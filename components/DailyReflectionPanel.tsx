"use client";

import { DailyReflection } from "@/lib/types";
import { format } from "date-fns";
import { FormEvent, useEffect, useState } from "react";

interface DailyReflectionPanelProps {
  reflection: DailyReflection | null;
  onUpdate(reflection: DailyReflection): void;
}

export function DailyReflectionPanel({ reflection, onUpdate }: DailyReflectionPanelProps) {
  const todayIso = new Date().toISOString();
  const [priorities, setPriorities] = useState(reflection?.priorities ?? "");
  const [wins, setWins] = useState(reflection?.wins ?? "");
  const [energyLevel, setEnergyLevel] = useState(reflection?.energyLevel ?? "medium");

  useEffect(() => {
    setPriorities(reflection?.priorities ?? "");
    setWins(reflection?.wins ?? "");
    setEnergyLevel(reflection?.energyLevel ?? "medium");
  }, [reflection?.date]);

  const handlePriorities = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate({ date: reflection?.date ?? todayIso, priorities, wins: reflection?.wins, energyLevel });
  };

  const handleWins = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate({ date: reflection?.date ?? todayIso, priorities: reflection?.priorities, wins, energyLevel });
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Daily Check-ins</h2>
        <p className="text-sm text-slate-500">Start strong and close with intention. I\'ll keep a light log for momentum tracking.</p>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <form onSubmit={handlePriorities} className="space-y-3 rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
          <span className="text-xs uppercase tracking-widest text-primary-600">Start of Day</span>
          <h3 className="text-base font-semibold text-slate-900">What are your priorities for today?</h3>
          <textarea
            value={priorities}
            onChange={(event) => setPriorities(event.target.value)}
            className="h-32 w-full rounded-2xl border border-primary-100 bg-white/80 px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Highlight 1-3 focus areas."
          />
          <div className="flex items-center justify-between text-xs text-primary-600">
            <div>
              Today · {format(new Date(), "EEEE, MMM d")}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              Save Priorities
            </button>
          </div>
        </form>
        <form onSubmit={handleWins} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs uppercase tracking-widest text-slate-400">End of Day</span>
          <h3 className="text-base font-semibold text-slate-900">What did you complete today?</h3>
          <textarea
            value={wins}
            onChange={(event) => setWins(event.target.value)}
            className="h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Capture key wins or learnings."
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 text-xs">
              Energy level
              <select
                value={energyLevel}
                onChange={(event) => setEnergyLevel(event.target.value as typeof energyLevel)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-xs focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-600"
            >
              Log Completion
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export type { DailyReflectionPanelProps };
