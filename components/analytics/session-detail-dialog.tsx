"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useTimerStore, type Session } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { getLocalDateKey } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface SessionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  dayName: string;
  hour: number;
}

export function SessionDetailDialog({
  open,
  onOpenChange,
  date,
  dayName,
  hour,
}: SessionDetailDialogProps) {
  const sessions = useTimerStore((state) => state.sessions);
  const tasks = useTaskStore((state) => state.tasks);

  // Filter sessions for this specific hour (all completed sessions)
  const hourSessions = React.useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt);
      const sessionDateStr = getLocalDateKey(sessionDate);
      const sessionHour = sessionDate.getHours();
      
      // Show all completed sessions in analytics (focus, breaks, chrono)
      return session.wasCompleted && sessionDateStr === date && sessionHour === hour;
    });
  }, [sessions, date, hour]);

  // Get task name by ID
  const getTaskName = (taskId?: string) => {
    if (!taskId) return "No Task";
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || "Deleted Task";
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Calculate total stats
  const totalMinutes = Math.round(
    hourSessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  const completedCount = hourSessions.filter((s) => s.wasCompleted).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Calendar className="h-6 w-6" />
            <div>
              <div className="flex items-center gap-2">
                <span>{dayName}</span>
                <span className="text-muted-foreground">at</span>
                <span>{hour}:00</span>
              </div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="text-3xl font-bold">{hourSessions.length}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">
              Total Sessions
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="text-3xl font-bold">{completedCount}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">
              Completed
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="text-3xl font-bold">{totalMinutes}m</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">
              Total Time
            </div>
          </div>
        </div>

        {/* Session List */}
        {hourSessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-lg font-semibold mb-1">No sessions found</p>
            <p className="text-sm">
              No sessions were completed during this hour.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span>Sessions ({hourSessions.length})</span>
            </h3>
            
            <AnimatePresence mode="popLayout">
              {hourSessions.map((session, index) => {
                const taskName = getTaskName(session.taskId);
                const isCompleted = session.wasCompleted;
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all hover:shadow-md",
                      isCompleted
                        ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                        : "bg-orange-500/5 border-orange-500/30 hover:border-orange-500/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - Session info */}
                      <div className="flex-1 space-y-2">
                        {/* Time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono">
                            {formatTime(session.completedAt)}
                          </span>
                        </div>

                        {/* Task */}
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {taskName}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold font-mono">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Right side - Status badge */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={isCompleted ? "default" : "secondary"}
                          className={cn(
                            "gap-1.5 px-3 py-1",
                            isCompleted
                              ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                              : "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30"
                          )}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Manual</span>
                            </>
                          )}
                        </Badge>

                        {/* Mode badge */}
                        <Badge variant="outline" className="text-xs">
                          {session.mode === "focus" && "🎯 Focus"}
                          {session.mode === "shortBreak" && "☕ Short Break"}
                          {session.mode === "longBreak" && "🌴 Long Break"}
                          {session.mode === "chronometer" && "⏱️ Chrono"}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Footer tip */}
        {hourSessions.length > 0 && (
          <div className="mt-6 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground text-center">
            💡 Tip: Sessions linked to tasks appear with their task names
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

