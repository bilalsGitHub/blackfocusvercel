"use client";

import { useEffect } from "react";

/**
 * Hook for timer notifications
 * Note: Notification logic is now handled in timer-store's completeTimer function
 * This hook is kept for backwards compatibility but is now a no-op
 */
export function useTimerNotifications() {
  useEffect(() => {
    console.log(
      "[NOTIFICATIONS] Hook initialized - notifications handled by timer-store"
    );
  }, []);
}
