"use client";

import * as React from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore, type Task } from "@/stores/task-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, X, Trash2, AlertTriangle } from "lucide-react";
import type { Session } from "@/stores/timer-store";

export function UnassignedSessions() {
  const sessions = useTimerStore((state) => state.sessions);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  // Filter focus sessions that aren't tracked yet
  const unassignedSessions = React.useMemo(() => {
    return sessions.filter(
      (s) =>
        (s.mode === "focus" || s.mode === "chronometer") &&
        s.wasCompleted &&
        !s.taskId
    );
  }, [sessions]);

  const [selectedTasks, setSelectedTasks] = React.useState<{
    [sessionId: string]: string;
  }>({});
  const [newTaskTitles, setNewTaskTitles] = React.useState<{
    [sessionId: string]: string;
  }>({});
  const [deletingSessionId, setDeletingSessionId] = React.useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<Session | null>(
    null
  );

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setDeletingSessionId(sessionToDelete.id);
    setDeleteDialogOpen(false);

    try {
      const response = await fetch(`/api/sessions/${sessionToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete session");

      // Remove from local state immediately
      const updatedSessions = sessions.filter(
        (s) => s.id !== sessionToDelete.id
      );
      useTimerStore.setState({ sessions: updatedSessions });
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session");
    } finally {
      setDeletingSessionId(null);
      setSessionToDelete(null);
    }
  };

  const handleAssignSession = async (sessionId: string, taskId: string) => {
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];

    try {
      // Update session in Supabase
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign session");
      }

      // Update local state
      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        taskId,
      };
      useTimerStore.setState({ sessions: updatedSessions });

      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const updates: Partial<Task> = {
          isActive: false,
        };

        if (session.mode === "focus") {
          updates.completedPomodoros = task.completedPomodoros + 1;
        } else if (session.mode === "chronometer") {
          updates.isChronoLog = true;
          updates.chronoDurationSeconds =
            (task.chronoDurationSeconds || 0) + session.duration;
        }

        if (session.mode === "chronometer" || task.isChronoLog) {
          updates.isCompleted = true;
          updates.completedAt = session.completedAt;
        }

        await updateTask(taskId, updates);
      }

      setSelectedTasks((prev) => {
        const newState = { ...prev };
        delete newState[sessionId];
        return newState;
      });

      setNewTaskTitles((prev) => {
        const newState = { ...prev };
        delete newState[sessionId];
        return newState;
      });
    } catch (error) {
      console.error("Error assigning session:", error);
    }
  };

  const handleCreateTaskAndAssign = async (session: Session, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      // For chronometer sessions, create a chrono log task directly via API
      if (session.mode === "chronometer") {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            estimatedPomodoros: 0,
            priority: "medium",
            isChronoLog: true,
            chronoDurationSeconds: session.duration,
            isCompleted: true,
            completedAt: session.completedAt,
            order: useTaskStore.getState().tasks.length,
          }),
        });

        if (!response.ok) throw new Error("Failed to create chrono task");

        const newTask = await response.json();

        // Update local state
        useTaskStore.setState({
          tasks: [
            ...useTaskStore.getState().tasks,
            {
              id: newTask.id,
              title: newTask.title,
              description: newTask.description || "",
              estimatedPomodoros: 0,
              completedPomodoros: 0,
              isActive: false,
              priority: newTask.priority || "medium",
              scheduledDate: newTask.scheduled_date || null,
              isCompleted: true,
              isChronoLog: true,
              chronoDurationSeconds: session.duration,
              order: newTask.order_index || 0,
              createdAt: newTask.created_at,
              completedAt: newTask.completed_at,
            },
          ],
        });

        // Assign session to this task
        await handleAssignSession(session.id, newTask.id);
      } else {
        // For focus sessions, use the normal addTask flow
        const addTask = useTaskStore.getState().addTask;
        // Create task with 1 estimated pomodoro (since we're assigning one completed session)
        await addTask(trimmedTitle, 1, "medium");

        // Get the newly created task
        const tasks = useTaskStore.getState().tasks;
        const newTask = tasks[tasks.length - 1];
        if (!newTask) return;

        // Now assign the session to this task
        handleAssignSession(session.id, newTask.id);
      }
    } catch (error) {
      console.error("Error creating task and assigning session:", error);
    }
  };

  if (unassignedSessions.length === 0) {
    return null;
  }

  return (
    <Card className="p-3 sm:p-4 border-dashed border-muted-foreground/30">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Unassigned Sessions ({unassignedSessions.length})
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Assign sessions to tasks
            </p>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-2">
          {unassignedSessions.slice(0, 5).map((session) => {
            const date = new Date(session.completedAt);
            const timeStr = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const dateStr = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={session.id}
                className="p-2.5 rounded-lg border bg-muted/30 space-y-2 relative group">
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(session)}
                  disabled={deletingSessionId === session.id}
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                  <X className="h-3.5 w-3.5" />
                </Button>

                {/* Session Info Row */}
                <div className="flex items-center gap-2 flex-wrap pr-7">
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium px-2 py-0.5">
                    {session.mode === "chronometer"
                      ? `⏱ ${Math.max(1, Math.round(session.duration / 60))}m`
                      : `🍅 ${Math.round(session.duration / 60)}m`}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {dateStr} {timeStr}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                    {session.mode === "chronometer" ? "Chrono" : "Focus"}
                  </Badge>
                </div>

                {/* Assign to Existing Task */}
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTasks[session.id] || ""}
                    onValueChange={(value) =>
                      setSelectedTasks((prev) => ({
                        ...prev,
                        [session.id]: value,
                      }))
                    }>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Select existing task..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks
                        .filter((t) => !t.isCompleted)
                        .map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const taskId = selectedTasks[session.id];
                      if (taskId) {
                        handleAssignSession(session.id, taskId);
                      }
                    }}
                    disabled={!selectedTasks[session.id]}
                    className="h-8 px-3 text-xs flex-shrink-0">
                    Assign
                  </Button>
                </div>

                {/* Create New Task */}
                <div className="pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newTaskTitles[session.id] || ""}
                      onChange={(e) =>
                        setNewTaskTitles((prev) => ({
                          ...prev,
                          [session.id]: e.target.value,
                        }))
                      }
                      placeholder="Or create new task..."
                      className="h-8 text-xs flex-1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          newTaskTitles[session.id]?.trim()
                        ) {
                          handleCreateTaskAndAssign(
                            session,
                            newTaskTitles[session.id] || ""
                          );
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        handleCreateTaskAndAssign(
                          session,
                          newTaskTitles[session.id] || ""
                        )
                      }
                      disabled={!newTaskTitles[session.id]?.trim()}
                      className="h-8 px-3 text-xs flex-shrink-0">
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {unassignedSessions.length > 5 && (
            <p className="text-[11px] text-muted-foreground text-center py-1">
              +{unassignedSessions.length - 5} more unassigned sessions
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Session
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this session? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {sessionToDelete && (
            <div className="py-4">
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {sessionToDelete.mode === "chronometer"
                      ? `⏱ ${Math.max(
                          1,
                          Math.round(sessionToDelete.duration / 60)
                        )}m`
                      : `🍅 ${Math.round(sessionToDelete.duration / 60)}m`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sessionToDelete.completedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}{" "}
                    {new Date(sessionToDelete.completedAt).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
