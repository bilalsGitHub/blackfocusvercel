"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/settings-store";
import { useTimerStore } from "@/stores/timer-store";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Bell, Clock, Palette, Volume2, Crown } from "lucide-react";
import { BACKGROUND_IMAGES, THEME_PRESETS } from "@/lib/theme-presets";
import type { ThemePreset } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/settings");
    }
  }, [isAuthenticated, router]);
  const {
    notifications,
    autoStartBreak,
    autoStartFocus,
    longBreakInterval,
    updateNotifications,
    updateSettings,
    themePreset,
    background,
  } = useSettingsStore();

  const { durations, updateDurations } = useTimerStore();
  const isPro = user?.isPro ?? false;

  const [customImageUrl, setCustomImageUrl] = React.useState(
    background.imageUrl || ""
  );

  React.useEffect(() => {
    setCustomImageUrl(background.imageUrl || "");
  }, [background.imageUrl]);

  const themeOptions = React.useMemo(() => {
    return Object.entries(THEME_PRESETS)
      .filter(([key]) => key !== "custom")
      .map(([key, value]) => ({
        id: key as ThemePreset,
        name: key === "default" ? "Classic" : value?.name || key,
        description:
          key === "default"
            ? "BlackFocus signature palette"
            : value?.description || "",
        preview: value?.colors ?? null,
      }));
  }, []);

  // Timer durations (in minutes)
  const [focusDuration, setFocusDuration] = React.useState(
    Math.floor(durations.focus / 60)
  );
  const [shortBreakDuration, setShortBreakDuration] = React.useState(
    Math.floor(durations.shortBreak / 60)
  );
  const [longBreakDuration, setLongBreakDuration] = React.useState(
    Math.floor(durations.longBreak / 60)
  );

  const handleSaveDurations = () => {
    updateDurations({
      focus: focusDuration * 60,
      shortBreak: shortBreakDuration * 60,
      longBreak: longBreakDuration * 60,
    });
    alert("✅ Timer durations saved!");
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all settings to defaults?")) {
      setFocusDuration(25);
      setShortBreakDuration(5);
      setLongBreakDuration(15);
      updateDurations({
        focus: 1500,
        shortBreak: 300,
        longBreak: 900,
      });
      updateSettings({
        autoStartBreak: false,
        autoStartFocus: false,
        longBreakInterval: 4,
      });
      updateNotifications({
        enabled: true,
        sound: "bell",
        volume: 50,
      });
      alert("✅ Settings reset to defaults!");
    }
  };

  const handleClearLocalStorage = () => {
    if (
      confirm(
        "⚠️ This will clear your authentication session. You will need to log in again. Are you sure?"
      )
    ) {
      // Clear only auth storage (other stores are not persisted)
      localStorage.removeItem("auth-storage");

      // Redirect to home page
      alert("✅ Session cleared! Redirecting to home page...");
      window.location.href = "/";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your focus timer experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Timer Durations */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Timer Durations</h2>
          </div>

          <div className="space-y-4">
            {/* Focus Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <Label htmlFor="focus-duration">Focus Session</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="focus-duration"
                  type="number"
                  min="1"
                  max="90"
                  value={focusDuration}
                  onChange={(e) =>
                    setFocusDuration(parseInt(e.target.value) || 1)
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>

            {/* Short Break Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <Label htmlFor="short-break-duration">Short Break</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="short-break-duration"
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakDuration}
                  onChange={(e) =>
                    setShortBreakDuration(parseInt(e.target.value) || 1)
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>

            {/* Long Break Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <Label htmlFor="long-break-duration">Long Break</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="long-break-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) =>
                    setLongBreakDuration(parseInt(e.target.value) || 1)
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>

            <Button onClick={handleSaveDurations} className="w-full md:w-auto">
              Save Timer Durations
            </Button>
          </div>
        </Card>

        {/* Auto-Start */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Auto-Start</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start Breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start break timer after focus session
                </p>
              </div>
              <Button
                variant={autoStartBreak ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateSettings({ autoStartBreak: !autoStartBreak })
                }>
                {autoStartBreak ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start Pomodoros</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start focus timer after break
                </p>
              </div>
              <Button
                variant={autoStartFocus ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateSettings({ autoStartFocus: !autoStartFocus })
                }>
                {autoStartFocus ? "On" : "Off"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
              <div>
                <Label htmlFor="long-break-interval">Long Break Interval</Label>
                <p className="text-sm text-muted-foreground">
                  After how many focus sessions
                </p>
              </div>
              <Select
                value={longBreakInterval.toString()}
                onValueChange={(value) =>
                  updateSettings({ longBreakInterval: parseInt(value) })
                }>
                <SelectTrigger id="long-break-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} sessions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when timer completes
                </p>
              </div>
              <Button
                variant={notifications.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateNotifications({ enabled: !notifications.enabled })
                }>
                {notifications.enabled ? "On" : "Off"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <Label htmlFor="notification-sound">Notification Sound</Label>
              <Select
                value={notifications.sound}
                onValueChange={(value: any) =>
                  updateNotifications({ sound: value })
                }>
                <SelectTrigger id="notification-sound">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bell">Bell</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="ding">Ding</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <Label htmlFor="notification-volume">Volume</Label>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="notification-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={notifications.volume}
                  onChange={(e) =>
                    updateNotifications({ volume: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {notifications.volume}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance & Personalization (Pro) */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Appearance & Personalization
            </h2>
            {!isPro && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                Pro
              </Badge>
            )}
          </div>

          {isPro ? (
            <div className="space-y-8">
              {/* Theme Presets */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">Theme Presets</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch the entire color system with one tap.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {themeOptions.map((option) => {
                    const isActive = themePreset === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          updateSettings({ themePreset: option.id })
                        }
                        className={cn(
                          "rounded-xl border p-4 text-left transition hover:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/40",
                          isActive
                            ? "border-primary ring-2 ring-primary/50"
                            : "border-border"
                        )}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{option.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          {isActive && (
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>

                        {option.preview ? (
                          <div className="flex items-center gap-2 pt-2">
                            <span
                              className="h-5 w-5 rounded-full border border-white/20 shadow-inner"
                              style={{
                                backgroundColor: `hsl(${option.preview.light.primary})`,
                              }}
                            />
                            <span
                              className="h-5 w-5 rounded-full border border-white/20 shadow-inner"
                              style={{
                                backgroundColor: `hsl(${option.preview.dark.primary})`,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-primary/30 to-primary/70" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Background Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      Applies to the entire app. Stored locally, only visible to
                      you.
                    </p>
                  </div>
                  <Switch
                    checked={background.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        background: {
                          ...background,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                {background.enabled && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {BACKGROUND_IMAGES.map((bg) => {
                        const isSelected = background.imageUrl === bg.url;
                        return (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() =>
                              updateSettings({
                                background: {
                                  ...background,
                                  enabled: true,
                                  imageUrl: bg.url,
                                },
                              })
                            }
                            className={cn(
                              "relative h-28 rounded-xl border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40 transition",
                              isSelected
                                ? "border-primary ring-1 ring-primary/40"
                                : "border-border"
                            )}>
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage: `url(${bg.url})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="relative z-10 h-full w-full flex flex-col justify-end p-3 text-left text-white drop-shadow">
                              <p className="text-sm font-medium">{bg.name}</p>
                              <p className="text-xs text-white/80">
                                {bg.category}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-background">
                        Or use your own image URL
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="custom-background"
                          placeholder="https://images.unsplash.com/..."
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!customImageUrl.trim()) return;
                            updateSettings({
                              background: {
                                ...background,
                                enabled: true,
                                imageUrl: customImageUrl.trim(),
                              },
                            });
                          }}
                          disabled={!customImageUrl.trim()}>
                          Use image
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tip: Choose high-resolution landscape photos for best
                        results.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="bg-opacity">
                          Background visibility ({background.opacity}% photo)
                        </Label>
                        <Input
                          id="bg-opacity"
                          type="range"
                          min={50}
                          max={100}
                          value={background.opacity}
                          onChange={(e) =>
                            updateSettings({
                              background: {
                                ...background,
                                opacity: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bg-blur">
                          Blur strength ({background.blur}px)
                        </Label>
                        <Input
                          id="bg-blur"
                          type="range"
                          min={0}
                          max={20}
                          value={background.blur}
                          onChange={(e) =>
                            updateSettings({
                              background: {
                                ...background,
                                blur: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center space-y-4">
              <div className="flex justify-center text-5xl">🎨</div>
              <div>
                <p className="font-semibold">Custom themes are a Pro feature</p>
                <p className="text-sm text-muted-foreground">
                  Unlock color presets, background photos, and full
                  personalization.
                </p>
              </div>
              <Button size="sm" onClick={() => router.push("/pricing")}>
                See Pricing
              </Button>
            </div>
          )}
        </Card>

        {/* Account */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Subscription Status</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "Guest user"}
                </p>
              </div>
              {user?.isPro ? (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="h-3 w-3 text-yellow-500" />
                  Pro
                </Badge>
              ) : (
                <Button size="sm" onClick={() => router.push("/")}>
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-destructive">
                Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                These actions cannot be undone
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleResetDefaults}
                className="w-full md:w-auto">
                Reset to Defaults
              </Button>

              <Button
                variant="destructive"
                onClick={handleClearLocalStorage}
                className="w-full md:w-auto">
                Clear Session
              </Button>
              <p className="text-xs text-muted-foreground">
                Clears your authentication session. All your data remains in
                Supabase.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
