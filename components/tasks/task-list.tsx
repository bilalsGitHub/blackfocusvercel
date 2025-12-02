"use client";

import * as React from "react";
import { TaskItem } from "./task-item";
import { AddTaskInput } from "./add-task-input";
import { TaskDateFilter } from "./task-date-filter";
import { useTaskStore } from "@/stores/task-store";

export function TaskList() {
  const { tasks, reorderTasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Filter tasks by selected date
  const activeTasks = React.useMemo(() => {
    const selected = new Date(selectedDate);
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const day = String(selected.getDate()).padStart(2, '0');
    const selectedStr = `${year}-${month}-${day}`;

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    return tasks
      .filter((task) => {
        if (task.isCompleted) return false;

        // If task has scheduled date, check against that
        if (task.scheduledDate) {
          return task.scheduledDate === selectedStr;
        }

        // If no scheduled date, only show on today
        return selectedStr === todayStr;
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks, selectedDate]);

  const completedTasks = React.useMemo(() => {
    const selected = new Date(selectedDate);
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const day = String(selected.getDate()).padStart(2, '0');
    const selectedStr = `${year}-${month}-${day}`;

    return tasks
      .filter((task) => {
        if (!task.isCompleted || !task.completedAt) return false;

        // Check if completed on selected date (by completedAt date)
        const completedDate = new Date(task.completedAt);
        const compYear = completedDate.getFullYear();
        const compMonth = String(completedDate.getMonth() + 1).padStart(2, '0');
        const compDay = String(completedDate.getDate()).padStart(2, '0');
        const completedDateStr = `${compYear}-${compMonth}-${compDay}`;

        const wasCompletedOnSelectedDate = completedDateStr === selectedStr;

        // Check if scheduled for this date
        const isScheduledForSelectedDate = task.scheduledDate === selectedStr;

        // Show task if it was completed on selected date OR scheduled for selected date
        return wasCompletedOnSelectedDate || isScheduledForSelectedDate;
      })
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return (
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      });
  }, [tasks, selectedDate]);

  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();

    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const draggedIndex = activeTasks.findIndex((t) => t.id === draggedTaskId);
    const targetIndex = activeTasks.findIndex((t) => t.id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...activeTasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);

    // Include completed tasks in reorder
    reorderTasks([...newTasks, ...completedTasks]);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4">
      {/* Date Filter */}
      <TaskDateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Add Task Input */}
      <AddTaskInput selectedDate={selectedDate} />

      {/* Active Tasks */}
      {activeTasks.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Active Tasks ({activeTasks.length})
          </h3>
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {activeTasks.length === 0 && completedTasks.length === 0
            ? "No tasks for this day 📅"
            : "No active tasks 🎯"}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Completed ({completedTasks.length})
            </h3>
          </div>
          <div className="space-y-2 opacity-60">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
