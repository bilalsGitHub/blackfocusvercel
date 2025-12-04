"use client";

import * as React from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { user } = useAuthStore();
  const { background } = useSettingsStore();
  const isPro = user?.isPro || false;

  // Only show background for Pro users
  const showBackground = isPro && background.enabled && background.imageUrl;

  return (
    <div className="relative min-h-screen">
      {/* Background Image Layer (Pro only) */}
      {showBackground && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${background.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: background.opacity / 100,
            filter: `blur(${background.blur}px)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Background Color Layer - only when no image */}
      {!showBackground && (
        <div
          className="fixed inset-0 z-0 bg-background pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
