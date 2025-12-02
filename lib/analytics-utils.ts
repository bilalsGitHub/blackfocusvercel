import { useTimerStore, Session } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";

export interface HeatmapDay {
  date: string;
  dayName: string;
  sessions: number;
  focusTime: number; // in seconds
  hourlyActivity: Record<number, { sessions: number; minutes: number }>;
}

// Helper to generate YYYY-MM-DD string based on LOCAL time (avoids timezone shifts)
export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to convert UTC date to local date key (for session comparison)
export function getUTCDateAsLocalKey(utcDateString: string) {
  const date = new Date(utcDateString);
  // Use local time interpretation
  return getLocalDateKey(date);
}

// Generate real analytics from timer store sessions
export function generateRealWeeklyData(weekOffset: number = 0) {
  const sessions = useTimerStore.getState().sessions;

  // Get last 7 days (with offset for week navigation)
  const today = new Date();
  today.setDate(today.getDate() + weekOffset * 7); // Offset by weeks
  const last7Days: HeatmapDay[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter sessions for this day (all completed sessions including chrono)
    const targetDateKey = getLocalDateKey(date);

    const daySessions = sessions.filter((s) => {
      if (!s.wasCompleted) return false; // Only completed sessions

      const sessionDate = new Date(s.completedAt);
      const sessionLocalDateKey = getLocalDateKey(sessionDate);

      // Debug first session to see what's happening
      if (i === 6 && sessions.indexOf(s) === 0) {
        console.log(`🔍 [DEBUG] Comparing dates:`, {
          sessionUTC: s.completedAt,
          sessionLocal: sessionDate.toString(),
          sessionDateKey: sessionLocalDateKey,
          targetDateKey: targetDateKey,
          match: sessionLocalDateKey === targetDateKey,
        });
      }

      return sessionLocalDateKey === targetDateKey;
    });

    // Group by hour
    const hourlyData: {
      [hour: number]: { sessions: number; minutes: number };
    } = {};

    daySessions.forEach((session) => {
      const sessionDate = new Date(session.completedAt);
      const hour = sessionDate.getHours();

      if (!hourlyData[hour]) {
        hourlyData[hour] = { sessions: 0, minutes: 0 };
      }
      hourlyData[hour].sessions += 1;
      hourlyData[hour].minutes += Math.round(session.duration / 60);
    });

    // Debug log for days with sessions
    if (daySessions.length > 0) {
      console.log(
        `📅 [ANALYTICS] ${getLocalDateKey(date)} (${date.toLocaleDateString(
          "en-US",
          { weekday: "short" }
        )}) - ${daySessions.length} sessions:`,
        {
          hours: Object.keys(hourlyData).map(
            (h) =>
              `${h}:00 (${hourlyData[parseInt(h)].sessions} sessions, ${
                hourlyData[parseInt(h)].minutes
              }m)`
          ),
          rawSessions: daySessions.map((s) => ({
            time: new Date(s.completedAt).toLocaleTimeString(),
            duration: s.duration,
          })),
        }
      );
    }

    last7Days.push({
      date: getLocalDateKey(date),
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      sessions: daySessions.length,
      focusTime: daySessions.reduce((sum, s) => sum + s.duration, 0),
      hourlyActivity: hourlyData,
    });
  }

  const totalSessions = last7Days.reduce((sum, d) => sum + d.sessions, 0);
  const totalFocusTime = last7Days.reduce((sum, d) => sum + d.focusTime, 0);

  return {
    days: last7Days,
    totalSessions,
    totalFocusTime,
  };
}

