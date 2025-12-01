import { type ThemePreset } from "@/stores/settings-store";

export interface ThemeColors {
  name: string;
  description: string;
  colors: {
    light: {
      background: string;
      foreground: string;
      primary: string;
      primaryForeground: string;
      card: string;
      border: string;
      muted: string;
    };
    dark: {
      background: string;
      foreground: string;
      primary: string;
      primaryForeground: string;
      card: string;
      border: string;
      muted: string;
    };
  };
}

export const THEME_PRESETS: Record<ThemePreset, ThemeColors | null> = {
  default: null, // Use CSS variables from globals.css
  
  ocean: {
    name: "Ocean Blue",
    description: "Calming blue tones inspired by the sea",
    colors: {
      light: {
        background: "210 100% 97%",
        foreground: "210 40% 15%",
        primary: "200 90% 50%",
        primaryForeground: "0 0% 100%",
        card: "210 50% 95%",
        border: "210 30% 85%",
        muted: "210 30% 90%",
      },
      dark: {
        background: "210 50% 8%",
        foreground: "210 20% 95%",
        primary: "200 90% 60%",
        primaryForeground: "210 50% 10%",
        card: "210 45% 12%",
        border: "210 30% 20%",
        muted: "210 30% 18%",
      },
    },
  },

  forest: {
    name: "Forest Green",
    description: "Natural green shades for focus",
    colors: {
      light: {
        background: "140 30% 97%",
        foreground: "140 40% 15%",
        primary: "145 70% 45%",
        primaryForeground: "0 0% 100%",
        card: "140 25% 94%",
        border: "140 20% 85%",
        muted: "140 20% 90%",
      },
      dark: {
        background: "140 40% 8%",
        foreground: "140 20% 95%",
        primary: "145 70% 55%",
        primaryForeground: "140 40% 10%",
        card: "140 35% 12%",
        border: "140 25% 20%",
        muted: "140 25% 18%",
      },
    },
  },

  sunset: {
    name: "Sunset Orange",
    description: "Warm and energizing orange hues",
    colors: {
      light: {
        background: "30 40% 97%",
        foreground: "30 40% 15%",
        primary: "25 95% 60%",
        primaryForeground: "0 0% 100%",
        card: "30 30% 94%",
        border: "30 25% 85%",
        muted: "30 25% 90%",
      },
      dark: {
        background: "30 35% 8%",
        foreground: "30 20% 95%",
        primary: "25 95% 65%",
        primaryForeground: "30 40% 10%",
        card: "30 30% 12%",
        border: "30 25% 20%",
        muted: "30 25% 18%",
      },
    },
  },

  midnight: {
    name: "Midnight Purple",
    description: "Deep purple for late-night focus",
    colors: {
      light: {
        background: "260 30% 97%",
        foreground: "260 40% 15%",
        primary: "265 85% 60%",
        primaryForeground: "0 0% 100%",
        card: "260 25% 94%",
        border: "260 20% 85%",
        muted: "260 20% 90%",
      },
      dark: {
        background: "260 45% 8%",
        foreground: "260 20% 95%",
        primary: "265 85% 65%",
        primaryForeground: "260 45% 10%",
        card: "260 40% 12%",
        border: "260 30% 20%",
        muted: "260 30% 18%",
      },
    },
  },

  rose: {
    name: "Rose Pink",
    description: "Soft pink tones for creativity",
    colors: {
      light: {
        background: "340 40% 97%",
        foreground: "340 40% 15%",
        primary: "345 80% 60%",
        primaryForeground: "0 0% 100%",
        card: "340 30% 94%",
        border: "340 25% 85%",
        muted: "340 25% 90%",
      },
      dark: {
        background: "340 40% 8%",
        foreground: "340 20% 95%",
        primary: "345 80% 65%",
        primaryForeground: "340 45% 10%",
        card: "340 35% 12%",
        border: "340 30% 20%",
        muted: "340 30% 18%",
      },
    },
  },

  custom: null, // Reserved for future custom color picker
};

const CSS_VARS = [
  "--background",
  "--foreground",
  "--primary",
  "--primary-foreground",
  "--card",
  "--border",
  "--muted",
];

export function applyThemePreset(preset: ThemePreset, mode: "light" | "dark") {
  const theme = THEME_PRESETS[preset];
  const root = document.documentElement;
  
  if (!theme || !theme.colors) {
    // Reset to default tokens defined in globals.css
    CSS_VARS.forEach((token) => root.style.removeProperty(token));
    return;
  }

  const colors = theme.colors[mode];
  
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--muted", colors.muted);
}

// Predefined background images (Unsplash)
export const BACKGROUND_IMAGES = [
  {
    id: "minimal-1",
    name: "Minimal Mountains",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    category: "Nature",
  },
  {
    id: "minimal-2",
    name: "Calm Ocean",
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80",
    category: "Nature",
  },
  {
    id: "minimal-3",
    name: "Desert Dunes",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80",
    category: "Nature",
  },
  {
    id: "minimal-4",
    name: "Forest Path",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
    category: "Nature",
  },
  {
    id: "minimal-5",
    name: "Aurora Sky",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80",
    category: "Nature",
  },
  {
    id: "abstract-1",
    name: "Gradient Flow",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80",
    category: "Abstract",
  },
  {
    id: "abstract-2",
    name: "Neon Waves",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80",
    category: "Abstract",
  },
  {
    id: "abstract-3",
    name: "Purple Smoke",
    url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=1920&q=80",
    category: "Abstract",
  },
  {
    id: "urban-1",
    name: "City Lights",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80",
    category: "Urban",
  },
  {
    id: "urban-2",
    name: "Minimal Architecture",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80",
    category: "Urban",
  },
];

