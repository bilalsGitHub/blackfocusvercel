import { Session } from "@/stores/timer-store";

/**
 * Generate test sessions for analytics testing
 * Creates realistic session data for the past 7 days
 */
export function generateTestSessions(): Session[] {
  const sessions: Session[] = [];
  const now = new Date();
  
  // Generate sessions for the last 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - dayOffset);
    
    // Generate 3-5 sessions per day
    const sessionsPerDay = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < sessionsPerDay; i++) {
      // Random hour between 9 AM and 9 PM
      const hour = Math.floor(Math.random() * 12) + 9;
      const minute = Math.floor(Math.random() * 60);
      
      const sessionDate = new Date(dayDate);
      sessionDate.setHours(hour, minute, 0, 0);
      
      sessions.push({
        id: `test-${dayOffset}-${i}-${Date.now()}`,
        mode: "focus",
        duration: 25 * 60, // 25 minutes in seconds
        completedAt: sessionDate.toISOString(),
        wasCompleted: true,
      });
    }
  }
  
  return sessions;
}

/**
 * Add test sessions to timer store
 */
export function addTestSessionsToStore() {
  const { useTimerStore } = require("@/stores/timer-store");
  const testSessions = generateTestSessions();
  
  console.log("🧪 [TEST] Adding", testSessions.length, "test sessions");
  console.log("🧪 [TEST] First session:", testSessions[0]);
  console.log("🧪 [TEST] Last session:", testSessions[testSessions.length - 1]);
  
  // Add to store
  useTimerStore.setState((state: any) => ({
    sessions: [...state.sessions, ...testSessions],
    completedSessions: state.completedSessions + testSessions.length,
  }));
  
  console.log("🧪 [TEST] ✅ Test sessions added successfully!");
  console.log("🧪 [TEST] Total sessions:", useTimerStore.getState().sessions.length);
}
