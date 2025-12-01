"use client";

import * as React from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTimer } from "@/hooks/use-timer";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAutoStart } from "@/hooks/use-auto-start";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { ModeSwitcher } from "@/components/timer/mode-switcher";
import { TimerStats } from "@/components/timer/timer-stats";
import { SettingsDialog, type SettingsDialogHandle } from "@/components/timer/settings-dialog";
import { KeyboardShortcutsInfo } from "@/components/timer/keyboard-shortcuts-info";
import { TaskList } from "@/components/tasks/task-list";
import { ActiveTaskBadge } from "@/components/tasks/active-task-badge";
import { UnassignedSessions } from "@/components/sessions/unassigned-sessions";
import { Card } from "@/components/ui/card";
import { AdBanner } from "@/components/ads/ad-banner";
import { SpotifyPlayer } from "@/components/timer/spotify-player";

export default function TimerPage() {
  const {
    mode,
    isActive,
    timeLeft,
    chronometerElapsed,
    completedSessions,
    durations,
    toggleTimer,
    resetTimer,
    switchMode,
    completeTimer,
  } = useTimerStore();
  const { user } = useAuthStore();
  const isPro = user?.isPro ?? false;

  const { formatTime } = useTimer();
  
  // Focus Mode state
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const settingsDialogRef = React.useRef<SettingsDialogHandle>(null);

  // Enable document title updates
  useDocumentTitle();

  // Enable auto-start functionality
  useAutoStart();

  const handlePlayPause = React.useCallback(() => {
    toggleTimer();
  }, [toggleTimer]);

  const handleReset = React.useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleModeChange = React.useCallback((newMode: typeof mode) => {
    switchMode(newMode);
  }, [switchMode]);

  const handleComplete = React.useCallback(() => {
    // Manually complete the current session
    completeTimer();
    resetTimer();
  }, [completeTimer, resetTimer]);

  // Toggle Focus Mode handler
  const handleToggleFocusMode = React.useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  // Keyboard shortcuts (including Focus Mode toggle with F key)
  useKeyboardShortcuts({
    onPlayPause: handlePlayPause,
    onReset: handleReset,
    onSettings: () => settingsDialogRef.current?.open(),
    onToggleFocusMode: handleToggleFocusMode,
  });

  // Prevent non-pro users from staying in chronometer mode
  React.useEffect(() => {
    if (!isPro && mode === "chronometer") {
      switchMode("focus");
    }
  }, [isPro, mode, switchMode]);

  const CHRONO_LOOP_SECONDS = 3600;
  const displaySeconds = mode === "chronometer" ? chronometerElapsed : timeLeft;
  const totalDuration =
    mode === "chronometer" ? CHRONO_LOOP_SECONDS : durations[mode];
  const progress =
    mode === "chronometer"
      ? 1 - ((chronometerElapsed % CHRONO_LOOP_SECONDS) / CHRONO_LOOP_SECONDS)
      : Math.max(0, Math.min(1, timeLeft / (durations[mode] || 1)));

  return (
    <>
      {/* Spotify Player - Fixed to bottom-left */}
      <SpotifyPlayer />
      
      <div className={`container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 transition-all duration-500 ${isFocusMode ? 'max-w-3xl' : ''}`}>
        <div className={`grid gap-4 sm:gap-6 md:gap-8 transition-all duration-500 ${isFocusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1fr_420px]'}`}>
        {/* Timer Section */}
        <div className={`flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-8 ${isFocusMode ? 'min-h-[80vh]' : ''}`}>
          <div className="w-full max-w-2xl space-y-4 sm:space-y-6 md:space-y-8">
            {/* Header with Settings and Keyboard Shortcuts */}
            <div className="flex items-center justify-between">
              <h1 className={`font-bold transition-all duration-300 ${isFocusMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
                {isFocusMode ? '🎯 Focus Mode' : 'Focus Timer'}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2">
                <KeyboardShortcutsInfo />
                <SettingsDialog ref={settingsDialogRef} />
              </div>
            </div>

            {/* Active Task Badge */}
            <ActiveTaskBadge variant={isFocusMode ? "minimal" : "default"} />

            {/* Mode Switcher - Hidden in Focus Mode */}
            {!isFocusMode && (
              <ModeSwitcher
                currentMode={mode}
                onModeChange={handleModeChange}
                disabled={isActive}
              />
            )}

            {/* Timer Display with Progress Ring and Tick Markers */}
            <TimerDisplay
              time={formatTime(displaySeconds)}
              mode={mode}
              progress={progress}
              totalSeconds={totalDuration}
            />

            {/* Controls */}
            <TimerControls
              isRunning={isActive}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onComplete={handleComplete}
            />

            {/* Focus Mode Toggle Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isFocusMode
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {isFocusMode ? (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span>👁️</span>
                    <span>Show All</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span>🎯</span>
                    <span>Focus Mode</span>
                  </span>
                )}
              </button>
            </div>

            {/* Stats - Hidden in Focus Mode */}
            {!isFocusMode && <TimerStats completedSessions={completedSessions} />}

            {/* Ad Banner - Only for Free users, Hidden in Focus Mode */}
            {!isFocusMode && (
              <div className="mt-4 sm:mt-6">
                <AdBanner position="bottom" />
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section - Hidden in Focus Mode */}
        {!isFocusMode && (
          <div className="lg:sticky lg:top-20 h-fit max-h-[calc(100vh-6rem)] flex flex-col">
            <div className="space-y-3 sm:space-y-4 overflow-y-auto">
              {/* Unassigned Sessions */}
              <UnassignedSessions />
              
              {/* Task List */}
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Tasks</h2>
                  <span className="text-xs sm:text-sm text-muted-foreground">Today</span>
                </div>
                <TaskList />
              </Card>

              {/* Sidebar Ad for Free users */}
              <div className="hidden lg:block">
                <AdBanner position="sidebar" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
