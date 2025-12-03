"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Calendar,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down";
  suffix?: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Icon mapping for visual interest
  const icons = [BarChart3, Clock, Calendar, LineChart];
  const iconColors = [
    "text-blue-500",
    "text-green-500",
    "text-purple-500",
    "text-orange-500",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = icons[index];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 hover:border-foreground/20">
              <CardContent className="p-6">
                {/* Icon */}
                <div className="mb-3">
                  <IconComponent className={cn("w-8 h-8", iconColors[index])} />
                </div>

                {/* Value */}
                <motion.div
                  className="text-5xl font-black tabular-nums mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}>
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-2xl text-muted-foreground/80 ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </motion.div>

                {/* Label */}
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">
                  {stat.label}
                </div>

                {/* Trend */}
                {stat.change !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-semibold px-2 py-1 rounded-full w-fit",
                      stat.trend === "up" && "text-green-600 bg-green-500/10",
                      stat.trend === "down" && "text-red-600 bg-red-500/10"
                    )}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
                  </motion.div>
                )}

                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
