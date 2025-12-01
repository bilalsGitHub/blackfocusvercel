"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeatmapDay } from "@/lib/analytics-utils";
import { SessionDetailDialog } from "./session-detail-dialog";

interface BubbleHeatmapProps {
  data: HeatmapDay[];
  weekOffset?: number;
  onWeekChange?: (offset: number) => void;
  className?: string;
}

export function BubbleHeatmap({
  data,
  weekOffset = 0,
  onWeekChange,
  className,
}: BubbleHeatmapProps) {
  // Debug: Log heatmap data
  React.useEffect(() => {
    console.log("🗓️ [HEATMAP] Data received:", {
      daysCount: data.length,
      totalSessions: data.reduce((sum, d) => sum + d.sessions, 0),
      days: data.map((d) => ({
        date: d.date,
        dayName: d.dayName,
        sessions: d.sessions,
        hours: Object.keys(d.hourlyActivity).length,
      })),
    });
  }, [data]);

  const [hoveredCell, setHoveredCell] = React.useState<{
    day: string;
    hour: number;
    sessions: number;
    focusTime: number;
  } | null>(null);

  const [selectedCell, setSelectedCell] = React.useState<{
    date: string;
    dayName: string;
    hour: number;
  } | null>(null);

  // Hours to display (work hours + evening)
  const displayHours = [
    6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];

  // Get max focus time (in minutes) for scaling (handle empty data)
  const maxFocusTime =
    data.length > 0
      ? Math.max(
          1, // Minimum 1 to avoid division by zero
          ...data.flatMap((day) =>
            Object.values(day.hourlyActivity || {}).map((h) => h.minutes || 0)
          )
        )
      : 1;

  // Calculate bubble size based on FOCUS TIME (not session count)
  const getBubbleSize = (focusMinutes: number) => {
    if (focusMinutes === 0) return 4; // Small but visible for empty hours
    const normalized = focusMinutes / maxFocusTime;
    return 18 + normalized * 24; // 18px to 42px - larger and more visible
  };

  // Calculate opacity based on FOCUS TIME (not session count)
  const getBubbleOpacity = (focusMinutes: number) => {
    if (focusMinutes === 0) return 0.15; // More visible for empty hours
    const normalized = focusMinutes / maxFocusTime;
    return 0.6 + normalized * 0.4; // 0.6 to 1.0 - much more visible
  };

  // Calculate week label
  const getWeekLabel = () => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === -1) return "Last Week";
    if (weekOffset === 1) return "Next Week";
    if (weekOffset < -1) return `${Math.abs(weekOffset)} Weeks Ago`;
    return `${weekOffset} Weeks Ahead`;
  };

  // Get date range for current week
  const getWeekRange = () => {
    if (data.length === 0) return "";
    const firstDay = data[0]?.date;
    const lastDay = data[data.length - 1]?.date;
    if (!firstDay || !lastDay) return "";

    const start = new Date(firstDay);
    const end = new Date(lastDay);

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Header with Week Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold">📊 Activity Heatmap</h3>

          {/* Week Navigation */}
          {onWeekChange && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onWeekChange(weekOffset - 1)}
                className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="min-w-[180px] text-center">
                <div className="text-sm font-semibold">{getWeekLabel()}</div>
                <div className="text-xs text-muted-foreground">
                  {getWeekRange()}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onWeekChange(weekOffset + 1)}
                disabled={weekOffset >= 0} // Can't go to future weeks
                className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>

              {weekOffset !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onWeekChange(0)}
                  className="h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Today
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="text-base text-muted-foreground">
          See when you're most productive throughout the week
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Larger bubbles = more focus time ·{" "}
          <span className="font-semibold">Click bubbles</span> to see details
        </p>
      </div>

      {/* Legend - More visual */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium">Activity Level:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-foreground opacity-20" />
              <span className="text-xs">None</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-foreground opacity-40" />
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-foreground opacity-70" />
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-foreground opacity-100" />
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          💡 Hover to preview · Click to see full details
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm">
        {/* Hour labels (top) */}
        <div className="flex mb-4">
          <div className="w-16 flex items-center">
            <span className="text-xs font-semibold text-muted-foreground">
              Day
            </span>
          </div>
          {displayHours.map((hour) => (
            <div key={hour} className="flex-1 text-center">
              <span className="text-xs font-medium text-muted-foreground">
                {hour}:00
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-xl font-semibold mb-2">No activity data yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Complete some focus sessions to see your productivity patterns
                here
              </p>
              <div className="inline-block px-4 py-2 bg-muted rounded-lg text-xs">
                💡 Tip: Larger bubbles mean more focus time at that hour
              </div>
            </div>
          ) : (
            data.map((day, dayIndex) => (
              <div
                key={day.date}
                className="flex items-center hover:bg-muted/30 rounded-lg transition-colors">
                {/* Day label */}
                <div className="w-16 text-sm font-semibold">{day.dayName}</div>

                {/* Bubbles */}
                <div className="flex-1 flex items-center justify-around">
                  {displayHours.map((hour) => {
                    const hourData = day.hourlyActivity?.[hour];
                    const sessions = hourData?.sessions || 0;
                    const focusTime = hourData?.minutes || 0;
                    const size = getBubbleSize(focusTime); // Size based on focus TIME
                    const opacity = getBubbleOpacity(focusTime); // Opacity based on focus TIME

                    // Debug bubble rendering for non-zero sessions
                    if (sessions > 0 && dayIndex === data.length - 1) {
                      console.log(
                        `🔵 [BUBBLE] ${day.dayName} ${hour}:00 - ${sessions} sessions, ${focusTime}m, size: ${size}px, opacity: ${opacity}`
                      );
                    }

                    return (
                      <motion.div
                        key={`${day.date}-${hour}`}
                        className="relative flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                        style={{ width: 40, height: 40 }}
                        onMouseEnter={() =>
                          setHoveredCell({
                            day: day.dayName,
                            hour,
                            sessions,
                            focusTime,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => {
                          if (sessions > 0) {
                            setSelectedCell({
                              date: day.date,
                              dayName: day.dayName,
                              hour,
                            });
                          }
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: dayIndex * 0.05 + (hour - 6) * 0.01,
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}>
                        <motion.div
                          className={cn(
                            "rounded-full bg-foreground transition-all duration-200",
                            sessions > 0
                              ? "cursor-pointer hover:ring-4 hover:ring-foreground/30 hover:shadow-lg active:scale-95"
                              : "cursor-default"
                          )}
                          style={{
                            width: size,
                            height: size,
                            opacity,
                          }}
                          whileHover={{
                            scale: sessions > 0 ? 1.3 : 1.1,
                            opacity: 1,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={sessions > 0 ? { scale: 0.9 } : {}}>
                          {/* Glow effect on hover */}
                          {hoveredCell?.day === day.dayName &&
                            hoveredCell?.hour === hour && (
                              <motion.div
                                className="absolute inset-0 rounded-full bg-foreground"
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: 0.3, scale: 1.5 }}
                                style={{
                                  filter: "blur(8px)",
                                }}
                              />
                            )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tooltip - More informative */}
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-4 py-3 bg-foreground text-background rounded-xl text-sm font-medium whitespace-nowrap shadow-2xl border-2 border-background/10 pointer-events-none">
            <div className="font-bold text-base mb-1">
              {hoveredCell.day}, {hoveredCell.hour}:00
            </div>
            {hoveredCell.sessions > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm opacity-95">
                  <span>🎯</span>
                  <span>
                    {hoveredCell.sessions} focus{" "}
                    {hoveredCell.sessions === 1 ? "session" : "sessions"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-95">
                  <span>⏱️</span>
                  <span>{hoveredCell.focusTime} minutes total</span>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-80 mt-2 pt-2 border-t border-background/20">
                  <span>👆</span>
                  <span>Click to view details</span>
                </div>
              </div>
            ) : (
              <div className="text-xs opacity-75">No activity</div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-foreground" />
          </motion.div>
        )}
      </div>

      {/* Summary Stats - More prominent */}
      {data.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center border border-border hover:border-foreground/20 transition-colors">
            <div className="text-3xl font-bold mb-1">
              {data.reduce((sum, d) => sum + d.sessions, 0)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Total Focus Sessions
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center border border-border hover:border-foreground/20 transition-colors">
            <div className="text-3xl font-bold mb-1">
              {Math.round(
                data.reduce((sum, d) => sum + d.focusTime, 0) / 60 / 60
              )}
              <span className="text-xl ml-1">hrs</span>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Total Focus Time
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center border border-border hover:border-foreground/20 transition-colors">
            <div className="text-3xl font-bold mb-1">
              {data.length > 0 ? Math.max(...data.map((d) => d.sessions)) : 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Peak Day Sessions
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Dialog */}
      <SessionDetailDialog
        open={selectedCell !== null}
        onOpenChange={(open) => !open && setSelectedCell(null)}
        date={selectedCell?.date || ""}
        dayName={selectedCell?.dayName || ""}
        hour={selectedCell?.hour || 0}
      />
    </div>
  );
}
