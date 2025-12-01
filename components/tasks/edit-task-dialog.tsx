"use client";

import * as React from "react";
import { Task, TaskPriority, useTaskStore } from "@/stores/task-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const { updateTask } = useTaskStore();
  
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || "");
  const [estimatedPomodoros, setEstimatedPomodoros] = React.useState(
    task.estimatedPomodoros.toString()
  );
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const isChronoLog = Boolean(task.isChronoLog);
  
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

  // Sync with task changes
  React.useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setEstimatedPomodoros(task.estimatedPomodoros.toString());
      setPriority(task.priority);
    }
  }, [open, task]);

  const handleSave = () => {
    if (!title.trim() || isTimerActive) return;

    const updates: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    };

    if (!isChronoLog) {
      updates.estimatedPomodoros = parseInt(estimatedPomodoros) || 1;
    }

    updateTask(task.id, updates);

    onOpenChange(false);
  };
  
  // Auto-close if timer starts while dialog is open
  React.useEffect(() => {
    if (isTimerActive && open) {
      onOpenChange(false);
    }
  }, [isTimerActive, open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Task Title */}
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Task Name</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name..."
              disabled={isTimerActive}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or details..."
              disabled={isTimerActive}
            />
          </div>

          {/* Estimated Pomodoros */}
          {!isChronoLog ? (
            <div className="grid gap-2">
              <Label htmlFor="edit-pomodoros">Estimated Pomodoros</Label>
              <Select
                value={estimatedPomodoros}
                onValueChange={setEstimatedPomodoros}
                disabled={isTimerActive}
              >
                <SelectTrigger id="edit-pomodoros">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} 🍅
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid gap-1 text-sm text-muted-foreground">
              <Label>Estimated Pomodoros</Label>
              <p>Chronometer logs track actual duration instead of Pomodoros.</p>
            </div>
          )}

          {/* Priority */}
          <div className="grid gap-2">
            <Label htmlFor="edit-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
              disabled={isTimerActive}
            >
              <SelectTrigger id="edit-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isTimerActive}>
            {isTimerActive ? "Timer Running..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

