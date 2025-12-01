"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTimer } from "./use-timer";

const DEFAULT_TITLE = "BlackFocus - Focus Timer";

export function useDocumentTitle() {
  const { timeLeft, chronometerElapsed, isActive, mode } = useTimerStore();
  const { showProgressInTitle } = useSettingsStore();
  const { formatTime } = useTimer();

  useEffect(() => {
    if (!showProgressInTitle || typeof document === "undefined") {
      document.title = DEFAULT_TITLE;
      return;
    }

    if (isActive) {
      const seconds = mode === "chronometer" ? chronometerElapsed : timeLeft;
      const formattedTime = formatTime(seconds);
      let emoji = "🎯";
      if (mode === "shortBreak") emoji = "☕";
      else if (mode === "longBreak") emoji = "🌙";
      else if (mode === "chronometer") emoji = "⏱️";
      document.title = `${emoji} ${formattedTime} - BlackFocus`;
    } else {
      document.title = DEFAULT_TITLE;
    }

    // Cleanup
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [timeLeft, chronometerElapsed, isActive, mode, showProgressInTitle, formatTime]);
}

