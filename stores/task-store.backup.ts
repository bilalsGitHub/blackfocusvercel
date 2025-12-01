import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isActive: boolean;
  isCompleted: boolean;
  priority: TaskPriority;
  createdAt: string;
  scheduledDate?: string; // Date when task is scheduled (YYYY-MM-DD format)
  completedAt?: string;
  order: number; // For drag & drop ordering
  isChronoLog?: boolean;
  chronoDurationSeconds?: number;
}

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;

  // Actions
  addTask: (title: string, estimatedPomodoros: number, priority?: TaskPriority, scheduledDate?: Date) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  incrementActiveTaskPomodoro: () => void;
  reorderTasks: (tasks: Task[]) => void;
  clearCompletedTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,

      addTask: (title, estimatedPomodoros, priority = "medium", scheduledDate) => {
        const state = get();
        
        // Format scheduled date to YYYY-MM-DD if provided
        let scheduledDateStr: string | undefined;
        if (scheduledDate) {
          const d = new Date(scheduledDate);
          d.setHours(0, 0, 0, 0);
          scheduledDateStr = d.toISOString().split('T')[0];
        }
        
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random()}`,
          title,
          estimatedPomodoros,
          completedPomodoros: 0,
          isActive: false,
          isCompleted: false,
          priority,
          createdAt: new Date().toISOString(),
          scheduledDate: scheduledDateStr,
          order: state.tasks.length,
          isChronoLog: false,
        };

        set({
          tasks: [...state.tasks, newTask],
        });
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        });
      },

      deleteTask: (id) => {
        const state = get();
        
        // If deleting active task, clear active task
        if (state.activeTaskId === id) {
          set({ activeTaskId: null });
        }

        set({
          tasks: state.tasks.filter((task) => task.id !== id),
        });
      },

      toggleTaskComplete: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        
        if (!task) return;

        const isCompleting = !task.isCompleted;

        set({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isCompleted: isCompleting,
                  isActive: isCompleting ? false : t.isActive,
                  completedAt: isCompleting ? new Date().toISOString() : undefined,
                }
              : t
          ),
        });

        // If completing the active task, clear active task
        if (isCompleting && state.activeTaskId === id) {
          set({ activeTaskId: null });
        }
      },

      setActiveTask: (id) => {
        set({
          tasks: get().tasks.map((task) => ({
            ...task,
            isActive: task.id === id,
          })),
          activeTaskId: id,
        });
      },

      incrementActiveTaskPomodoro: () => {
        const state = get();
        if (!state.activeTaskId) return;

        set({
          tasks: state.tasks.map((task) =>
            task.id === state.activeTaskId
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task
          ),
        });

        // Auto-complete task if reached estimated pomodoros
        const activeTask = state.tasks.find((t) => t.id === state.activeTaskId);
        if (
          activeTask &&
          activeTask.completedPomodoros + 1 >= activeTask.estimatedPomodoros
        ) {
          // Optional: auto-complete
          // get().toggleTaskComplete(activeTask.id);
        }
      },

      reorderTasks: (reorderedTasks) => {
        set({
          tasks: reorderedTasks.map((task, index) => ({
            ...task,
            order: index,
          })),
        });
      },

      clearCompletedTasks: () => {
        set({
          tasks: get().tasks.filter((task) => !task.isCompleted),
        });
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

