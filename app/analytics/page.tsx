"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  BarChart3,
  Lightbulb,
  TestTube,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportButton } from "@/components/analytics/export-button";
import { ImportButton } from "@/components/analytics/import-button";
import { DeleteAllDataButton } from "@/components/analytics/delete-all-data-button";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import { useAuthStore } from "@/stores/auth-store";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { BubbleHeatmap } from "@/components/analytics/bubble-heatmap";
import { StatsCards } from "@/components/analytics/stats-cards";
import { StreakDisplay } from "@/components/analytics/streak-display";
import {
  generateRealWeeklyData,
  generateRealSummaryStats,
  generateRealStreakData,
} from "@/lib/analytics-utils";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  // TEST MODE: Everyone can see analytics
  const isPro = true; // user?.isPro || false;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/analytics");
    }
  }, [isAuthenticated, router]);

  // Get real sessions from store
  const sessions = useTimerStore((state) => state.sessions);

  // Week navigation state (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = React.useState(0);

  // Generate analytics from real data with week offset
  const weeklyData = React.useMemo(
    () => generateRealWeeklyData(weekOffset),
    [sessions, weekOffset]
  );
  const summaryStats = React.useMemo(
    () => generateRealSummaryStats(),
    [sessions]
  );
  const streakData = React.useMemo(() => generateRealStreakData(), [sessions]);

  // Debug stats
  React.useEffect(() => {
    // Removed console logs for production
  }, [summaryStats, sessions, weeklyData]);

  // TEST: Add dummy sessions
  const handleAddTestSessions = async () => {
    const { addTestSessionsToStore } = await import(
      "@/lib/test-sessions-generator"
    );
    addTestSessionsToStore();
    window.location.reload();
  };

  // File input ref for import
  const importInputRef = React.useRef<HTMLInputElement>(null);

  // Export button ref
  const exportButtonRef = React.useRef<HTMLButtonElement>(null);

  // Delete button ref
  const deleteButtonRef = React.useRef<HTMLButtonElement>(null);

  // Transform summary stats for cards
  const statsCards = [
    {
      label: "Total Sessions",
      value: summaryStats.totalSessions,
    },
    {
      label: "Tasks Completed",
      value: summaryStats.completedTasks || 0,
    },
    {
      label: "Focus Hours",
      value: summaryStats.totalHours,
    },
    {
      label: "Active Days",
      value: summaryStats.totalDays,
    },
  ];

  // If not Pro, show upgrade prompt
  if (!isPro) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 sm:py-16 space-y-4 sm:space-y-6">
            <div className="flex justify-center mb-2 sm:mb-4">
              <BarChart3 className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Analytics Dashboard
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Unlock powerful insights into your productivity patterns and focus
              trends with Pro.
            </p>
            <div className="flex flex-col items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <UpgradeToProButton size="lg" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Or{" "}
                <a href="/pricing" className="underline hover:text-foreground">
                  view pricing
                </a>
              </p>
            </div>

            {/* Preview */}
            <div className="mt-8 sm:mt-12 p-4 sm:p-8 rounded-xl border-2 border-dashed border-border bg-muted/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="blur-sm grayscale opacity-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="h-16 sm:h-24 rounded-lg bg-muted" />
                  <div className="h-16 sm:h-24 rounded-lg bg-muted" />
                  <div className="h-16 sm:h-24 rounded-lg bg-muted" />
                  <div className="h-16 sm:h-24 rounded-lg bg-muted" />
                </div>
                <div className="h-48 sm:h-64 rounded-lg bg-muted" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-background/95 backdrop-blur px-4 sm:px-6 py-2 sm:py-3 rounded-full border shadow-lg">
                  <span className="flex items-center gap-1.5 sm:gap-2 font-semibold text-sm sm:text-base">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span>Pro Feature</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Track your productivity patterns and focus trends over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPro && (
              <Badge
                variant="secondary"
                className="gap-1.5 px-3 py-1.5 text-sm">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Pro</span>
              </Badge>
            )}

            {/* Dropdown Menu for Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreVertical className="h-4 w-4" />
                  <span className="hidden sm:inline">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/stats")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Daily Stats
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => importInputRef.current?.click()}>
                  Import Data
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => exportButtonRef.current?.click()}>
                  Export Data
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => deleteButtonRef.current?.click()}
                  className="text-destructive focus:text-destructive">
                  Delete All Data
                </DropdownMenuItem>

                {sessions.length === 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAddTestSessions}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Add Test Data
                    </DropdownMenuItem>
                  </>
                )}

                {!isPro && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/pricing")}>
                      <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hidden components for functionality */}
            <div className="hidden">
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    if (!data.version || !data.timer || !data.tasks) {
                      throw new Error("Invalid backup file format");
                    }

                    const confirmed = window.confirm(
                      `Import backup from ${new Date(
                        data.exportDate
                      ).toLocaleDateString()}?\n\n` +
                        `This will replace your current data:\n` +
                        `- ${data.timer.sessions.length} sessions\n` +
                        `- ${data.tasks.tasks.length} tasks\n\n` +
                        `Current data will be lost!`
                    );

                    if (!confirmed) return;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const newestDate = new Date(
                      Math.max(
                        ...data.timer.sessions.map((s: any) =>
                          new Date(s.completedAt).getTime()
                        )
                      )
                    );
                    const daysDiff = Math.ceil(
                      (today.getTime() - newestDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    const adjustedSessions = data.timer.sessions.map(
                      (session: any) => {
                        const sessionDate = new Date(session.completedAt);
                        sessionDate.setDate(sessionDate.getDate() + daysDiff);
                        return {
                          ...session,
                          completedAt: sessionDate.toISOString(),
                        };
                      }
                    );

                    useTimerStore.setState({
                      sessions: adjustedSessions,
                      completedSessions: data.timer.completedSessions,
                      durations: data.timer.durations,
                    });

                    useTaskStore.setState({
                      tasks: data.tasks.tasks,
                      activeTaskId: data.tasks.activeTaskId,
                    });

                    alert("✅ Import successful!");
                    window.location.reload();
                  } catch (error) {
                    console.error("Import error:", error);
                    alert("❌ Import failed. Please check the file format.");
                  }

                  if (importInputRef.current) {
                    importInputRef.current.value = "";
                  }
                }}
              />
              <button
                ref={exportButtonRef}
                onClick={() => {
                  const timerState = useTimerStore.getState();
                  const taskState = useTaskStore.getState();
                  const data = {
                    version: "1.0.0",
                    exportDate: new Date().toISOString(),
                    user: {
                      email: user?.email,
                      name: user?.name,
                    },
                    timer: {
                      sessions: timerState.sessions,
                      completedSessions: timerState.completedSessions,
                      durations: timerState.durations,
                    },
                    tasks: {
                      tasks: taskState.tasks,
                      activeTaskId: taskState.activeTaskId,
                    },
                    stats: summaryStats,
                  };

                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });

                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `blackfocus-backup-${
                    new Date().toISOString().split("T")[0]
                  }.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              />
              <DeleteAllDataButton ref={deleteButtonRef} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <StatsCards stats={statsCards} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Heatmap - Takes 2 columns */}
          <div className="lg:col-span-2">
            <BubbleHeatmap
              data={weeklyData.days}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
            />
          </div>

          {/* Streak - Takes 1 column */}
          <div className="lg:col-span-1">
            <StreakDisplay data={streakData} />
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <span>Key Insights</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2">
                MOST PRODUCTIVE DAY
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {summaryStats.mostProductiveDay}
              </div>
            </div>
            <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2">
                PEAK FOCUS HOUR
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {summaryStats.mostProductiveHour}:00
              </div>
            </div>
            <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2">
                WEEKLY GROWTH
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">
                +{summaryStats.weeklyGrowth}% ↗
              </div>
            </div>
            <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2">
                THIS WEEK
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {weeklyData.totalSessions}
                <span className="text-sm sm:text-base text-muted-foreground ml-1">
                  sessions
                </span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                {Math.round(weeklyData.totalFocusTime / 60)}h total
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center py-3 sm:py-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 text-xs sm:text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Data updates in real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
