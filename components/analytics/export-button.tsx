"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { generateSummaryStats } from "@/lib/dummy-analytics-data";

export function ExportButton() {
  const { user } = useAuthStore();
  const isPro = user?.isPro || false;

  const exportToJSON = () => {
    const timerState = useTimerStore.getState();
    const taskState = useTaskStore.getState();
    
    const data = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      user: {
        email: user?.email,
        name: user?.name,
      },
      timer: {
        sessions: timerState.sessions,
        completedSessions: timerState.completedSessions,
        durations: timerState.durations,
      },
      tasks: {
        tasks: taskState.tasks,
        activeTaskId: taskState.activeTaskId,
      },
      stats: generateSummaryStats(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    
    downloadFile(
      blob,
      `blackfocus-backup-${new Date().toISOString().split('T')[0]}.json`
    );
  };

  const exportToCSV = () => {
    const sessions = useTimerStore.getState().sessions;
    
    // CSV Header
    const headers = ["Date", "Time", "Mode", "Duration (min)", "Completed"];
    
    // CSV Rows
    const rows = sessions.map((session) => {
      const date = new Date(session.completedAt);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        session.mode,
        Math.round(session.duration / 60),
        session.wasCompleted ? "Yes" : "No",
      ];
    });

    // Combine
    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    
    downloadFile(
      blob,
      `blackfocus-sessions-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isPro) {
    return (
      <Button variant="outline" disabled>
        <Download className="h-4 w-4 mr-2" />
        Export (Pro)
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

