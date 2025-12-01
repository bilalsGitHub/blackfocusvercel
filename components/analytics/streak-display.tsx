"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakData } from "@/lib/dummy-analytics-data";

interface StreakDisplayProps {
  data: StreakData;
}

export function StreakDisplay({ data }: StreakDisplayProps) {
  const isOnFire = data.currentStreak >= 7;
  
  return (
    <Card className="border-2 hover:border-orange-500/30 transition-all duration-300">
      <CardContent className="p-8">
        <div className="text-center space-y-8">
          {/* Header */}
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span>🔥</span>
              <span>Streak</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep your momentum going!
            </p>
          </div>

          {/* Main streak number with fire animation */}
          <div className="relative">
            <motion.div
              className={cn(
                "text-7xl font-black tabular-nums",
                isOnFire && "text-orange-500"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {data.currentStreak}
            </motion.div>
            <div className="text-base text-muted-foreground font-semibold uppercase tracking-wider mt-3">
              {data.currentStreak === 1 ? 'Day' : 'Days'} in a Row
            </div>
            
            {/* Encouraging message */}
            {isOnFire && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm font-medium text-orange-500"
              >
                🔥 You're on fire!
              </motion.div>
            )}
          </div>

          {/* Fire icons - only show if streak exists */}
          {data.currentStreak > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 px-4">
              {Array.from({ length: Math.min(data.currentStreak, 21) }).map(
                (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <Flame
                      className={cn(
                        "h-5 w-5",
                        i >= data.currentStreak - 7
                          ? "text-orange-500 drop-shadow-lg"
                          : "text-orange-500/30"
                      )}
                    />
                  </motion.div>
                )
              )}
              {data.currentStreak > 21 && (
                <span className="text-xs text-muted-foreground ml-2 self-center">
                  +{data.currentStreak - 21} more
                </span>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to 30 days</span>
              <span>{Math.min(data.currentStreak, 30)}/30</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((data.currentStreak / 30) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t-2">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-3xl font-bold text-orange-500">
                {data.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase mt-1">
                Current
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-3xl font-bold">
                {data.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase mt-1">
                Personal Best
              </div>
            </div>
          </div>

          {/* Motivational message */}
          <div className="text-xs text-muted-foreground pt-2">
            {data.currentStreak === 0 && "Start your streak today! 💪"}
            {data.currentStreak > 0 && data.currentStreak < 3 && "Great start! Keep going! 🚀"}
            {data.currentStreak >= 3 && data.currentStreak < 7 && "Building momentum! 📈"}
            {data.currentStreak >= 7 && data.currentStreak < 14 && "Amazing consistency! 🌟"}
            {data.currentStreak >= 14 && data.currentStreak < 30 && "Unstoppable force! ⚡"}
            {data.currentStreak >= 30 && "You're a legend! 👑"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

