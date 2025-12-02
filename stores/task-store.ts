import { create } from "zustand";

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
  scheduledDate?: string;
  completedAt?: string;
  order: number;
  isChronoLog?: boolean;
  chronoDurationSeconds?: number;
}

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  isLoading: boolean;

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (
    title: string,
    estimatedPomodoros: number,
    priority?: TaskPriority,
    scheduledDate?: Date
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  setActiveTask: (id: string | null) => void;
  incrementActiveTaskPomodoro: () => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  setPro: (isPro: boolean) => void;
}

// Helper function to convert DB format to Task format
function dbToTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    estimatedPomodoros: dbTask.estimated_pomodoros,
    completedPomodoros: dbTask.completed_pomodoros,
    isActive: false, // Active state is client-side only
    isCompleted: dbTask.is_completed,
    priority: dbTask.priority,
    createdAt: dbTask.created_at,
    scheduledDate: dbTask.scheduled_date,
    completedAt: dbTask.completed_at,
    order: dbTask.order_index,
    isChronoLog: dbTask.is_chrono_log,
    chronoDurationSeconds: dbTask.chrono_duration_seconds,
  };
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  activeTaskId: null,
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();

      // Keep all tasks including completed ones
      // They should be visible in task list, calendar, and analytics
      const tasks = data.map(dbToTask);

      set({ tasks, isLoading: false });
    } catch (error) {
      console.error("Fetch tasks error:", error);
      set({ isLoading: false });
    }
  },

  addTask: async (
    title,
    estimatedPomodoros,
    priority = "medium",
    scheduledDate
  ) => {
    try {
      const state = get();
      let scheduledDateStr: string | undefined;

      if (scheduledDate) {
        // Use local date to avoid timezone issues
        const d = new Date(scheduledDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        scheduledDateStr = `${year}-${month}-${day}`;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          estimatedPomodoros,
          priority,
          scheduledDate: scheduledDateStr,
          order: state.tasks.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const newTask = dbToTask(await response.json());
      set({ tasks: [...state.tasks, newTask] });
    } catch (error) {
      console.error("Add task error:", error);
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      // Check if ID is a valid UUID format (for Supabase)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error("Invalid task ID format. Expected UUID, got:", id);
        throw new Error(
          "Invalid task ID format. Please clear your browser data and try again."
        );
      }

      console.log(`[TASK] Updating task ${id}:`, updates);

      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[TASK] ❌ Update failed:`, errorData);
        throw new Error(errorData.error || "Failed to update task");
      }

      const updatedTask = dbToTask(await response.json());
      console.log(`[TASK] ✅ Task updated from backend:`, updatedTask);

      // Merge backend response with local state
      set({
        tasks: get().tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        ),
      });
    } catch (error) {
      console.error("[TASK] ❌ Update task error:", error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const state = get();

      // Check if ID is a valid UUID format (for Supabase)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error("Invalid task ID format. Expected UUID, got:", id);
        // For delete, we'll just remove it from local state since it's not in DB anyway
        set({ tasks: state.tasks.filter((task) => task.id !== id) });
        if (state.activeTaskId === id) {
          set({ activeTaskId: null });
        }
        return;
      }

      if (state.activeTaskId === id) {
        set({ activeTaskId: null });
      }

      // Get timer store BEFORE deleting task
      const { useTimerStore } = await import("./timer-store");
      const timerState = useTimerStore.getState();

      // Find all sessions linked to this task
      const sessionsToDelete = timerState.sessions.filter(
        (session) => session.taskId === id
      );

      // Delete each session from the database FIRST
      await Promise.all(
        sessionsToDelete.map(async (session) => {
          try {
            await fetch(`/api/sessions/${session.id}`, {
              method: "DELETE",
            });
          } catch (error) {
            console.error(`Error deleting session ${session.id}:`, error);
          }
        })
      );

      // Remove sessions from local state immediately
      timerState.sessions = timerState.sessions.filter(
        (session) => session.taskId !== id
      );

      // Now delete the task from database
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      // Remove task from UI
      set({ tasks: state.tasks.filter((task) => task.id !== id) });

      // Refresh sessions to ensure UI is in sync
      await timerState.fetchSessions();
    } catch (error) {
      console.error("Delete task error:", error);
      throw error;
    }
  },

  toggleTaskComplete: async (id) => {
    try {
      const state = get();
      const task = state.tasks.find((t) => t.id === id);

      if (!task) return;

      // Check if ID is a valid UUID format (for Supabase)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error("Invalid task ID format. Expected UUID, got:", id);
        console.log("Removing invalid task from local state:", id);
        // Just remove from local state and delete without alert
        set({ tasks: state.tasks.filter((t) => t.id !== id) });
        if (state.activeTaskId === id) {
          set({ activeTaskId: null });
        }
        return;
      }

      const isCompleting = !task.isCompleted;

      const updates: Partial<Task> = {
        isCompleted: isCompleting,
      };

      if (isCompleting) {
        updates.completedAt = new Date().toISOString();
        // When completing manually:
        // - If completedPomodoros is 0, set it to estimatedPomodoros (task done without timer)
        // - Otherwise keep the current completedPomodoros (task done with timer sessions)
        if (task.completedPomodoros === 0) {
          updates.completedPomodoros = task.estimatedPomodoros;
        }
        // Do NOT modify completedPomodoros if it's already > 0
      } else {
        updates.completedAt = null as any; // Clear completedAt when un-completing
        // When uncompleting, keep the pomodoros count (don't reset to 0)
        // User may want to uncomplete and continue working
      }

      await get().updateTask(id, updates);

      if (isCompleting && state.activeTaskId === id) {
        set({ activeTaskId: null });
      }
    } catch (error) {
      console.error("Toggle complete error:", error);
      throw error;
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

  incrementActiveTaskPomodoro: async () => {
    try {
      const state = get();
      if (!state.activeTaskId) {
        console.log("[TASK] No active task to increment");
        return;
      }

      const task = state.tasks.find((t) => t.id === state.activeTaskId);
      if (!task) {
        console.log("[TASK] Active task not found:", state.activeTaskId);
        return;
      }

      const newCount = task.completedPomodoros + 1;
      console.log(
        `[TASK] Incrementing ${task.title}: ${task.completedPomodoros} -> ${newCount}`
      );

      // Update locally first for immediate UI feedback
      set({
        tasks: state.tasks.map((t) =>
          t.id === state.activeTaskId
            ? { ...t, completedPomodoros: newCount }
            : t
        ),
      });

      // Then sync with backend
      await get().updateTask(state.activeTaskId, {
        completedPomodoros: newCount,
      });

      console.log(`[TASK] ✅ Pomodoro count updated to ${newCount}`);
    } catch (error) {
      console.error("[TASK] ❌ Increment pomodoro error:", error);
      // Rollback on error
      await get().fetchTasks();
    }
  },

  reorderTasks: async (reorderedTasks) => {
    try {
      // Update order locally first
      const tasksWithOrder = reorderedTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      set({ tasks: tasksWithOrder });

      // Update each task's order in the backend
      await Promise.all(
        tasksWithOrder.map((task) =>
          fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: task.order }),
          })
        )
      );
    } catch (error) {
      console.error("Reorder tasks error:", error);
    }
  },

  clearCompletedTasks: async () => {
    try {
      const state = get();

      // Get all completed tasks
      const completedTasks = state.tasks.filter((task) => task.isCompleted);

      // Delete each completed task from database
      await Promise.all(
        completedTasks.map(async (task) => {
          try {
            const response = await fetch(`/api/tasks/${task.id}`, {
              method: "DELETE",
            });
            if (!response.ok) {
              throw new Error("Failed to delete task");
            }
          } catch (error) {
            console.error(`Error deleting task ${task.id}:`, error);
          }
        })
      );

      // Remove completed tasks from UI state
      const remainingTasks = state.tasks.filter((task) => !task.isCompleted);
      set({ tasks: remainingTasks });
    } catch (error) {
      console.error("Clear completed tasks error:", error);
    }
  },

  setPro: (isPro: boolean) => {
    // This is handled in auth-store, kept here for compatibility
  },
}));
