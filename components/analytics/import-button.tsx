"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";

interface ImportData {
  version: string;
  exportDate: string;
  timer: {
    sessions: any[];
    completedSessions: number;
    durations: any;
  };
  tasks: {
    tasks: any[];
    activeTaskId: string | null;
  };
}

export function ImportButton() {
  const { user } = useAuthStore();
  const isPro = user?.isPro || false;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: ImportData = JSON.parse(text);

      // Validate data
      if (!data.version || !data.timer || !data.tasks) {
        throw new Error("Invalid backup file format");
      }

      // Confirm before importing
      const confirmed = window.confirm(
        `Import backup from ${new Date(data.exportDate).toLocaleDateString()}?\n\n` +
        `This will replace your current data:\n` +
        `- ${data.timer.sessions.length} sessions\n` +
        `- ${data.tasks.tasks.length} tasks\n\n` +
        `Current data will be lost!`
      );

      if (!confirmed) return;

      // Adjust session dates to current week (last 7 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find the date range in the imported data
      const oldestDate = new Date(Math.min(...data.timer.sessions.map((s: any) => new Date(s.completedAt).getTime())));
      const newestDate = new Date(Math.max(...data.timer.sessions.map((s: any) => new Date(s.completedAt).getTime())));
      
      // Calculate how many days to shift (to make newest date = today)
      const daysDiff = Math.ceil((today.getTime() - newestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log("📅 Date adjustment:", {
        oldestDate: oldestDate.toISOString(),
        newestDate: newestDate.toISOString(),
        today: today.toISOString(),
        daysDiff,
      });
      
      // Shift all sessions to current week
      const adjustedSessions = data.timer.sessions.map((session: any) => {
        const sessionDate = new Date(session.completedAt);
        sessionDate.setDate(sessionDate.getDate() + daysDiff);
        return {
          ...session,
          completedAt: sessionDate.toISOString(),
        };
      });

      // Import timer data with adjusted dates
      useTimerStore.setState({
        sessions: adjustedSessions,
        completedSessions: data.timer.completedSessions,
        durations: data.timer.durations,
      });

      // Import task data
      useTaskStore.setState({
        tasks: data.tasks.tasks,
        activeTaskId: data.tasks.activeTaskId,
      });

      alert("✅ Import successful!");
      
      // Refresh page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Import error:", error);
      alert("❌ Import failed. Please check the file format.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isPro) {
    return (
      <Button variant="outline" disabled>
        <Upload className="h-4 w-4 mr-2" />
        Import (Pro)
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={handleImport}>
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}

