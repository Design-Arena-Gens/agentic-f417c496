"use client";

import { FormEvent, useMemo, useState } from "react";
import { PriorityLevel, Task, EnergyLevel } from "@/lib/types";
import { format } from "date-fns";

const categories = ["Work", "Study", "Personal", "Health", "Finance", "Family", "Errand", "Focus"];

interface TaskComposerProps {
  onCreate(task: Task): void;
  onAutoPlan(): void;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  deadline: string;
  energy: EnergyLevel;
}

const defaultState: FormState = {
  title: "",
  description: "",
  category: "Work",
  priority: "medium",
  deadline: "",
  energy: "medium",
};

export function TaskComposer({ onCreate, onAutoPlan }: TaskComposerProps) {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<string | null>(null);

  const canSubmit = useMemo(() => form.title.trim().length > 0, [form.title]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(null);

    if (!form.title.trim()) {
      setErrors("Give this task a clear title so we can track it.");
      return;
    }

    if (!form.deadline) {
      setErrors("Add a clear deadline so I can schedule this.");
      return;
    }

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload: Task = {
      id,
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : undefined,
      category: form.category,
      priority: form.priority,
      deadline: new Date(form.deadline).toISOString(),
      energy: form.energy,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    onCreate(payload);
    setForm(defaultState);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Capture a New Task</h2>
          <p className="text-sm text-slate-500">Tell me what matters, and I\'ll plan it into your day.</p>
        </div>
        <button
          type="button"
          onClick={onAutoPlan}
          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
        >
          Refresh Plan
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="col-span-2 text-sm font-medium text-slate-600">
          Title
          <input
            required
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Draft the project proposal"
          />
        </label>
        <label className="col-span-2 text-sm font-medium text-slate-600">
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            rows={3}
            placeholder="Add context, links, or steps"
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          Category
          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-600">
          Priority
          <select
            value={form.priority}
            onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as PriorityLevel }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-600">
          Deadline
          <input
            type="datetime-local"
            value={form.deadline}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          Energy Level
          <select
            value={form.energy}
            onChange={(event) => setForm((prev) => ({ ...prev, energy: event.target.value as EnergyLevel }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <div className="col-span-2 flex items-center justify-between">
          <div className="text-sm text-primary-600">Always include a clear deadline and priority so I can plan accurately.</div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Add Task
          </button>
        </div>
        {errors ? <p className="col-span-2 text-sm text-red-500">{errors}</p> : null}
      </form>
    </section>
  );
}

export type { TaskComposerProps };
