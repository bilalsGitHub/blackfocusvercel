import { create } from "zustand";
import { supabaseBrowser } from "@/lib/supabase-browser";

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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Set user manually
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Email/Password Login
  login: async (email: string, password: string) => {
    console.log("[LOGIN] Step 1: Starting...");
    set({ isLoading: true });

    try {
      console.log("[LOGIN] Step 2: Calling Supabase...");
      
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[LOGIN] Auth error:", error);
        throw error;
      }

      console.log("[LOGIN] Step 3: Success! onAuthStateChange will handle the rest");
      
      // Don't set state here, let onAuthStateChange handle it
      // Just mark as loading complete
      set({ isLoading: false });
    } catch (error: any) {
      console.error("[LOGIN] Failed:", error);
      set({ isLoading: false, user: null, isAuthenticated: false });
      throw error;
    }
  },

  // Google OAuth Login
  loginWithGoogle: async () => {
    set({ isLoading: true });

    try {
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Email/Password Register
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
        },
      });

      if (error) throw error;

      // If no session, email confirmation required
      if (!data.session) {
        set({ isLoading: false });
        throw new Error("confirmation_required");
      }

      // Create profile
      await supabaseBrowser.from("profiles").upsert({
        id: data.user!.id,
        display_name: name,
        is_pro: false,
      });

      const user: User = {
        id: data.user!.id,
        email: data.user!.email!,
        name,
        isPro: false,
        createdAt: data.user!.created_at,
      };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    // Clear state immediately
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Sign out from Supabase (background)
    await supabaseBrowser.auth.signOut();
  },

  // Reset Password
  resetPassword: async (email: string) => {
    set({ isLoading: true });

    try {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Check current auth status
  checkAuth: async () => {
    try {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session?.user) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      // Fetch profile
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

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Check auth error:", error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));

// Initialize auth on app load
if (typeof window !== "undefined") {
  // Check auth immediately
  useAuthStore.getState().checkAuth();

  // Listen for auth changes
  supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
    console.log("[AUTH_EVENT]", event);

    if (event === "SIGNED_IN" && session?.user) {
      console.log("[AUTH_EVENT] Processing SIGNED_IN...");
      
      // Fetch profile
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // If no profile, create one
      if (!profile) {
        await supabaseBrowser.from("profiles").upsert({
          id: session.user.id,
          display_name: session.user.email!.split("@")[0],
          is_pro: false,
        });
      }

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.display_name || session.user.email!.split("@")[0],
        avatar: profile?.photo_url,
        isPro: profile?.is_pro || false,
        createdAt: session.user.created_at,
      };

      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  });
}
