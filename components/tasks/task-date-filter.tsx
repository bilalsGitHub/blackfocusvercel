"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface TaskDateFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function TaskDateFilter({ selectedDate, onDateChange }: TaskDateFilterProps) {
  // Check if timer is running
  const [isTimerActive, setIsTimerActive] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      import("@/stores/timer-store").then(({ useTimerStore }) => {
        const unsubscribe = useTimerStore.subscribe((state) => {
          setIsTimerActive(state.isActive);
        });
        setIsTimerActive(useTimerStore.getState().isActive);
        return unsubscribe;
      });
    }
  }, []);

  const goToPreviousDay = () => {
    if (isTimerActive) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    if (isTimerActive) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    if (isTimerActive) return;
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selected.getTime() === today.getTime()) {
      return "Today";
    } else if (selected.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else if (selected.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return selected.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: selected.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      });
    }
  };

  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousDay}
        disabled={isTimerActive}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium min-w-[80px] text-center">
          {getDateLabel()}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {!isToday() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            disabled={isTimerActive}
            className="h-8 px-2 text-xs"
          >
            Today
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextDay}
          disabled={isTimerActive}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

