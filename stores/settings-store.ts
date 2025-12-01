import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  // Actions
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
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
    opacity: 90,
    blur: 0,
  },
  reduceMotion: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      // Update notification settings
      updateNotifications: (newSettings) => {
        const current = get().notifications;
        set({
          notifications: {
            ...current,
            ...newSettings,
          },
        });
      },

      // Update app settings
      updateSettings: (newSettings) => {
        set(newSettings);
      },

      // Reset to defaults
      resetSettings: () => {
        set(DEFAULT_SETTINGS);
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
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

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

// Cross-tab sync for settings
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "settings-storage" && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        useSettingsStore.setState(newState.state);
      } catch (error) {
        console.error("Failed to sync settings:", error);
      }
    }
  });
}

