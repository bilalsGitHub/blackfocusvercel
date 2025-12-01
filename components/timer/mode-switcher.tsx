"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimerMode } from "@/stores/timer-store";
import { useAuthStore } from "@/stores/auth-store";
import { Crown } from "lucide-react";

interface ModeSwitcherProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled?: boolean;
  className?: string;
}

const baseModes: { value: Exclude<TimerMode, "chronometer">; label: string }[] = [
  { value: "focus", label: "Focus" },
  { value: "shortBreak", label: "Short Break" },
  { value: "longBreak", label: "Long Break" },
];

export function ModeSwitcher({
  currentMode,
  onModeChange,
  disabled = false,
  className,
}: ModeSwitcherProps) {
  const { user } = useAuthStore();
  const isPro = user?.isPro ?? false;

  const modes = React.useMemo(
    () =>
      [
        ...baseModes,
        {
          value: "chronometer" as TimerMode,
          label: "Chronometer",
          proOnly: true,
        },
      ] as Array<{ value: TimerMode; label: string; proOnly?: boolean }>,
    []
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 sm:gap-2 p-1 bg-muted/50 rounded-lg border",
        className
      )}
      role="tablist"
      aria-label="Timer mode selector"
    >
      {modes.map((mode) => {
        const isDisabled =
          disabled || (mode.proOnly && !isPro);
        return (
        <Button
          key={mode.value}
          variant={currentMode === mode.value ? "default" : "ghost"}
          className={cn(
            "flex-1 transition-all text-xs sm:text-sm px-2 sm:px-4",
            currentMode === mode.value && "shadow-sm",
            mode.proOnly && !isPro && "justify-between"
          )}
          onClick={() => {
            if (!isDisabled) {
              onModeChange(mode.value);
            }
          }}
          disabled={isDisabled}
          role="tab"
          title={
            mode.proOnly && !isPro
              ? "Upgrade to Pro to unlock the chronometer"
              : undefined
          }
          aria-selected={currentMode === mode.value}
          aria-controls={`${mode.value}-panel`}
          tabIndex={currentMode === mode.value ? 0 : -1}
        >
          <span className="flex items-center gap-0.5 sm:gap-1">
            <span className="hidden sm:inline">{mode.label}</span>
            <span className="sm:hidden">{mode.label.split(' ')[0]}</span>
            {mode.proOnly && (
              <Crown
                className={cn(
                  "h-3 w-3 sm:h-3.5 sm:w-3.5",
                  isDisabled ? "text-yellow-400" : "text-yellow-300"
                )}
              />
            )}
          </span>
          {mode.proOnly && !isPro && (
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-yellow-400">
              Pro
            </span>
          )}
        </Button>
      )})}
    </div>
  );
}

