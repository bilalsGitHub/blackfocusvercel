"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimerStatsProps {
  completedSessions: number;
  className?: string;
}

export function TimerStats({ completedSessions, className }: TimerStatsProps) {
  const totalMinutes = completedSessions * 25;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div
      className={cn("grid grid-cols-2 gap-4", className)}
      role="region"
      aria-label="Timer statistics"
    >
      <Card className="border-2">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl md:text-5xl font-bold text-primary tabular-nums"
            aria-label={`${completedSessions} completed sessions`}
          >
            {completedSessions}
          </div>
          <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
            Sessions
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl md:text-5xl font-bold text-primary tabular-nums"
            aria-label={`${hours} hours ${minutes} minutes of focus time`}
          >
            {hours}h {minutes}m
          </div>
          <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
            Focus Time
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

