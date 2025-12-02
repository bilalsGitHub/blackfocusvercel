"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface DailyStats {
  date: string;
  dateDisplay: string;
  dayName: string;
  totalSessions: number;
  focusSessions: number;
  breakSessions: number;
  chronometerSessions: number;
  totalMinutes: number;
  totalHours: string;
  completedTasks: number;
  sessionDetails: Array<{
    time: string;
    mode: string;
    duration: string;
    taskId?: string;
  }>;
  completedTaskDetails: Array<{
    time: string;
    title: string;
    pomodoros: number;
  }>;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateKey = dateStr;
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterdayKey = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1
  ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (dateKey === todayKey) return "Today";
  if (dateKey === yesterdayKey) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getModeColor(mode: string): string {
  switch (mode) {
    case "focus":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "shortBreak":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "longBreak":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "chronometer":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case "focus":
      return "Focus";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
    case "chronometer":
      return "Chronometer";
    default:
      return mode;
  }
}

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const sessions = useTimerStore((state) => state.sessions);
  const tasks = useTaskStore((state) => state.tasks);

  // Current selected date index (0 = today/most recent)
  const [currentDayIndex, setCurrentDayIndex] = React.useState(0);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/stats");
    }
  }, [isAuthenticated, router]);

  // Group sessions by day and include completed tasks
  const dailyStats = React.useMemo(() => {
    // Group by date
    const grouped = new Map<string, DailyStats>();

    // Process sessions
    sessions.forEach((session) => {
      if (!session.wasCompleted) return;

      const date = new Date(session.completedAt);
      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date: dateKey,
          dateDisplay: formatDate(dateKey),
          dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
          totalSessions: 0,
          focusSessions: 0,
          breakSessions: 0,
          chronometerSessions: 0,
          totalMinutes: 0,
          totalHours: "0h 0m",
          completedTasks: 0,
          sessionDetails: [],
          completedTaskDetails: [],
        });
      }

      const dayStats = grouped.get(dateKey)!;
      dayStats.totalSessions++;
      dayStats.totalMinutes += Math.round(session.duration / 60);

      if (session.mode === "focus") dayStats.focusSessions++;
      else if (session.mode === "shortBreak" || session.mode === "longBreak")
        dayStats.breakSessions++;
      else if (session.mode === "chronometer") dayStats.chronometerSessions++;

      // Add session detail
      const sessionTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const sessionDuration = Math.round(session.duration / 60);
      const hours = Math.floor(sessionDuration / 60);
      const minutes = sessionDuration % 60;
      const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      dayStats.sessionDetails.push({
        time: sessionTime,
        mode: session.mode,
        duration: durationStr,
        taskId: session.taskId,
      });
    });

    // Process completed tasks (without session)
    tasks.forEach((task) => {
      if (!task.isCompleted || !task.completedAt) return;

      const date = new Date(task.completedAt);
      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date: dateKey,
          dateDisplay: formatDate(dateKey),
          dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
          totalSessions: 0,
          focusSessions: 0,
          breakSessions: 0,
          chronometerSessions: 0,
          totalMinutes: 0,
          totalHours: "0h 0m",
          completedTasks: 0,
          sessionDetails: [],
          completedTaskDetails: [],
        });
      }

      const dayStats = grouped.get(dateKey)!;
      dayStats.completedTasks++;

      // Add task detail
      const taskTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      dayStats.completedTaskDetails.push({
        time: taskTime,
        title: task.title,
        pomodoros: task.completedPomodoros,
      });
    });

    // Calculate total hours for each day
    grouped.forEach((dayStats) => {
      const hours = Math.floor(dayStats.totalMinutes / 60);
      const minutes = dayStats.totalMinutes % 60;
      dayStats.totalHours = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Sort session details by time (most recent first)
      dayStats.sessionDetails.sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
        const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
        return timeB - timeA;
      });

      // Sort completed task details by time (most recent first)
      dayStats.completedTaskDetails.sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
        const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
        return timeB - timeA;
      });
    });

    // Convert to array and sort by date (most recent first)
    const result = Array.from(grouped.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // If no data at all, return empty array
    if (
      result.length === 0 &&
      sessions.length === 0 &&
      tasks.filter((t) => t.isCompleted).length === 0
    ) {
      return [];
    }

    return result;
  }, [sessions, tasks]);

  // Get current day data
  const currentDay = dailyStats[currentDayIndex];

  // Debug: Log current day info
  React.useEffect(() => {
    if (currentDay) {
      console.log("Current Day:", currentDay.dateDisplay, currentDay.date);
      console.log("Total Sessions:", currentDay.totalSessions);
      console.log("Session Details Count:", currentDay.sessionDetails.length);
    }
  }, [currentDay]);

  // Calculate stats for current day only
  const currentDayStats = React.useMemo(() => {
    if (!currentDay) {
      return {
        totalDays: dailyStats.length,
        totalSessions: 0,
        totalMinutes: 0,
        avgSessionsPerDay: "0",
        avgMinutesPerDay: 0,
      };
    }

    // For the selected day
    const totalSessions = currentDay.totalSessions;
    const totalMinutes = currentDay.totalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      totalDays: dailyStats.length,
      totalSessions,
      totalMinutes,
      totalHours: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      focusSessions: currentDay.focusSessions,
      breakSessions: currentDay.breakSessions,
      chronometerSessions: currentDay.chronometerSessions,
    };
  }, [currentDay, dailyStats.length]);

  // Navigation handlers
  const goToPreviousDay = () => {
    if (currentDayIndex < dailyStats.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const goToNextDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const goToToday = () => {
    setCurrentDayIndex(0);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
              📊 Daily Statistics
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Clear overview of your daily productivity
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/analytics")}
            size="sm">
            View Analytics
          </Button>
        </div>

        {/* Date Navigation */}
        {dailyStats.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousDay}
                disabled={currentDayIndex >= dailyStats.length - 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Day
              </Button>

              <div className="flex flex-col items-center gap-1">
                <h3 className="text-lg font-bold">
                  {currentDay?.dateDisplay || "No Data"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentDay?.dayName || ""}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextDay}
                disabled={currentDayIndex === 0}>
                Next Day
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {currentDayIndex > 0 && (
              <div className="mt-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs">
                  Jump to Today
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Current Day Stats Cards */}
        {currentDay && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                {currentDayStats.totalDays}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Clock className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                {currentDayStats.totalSessions}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Sessions
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                {currentDayStats.focusSessions + currentDayStats.breakSessions}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg Sessions/Day
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Award className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                {currentDayStats.totalHours}
              </div>
              <div className="text-xs text-muted-foreground">Avg Time/Day</div>
            </Card>
          </div>
        )}

        {/* Daily Breakdown */}
        {dailyStats.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">No stats yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete your first session to see your statistics here
            </p>
          </Card>
        ) : currentDay ? (
          <div className="space-y-4">
            <Card key={currentDay.date} className="p-4 sm:p-6">
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    Daily Activity
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All activity for {currentDay.dateDisplay} (
                    {currentDay.dayName})
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentDay.completedTasks > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {currentDay.completedTasks} tasks
                    </Badge>
                  )}
                  {currentDay.totalSessions > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {currentDay.totalSessions} sessions
                    </Badge>
                  )}
                  {currentDay.totalHours !== "0m" && (
                    <Badge variant="secondary" className="text-xs">
                      {currentDay.totalHours}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {currentDay.completedTasks > 0 && (
                  <div className="text-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="text-xl font-bold text-green-500">
                      {currentDay.completedTasks}
                    </div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                )}
                {currentDay.focusSessions > 0 && (
                  <div className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="text-xl font-bold text-blue-500">
                      {currentDay.focusSessions}
                    </div>
                    <div className="text-xs text-muted-foreground">Focus</div>
                  </div>
                )}
                {currentDay.breakSessions > 0 && (
                  <div className="text-center p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <div className="text-xl font-bold text-purple-500">
                      {currentDay.breakSessions}
                    </div>
                    <div className="text-xs text-muted-foreground">Breaks</div>
                  </div>
                )}
                {currentDay.chronometerSessions > 0 && (
                  <div className="text-center p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                    <div className="text-xl font-bold text-orange-500">
                      {currentDay.chronometerSessions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Chronometer
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  ACTIVITY TIMELINE
                </div>

                {/* Completed Tasks */}
                {currentDay.completedTaskDetails.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      ✅ Completed Tasks
                    </div>
                    {currentDay.completedTaskDetails.map((task, idx) => (
                      <div
                        key={`task-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <div className="text-sm font-mono text-muted-foreground">
                            {task.time}
                          </div>
                          <div className="text-sm font-medium">
                            {task.title}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          {task.pomodoros} 🍅
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Session Details */}
                {currentDay.sessionDetails.length > 0 && (
                  <div className="space-y-2">
                    {currentDay.completedTaskDetails.length > 0 && (
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        ⏱️ Timer Sessions
                      </div>
                    )}
                    {currentDay.sessionDetails.map((session, idx) => (
                      <div
                        key={`session-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-mono text-muted-foreground">
                            {session.time}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getModeColor(session.mode)}`}>
                            {getModeLabel(session.mode)}
                          </Badge>
                        </div>
                        <div className="text-sm font-semibold">
                          {session.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No activity message */}
                {currentDay.sessionDetails.length === 0 &&
                  currentDay.completedTaskDetails.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">
                        No activity recorded for this day
                      </p>
                    </div>
                  )}
              </div>
            </Card>
          </div>
        ) : null}

        {/* Footer */}
        {dailyStats.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Day {currentDayIndex + 1} of {dailyStats.length} active days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
