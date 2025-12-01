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
  addTask: (title: string, estimatedPomodoros: number, priority?: TaskPriority, scheduledDate?: Date) => Promise<void>;
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
      const tasks = data.map(dbToTask);
      
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error("Fetch tasks error:", error);
      set({ isLoading: false });
    }
  },

  addTask: async (title, estimatedPomodoros, priority = "medium", scheduledDate) => {
    try {
      const state = get();
      let scheduledDateStr: string | undefined;
      
      if (scheduledDate) {
        const d = new Date(scheduledDate);
        d.setHours(0, 0, 0, 0);
        scheduledDateStr = d.toISOString().split("T")[0];
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
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error("Invalid task ID format. Expected UUID, got:", id);
        throw new Error("Invalid task ID format. Please clear your browser data and try again.");
      }

      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const updatedTask = dbToTask(await response.json());
      
      set({
        tasks: get().tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        ),
      });
    } catch (error) {
      console.error("Update task error:", error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const state = get();
      
      // Check if ID is a valid UUID format (for Supabase)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      set({ tasks: state.tasks.filter((task) => task.id !== id) });
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
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
      } else {
        updates.completedAt = null as any; // Clear completedAt when un-completing
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
      if (!state.activeTaskId) return;

      const task = state.tasks.find((t) => t.id === state.activeTaskId);
      if (!task) return;

      await get().updateTask(state.activeTaskId, {
        completedPomodoros: task.completedPomodoros + 1,
      });
    } catch (error) {
      console.error("Increment pomodoro error:", error);
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
      const completedTasks = state.tasks.filter((task) => task.isCompleted);

      await Promise.all(
        completedTasks.map((task) => get().deleteTask(task.id))
      );
    } catch (error) {
      console.error("Clear completed tasks error:", error);
    }
  },

  setPro: (isPro: boolean) => {
    // This is handled in auth-store, kept here for compatibility
  },
}));

