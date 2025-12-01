"use client";

import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onPlayPause?: () => void;
  onReset?: () => void;
  onSettings?: () => void;
  onToggleFocusMode?: () => void;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onReset,
  onSettings,
  onToggleFocusMode,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Space or K - Play/Pause
      if (event.code === "Space" || key === "k") {
        event.preventDefault();
        onPlayPause?.();
      }

      // R - Reset
      if (key === "r" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onReset?.();
      }

      // F - Toggle Focus Mode
      if (key === "f" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onToggleFocusMode?.();
      }

      // S - Settings
      if (key === "s" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onSettings?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPlayPause, onReset, onSettings, onToggleFocusMode]);
}

