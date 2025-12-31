"use client";

import { format, formatDistanceToNow, isToday } from "date-fns";
import { Task, TimeBlock } from "@/lib/types";
import { Fragment, useMemo, useState } from "react";
import { CheckIcon, ClockIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange(id: string, status: Task["status"]): void;
  onDelete(id: string): void;
  onSchedule(id: string, block: TimeBlock | undefined): void;
}

const blockLabels: Record<TimeBlock, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export function TaskBoard({ tasks, onStatusChange, onDelete, onSchedule }: TaskBoardProps) {
  const [filter, setFilter] = useState<"all" | TimeBlock | "overdue">("all");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (category !== "all" && task.category !== category) return false;
      if (filter === "overdue") {
        return Boolean(task.deadline && new Date(task.deadline).getTime() < Date.now() && task.status !== "completed");
      }
      if (filter === "all") return true;
      return task.scheduledBlock === filter;
    });
  }, [tasks, filter, category]);

  const categories = useMemo(() => Array.from(new Set(tasks.map((task) => task.category))), [tasks]);

  const sorted = useMemo(() => {
    const priorityOrder: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };
    return [...filtered].sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      if (aDeadline !== bDeadline) return aDeadline - bDeadline;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [filtered]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">To-Do List</h2>
          <p className="text-sm text-slate-500">Tap to mark progress. I\'ll keep everything synced across your plan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All Blocks</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="grid gap-4">
        {sorted.map((task) => {
          const deadlineLabel = task.deadline
            ? format(new Date(task.deadline), isToday(new Date(task.deadline)) ? "h:mm a" : "MMM d · h:mm a")
            : "No deadline";
          const deadlineDistance = task.deadline
            ? formatDistanceToNow(new Date(task.deadline), { addSuffix: true })
            : null;
          const isOverdue = Boolean(task.deadline && new Date(task.deadline).getTime() < Date.now() && task.status !== "completed");
          return (
            <li
              key={task.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-primary-200 hover:shadow-md md:flex-row md:items-center"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() =>
                    onStatusChange(task.id, task.status === "completed" ? "pending" : "completed")
                  }
                  className={`mt-1 flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                    task.status === "completed"
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-slate-300 text-slate-500 hover:border-primary-400"
                  }`}
                  aria-label={task.status === "completed" ? "Mark as pending" : "Mark as completed"}
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-base font-semibold text-slate-900">{task.title}</p>
                  {task.description ? (
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1 font-semibold capitalize text-slate-700">
                      {task.priority} priority
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">
                      {task.category}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-semibold capitalize text-slate-700">
                      Energy: {task.energy}
                    </span>
                    {task.scheduledBlock ? (
                      <span className="rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-600">
                        {blockLabels[task.scheduledBlock]}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col items-end gap-2 md:mt-0 md:flex-row md:items-center">
                <div className="text-right text-xs text-slate-500">
                  <div className="flex items-center justify-end gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{deadlineLabel}</span>
                  </div>
                  {deadlineDistance ? <p className={isOverdue ? "text-red-500" : ""}>{deadlineDistance}</p> : null}
                </div>
                <select
                  value={task.scheduledBlock ?? "unscheduled"}
                  onChange={(event) =>
                    onSchedule(task.id, event.target.value === "unscheduled" ? undefined : (event.target.value as TimeBlock))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="unscheduled">Assign Block</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
                <button
                  onClick={() => onDelete(task.id)}
                  className="flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </li>
          );
        })}
        {sorted.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No tasks here yet. Capture something important and I\'ll slot it into your plan.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export type { TaskBoardProps };
