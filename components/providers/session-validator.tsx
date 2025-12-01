"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * SessionValidator - Loads existing session on page refresh
 * 
 * This component runs ONLY on page refresh to restore the user's session.
 * It does NOT run during OAuth redirect to avoid race conditions.
 * 
 * The onAuthStateChange listener in auth-store handles all auth state changes.
 */
export function SessionValidator() {
  useEffect(() => {
    // Only check auth on page refresh/reload
    // This won't interfere with OAuth redirect flow
    console.log("[SESSION_VALIDATOR] Checking for existing session...");
    useAuthStore.getState().checkAuth();
  }, []);

  return null; // This component doesn't render anything
}
