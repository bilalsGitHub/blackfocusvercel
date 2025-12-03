"use client";

import * as React from "react";
import { useSettingsStore } from "@/stores/settings-store";

export function FontProvider({ children }: { children: React.ReactNode }) {
  const fontFamily = useSettingsStore((state) => state.fontFamily);

  React.useEffect(() => {
    // Apply font to document body
    if (typeof document !== "undefined") {
      document.body.style.fontFamily = `var(--font-${fontFamily}), sans-serif`;
    }
  }, [fontFamily]);

  return <>{children}</>;
}
