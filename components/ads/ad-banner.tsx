"use client";

import * as React from "react";
import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

interface AdBannerProps {
  position?: "top" | "bottom" | "sidebar";
}

export function AdBanner({ position = "bottom" }: AdBannerProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(true);
  const isPro = user?.isPro || false;

  // Don't show ads to Pro users
  if (isPro || !isVisible) return null;

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 text-white p-4 rounded-lg border border-zinc-700 ${
        position === "sidebar" ? "w-full" : ""
      }`}
    >
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-zinc-400 hover:text-white transition-colors"
        aria-label="Close ad"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <div className="text-xs text-zinc-400 uppercase tracking-wide">
          Advertisement
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">Remove Ads with Pro</h3>
          </div>
          <p className="text-sm text-zinc-300 max-w-md">
            Get unlimited tasks, analytics, and an ad-free experience for just $5/month
          </p>
        </div>

        <Button
          onClick={handleUpgrade}
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Pro
        </Button>

        <p className="text-xs text-zinc-500">
          Support the development of BlackFocus
        </p>
      </div>
    </div>
  );
}

