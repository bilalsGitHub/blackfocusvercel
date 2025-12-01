// Dummy Analytics Data for Testing

export interface HourlyActivity {
  hour: number; // 0-23
  sessions: number; // Number of Pomodoro sessions
  focusTime: number; // Minutes of focus time
  intensity: number; // 0-100
}

export interface DailyActivity {
  date: string; // ISO date
  day: string; // "Mon", "Tue", etc.
  hourlyData: HourlyActivity[];
  totalSessions: number;
  totalFocusTime: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  days: DailyActivity[];
  totalSessions: number;
  totalFocusTime: number;
  averagePerDay: number;
}

export interface CategoryData {
  name: string;
  sessions: number;
  percentage: number;
  color: string;
}

// Generate dummy hourly data for a day
function generateHourlyData(date: string, intensity: number): HourlyActivity[] {
  const hours: HourlyActivity[] = [];
  
  // Define peak hours (9-12, 14-18, 20-22)
  const peakHours = [9, 10, 11, 14, 15, 16, 17, 20, 21];
  
  for (let hour = 0; hour < 24; hour++) {
    const isPeak = peakHours.includes(hour);
    const baseIntensity = isPeak ? intensity : intensity * 0.3;
    const randomVariation = Math.random() * 30 - 15; // -15 to +15
    
    const sessions = isPeak 
      ? Math.floor(Math.random() * 4) + 1 
      : Math.floor(Math.random() * 2);
    
    const focusTime = sessions * 25; // 25 minutes per session
    const calculatedIntensity = Math.max(0, Math.min(100, baseIntensity + randomVariation));
    
    hours.push({
      hour,
      sessions,
      focusTime,
      intensity: calculatedIntensity,
    });
  }
  
  return hours;
}

// Generate dummy data for last 7 days
export function generateWeeklyData(): WeeklyStats {
  const today = new Date();
  const days: DailyActivity[] = [];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Weekdays have higher intensity
    const baseIntensity = isWeekend ? 40 : 70;
    const hourlyData = generateHourlyData(date.toISOString(), baseIntensity);
    
    const totalSessions = hourlyData.reduce((sum, h) => sum + h.sessions, 0);
    const totalFocusTime = hourlyData.reduce((sum, h) => sum + h.focusTime, 0);
    
    days.push({
      date: date.toISOString(),
      day: dayNames[dayOfWeek],
      hourlyData,
      totalSessions,
      totalFocusTime,
    });
  }
  
  const totalSessions = days.reduce((sum, d) => sum + d.totalSessions, 0);
  const totalFocusTime = days.reduce((sum, d) => sum + d.totalFocusTime, 0);
  
  return {
    weekStart: days[0].date,
    weekEnd: days[days.length - 1].date,
    days,
    totalSessions,
    totalFocusTime,
    averagePerDay: Math.round(totalSessions / days.length),
  };
}

// Generate last 30 days data
export function generateMonthlyData(): DailyActivity[] {
  const today = new Date();
  const days: DailyActivity[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const baseIntensity = isWeekend ? 40 : 70;
    const hourlyData = generateHourlyData(date.toISOString(), baseIntensity);
    
    const totalSessions = hourlyData.reduce((sum, h) => sum + h.sessions, 0);
    const totalFocusTime = hourlyData.reduce((sum, h) => sum + h.focusTime, 0);
    
    days.push({
      date: date.toISOString(),
      day: dayNames[dayOfWeek],
      hourlyData,
      totalSessions,
      totalFocusTime,
    });
  }
  
  return days;
}

// Category breakdown
export function generateCategoryData(): CategoryData[] {
  return [
    { name: "Work", sessions: 68, percentage: 45, color: "#ffffff" },
    { name: "Study", sessions: 45, percentage: 30, color: "#cccccc" },
    { name: "Personal", sessions: 38, percentage: 25, color: "#888888" },
  ];
}

// Streak data
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakDates: string[];
}

export function generateStreakData(): StreakData {
  const today = new Date();
  const streakDates: string[] = [];
  
  // Current streak: 23 days
  for (let i = 22; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    streakDates.push(date.toISOString().split('T')[0]);
  }
  
  return {
    currentStreak: 23,
    longestStreak: 45,
    streakDates,
  };
}

// Summary stats
export interface SummaryStats {
  totalSessions: number;
  totalHours: number;
  totalDays: number;
  averagePerDay: number;
  weeklyGrowth: number; // percentage
  mostProductiveDay: string;
  mostProductiveHour: number;
}

export function generateSummaryStats(): SummaryStats {
  return {
    totalSessions: 156,
    totalHours: 89,
    totalDays: 23,
    averagePerDay: 4.2,
    weeklyGrowth: 12,
    mostProductiveDay: "Wednesday",
    mostProductiveHour: 14,
  };
}

