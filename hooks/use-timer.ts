"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/stores/timer-store";

export function useTimer() {
  const { isActive, tick } = useTimerStore();
  const rafIdRef = useRef<number | null>(null);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    tick();
    rafIdRef.current = requestAnimationFrame(animate);
  }, [tick]);

  useEffect(() => {
    if (isActive) {
      // Start animation loop
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation loop
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isActive, animate]);

  // Format time to mm:ss
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Format duration to human readable
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  // Calculate total focus time
  const calculateTotalFocusTime = useCallback((sessions: any[]): number => {
    return sessions
      .filter(session => session.mode === "focus" && session.wasCompleted)
      .reduce((total, session) => total + session.duration, 0);
  }, []);

  return {
    formatTime,
    formatDuration,
    calculateTotalFocusTime,
  };
}
