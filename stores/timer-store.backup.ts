import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TimerMode = "focus" | "shortBreak" | "longBreak" | "chronometer";

export interface Session {
  id: string;
  mode: TimerMode;
  duration: number; // in seconds
  completedAt: string; // ISO timestamp
  wasCompleted: boolean; // false if manually stopped
  taskId?: string; // Optional: linked task ID
}

export interface TimerDurations {
  focus: number;
  shortBreak: number;
  longBreak: number;
  chronometer?: number; // not used, but keeps typing happy
}

interface TimerState {
  // Core timer state
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  chronometerElapsed: number;
  
  // Durations (in seconds)
  durations: TimerDurations;
  
  // Session tracking
  sessions: Session[];
  completedSessions: number; // Only completed focus sessions
  
  // Internal timer tracking
  lastTickTime: number | null;
  
  // Actions
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  tick: () => void;
  completeTimer: () => void;
  addSession: (session: Omit<Session, "id" | "completedAt">) => void;
  updateDurations: (durations: Partial<TimerDurations>) => void;
  clearSessions: () => void;
}

// Default durations in seconds
const DEFAULT_DURATIONS: TimerDurations = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      timeLeft: DEFAULT_DURATIONS.focus,
      isActive: false,
      mode: "focus",
      chronometerElapsed: 0,
      durations: DEFAULT_DURATIONS,
      sessions: [],
      completedSessions: 0,
      lastTickTime: null,

      // Toggle timer (start/pause)
      toggleTimer: () => {
        const state = get();
        const newIsActive = !state.isActive;
        
        set({
          isActive: newIsActive,
          lastTickTime: newIsActive ? Date.now() : null,
        });
      },

      // Reset current timer
      resetTimer: () => {
        const state = get();
        if (state.mode === "chronometer") {
          set({
            chronometerElapsed: 0,
            timeLeft: 0,
            isActive: false,
            lastTickTime: null,
          });
          return;
        }

        const duration = state.durations[state.mode];
        
        set({
          timeLeft: duration,
          isActive: false,
          lastTickTime: null,
        });
      },

      // Switch mode
      switchMode: (mode: TimerMode) => {
        const state = get();
        if (mode === "chronometer") {
          set({
            mode,
            isActive: false,
            timeLeft: 0,
            chronometerElapsed: 0,
            lastTickTime: null,
          });
          return;
        }

        const duration = state.durations[mode];
        
        set({
          mode,
          timeLeft: duration,
          chronometerElapsed: 0,
          isActive: false,
          lastTickTime: null,
        });
      },

      // Set time left (for manual adjustments)
      setTimeLeft: (time: number) => {
        set({ timeLeft: Math.max(0, time) });
      },

      // Tick function (called by requestAnimationFrame)
      tick: () => {
        const state = get();
        
        if (!state.isActive) {
          return;
        }

        const now = Date.now();
        const elapsed = state.lastTickTime 
          ? (now - state.lastTickTime) / 1000 
          : 0;

        if (state.mode === "chronometer") {
          set({
            chronometerElapsed: state.chronometerElapsed + elapsed,
            lastTickTime: now,
          });
          return;
        }

        if (state.timeLeft <= 0) {
          set({
            isActive: false,
            lastTickTime: null,
          });
          return;
        }

        const newTimeLeft = Math.max(0, state.timeLeft - elapsed);

        set({
          timeLeft: newTimeLeft,
          lastTickTime: now,
        });

        // Auto-complete when timer reaches 0
        if (newTimeLeft === 0) {
          get().completeTimer();
        }
      },

      // Complete timer (called when timer reaches 0 or manually)
      completeTimer: async () => {
        const state = get();
        const duration =
          state.mode === "chronometer"
            ? Math.round(state.chronometerElapsed)
            : state.durations[state.mode];

        if (state.mode === "chronometer" && duration <= 0) {
          set({
            isActive: false,
            chronometerElapsed: 0,
            lastTickTime: null,
          });
          return;
        }

        // Get active task ID from task store
        let activeTaskId: string | undefined;
        if (typeof window !== "undefined") {
          const { useTaskStore } = await import("./task-store");
          activeTaskId = useTaskStore.getState().activeTaskId || undefined;
        }

        // Add session to history
        const session: Session = {
          id: `${Date.now()}-${Math.random()}`,
          mode: state.mode,
          duration,
          completedAt: new Date().toISOString(),
          wasCompleted: true,
          taskId: activeTaskId, // Link to active task if exists
        };

        const newCompletedSessions = 
          state.mode === "focus" 
            ? state.completedSessions + 1 
            : state.completedSessions;

        set({
          isActive: false,
          sessions: [...state.sessions, session],
          completedSessions: newCompletedSessions,
          lastTickTime: null,
          chronometerElapsed: state.mode === "chronometer" ? 0 : state.chronometerElapsed,
        });

        // Increment active task pomodoro if in focus mode
        if (state.mode === "focus") {
          // Dynamically import to avoid circular dependency
          if (typeof window !== "undefined") {
            import("./task-store").then(({ useTaskStore }) => {
              useTaskStore.getState().incrementActiveTaskPomodoro();
            });
          }
        }

        // Play notification sound (if implemented)
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Timer Complete!", {
              body: `Your ${state.mode} session is complete!`,
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
            });
          }
        }

        // Vibrate on mobile (if supported)
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      },

      // Add session manually
      addSession: (sessionData) => {
        const session: Session = {
          ...sessionData,
          id: `${Date.now()}-${Math.random()}`,
          completedAt: new Date().toISOString(),
        };

        const state = get();
        const newCompletedSessions = 
          session.mode === "focus" && session.wasCompleted
            ? state.completedSessions + 1
            : state.completedSessions;

        set({
          sessions: [...state.sessions, session],
          completedSessions: newCompletedSessions,
        });
      },

      // Update durations
      updateDurations: (newDurations) => {
        const state = get();
        const updatedDurations: TimerDurations = {
          ...state.durations,
          ...newDurations,
        };

        // If current mode's duration changed and timer is not active, update timeLeft
        let newTimeLeft = state.timeLeft;
        if (!state.isActive && state.mode !== "chronometer") {
          newTimeLeft = updatedDurations[state.mode];
        }

        set({
          durations: updatedDurations,
          timeLeft: newTimeLeft,
        });
      },

      // Clear all sessions
      clearSessions: () => {
        set({
          sessions: [],
          completedSessions: 0,
        });
      },
    }),
    {
      name: "timer-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        mode: state.mode,
        durations: state.durations,
        sessions: state.sessions,
        completedSessions: state.completedSessions,
        chronometerElapsed: state.chronometerElapsed,
        // Don't persist active timer state
      }),
    }
  )
);

// Storage event listener for cross-tab synchronization
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "timer-storage" && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        const currentState = useTimerStore.getState();
        
        // Only sync if not actively running
        if (!currentState.isActive) {
          useTimerStore.setState({
            mode: newState.state.mode,
            durations: newState.state.durations,
            sessions: newState.state.sessions,
            completedSessions: newState.state.completedSessions,
          });
        }
      } catch (error) {
        console.error("Failed to sync timer state:", error);
      }
    }
  });
}
