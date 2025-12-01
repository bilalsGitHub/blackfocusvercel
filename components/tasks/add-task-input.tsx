"use client";

import * as React from "react";
import { useTaskStore, TaskPriority } from "@/stores/task-store";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Crown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddTaskInputProps {
  selectedDate?: Date;
}

export function AddTaskInput({ selectedDate }: AddTaskInputProps) {
  const { addTask, tasks } = useTaskStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isPro = user?.isPro || false;
  const [title, setTitle] = React.useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = React.useState("1");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [isExpanded, setIsExpanded] = React.useState(false);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    // Check task limit for free users
    if (!isPro && tasks.length >= 2) {
      const shouldUpgrade = window.confirm(
        "🎯 Task Limit Reached!\n\nFree users can create up to 2 tasks.\n\nUpgrade to Pro for:\n• Unlimited tasks\n• Full analytics\n• Ad-free experience\n• Only $5/month\n\nGo to Pricing page?"
      );
      
      if (shouldUpgrade) {
        router.push("/pricing");
      }
      return;
    }

    const pomodoros = parseInt(estimatedPomodoros) || 1;
    
    // Pass selected date to addTask
    addTask(title.trim(), pomodoros, priority, selectedDate);

    // Reset form
    setTitle("");
    setEstimatedPomodoros("1");
    setPriority("medium");
    setIsExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Quick Add */}
      {!isExpanded ? (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setIsExpanded(true)}
          disabled={isTimerActive || (!isPro && tasks.length >= 2)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isTimerActive 
            ? "Pause timer to add tasks..." 
            : !isPro && tasks.length >= 2
            ? "Upgrade to Pro for more tasks"
            : "Add a task..."}
          {!isPro && tasks.length >= 2 && <Crown className="h-3 w-3 ml-2 text-yellow-500" />}
        </Button>
      ) : (
        <>
          {/* Expanded Form */}
          <div className="space-y-3 p-4 rounded-lg border bg-card">
            {/* Task Title */}
            <Input
              placeholder="Task name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />

            {/* Options Row */}
            <div className="flex gap-2">
              {/* Estimated Pomodoros */}
              <div className="flex-1">
                <Select
                  value={estimatedPomodoros}
                  onValueChange={setEstimatedPomodoros}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} 🍅
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="flex-1">
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Add Task
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle("");
                  setEstimatedPomodoros("1");
                  setPriority("medium");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </form>
  );
}

