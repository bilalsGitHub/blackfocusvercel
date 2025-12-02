"use client";

import * as React from "react";
import { Task, TaskPriority, useTaskStore } from "@/stores/task-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  GripVertical, 
  Trash2, 
  Circle,
  CheckCircle2,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditTaskDialog } from "./edit-task-dialog";

const formatChronoDuration = (seconds: number = 0) => {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

interface TaskItemProps {
  task: Task;
  onDragStart?: (taskId: string) => void;
  onDragOver?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  high: "text-red-500 border-red-500/30 bg-red-500/10",
  medium: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  low: "text-blue-500 border-blue-500/30 bg-blue-500/10",
};

const priorityLabels: Record<TaskPriority, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

export function TaskItem({ task, onDragStart, onDragOver, onDragEnd }: TaskItemProps) {
  const { toggleTaskComplete, deleteTask, setActiveTask, activeTaskId } = useTaskStore();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  
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

  const isActive = activeTaskId === task.id;
  const isChronoLog = Boolean(task.isChronoLog);
  const chronoDuration = task.chronoDurationSeconds || 0;
  const pomodorosLeft = isChronoLog
    ? 0
    : Math.max(0, task.estimatedPomodoros - task.completedPomodoros);

  const handleToggleComplete = () => {
    if (isTimerActive) return; // Disabled when timer is running
    toggleTaskComplete(task.id);
  };

  const handleDelete = () => {
    if (isTimerActive) return; // Disabled when timer is running
    deleteTask(task.id);
  };

  const handleSetActive = () => {
    if (task.isCompleted || isTimerActive) return; // Disabled when timer is running
    setActiveTask(isActive ? null : task.id);
  };

  return (
    <>
      <div
        draggable={!task.isCompleted && !isTimerActive}
        onDragStart={() => onDragStart?.(task.id)}
        onDragOver={(e) => onDragOver?.(e, task.id)}
        onDragEnd={onDragEnd}
        className={cn(
          "group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card transition-all",
          isActive && "ring-2 ring-primary border-primary",
          task.isCompleted && "opacity-60",
          isTimerActive && "opacity-50 cursor-not-allowed",
          !task.isCompleted && !isTimerActive && "hover:border-primary/50 cursor-move"
        )}
      >
        {/* Drag Handle */}
        {!task.isCompleted && (
          <GripVertical className="hidden sm:block h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
        )}

        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={isTimerActive}
          className={cn("flex-shrink-0", isTimerActive && "cursor-not-allowed")}
          aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.isCompleted ? (
            <CheckCircle2 className={cn("h-4 w-4 sm:h-5 sm:w-5 text-primary", isTimerActive && "opacity-50")} />
          ) : (
            <Circle className={cn("h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary transition-colors", isTimerActive && "opacity-50")} />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0" onClick={handleSetActive}>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span
              className={cn(
                "font-medium text-sm sm:text-base",
                task.isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </span>
            
            {/* Priority Badge */}
            <Badge
              variant="outline"
              className={cn("text-[10px] sm:text-xs", priorityColors[task.priority])}
            >
              {priorityLabels[task.priority]}
            </Badge>

            {isChronoLog && (
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs text-purple-400 border-purple-500/30 bg-purple-500/10"
              >
                Chrono
              </Badge>
            )}

            {/* Active Badge */}
            {isActive && (
              <Badge variant="default" className="text-[10px] sm:text-xs">
                Active
              </Badge>
            )}
          </div>

          {/* Progress / Duration */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
            {isChronoLog ? (
              <span>⏱ {formatChronoDuration(chronoDuration)}</span>
            ) : (
              <>
                <span>
                  {task.completedPomodoros} / {task.estimatedPomodoros} 🍅
                </span>
                {!task.isCompleted && pomodorosLeft > 0 && (
                  <span className="hidden sm:inline">({pomodorosLeft} left)</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {!task.isCompleted && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => setEditDialogOpen(true)}
                disabled={isTimerActive}
                aria-label="Edit task"
              >
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 hover:text-destructive"
                onClick={handleDelete}
                disabled={isTimerActive}
                aria-label="Delete task"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditTaskDialog
        task={task}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
