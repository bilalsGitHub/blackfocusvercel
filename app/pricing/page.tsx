"use client";

import * as React from "react";
import {
  Check,
  Crown,
  Zap,
  TimerReset,
  Palette,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const comparisonFeatures = [
  {
    label: "Tasks",
    free: "Up to 2",
    pro: "Unlimited + drag & drop + priorities",
  },
  {
    label: "Chronometer mode",
    free: "—",
    pro: "Advanced stopwatch with logging",
  },
  {
    label: "Analytics & reports",
    free: "—",
    pro: "Heatmap, trends, streaks",
  },
  {
    label: "Data export / import",
    free: "—",
    pro: "JSON + CSV + restore",
  },
  {
    label: "Background photos & themes",
    free: "—",
    pro: "Custom wallpapers + palettes",
  },
  {
    label: "Ads",
    free: "Supported by ads",
    pro: "Zero ads",
  },
];

export default function PricingPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const isPro = user?.isPro || false;
  const [isYearly, setIsYearly] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  // Pricing
  const monthlyPrice = 5;
  const yearlyPrice = 48; // $4/month when billed yearly (20% discount)
  const currentPrice = isYearly ? yearlyPrice : monthlyPrice;
  const pricePerMonth = isYearly ? (yearlyPrice / 12).toFixed(2) : monthlyPrice;

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?upgrade=true");
      return;
    }

    try {
      setIsUpgrading(true);
      console.log("[PRICING] Upgrade button clicked");

      const response = await fetch("/api/upgrade-to-pro", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to upgrade");
      }

      const result = await response.json();
      console.log("[PRICING] ✅ Upgrade success:", result);

      setUser({
        ...user,
        isPro: true,
      });

      alert(
        "🎉 You're now a Pro user!\n\nThe test upgrade flow updated your Supabase profile."
      );

      setIsUpgrading(false);
      window.location.reload();
    } catch (error) {
      console.error("[PRICING] ❌ Upgrade error:", error);
      alert("❌ Failed to upgrade. Please try again.");
      setIsUpgrading(false);
    }
  };

  const handleStartFree = () => {
    router.push("/timer");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you need more power
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 py-4">
            <span
              className={`text-sm font-medium transition-colors ${
                !isYearly ? "text-foreground" : "text-muted-foreground"
              }`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span
              className={`text-sm font-medium transition-colors ${
                isYearly ? "text-foreground" : "text-muted-foreground"
              }`}>
              Yearly
            </span>
            {isYearly && (
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                Save 20%
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
              <TimerReset className="h-4 w-4 text-primary" />
              Chronometer logging (Pro)
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
              <BarChart3 className="h-4 w-4 text-primary" />
              Bubble heatmap & streaks
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
              <Palette className="h-4 w-4 text-primary" />
              Background photos & themes
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative rounded-2xl border-2 border-border bg-card p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <p className="text-muted-foreground">
                Perfect for getting started with Pomodoro
              </p>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full mb-6"
              onClick={handleStartFree}>
              <Zap className="h-4 w-4 mr-2" />
              Start Free
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited timer sessions</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Up to 2 tasks</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Basic timer features</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Keyboard shortcuts</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Focus mode</span>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <span className="h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                  ×
                </span>
                <span className="text-sm line-through">
                  Chronometer logging
                </span>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <span className="h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                  ×
                </span>
                <span className="text-sm line-through">
                  Analytics dashboard & heatmap
                </span>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <span className="h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                  ×
                </span>
                <span className="text-sm line-through">
                  Export / import backups
                </span>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <span className="h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                  ×
                </span>
                <span className="text-sm line-through">
                  Custom wallpapers & themes
                </span>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <span className="h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                  ×
                </span>
                <span className="text-sm line-through">Ad-free experience</span>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-2xl shadow-primary/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                Pro
                <Crown className="h-5 w-5 text-yellow-500" />
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">
                  ${isYearly ? pricePerMonth : currentPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {isYearly && (
                <p className="text-sm text-muted-foreground mb-2">
                  ${yearlyPrice} billed annually
                </p>
              )}
              <p className="text-muted-foreground">
                For serious productivity enthusiasts
              </p>
            </div>

            <Button
              size="lg"
              className="w-full mb-6 bg-primary hover:bg-primary/90"
              onClick={handleUpgrade}
              disabled={isPro || isUpgrading}>
              {isPro ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Current Plan
                </>
              ) : isUpgrading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold">
                  Everything in Free, plus:
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited tasks</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Full analytics dashboard</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Activity heatmap</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Productivity streak tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Data export (JSON, CSV)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Data import</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Chronometer + stopwatch history</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold">
                  Custom backgrounds & color themes
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold">
                  Ad-free experience
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            What changes with Pro?
          </h2>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="grid grid-cols-3 text-sm font-semibold bg-muted/40 px-6 py-3">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Pro</div>
            </div>
            <div className="divide-y">
              {comparisonFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="grid grid-cols-3 px-6 py-4 text-sm">
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-center text-muted-foreground">
                    {feature.free}
                  </div>
                  <div className="text-center font-semibold text-primary">
                    {feature.pro}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade to Pro or cancel your subscription at any
                time. Your data will be preserved.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">
                Can I switch between monthly and yearly plans?
              </h3>
              <p className="text-muted-foreground text-sm">
                Absolutely! You can switch from monthly to yearly (or vice
                versa) at any time. The change will take effect at your next
                billing cycle.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-muted-foreground text-sm">
                Your data is never deleted. If you have more than 2 tasks, you
                won't be able to create new ones until you delete some or
                upgrade again.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 14-day money-back guarantee. No questions asked.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely. All data is stored locally in your browser. Pro
                features use secure encryption for cloud sync.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-muted-foreground">
            Ready to supercharge your productivity?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="outline" onClick={handleStartFree}>
              Start with Free
            </Button>
            <Button
              size="lg"
              onClick={handleUpgrade}
              disabled={isPro || isUpgrading}>
              {isPro ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  You're already Pro!
                </>
              ) : isUpgrading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Start 14-Day Pro Trial
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
