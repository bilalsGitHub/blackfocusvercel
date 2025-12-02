"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

interface UpgradeToProButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function UpgradeToProButton({ 
  variant = "default", 
  size = "default",
  className 
}: UpgradeToProButtonProps) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpgrade = async () => {
    // TEST MODE: Direkt Pro yap
    if (user) {
      try {
        console.log("[UPGRADE] Making user Pro:", user.email);
        setIsLoading(true);

        const response = await fetch("/api/upgrade-to-pro", {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to upgrade user");
        }

        const result = await response.json();
        console.log("[UPGRADE] ✅ API success:", result);

        setUser({
          ...user,
          isPro: true,
        });
        
        alert("🎉 You're now a Pro user!\n\n✨ All premium features unlocked!\n\nIn production, this would redirect to Stripe checkout.");
        
        // Refresh to show Pro features
        window.location.reload();
        setIsLoading(false);
        window.location.reload();
      } catch (err) {
        console.error("[UPGRADE] ❌ Error:", err);
        alert("❌ Failed to upgrade. Please try again.");
        setIsLoading(false);
      }
    } else {
      // Not logged in, redirect to login
      router.push("/login?upgrade=true");
    }
  };

  // Already Pro
  if (user?.isPro) {
    return (
      <Button variant="outline" disabled className={className}>
        <Crown className="h-4 w-4 mr-2 text-yellow-500" />
        Pro Active
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleUpgrade}
      disabled={isLoading}
      className={className}
    >
      <Crown className="h-4 w-4 mr-2" />
      {isLoading ? "Upgrading..." : "Upgrade to Pro"}
    </Button>
  );
}

