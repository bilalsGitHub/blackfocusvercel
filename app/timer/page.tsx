"use client";

import * as React from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTimer } from "@/hooks/use-timer";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAutoStart } from "@/hooks/use-auto-start";
import { useTimerNotifications } from "@/hooks/use-timer-notifications";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { ModeSwitcher } from "@/components/timer/mode-switcher";
import { TimerStats } from "@/components/timer/timer-stats";
import {
  SettingsDialog,
  type SettingsDialogHandle,
} from "@/components/timer/settings-dialog";
import { KeyboardShortcutsInfo } from "@/components/timer/keyboard-shortcuts-info";
import { TaskList } from "@/components/tasks/task-list";
import { ActiveTaskBadge } from "@/components/tasks/active-task-badge";
import { UnassignedSessions } from "@/components/sessions/unassigned-sessions";
import { Card } from "@/components/ui/card";
import { AdBanner } from "@/components/ads/ad-banner";
import { FontSelector } from "@/components/ui/font-selector";
import { AudioMixer } from "@/components/timer/audio-mixer";

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
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const settingsDialogRef = React.useRef<SettingsDialogHandle>(null);

  // Enable document title updates
  useDocumentTitle();

  // Enable auto-start functionality
  useAutoStart();

  // Enable timer notifications
  useTimerNotifications();

  const handlePlayPause = React.useCallback(() => {
    toggleTimer();
  }, [toggleTimer]);

  const handleReset = React.useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleModeChange = React.useCallback(
    (newMode: typeof mode) => {
      switchMode(newMode);
    },
    [switchMode]
  );

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
      ? 1 - (chronometerElapsed % CHRONO_LOOP_SECONDS) / CHRONO_LOOP_SECONDS
      : Math.max(0, Math.min(1, timeLeft / (durations[mode] || 1)));

  return (
    <>
      <div
        className={`transition-all duration-500 ${
          isFocusMode
            ? ""
            : isSidebarOpen
            ? "lg:grid lg:grid-cols-[1fr_420px]"
            : ""
        }`}>
        {/* Sidebar Toggle Button - Fixed */}
        {!isFocusMode && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-50 items-center justify-center w-10 h-20 bg-card hover:bg-muted border-l border-y rounded-l-lg shadow-lg transition-all duration-300 ${
              isSidebarOpen ? "right-[420px]" : "right-0"
            }`}
            title={isSidebarOpen ? "Close Tasks" : "Open Tasks"}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${
                isSidebarOpen ? "" : "rotate-180"
              }`}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Timer Section - Centered */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-2xl px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Header with Settings and Keyboard Shortcuts */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              {isPro && <AudioMixer variant="inline" />}
              <FontSelector />
              <KeyboardShortcutsInfo />
              <SettingsDialog ref={settingsDialogRef} />
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
                className={`group relative px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold transition-all duration-500 transform hover:scale-110 active:scale-95 overflow-hidden ${
                  isFocusMode
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:shadow-lg"
                }`}>
                {/* Animated background gradient */}
                <span
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isFocusMode ? "opacity-100" : "opacity-0"
                  }`}>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse" />
                </span>

                {/* Button content */}
                <span className="relative z-10">
                  {isFocusMode ? (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-lg sm:text-xl transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                        👁️
                      </span>
                      <span className="transition-all duration-300 group-hover:tracking-wide">
                        Show All
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-lg sm:text-xl transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[-12deg]">
                        🎯
                      </span>
                      <span className="transition-all duration-300 group-hover:tracking-wide">
                        Focus Mode
                      </span>
                    </span>
                  )}
                </span>

                {/* Ripple effect on hover */}
                <span className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/20 transition-all duration-300 group-hover:scale-110" />
              </button>
            </div>

            {/* Stats - Hidden in Focus Mode */}
            {!isFocusMode && (
              <TimerStats completedSessions={completedSessions} />
            )}

            {/* Ad Banner - Only for Free users, Hidden in Focus Mode */}
            {!isFocusMode && (
              <div className="mt-4 sm:mt-6">
                <AdBanner position="bottom" />
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section - Fixed Right Sidebar */}
        {!isFocusMode && (
          <div
            className={`hidden lg:block fixed right-0 top-0 w-[420px] h-screen overflow-y-auto border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}>
            <div className="pt-16 p-4 space-y-3 sm:space-y-4">
              {/* Unassigned Sessions */}
              <UnassignedSessions />

              {/* Task List */}
              <Card className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Tasks</h2>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Today
                  </span>
                </div>
                <TaskList />
              </Card>

              {/* Sidebar Ad for Free users */}
              <div>
                <AdBanner position="sidebar" />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tasks Section - Below Timer on Mobile */}
        {!isFocusMode && (
          <div className="lg:hidden px-3 sm:px-4 pb-4 space-y-3 sm:space-y-4">
            <UnassignedSessions />

            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold">Tasks</h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Today
                </span>
              </div>
              <TaskList />
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
