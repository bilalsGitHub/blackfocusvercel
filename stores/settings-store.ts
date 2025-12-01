import { create } from "zustand";

export interface NotificationSettings {
  enabled: boolean;
  sound: "bell" | "chime" | "ding" | "none";
  volume: number; // 0-100
}

export type ThemePreset = 
  | "default" 
  | "ocean" 
  | "forest" 
  | "sunset" 
  | "midnight" 
  | "rose"
  | "custom";

export interface BackgroundSettings {
  enabled: boolean;
  imageUrl: string;
  opacity: number; // 0-100
  blur: number; // 0-20
}

export interface AppSettings {
  // Notifications
  notifications: NotificationSettings;
  
  // Auto-start next session
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  
  // Long break interval (after how many focus sessions)
  longBreakInterval: number;
  
  // Visual settings
  showProgressInTitle: boolean; // Update document.title with time
  showNotificationsInTitle: boolean;
  showTickMarkers: boolean; // Show tick markers on timer ring
  
  // Pro-only: Custom themes
  themePreset: ThemePreset;
  
  // Pro-only: Background image
  background: BackgroundSettings;
  
  // Accessibility
  reduceMotion: boolean;
}

interface SettingsState extends AppSettings {
  isLoading: boolean;
  // Actions
  fetchSettings: () => Promise<void>;
  updateNotifications: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    sound: "bell",
    volume: 50,
  },
  autoStartBreak: false,
  autoStartFocus: false,
  longBreakInterval: 4,
  showProgressInTitle: true,
  showNotificationsInTitle: true,
  showTickMarkers: true,
  themePreset: "default",
  background: {
    enabled: false,
    imageUrl: "",
    opacity: 100,
    blur: 0,
  },
  reduceMotion: false,
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
      ...DEFAULT_SETTINGS,
      isLoading: false,

      // Fetch settings from backend
      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/settings");
          if (!response.ok) throw new Error("Failed to fetch settings");
          
          const data = await response.json();
          
          if (data && data.data) {
            set({ ...data.data, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Fetch settings error:", error);
          set({ isLoading: false });
        }
      },

      // Update notification settings
      updateNotifications: async (newSettings) => {
        const current = get().notifications;
        const updatedNotifications = {
          ...current,
          ...newSettings,
        };
        
        set({ notifications: updatedNotifications });
        
        // Save to backend
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...get() }),
          });
        } catch (error) {
          console.error("Update notifications error:", error);
        }
      },

      // Update app settings
      updateSettings: async (newSettings) => {
        set(newSettings);
        
        // Save to backend
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...get(), ...newSettings }),
          });
        } catch (error) {
          console.error("Update settings error:", error);
        }
      },

      // Reset to defaults
      resetSettings: async () => {
        set(DEFAULT_SETTINGS);
        
        // Save to backend
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(DEFAULT_SETTINGS),
          });
        } catch (error) {
          console.error("Reset settings error:", error);
        }
      },

      // Request notification permission
      requestNotificationPermission: async () => {
        if (!("Notification" in window)) {
          console.warn("This browser does not support notifications");
          return false;
        }

        if (Notification.permission === "granted") {
          return true;
        }

        if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission();
          const granted = permission === "granted";
          
          if (granted) {
            set({
              notifications: {
                ...get().notifications,
                enabled: true,
              },
            });
          }
          
          return granted;
        }

        return false;
      },
    }));

// Detect user's motion preference
if (typeof window !== "undefined") {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    useSettingsStore.setState({
      reduceMotion: true,
    });
  }
}

// Note: Settings are now fetched from Supabase, no localStorage sync needed

