"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTaskStore } from "@/stores/task-store";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore } from "@/stores/settings-store";

export function useHydrateStores() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchSessions = useTimerStore((state) => state.fetchSessions);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch all data from Supabase
      fetchTasks();
      fetchSessions();
      fetchSettings();
    }
  }, [isAuthenticated, fetchTasks, fetchSessions, fetchSettings]);
}

