"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onComplete?: () => void;
  disabled?: boolean;
  className?: string;
}

export function TimerControls({
  isRunning,
  onPlayPause,
  onReset,
  onComplete,
  disabled = false,
  className,
}: TimerControlsProps) {
  const [showComplete, setShowComplete] = React.useState(false);

  const handleComplete = () => {
    if (confirm("Mark this session as completed?\n\nThis will save it to your history.")) {
      onComplete?.();
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div
        className={cn("flex items-center justify-center gap-3 sm:gap-4", className)}
        role="group"
        aria-label="Timer controls"
      >
        <Button
          size="lg"
          onClick={onPlayPause}
          disabled={disabled}
          className="w-28 sm:w-32 md:w-36 h-10 sm:h-11 md:h-12 text-sm sm:text-base font-semibold"
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <>
              <Pause className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Start
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onReset}
          disabled={disabled}
          className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 p-0"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Complete Now Button */}
      {!isRunning && onComplete && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleComplete}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground px-2 sm:px-3"
          >
            <Check className="mr-0.5 sm:mr-1 h-3 w-3" />
            <span className="hidden sm:inline">Complete Session Manually</span>
            <span className="sm:hidden">Complete</span>
          </Button>
        </div>
      )}
    </div>
  );
}

