"use client";

import * as React from "react";
import { useTaskStore } from "@/stores/task-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

const formatChronoDuration = (seconds: number = 0) => {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

interface ActiveTaskBadgeProps {
  variant?: "default" | "minimal";
}

export function ActiveTaskBadge({ variant = "default" }: ActiveTaskBadgeProps) {
  const { tasks, activeTaskId, setActiveTask } = useTaskStore();
  const activeTask = React.useMemo(
    () => tasks.find((task) => task.id === activeTaskId) || null,
    [tasks, activeTaskId]
  );

  const handleClearActive = () => {
    setActiveTask(null);
  };

  if (!activeTask) {
    return null;
  }

  const isChronoLog = Boolean(activeTask.isChronoLog);
  const chronometerDuration = activeTask.chronoDurationSeconds || 0;
  const pomodorosLeft = isChronoLog
    ? 0
    : Math.max(
        0,
        activeTask.estimatedPomodoros - activeTask.completedPomodoros
      );

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "default" &&
          "p-3 rounded-lg border bg-card/50",
        variant === "minimal" &&
          "px-4 py-2 rounded-full border border-border/40 bg-card/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm text-sm"
      )}
    >
      <Target
        className={cn(
          "flex-shrink-0",
          variant === "minimal" ? "h-3.5 w-3.5 text-primary/80" : "h-4 w-4 text-primary"
        )}
      />
      <div className="flex-1 min-w-0">
        <div className={cn("truncate", variant === "minimal" ? "text-sm font-medium" : "font-medium")}>
          {activeTask.title}
        </div>
        <div
          className={cn(
            "text-muted-foreground",
            variant === "minimal" ? "text-xs" : "text-xs"
          )}
        >
          {isChronoLog ? (
            <>Chronometer log · {formatChronoDuration(chronometerDuration)}</>
          ) : (
            <>
              {activeTask.completedPomodoros} / {activeTask.estimatedPomodoros} 🍅
              {pomodorosLeft > 0 && ` · ${pomodorosLeft} left`}
            </>
          )}
        </div>
      </div>
      <Badge
        variant={variant === "minimal" ? "outline" : "default"}
        className={cn("text-xs flex-shrink-0", variant === "minimal" && "bg-transparent")}
      >
        Active
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClearActive}
        className={cn(
          "flex-shrink-0 hover:bg-destructive/10 hover:text-destructive",
          variant === "minimal" ? "h-6 w-6 text-muted-foreground/80" : "h-6 w-6"
        )}
        title="Clear active task"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

