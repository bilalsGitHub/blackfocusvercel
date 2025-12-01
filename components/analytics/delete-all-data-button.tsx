"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { useSettingsStore } from "@/stores/settings-store";

export function DeleteAllDataButton() {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteAll = () => {
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
      "Final confirmation:\n\n" +
      "Type 'DELETE' to confirm data deletion:"
    );

    if (finalConfirm !== "DELETE") {
      alert("❌ Deletion cancelled.");
      return;
    }

    // Delete all data
    setIsDeleting(true);

    try {
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
          sound: "bell",
          volume: 50,
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
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 100);
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Error deleting data. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={handleDeleteAll}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? "Deleting..." : "Delete All Data"}
    </Button>
  );
}

