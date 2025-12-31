"use client";

import { Goal } from "@/lib/types";
import { FormEvent, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface GoalTrackerProps {
  goals: Goal[];
  onCreate(goal: Goal): void;
  onToggleStep(goalId: string, stepId: string): void;
}

interface GoalFormState {
  name: string;
  horizon: Goal["horizon"];
  motivation: string;
  targetDate: string;
  steps: string;
}

const defaultGoalForm: GoalFormState = {
  name: "",
  horizon: "short-term",
  motivation: "",
  targetDate: "",
  steps: "",
};

export function GoalTracker({ goals, onCreate, onToggleStep }: GoalTrackerProps) {
  const [form, setForm] = useState<GoalFormState>(defaultGoalForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const generateId = () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const steps = form.steps
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title) => ({ id: generateId(), title, completed: false }));

    onCreate({
      id: generateId(),
      name: form.name.trim(),
      horizon: form.horizon,
      motivation: form.motivation.trim() || undefined,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
      steps,
    });
    setForm(defaultGoalForm);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Goal Progress</h2>
        <p className="text-sm text-slate-500">Anchor your long-game. I\'ll surface the steps that belong in today\'s plan.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Goal Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Ship v1 of the product"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Horizon
            <select
              value={form.horizon}
              onChange={(event) => setForm((prev) => ({ ...prev, horizon: event.target.value as Goal["horizon"] }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="short-term">Short-term (under 90 days)</option>
              <option value="long-term">Long-term</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Target Date
            <input
              type="date"
              value={form.targetDate}
              onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Motivation
            <input
              value={form.motivation}
              onChange={(event) => setForm((prev) => ({ ...prev, motivation: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Why is this important?"
            />
          </label>
        </div>
        <label className="text-sm font-medium text-slate-600">
          Break it into steps (one per line)
          <textarea
            value={form.steps}
            onChange={(event) => setForm((prev) => ({ ...prev, steps: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            rows={4}
            placeholder={"Draft outline\nSchedule user interviews\nReview feedback"}
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            Add Goal
          </button>
        </div>
      </form>
      <div className="mt-6 space-y-4">
        {goals.map((goal) => {
          const totalSteps = goal.steps.length || 1;
          const completedSteps = goal.steps.filter((step) => step.completed).length;
          const completion = Math.round((completedSteps / totalSteps) * 100);
          return (
            <div key={goal.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{goal.name}</h3>
                  <p className="text-xs uppercase tracking-wide text-primary-500">{goal.horizon === "short-term" ? "Short-term" : "Long-term"}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-600">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${completion}%` }} />
                  </div>
                  {completion}%
                </div>
              </div>
              {goal.motivation ? <p className="mt-2 text-sm text-slate-600">{goal.motivation}</p> : null}
              <ul className="mt-4 space-y-2">
                {goal.steps.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
                    Add focused steps so I can weave them into your plan.
                  </li>
                ) : null}
                {goal.steps.map((step) => (
                  <li key={step.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
                    <button
                      onClick={() => onToggleStep(goal.id, step.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-primary-500 transition ${
                        step.completed ? "border-primary-500 bg-primary-500 text-white" : "border-primary-200"
                      }`}
                      aria-label="Toggle step"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <span className={`text-sm ${step.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {step.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No goals defined yet. Let\'s set one so I can break it into weekly and daily actions for you.
          </div>
        ) : null}
      </div>
    </section>
  );
}

export type { GoalTrackerProps };
