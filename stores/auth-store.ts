"use client";

import { create } from "zustand";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPro: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthEvent: (
    event: AuthChangeEvent,
    session: Session | null
  ) => Promise<void>;
}

/**
 * Clear all stale Supabase auth tokens from localStorage
 * This fixes the "cache-dependent login" bug
 */
function clearSupabaseTokens() {
  console.log("[AUTH] Clearing stale Supabase tokens...");
  const keys = Object.keys(localStorage);
  let cleared = 0;

  for (const key of keys) {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      localStorage.removeItem(key);
      cleared++;
      console.log(`[AUTH] Removed: ${key}`);
    }
  }

  console.log(`[AUTH] ✅ Cleared ${cleared} token(s)`);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Set user manually
  setUser: (user) => {
    console.log("[AUTH] setUser:", user?.email || "null");
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Email/Password Login
  login: async (email: string, password: string) => {
    console.log("[LOGIN] Starting login for:", email);
    set({ isLoading: true });

    try {
      // Clear stale tokens BEFORE login
      clearSupabaseTokens();

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[LOGIN] ❌ Error:", error.message);
        throw error;
      }

      console.log("[LOGIN] ✅ Supabase auth successful");
      // onAuthStateChange will handle state update via handleAuthEvent
      set({ isLoading: false });
    } catch (error: any) {
      console.error("[LOGIN] ❌ Failed:", error);
      set({ isLoading: false, user: null, isAuthenticated: false });
      throw error;
    }
  },

  // Google OAuth Login
  loginWithGoogle: async () => {
    console.log("[LOGIN] Starting Google OAuth...");
    set({ isLoading: true });

    try {
      // Clear stale tokens BEFORE OAuth
      clearSupabaseTokens();

      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("[LOGIN] ❌ Google OAuth error:", error);
        throw error;
      }

      // OAuth redirects, so loading state continues
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Email/Password Register
  register: async (name: string, email: string, password: string) => {
    console.log("[REGISTER] Starting registration for:", email);
    set({ isLoading: true });

    try {
      // Clear stale tokens BEFORE registration
      clearSupabaseTokens();

      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
        },
      });

      if (error) {
        console.error("[REGISTER] ❌ Error:", error);
        throw error;
      }

      // If no session, email confirmation required
      if (!data.session) {
        console.log("[REGISTER] ⚠️ Email confirmation required");
        set({ isLoading: false });
        throw new Error("confirmation_required");
      }

      // Create profile (non-blocking)
      supabaseBrowser
        .from("profiles")
        .upsert({
          id: data.user!.id,
          display_name: name,
          is_pro: false,
        })
        .then(({ error }) => {
          if (error) {
            console.error("[REGISTER] ⚠️ Profile creation failed:", error);
          } else {
            console.log("[REGISTER] ✅ Profile created");
          }
        });

      console.log("[REGISTER] ✅ Registration successful");
      // onAuthStateChange will handle state update via handleAuthEvent
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    console.log("[LOGOUT] Logging out...");

    // Clear state immediately
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    try {
      // Sign out from Supabase
      await supabaseBrowser.auth.signOut();

      // Clear stale tokens AFTER logout
      clearSupabaseTokens();

      console.log("[LOGOUT] ✅ Signed out");
    } catch (error) {
      console.error("[LOGOUT] ❌ Error:", error);
      // Still clear tokens even if signOut fails
      clearSupabaseTokens();
    }
  },

  // Reset Password
  resetPassword: async (email: string) => {
    console.log("[RESET] Sending reset email to:", email);
    set({ isLoading: true });

    try {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        console.error("[RESET] ❌ Error:", error);
        throw error;
      }

      console.log("[RESET] ✅ Reset email sent");
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Check current auth status (manual only, for page refresh)
  checkAuth: async () => {
    console.log("[AUTH] Checking authentication...");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabaseBrowser.auth.getSession();

      // If there's a session error, clear everything
      if (sessionError) {
        console.error("[AUTH] ❌ Session error:", sessionError);
        clearSupabaseTokens();
        await supabaseBrowser.auth.signOut();
        set({ user: null, isAuthenticated: false });
        return;
      }

      if (!session?.user) {
        console.log("[AUTH] No active session");
        set({ user: null, isAuthenticated: false });
        return;
      }

      console.log("[AUTH] Active session found for:", session.user.email);

      // Fetch profile (non-blocking fallback)
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.display_name || session.user.email!.split("@")[0],
        avatar: profile?.photo_url,
        isPro: profile?.is_pro || false,
        createdAt: session.user.created_at,
      };

      console.log("[AUTH] ✅ Authenticated as:", user.email);
      set({
        user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error("[AUTH] ❌ Check failed:", error);

      // If it's an auth error, clear the session
      if (
        error?.message?.includes("session") ||
        error?.message?.includes("token")
      ) {
        console.log("[AUTH] Clearing invalid session...");
        clearSupabaseTokens();
        await supabaseBrowser.auth.signOut();
      }

      set({ user: null, isAuthenticated: false });
    }
  },

  // Handle auth events from Supabase listener
  handleAuthEvent: async (event: AuthChangeEvent, session: Session | null) => {
    console.log(`[AUTH_EVENT] Processing: ${event}`);

    if (event === "SIGNED_IN" && session?.user) {
      console.log("[AUTH_EVENT] User signed in:", session.user.email);

      try {
        // Fetch profile from database (non-blocking)
        const { data: profile, error: profileError } = await supabaseBrowser
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        // If profile doesn't exist, create one (non-blocking)
        if (profileError && profileError.code === "PGRST116") {
          console.log("[AUTH_EVENT] Creating new profile...");
          supabaseBrowser
            .from("profiles")
            .upsert({
              id: session.user.id,
              display_name: session.user.email!.split("@")[0],
              is_pro: false,
            })
            .then(({ error }) => {
              if (error) {
                console.error(
                  "[AUTH_EVENT] ⚠️ Profile creation failed:",
                  error
                );
              } else {
                console.log("[AUTH_EVENT] ✅ Profile created");
              }
            });
        }

        // Create user object with fallback
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: profile?.display_name || session.user.email!.split("@")[0],
          avatar: profile?.photo_url,
          isPro: profile?.is_pro || false,
          createdAt: session.user.created_at,
        };

        // Update store
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log("[AUTH_EVENT] ✅ Authentication complete!");
      } catch (error) {
        console.error("[AUTH_EVENT] ❌ Error processing sign in:", error);

        // Fallback: Set basic user info even if profile fails
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split("@")[0],
          isPro: false,
          createdAt: session.user.created_at,
        };

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log("[AUTH_EVENT] ⚠️ Using fallback user data");
      }
    } else if (event === "SIGNED_OUT") {
      console.log("[AUTH_EVENT] User signed out");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } else if (event === "TOKEN_REFRESHED") {
      console.log("[AUTH_EVENT] Token refreshed");
      // Session is still valid, keep current state
    } else if (event === "USER_UPDATED") {
      console.log("[AUTH_EVENT] User updated");
      // Optionally refresh user data here
    }
  },
}));
