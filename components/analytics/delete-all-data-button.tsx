"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { useSettingsStore } from "@/stores/settings-store";

export const DeleteAllDataButton = React.forwardRef<HTMLButtonElement>(
  (props, ref) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDeleteAll = async () => {
      // Triple confirmation for safety
      const firstConfirm = window.confirm(
        "⚠️ WARNING: Delete ALL data?\n\n" +
          "This will permanently delete:\n" +
          "- All sessions\n" +
          "- All tasks\n" +
          "- All settings\n" +
          "- All statistics\n\n" +
          "This action CANNOT be undone!"
      );

      if (!firstConfirm) return;

      const secondConfirm = window.confirm(
        "Are you ABSOLUTELY sure?\n\n" +
          "Type 'DELETE' in your mind and click OK to confirm."
      );

      if (!secondConfirm) return;

      const finalConfirm = window.prompt(
        "Final confirmation:\n\n" + "Type 'DELETE' to confirm data deletion:"
      );

      if (finalConfirm !== "DELETE") {
        alert("❌ Deletion cancelled.");
        return;
      }

      setIsDeleting(true);
      console.log("🗑️ [Analytics] Starting delete all data...");

      try {
        console.log("🔥 [Analytics] Calling /api/delete-all-data...");
        const response = await fetch("/api/delete-all-data", {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.error || `Failed to delete data: ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("✅ [Analytics] Delete result:", result);
        console.log(`   📊 Deleted ${result.deleted_sessions} sessions`);
        console.log(`   📊 Deleted ${result.deleted_tasks} tasks`);
        console.log(`   📊 Deleted ${result.deleted_settings} settings`);

        // Clear all localStorage first (including persist stores)
        localStorage.removeItem("timer-storage");
        localStorage.removeItem("task-storage");
        localStorage.removeItem("settings-storage");
        localStorage.removeItem("auth-storage");

        // Reset timer store to defaults
        useTimerStore.setState({
          timeLeft: 1500,
          isActive: false,
          mode: "focus",
          sessions: [],
          completedSessions: 0,
          lastTickTime: null,
          durations: {
            focus: 1500,
            shortBreak: 300,
            longBreak: 900,
          },
        });

        // Reset task store to defaults
        useTaskStore.setState({
          tasks: [],
          activeTaskId: null,
        });

        // Reset settings store to defaults
        useSettingsStore.setState({
          notifications: {
            enabled: true,
            focusSound: "bell",
            shortBreakSound: "chime",
            longBreakSound: "ding",
            volume: 50,
          },
          timerDurations: {
            focusMinutes: 25,
            shortBreakMinutes: 5,
            longBreakMinutes: 15,
          },
          autoStartBreak: false,
          autoStartFocus: false,
          longBreakInterval: 4,
          showProgressInTitle: true,
          showNotificationsInTitle: true,
          reduceMotion: false,
        });

        alert("✅ All data deleted successfully!");

        // Force reload to clear everything
        window.location.reload();
      } catch (error) {
        console.error("❌ [Analytics] Delete error:", error);
        alert("❌ Error deleting data. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <Button
        ref={ref}
        variant="destructive"
        size="sm"
        onClick={handleDeleteAll}
        disabled={isDeleting}
        style={{ display: "none" }}>
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete All Data"}
      </Button>
    );
  }
);

DeleteAllDataButton.displayName = "DeleteAllDataButton";
