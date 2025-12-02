"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useTaskStore } from "@/stores/task-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/stores/task-store";

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const isPro = user?.isPro || false;
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = React.useState("1");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [description, setDescription] = React.useState("");

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/calendar");
    }
  }, [isAuthenticated, router]);

  // Helper function to get tasks for a specific date
  const getTasksForDate = React.useCallback(
    (date: Date) => {
      // Use local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      return tasks.filter((task) => {
        // Show task if it's scheduled for this date
        const isScheduledForDate = task.scheduledDate === dateStr;

        // OR if it's completed on this date (even if scheduled for another date)
        let isCompletedOnDate = false;
        if (task.isCompleted && task.completedAt) {
          const completedDate = new Date(task.completedAt);
          const compYear = completedDate.getFullYear();
          const compMonth = String(completedDate.getMonth() + 1).padStart(2, '0');
          const compDay = String(completedDate.getDate()).padStart(2, '0');
          const completedDateStr = `${compYear}-${compMonth}-${compDay}`;
          isCompletedOnDate = completedDateStr === dateStr;
        }

        return isScheduledForDate || isCompletedOnDate;
      });
    },
    [tasks]
  );

  // Get calendar data
  const calendarData = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month's days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = startingDayOfWeek;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasksCount: number;
    }> = [];

    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasksCount: getTasksForDate(date).length,
      });
    }

    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        tasksCount: getTasksForDate(date).length,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasksCount: getTasksForDate(date).length,
      });
    }

    return days;
  }, [currentDate, tasks, getTasksForDate]);

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewTaskTitle("");
    setEstimatedPomodoros("1");
    setPriority("medium");
    setDescription("");
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedDate) return;

    // Check task limit for free users - only count active (incomplete) tasks
    const activeTasks = tasks.filter(task => !task.isCompleted);
    if (!isPro && activeTasks.length >= 2) {
      const shouldUpgrade = window.confirm(
        "🎯 Task Limit Reached!\n\nFree users can create up to 2 active tasks.\n\nUpgrade to Pro for:\n• Unlimited tasks\n• Full analytics\n• Ad-free experience\n• Only $5/month\n\nGo to Pricing page?"
      );
      
      if (shouldUpgrade) {
        router.push("/pricing");
      }
      return;
    }

    try {
      const pomodoros = parseInt(estimatedPomodoros) || 1;
      await addTask(newTaskTitle, pomodoros, priority, selectedDate);
      handleCloseAddDialog();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleOpenEditDialog = (task: any) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setEstimatedPomodoros(task.estimatedPomodoros.toString());
    setPriority(task.priority);
    setDescription(task.description || "");
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
    setNewTaskTitle("");
    setEstimatedPomodoros("1");
    setPriority("medium");
    setDescription("");
  };

  const handleUpdateTask = async () => {
    if (!newTaskTitle.trim() || !editingTask) return;

    try {
      const pomodoros = parseInt(estimatedPomodoros) || 1;
      await updateTask(editingTask.id, {
        title: newTaskTitle,
        estimatedPomodoros: pomodoros,
        priority: priority,
        description: description,
      });
      handleCloseEditDialog();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleToggleComplete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleTaskComplete(taskId);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  if (!isAuthenticated) return null;

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Calendar View */}
        <div>
          <Card className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {monthName} {year}
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day, index) => {
                const isSelected =
                  selectedDate &&
                  day.date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day.date)}
                    className={cn(
                      "aspect-square p-2 rounded-lg border-2 transition-all relative",
                      "hover:border-primary hover:shadow-md",
                      day.isCurrentMonth
                        ? "bg-card"
                        : "bg-muted/30 text-muted-foreground",
                      day.isToday && "border-primary bg-primary/5",
                      isSelected && "border-primary bg-primary/10 shadow-lg",
                      !day.isCurrentMonth && "opacity-50"
                    )}>
                    <div className="text-sm font-medium">
                      {day.date.getDate()}
                    </div>
                    {day.tasksCount > 0 && (
                      <div className="absolute bottom-1 right-1">
                        <Badge
                          variant="secondary"
                          className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {day.tasksCount}
                        </Badge>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div>
          <Card className="p-6 sticky top-20">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                  </div>
                  <Button size="sm" onClick={handleOpenAddDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {selectedDateTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No tasks scheduled for this day</p>
                    </div>
                  ) : (
                    selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "p-3 border rounded-lg transition-colors group cursor-pointer",
                          task.isCompleted
                            ? "bg-muted/50 border-green-500/20"
                            : "bg-card hover:bg-accent"
                        )}
                        onClick={() => router.push("/timer")}>
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={(e) => handleToggleComplete(task.id, e)}
                            className={cn(
                              "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                              task.isCompleted
                                ? "bg-green-500 border-green-500"
                                : "border-muted-foreground/30 hover:border-primary"
                            )}>
                            {task.isCompleted && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </button>

                          {/* Task Info */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className={cn(
                                "font-medium",
                                task.isCompleted &&
                                  "line-through text-muted-foreground"
                              )}>
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.completedPomodoros}/
                                {task.estimatedPomodoros} 🍅
                              </Badge>
                              {task.isCompleted && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDialog(task);
                            }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Select a date to view tasks</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a new task for{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Name</label>
              <Input
                placeholder="Enter task name..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAddTask();
                }}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                placeholder="Add notes or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Estimated Pomodoros */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Pomodoros</label>
              <Select
                value={estimatedPomodoros}
                onValueChange={setEstimatedPomodoros}>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger>
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

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseAddDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Name</label>
              <Input
                placeholder="Enter task name..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleUpdateTask();
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                placeholder="Add notes or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Estimated Pomodoros */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Pomodoros</label>
              <Select
                value={estimatedPomodoros}
                onValueChange={setEstimatedPomodoros}>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger>
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

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
