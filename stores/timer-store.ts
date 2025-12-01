import { create } from "zustand";

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
  isLoading: boolean;
  
  // Internal timer tracking
  lastTickTime: number | null;
  
  // Actions
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  tick: () => void;
  completeTimer: () => Promise<void>;
  addSession: (session: Omit<Session, "id" | "completedAt">) => Promise<void>;
  assignSessionToTask: (sessionId: string, taskId: string) => Promise<void>;
  updateDurations: (durations: Partial<TimerDurations>) => void;
  clearSessions: () => Promise<void>;
  fetchSessions: () => Promise<void>;
}

// Default durations in seconds
const DEFAULT_DURATIONS: TimerDurations = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// Helper to convert DB session to Session
function dbToSession(dbSession: any): Session {
  return {
    id: dbSession.id,
    mode: dbSession.mode,
    duration: dbSession.duration_seconds,
    completedAt: dbSession.ended_at || dbSession.started_at,
    wasCompleted: dbSession.is_completed && !dbSession.was_interrupted,
    taskId: dbSession.task_id || undefined,
  };
}

export const useTimerStore = create<TimerState>()((set, get) => ({
      // Initial state
      timeLeft: DEFAULT_DURATIONS.focus,
      isActive: false,
      mode: "focus",
      chronometerElapsed: 0,
      durations: DEFAULT_DURATIONS,
      sessions: [],
      completedSessions: 0,
      isLoading: false,
      lastTickTime: null,

      // Fetch sessions from backend
      fetchSessions: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/sessions");
          if (!response.ok) throw new Error("Failed to fetch sessions");
          
          const data = await response.json();
          const sessions = data.map(dbToSession);
          const completedSessions = sessions.filter(
            (s: Session) => s.mode === "focus" && s.wasCompleted
          ).length;
          
          set({ sessions, completedSessions, isLoading: false });
        } catch (error) {
          console.error("Fetch sessions error:", error);
          set({ isLoading: false });
        }
      },

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

      // Switch timer mode
      switchMode: (mode) => {
        const state = get();
        
        if (mode === "chronometer") {
          set({
            mode: "chronometer",
            timeLeft: 0,
            chronometerElapsed: 0,
            isActive: false,
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

      // Set time left manually
      setTimeLeft: (time) => {
        set({ timeLeft: time });
      },

      // Tick handler (called by RAF)
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

        // Get active task ID from task store (only for focus mode)
        let activeTaskId: string | undefined;
        if (state.mode !== "chronometer" && typeof window !== "undefined") {
          const { useTaskStore } = await import("./task-store");
          activeTaskId = useTaskStore.getState().activeTaskId || undefined;
        }

        // Save session to backend
        try {
          const now = new Date().toISOString();
          const startedAt = new Date(Date.now() - duration * 1000).toISOString();
          
          const response = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: state.mode,
              duration,
              startedAt,
              completedAt: now,
              wasCompleted: true,
              taskId: activeTaskId, // This will be undefined for chronometer
            }),
          });

          if (!response.ok) throw new Error("Failed to save session");

          const savedSession = dbToSession(await response.json());

          const newCompletedSessions = 
            state.mode === "focus" 
              ? state.completedSessions + 1 
              : state.completedSessions;

          set({
            sessions: [savedSession, ...state.sessions],
            completedSessions: newCompletedSessions,
            isActive: false,
            lastTickTime: null,
          });

          // Reset timer for next session
          if (state.mode === "chronometer") {
            set({
              chronometerElapsed: 0,
              timeLeft: 0,
            });
          } else {
            set({
              timeLeft: state.durations[state.mode],
            });
          }

          // Increment task's completed pomodoro if this was a focus session
          if (state.mode === "focus" && activeTaskId && typeof window !== "undefined") {
            const { useTaskStore } = await import("./task-store");
            await useTaskStore.getState().incrementActiveTaskPomodoro();
          }
        } catch (error) {
          console.error("Complete timer error:", error);
          set({
            isActive: false,
            lastTickTime: null,
          });
        }
      },

      // Add session (for manual completion)
      addSession: async (sessionData) => {
        const state = get();
        
        try {
          const now = new Date().toISOString();
          const startedAt = new Date(Date.now() - sessionData.duration * 1000).toISOString();
          
          const response = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: sessionData.mode,
              duration: sessionData.duration,
              startedAt,
              completedAt: now,
              wasCompleted: sessionData.wasCompleted,
              taskId: sessionData.taskId,
            }),
          });

          if (!response.ok) throw new Error("Failed to save session");

          const savedSession = dbToSession(await response.json());

          set({
            sessions: [savedSession, ...state.sessions],
            completedSessions:
              sessionData.mode === "focus" && sessionData.wasCompleted
                ? state.completedSessions + 1
                : state.completedSessions,
          });
        } catch (error) {
          console.error("Add session error:", error);
          throw error;
        }
      },

      // Assign existing session to a task
      assignSessionToTask: async (sessionId, taskId) => {
        try {
          const response = await fetch(`/api/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId }),
          });

          if (!response.ok) throw new Error("Failed to assign session");

          const updatedSession = dbToSession(await response.json());

          set({
            sessions: get().sessions.map((s) =>
              s.id === sessionId ? updatedSession : s
            ),
          });
        } catch (error) {
          console.error("Assign session error:", error);
          throw error;
        }
      },

      // Update timer durations
      updateDurations: (newDurations) => {
        const state = get();
        const updatedDurations = {
          ...state.durations,
          ...newDurations,
        };
        
        set({
          durations: updatedDurations,
          timeLeft: updatedDurations[state.mode] || state.timeLeft,
        });
      },

      // Clear all sessions
      clearSessions: async () => {
        try {
          // Delete all sessions from backend
          await Promise.all(
            get().sessions.map((session) =>
              fetch(`/api/sessions/${session.id}`, { method: "DELETE" })
            )
          );

          set({
            sessions: [],
            completedSessions: 0,
          });
        } catch (error) {
          console.error("Clear sessions error:", error);
        }
      },
    }));

