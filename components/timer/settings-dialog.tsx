"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore } from "@/stores/settings-store";

const soundOptions = [
  { value: "bell", label: "Bell" },
  { value: "chime", label: "Chime" },
  { value: "ding", label: "Ding" },
  { value: "none", label: "None" },
];

export type SettingsDialogHandle = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const SettingsDialog = React.forwardRef<SettingsDialogHandle>(function SettingsDialog(_, ref) {
  const [open, setOpen] = React.useState(false);
  const { durations, updateDurations } = useTimerStore();
  const {
    notifications,
    autoStartBreak,
    autoStartFocus,
    longBreakInterval,
    updateNotifications,
    updateSettings,
    resetSettings,
    requestNotificationPermission,
  } = useSettingsStore();

  // Local state for form
  const [focusMinutes, setFocusMinutes] = React.useState(
    Math.floor(durations.focus / 60)
  );
  const [shortBreakMinutes, setShortBreakMinutes] = React.useState(
    Math.floor(durations.shortBreak / 60)
  );
  const [longBreakMinutes, setLongBreakMinutes] = React.useState(
    Math.floor(durations.longBreak / 60)
  );
  const [sound, setSound] = React.useState(notifications.sound);
  const [volume, setVolume] = React.useState(notifications.volume);
  const [autoBreak, setAutoBreak] = React.useState(autoStartBreak);
  const [autoFocus, setAutoFocus] = React.useState(autoStartFocus);
  const [interval, setInterval] = React.useState(longBreakInterval);

  // Sync with store when dialog opens
  React.useEffect(() => {
    if (open) {
      setFocusMinutes(Math.floor(durations.focus / 60));
      setShortBreakMinutes(Math.floor(durations.shortBreak / 60));
      setLongBreakMinutes(Math.floor(durations.longBreak / 60));
      setSound(notifications.sound);
      setVolume(notifications.volume);
      setAutoBreak(autoStartBreak);
      setAutoFocus(autoStartFocus);
      setInterval(longBreakInterval);
    }
  }, [open, durations, notifications, autoStartBreak, autoStartFocus, longBreakInterval]);

  const handleSave = () => {
    // Update timer durations
    updateDurations({
      focus: focusMinutes * 60,
      shortBreak: shortBreakMinutes * 60,
      longBreak: longBreakMinutes * 60,
    });

    // Update settings
    updateNotifications({
      sound,
      volume,
    });

    updateSettings({
      autoStartBreak: autoBreak,
      autoStartFocus: autoFocus,
      longBreakInterval: interval,
    });

    setOpen(false);
  };

  const handleReset = () => {
    setFocusMinutes(25);
    setShortBreakMinutes(5);
    setLongBreakMinutes(15);
    setSound("bell");
    setVolume(50);
    setAutoBreak(false);
    setAutoFocus(false);
    setInterval(4);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      // Show a test notification
      new Notification("Notifications Enabled!", {
        body: "You'll receive notifications when timers complete.",
        icon: "/icon-192x192.png",
      });
    }
  };

  React.useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((prev) => !prev),
    }),
    []
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open timer settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
          <DialogDescription>
            Customize your timer durations, notifications, and behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Timer Durations Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Timer Durations</h3>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="focus-duration" className="text-right">
                Focus
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="focus-duration"
                  type="number"
                  min="1"
                  max="120"
                  value={focusMinutes}
                  onChange={(e) =>
                    setFocusMinutes(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16">minutes</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="short-break-duration" className="text-right">
                Short Break
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="short-break-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreakMinutes}
                  onChange={(e) =>
                    setShortBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16">minutes</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="long-break-duration" className="text-right">
                Long Break
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="long-break-duration"
                  type="number"
                  min="1"
                  max="120"
                  value={longBreakMinutes}
                  onChange={(e) =>
                    setLongBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16">minutes</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">Notifications</h3>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sound-select" className="text-right">
                Sound
              </Label>
              <div className="col-span-3">
                <Select value={sound} onValueChange={(value: any) => setSound(value)}>
                  <SelectTrigger id="sound-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {soundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="volume" className="text-right">
                Volume
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">{volume}%</span>
              </div>
            </div>

            <div className="col-span-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestNotifications}
                className="w-full"
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable Browser Notifications
              </Button>
            </div>
          </div>

          {/* Behavior Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">Behavior</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-start-break" className="flex-1 cursor-pointer">
                Auto-start breaks
              </Label>
              <Switch
                id="auto-start-break"
                checked={autoBreak}
                onCheckedChange={setAutoBreak}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-start-focus" className="flex-1 cursor-pointer">
                Auto-start focus sessions
              </Label>
              <Switch
                id="auto-start-focus"
                checked={autoFocus}
                onCheckedChange={setAutoFocus}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="long-break-interval" className="text-right col-span-2">
                Long break after
              </Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  id="long-break-interval"
                  type="number"
                  min="2"
                  max="10"
                  value={interval}
                  onChange={(e) =>
                    setInterval(Math.max(2, parseInt(e.target.value) || 4))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">sessions</span>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            aria-label="Reset to default settings"
          >
            Reset Defaults
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
