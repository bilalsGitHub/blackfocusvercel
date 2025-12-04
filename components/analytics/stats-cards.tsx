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
                  className="text-5xl font-black tabular-nums mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}>
                  {stat.value}
                </motion.div>

                {/* Label */}
                <div className="text-sm text-muted-foreground font-semibold">
                  {stat.label}
                </div>

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
