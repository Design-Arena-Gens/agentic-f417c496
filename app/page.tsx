"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentHeader } from "@/components/AgentHeader";
import { TaskComposer } from "@/components/TaskComposer";
import { TaskBoard } from "@/components/TaskBoard";
import { DailyPlanView } from "@/components/DailyPlanView";
import { ReminderPanel } from "@/components/ReminderPanel";
import { GoalTracker } from "@/components/GoalTracker";
import { CoachingPanel } from "@/components/CoachingPanel";
import { DailyReflectionPanel } from "@/components/DailyReflectionPanel";
import {
  DailyPlan,
  DailyReflection,
  Goal,
  Reminder,
  Task,
} from "@/lib/types";
import {
  autoAssignBlocks,
  buildReminders,
  generateDailyPlan,
  rescheduleIncomplete,
} from "@/lib/planner";
import { isSameDay, startOfDay } from "date-fns";

const STORAGE_KEY = "focusflow-ai-state-v1";

interface PersistedState {
  tasks: Task[];
  goals: Goal[];
  reminders: Reminder[];
  reflections: DailyReflection[];
}

function rebuildReminders(tasks: Task[], previous: Reminder[]): Reminder[] {
  const existingMessages = previous.reduce<Record<string, string>>((acc, reminder) => {
    acc[reminder.id] = reminder.message;
    return acc;
  }, {});
  const reminderMap = buildReminders(tasks, existingMessages);
  return Object.entries(reminderMap).map(([id, message]) => {
    const [taskId] = id.split(":");
    const relatedTask = tasks.find((task) => task.id === taskId);
    const prior = previous.find((reminder) => reminder.id === id);
    return {
      id,
      taskId,
      message,
      remindAt: prior?.remindAt ?? relatedTask?.deadline ?? new Date().toISOString(),
      acknowledged: prior?.acknowledged ?? false,
    } satisfies Reminder;
  });
}

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(() => generateDailyPlan([], new Date()));
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PersistedState;
        const restoredTasks = autoAssignBlocks(rescheduleIncomplete(parsed.tasks ?? []));
        setTasks(restoredTasks);
        setGoals(parsed.goals ?? []);
        setReminders(parsed.reminders ?? []);
        setReflections(parsed.reflections ?? []);
        setDailyPlan(generateDailyPlan(restoredTasks, new Date()));
      } catch (error) {
        console.error("Failed to parse stored planner state", error);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const snapshot: PersistedState = {
      tasks,
      goals,
      reminders,
      reflections,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [hydrated, tasks, goals, reminders, reflections]);

  const applyTaskUpdate = useCallback((updater: (tasks: Task[]) => Task[]) => {
    setTasks((previous) => {
      const mutated = updater(previous);
      const cleaned = rescheduleIncomplete(mutated);
      const scheduled = autoAssignBlocks(cleaned);
      const plan = generateDailyPlan(scheduled, new Date());
      setDailyPlan(plan);
      setReminders((current) => rebuildReminders(scheduled, current));
      return scheduled;
    });
  }, []);

  const handleCreateTask = useCallback(
    (task: Task) => {
      applyTaskUpdate((prev) => [...prev, task]);
    },
    [applyTaskUpdate],
  );

  const handleStatusChange = useCallback(
    (id: string, status: Task["status"]) => {
      applyTaskUpdate((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status,
                completedAt: status === "completed" ? new Date().toISOString() : undefined,
                scheduledBlock: status === "completed" ? undefined : task.scheduledBlock,
              }
            : task,
        ),
      );
    },
    [applyTaskUpdate],
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      applyTaskUpdate((prev) => prev.filter((task) => task.id !== id));
      setReminders((prev) => prev.filter((reminder) => !reminder.id.startsWith(`${id}:`)));
    },
    [applyTaskUpdate],
  );

  const handleSchedule = useCallback(
    (id: string, block: Task["scheduledBlock"]) => {
      applyTaskUpdate((prev) =>
        prev.map((task) => (task.id === id ? { ...task, scheduledBlock: block } : task)),
      );
    },
    [applyTaskUpdate],
  );

  const handleAutoPlan = useCallback(() => {
    applyTaskUpdate((prev) => [...prev]);
  }, [applyTaskUpdate]);

  const handleAcknowledgeReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, acknowledged: true } : reminder)));
  }, []);

  const handleCreateGoal = useCallback((goal: Goal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const handleToggleGoalStep = useCallback((goalId: string, stepId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              steps: goal.steps.map((step) =>
                step.id === stepId ? { ...step, completed: !step.completed } : step,
              ),
            }
          : goal,
      ),
    );
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);

  const todayReflection = useMemo(() => {
    const existing = reflections.find((entry) => isSameDay(new Date(entry.date), today));
    if (existing) return existing;
    return { date: today.toISOString() } satisfies DailyReflection;
  }, [reflections, today]);

  const handleReflectionUpdate = useCallback((entry: DailyReflection) => {
    setReflections((prev) => {
      const existingIndex = prev.findIndex((item) => isSameDay(new Date(item.date), new Date(entry.date)));
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...entry };
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const pendingTasks = useMemo(() => tasks.filter((task) => task.status !== "completed"), [tasks]);
  const completedToday = useMemo(
    () => tasks.filter((task) => task.completedAt && isSameDay(new Date(task.completedAt), today)).length,
    [tasks, today],
  );

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <AgentHeader pendingTasks={pendingTasks.length} completedTasksToday={completedToday} />
      <TaskComposer onCreate={handleCreateTask} onAutoPlan={handleAutoPlan} />
      <DailyPlanView plan={dailyPlan} tasks={tasks} onMarkComplete={(id) => handleStatusChange(id, "completed")} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <TaskBoard tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} onSchedule={handleSchedule} />
          <GoalTracker goals={goals} onCreate={handleCreateGoal} onToggleStep={handleToggleGoalStep} />
        </div>
        <div className="space-y-6">
          <ReminderPanel reminders={reminders} tasks={tasks} onAcknowledge={handleAcknowledgeReminder} />
          <CoachingPanel tasks={tasks} goals={goals} />
        </div>
      </div>
      <DailyReflectionPanel reflection={todayReflection} onUpdate={handleReflectionUpdate} />
    </main>
  );
}
