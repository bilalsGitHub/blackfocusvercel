"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useTimerStore } from "@/stores/timer-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Award } from "lucide-react";

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
  sessionDetails: Array<{
    time: string;
    mode: string;
    duration: string;
    taskId?: string;
  }>;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateKey = dateStr;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

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

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/stats");
    }
  }, [isAuthenticated, router]);

  // Group sessions by day
  const dailyStats = React.useMemo(() => {
    if (sessions.length === 0) return [];

    // Group by date
    const grouped = new Map<string, DailyStats>();

    sessions.forEach((session) => {
      if (!session.wasCompleted) return;

      const date = new Date(session.completedAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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
          sessionDetails: [],
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
      const durationStr =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      dayStats.sessionDetails.push({
        time: sessionTime,
        mode: session.mode,
        duration: durationStr,
        taskId: session.taskId,
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
    });

    // Convert to array and sort by date (most recent first)
    return Array.from(grouped.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [sessions]);

  // Calculate overall stats
  const overallStats = React.useMemo(() => {
    const totalDays = dailyStats.length;
    const totalSessions = dailyStats.reduce(
      (sum, day) => sum + day.totalSessions,
      0
    );
    const totalMinutes = dailyStats.reduce(
      (sum, day) => sum + day.totalMinutes,
      0
    );
    const avgSessionsPerDay = totalDays > 0 ? (totalSessions / totalDays).toFixed(1) : "0";
    const avgMinutesPerDay = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;

    return {
      totalDays,
      totalSessions,
      totalMinutes,
      avgSessionsPerDay,
      avgMinutesPerDay,
    };
  }, [dailyStats]);

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

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{overallStats.totalDays}</div>
            <div className="text-xs text-muted-foreground">Active Days</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{overallStats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{overallStats.avgSessionsPerDay}</div>
            <div className="text-xs text-muted-foreground">Avg Sessions/Day</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Award className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {Math.floor(overallStats.avgMinutesPerDay / 60)}h{" "}
              {overallStats.avgMinutesPerDay % 60}m
            </div>
            <div className="text-xs text-muted-foreground">Avg Time/Day</div>
          </Card>
        </div>

        {/* Daily Breakdown */}
        {dailyStats.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">No stats yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete your first session to see your statistics here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {dailyStats.map((day) => (
              <Card key={day.date} className="p-4 sm:p-6">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      {day.dateDisplay}
                    </h3>
                    <p className="text-sm text-muted-foreground">{day.dayName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {day.totalSessions} sessions
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {day.totalHours}
                    </Badge>
                  </div>
                </div>

                {/* Session Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {day.focusSessions > 0 && (
                    <div className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <div className="text-xl font-bold text-blue-500">
                        {day.focusSessions}
                      </div>
                      <div className="text-xs text-muted-foreground">Focus</div>
                    </div>
                  )}
                  {day.breakSessions > 0 && (
                    <div className="text-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                      <div className="text-xl font-bold text-green-500">
                        {day.breakSessions}
                      </div>
                      <div className="text-xs text-muted-foreground">Breaks</div>
                    </div>
                  )}
                  {day.chronometerSessions > 0 && (
                    <div className="text-center p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                      <div className="text-xl font-bold text-orange-500">
                        {day.chronometerSessions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Chronometer
                      </div>
                    </div>
                  )}
                </div>

                {/* Session Details */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    SESSION TIMELINE
                  </div>
                  {day.sessionDetails.map((session, idx) => (
                    <div
                      key={idx}
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
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        {dailyStats.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Showing all {dailyStats.length} active days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
