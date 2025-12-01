"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  time: string;
  mode: string;
  progress: number;
  totalSeconds?: number; // Total duration in seconds
  className?: string;
}

export function TimerDisplay({
  time,
  mode,
  progress,
  totalSeconds = 1500, // Default 25 minutes
  className,
}: TimerDisplayProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={cn(
        "relative w-full aspect-square max-w-sm mx-auto",
        className
      )}
      role="timer"
      aria-label={`${mode} timer`}
      aria-live="polite">
      {/* Timer Text - Centered */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <time
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tabular-nums tracking-tight"
            dateTime={`PT${time.replace(":", "M")}S`}>
            {time}
          </time>
          <div
            className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2 capitalize font-medium"
            aria-label={`Current mode: ${mode}`}>
            {mode.replace(/([A-Z])/g, " $1").trim()}
          </div>
        </div>
      </div>

      {/* Progress Ring - SVG */}
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden="true">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted opacity-20"
        />

        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-linear"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      {/* Progress Indicator (Screen Reader) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Timer progress: {Math.round(progress * 100)}%
      </div>
    </div>
  );
}