export function generateRealSummaryStats() {
  const sessions = useTimerStore.getState().sessions;
  const tasks = useTaskStore.getState().tasks;
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const completedSessionsList = sessions.filter((s) => s.wasCompleted);

  if (completedSessionsList.length === 0 && completedTasks.length === 0) {
    return {
      totalSessions: 0,
      totalHours: 0,
      totalDays: 0,
      averagePerDay: 0,
      weeklyGrowth: 0,
      mostProductiveDay: "N/A",
      mostProductiveHour: 0,
      completedTasks: 0,
    };
  }

  // Total sessions (completed focus/chrono sessions only)
  const completedSessionsCount = completedSessionsList.length;
  const totalSessions = completedSessionsCount;

  const totalMinutes = completedSessionsList.reduce(
    (sum, s) => sum + s.duration / 60,
    0
  );
  const totalHours = Math.round(totalMinutes / 60);

  // Debug logging
  console.log("📊 Analytics Stats Debug:", {
    totalSessions: sessions.length,
    completedSessions: completedSessionsList.length,
    totalMinutes,
    totalHours,
  });

  // Get unique days (from both sessions and completed tasks)
  const uniqueDays = new Set([
    ...completedSessionsList.map((s) =>
      getLocalDateKey(new Date(s.completedAt))
    ),
    ...completedTasks
      .filter((t) => t.completedAt)
      .map((t) => getLocalDateKey(new Date(t.completedAt!))),
  ]);
  const totalDays = uniqueDays.size;

  // Average per day
  const averagePerDay =
    totalDays > 0 ? parseFloat((totalMinutes / 60 / totalDays).toFixed(1)) : 0;

  // Most productive day
  const dayCount: { [day: string]: number } = {};
  sessions.forEach((s) => {
    const day = new Date(s.completedAt).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const mostProductiveDay =
    Object.keys(dayCount).length > 0
      ? Object.keys(dayCount).reduce((a, b) =>
          dayCount[a] > dayCount[b] ? a : b
        )
      : "N/A";

  // Most productive hour
  const hourCount: { [hour: number]: number } = {};
  sessions.forEach((s) => {
    const hour = new Date(s.completedAt).getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });
  const mostProductiveHour =
    Object.keys(hourCount).length > 0
      ? parseInt(
          Object.keys(hourCount).reduce((a, b) =>
            hourCount[parseInt(a)] > hourCount[parseInt(b)] ? a : b
          )
        )
      : 14;

  // Weekly growth (compare last 7 days vs previous 7 days)
  const today = new Date();
  const last7DaysStart = new Date(today);
  last7DaysStart.setDate(today.getDate() - 7);
  const prev7DaysStart = new Date(today);
  prev7DaysStart.setDate(today.getDate() - 14);

  const last7Sessions = sessions.filter((s) => {
    const date = new Date(s.completedAt);
    return date >= last7DaysStart;
  }).length;

  const prev7Sessions = sessions.filter((s) => {
    const date = new Date(s.completedAt);
    return date >= prev7DaysStart && date < last7DaysStart;
  }).length;

  const weeklyGrowth =
    prev7Sessions > 0
      ? Math.round(((last7Sessions - prev7Sessions) / prev7Sessions) * 100)
      : 0;

  return {
    totalSessions,
    totalHours,
    totalDays,
    averagePerDay,
    weeklyGrowth,
    mostProductiveDay,
    mostProductiveHour,
    completedTasks: completedTasks.length,
  };
}

export function generateRealStreakData() {
  const sessions = useTimerStore.getState().sessions;

  if (sessions.length === 0) {
    // Get last 30 days for the streak calendar (empty state)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const streakDates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      streakDates.push(getLocalDateKey(date));
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      streakDates,
    };
  }

  // Get unique days with sessions (all completed sessions including chrono)
  const daysWithSessions = new Set(
    sessions
      .filter((s) => s.wasCompleted)
      .map((s) => getLocalDateKey(new Date(s.completedAt)))
  );

  const sortedDays = Array.from(daysWithSessions).sort();

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = getLocalDateKey(checkDate);

    if (daysWithSessions.has(dateStr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Get last 30 days for the streak calendar
  const streakDates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    streakDates.push(getLocalDateKey(date));
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalDays: daysWithSessions.size,
    streakDates,
  };
}
