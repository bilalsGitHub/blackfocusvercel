import { create } from "zustand";

export type SoundType = "bell" | "chime" | "ding" | "none";

export interface NotificationSettings {
  enabled: boolean;
  focusSound: SoundType; // Sound when focus session completes
  shortBreakSound: SoundType; // Sound when short break completes
  longBreakSound: SoundType; // Sound when long break completes
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

export type FontFamily =
  | "inter"
  | "roboto"
  | "poppins"
  | "montserrat"
  | "lato"
  | "opensans"
  | "raleway"
  | "nunito";

export interface BackgroundSettings {
  enabled: boolean;
  imageUrl: string;
  opacity: number; // 0-100
  blur: number; // 0-20
}

export interface TimerDurations {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export interface AppSettings {
  // Notifications
  notifications: NotificationSettings;

  // Timer Durations
  timerDurations: TimerDurations;

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

  // Font family
  fontFamily: FontFamily;

  // Accessibility
  reduceMotion: boolean;
}

interface SettingsState extends AppSettings {
  isLoading: boolean;
  // Actions
  fetchSettings: () => Promise<void>;
  updateNotifications: (
    settings: Partial<NotificationSettings>
  ) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    focusSound: "bell",
    shortBreakSound: "chime",
    longBreakSound: "ding",
    volume: 50,
  },
  timerDurations: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
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
  fontFamily: "inter",
  reduceMotion: false,
};

// Helper function to ensure notifications have the new structure
const migrateNotifications = (notifications: any): NotificationSettings => {
  // If old 'sound' field exists, migrate it
  if ("sound" in notifications && !("focusSound" in notifications)) {
    const oldSound = notifications.sound;
    return {
      enabled: notifications.enabled ?? true,
      focusSound: oldSound,
      shortBreakSound: oldSound,
      longBreakSound: oldSound,
      volume: notifications.volume ?? 50,
    };
  }

  // Ensure all new fields exist with defaults
  return {
    enabled: notifications.enabled ?? true,
    focusSound: notifications.focusSound ?? "bell",
    shortBreakSound: notifications.shortBreakSound ?? "chime",
    longBreakSound: notifications.longBreakSound ?? "ding",
    volume: notifications.volume ?? 50,
  };
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
        // Migrate notifications to new structure
        if (data.data.notifications) {
          data.data.notifications = migrateNotifications(
            data.data.notifications
          );
        }

        // Ensure timerDurations exists with defaults
        if (!data.data.timerDurations) {
          data.data.timerDurations = DEFAULT_SETTINGS.timerDurations;
        }

        // Save migrated data back to database if needed
        if (!data.data.notifications || !data.data.timerDurations) {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data.data),
          });
        }

        set({ ...data.data, isLoading: false });

        // Load volume from localStorage and override the value from backend
        if (typeof window !== "undefined") {
          const savedVolume = localStorage.getItem("timer-volume");
          if (savedVolume) {
            const volume = parseInt(savedVolume);
            console.log(
              "[SETTINGS] Overriding volume from localStorage:",
              volume
            );
            set({
              notifications: {
                ...get().notifications,
                volume,
              },
            });
          }
        }

        // Sync timer durations to timer store
        if (data.data.timerDurations && typeof window !== "undefined") {
          const { useTimerStore } = await import("./timer-store");
          useTimerStore.getState().updateDurations({
            focus: data.data.timerDurations.focusMinutes * 60,
            shortBreak: data.data.timerDurations.shortBreakMinutes * 60,
            longBreak: data.data.timerDurations.longBreakMinutes * 60,
          });
        }
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

    // Save to backend (excluding volume which is stored in localStorage)
    try {
      const settingsToSave = { ...get() };
      // Don't save volume to backend if it's the only thing being updated
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsToSave),
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

// Detect user's motion preference and load volume from localStorage
if (typeof window !== "undefined") {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    useSettingsStore.setState({
      reduceMotion: true,
    });
  }

  // Load volume from localStorage and set it in the store
  const savedVolume = localStorage.getItem("timer-volume");
  if (savedVolume) {
    const volume = parseInt(savedVolume);
    console.log("[SETTINGS] Loading volume from localStorage:", volume);
    useSettingsStore.setState({
      notifications: {
        ...useSettingsStore.getState().notifications,
        volume,
      },
    });
  } else {
    // If no volume in localStorage, save the default
    localStorage.setItem("timer-volume", "50");
    console.log("[SETTINGS] No volume in localStorage, using default: 50");
  }
}

// Note: Settings are now fetched from Supabase, no localStorage sync needed
