"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useSettingsStore } from "@/stores/settings-store";
import { applyThemePreset } from "@/lib/theme-presets";

function ThemePresetApplier() {
  const { theme } = useTheme();
  const { themePreset } = useSettingsStore();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mode =
      theme === "dark" || theme === "light"
        ? theme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    applyThemePreset(themePreset, mode);
  }, [theme, themePreset]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      <ThemePresetApplier />
      {children}
    </NextThemesProvider>
  );
}

