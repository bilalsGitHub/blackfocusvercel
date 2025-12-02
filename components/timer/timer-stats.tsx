"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/stores/timer-store";

interface TimerStatsProps {
  completedSessions: number;
  className?: string;
}

export function TimerStats({ completedSessions, className }: TimerStatsProps) {
  const sessions = useTimerStore((state) => state.sessions);

  // Calculate today's stats
  const todayStats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter((session) => {
      if (!session.wasCompleted) return false;
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const focusSessions = todaySessions.filter(
      (s) => s.mode === "focus"
    ).length;
    const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    return {
      sessions: focusSessions,
      totalMinutes,
    };
  }, [sessions]);

  const hours = Math.floor(todayStats.totalMinutes / 60);
  const minutes = todayStats.totalMinutes % 60;

  return (
    <div
      className={cn("grid grid-cols-2 gap-4", className)}
      role="region"
      aria-label="Timer statistics">
      <Card className="border-2">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl md:text-5xl font-bold text-primary tabular-nums"
            aria-label={`${todayStats.sessions} completed sessions today`}>
            {todayStats.sessions}
          </div>
          <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
            Sessions
          </div>
          <div className="text-xs text-muted-foreground/70 mt-1">Today</div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl md:text-5xl font-bold text-primary tabular-nums"
            aria-label={`${hours} hours ${minutes} minutes of focus time today`}>
            {hours}h {minutes}m
          </div>
          <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
            Focus Time
          </div>
          <div className="text-xs text-muted-foreground/70 mt-1">Today</div>
        </CardContent>
      </Card>
    </div>
  );
}
