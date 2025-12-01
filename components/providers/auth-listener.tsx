"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Global Supabase auth state listener
 * Handles all authentication events in one place
 */
export function AuthListener() {
  useEffect(() => {
    console.log("[AUTH_LISTENER] Initializing...");

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      console.log(`[AUTH_LISTENER] Event: ${event}`);
      useAuthStore.getState().handleAuthEvent(event, session);
    });

    // Initial session check on mount
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("[AUTH_LISTENER] Initial session found");
        useAuthStore.getState().handleAuthEvent("SIGNED_IN", session);
      } else {
        console.log("[AUTH_LISTENER] No initial session");
      }
    });

    console.log("[AUTH_LISTENER] ✅ Ready");

    // Cleanup subscription on unmount
    return () => {
      console.log("[AUTH_LISTENER] Cleaning up...");
      subscription.unsubscribe();
    };
  }, []);

  return null; // This component doesn't render anything
}
