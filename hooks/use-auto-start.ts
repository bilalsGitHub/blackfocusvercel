"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore } from "@/stores/settings-store";

export function useAutoStart() {
  const { mode, isActive, timeLeft, switchMode, toggleTimer } = useTimerStore();
  const { autoStartBreak, autoStartFocus, longBreakInterval } = useSettingsStore();
  const completedFocusSessions = useTimerStore(state => state.completedSessions);

  useEffect(() => {
    if (mode === "chronometer") {
      return;
    }

    // Don't auto-start if timer is already active or there's time left
    if (isActive || timeLeft > 0) {
      return;
    }

    let shouldAutoStart = false;
    let nextMode = mode;

    // After focus session completes
    if (mode === "focus" && autoStartBreak) {
      // Determine if it's time for a long break
      const shouldTakeLongBreak = 
        completedFocusSessions > 0 && 
        completedFocusSessions % longBreakInterval === 0;
      
      nextMode = shouldTakeLongBreak ? "longBreak" : "shortBreak";
      shouldAutoStart = true;
    }
    // After break completes
    else if ((mode === "shortBreak" || mode === "longBreak") && autoStartFocus) {
      nextMode = "focus";
      shouldAutoStart = true;
    }

    if (shouldAutoStart) {
      // Small delay before auto-starting
      const timer = setTimeout(() => {
        switchMode(nextMode);
        // Give a moment for the mode switch to complete
        setTimeout(() => {
          toggleTimer();
        }, 100);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    mode,
    isActive,
    timeLeft,
    autoStartBreak,
    autoStartFocus,
    completedFocusSessions,
    longBreakInterval,
    switchMode,
    toggleTimer,
  ]);
}

