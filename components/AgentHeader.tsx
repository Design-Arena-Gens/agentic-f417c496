"use client";

import { format } from "date-fns";

interface AgentHeaderProps {
  pendingTasks: number;
  completedTasksToday: number;
}

export function AgentHeader({ pendingTasks, completedTasksToday }: AgentHeaderProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-white via-primary-50 to-white p-8 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.4rem] text-primary-500">FocusFlow AI</span>
        <h1 className="text-3xl font-semibold text-slate-900">
          {greeting}! I\'m here to keep your day intentional.
        </h1>
        <p className="text-sm text-slate-500">
          {format(now, "EEEE, MMMM d")}. We have {pendingTasks} active task{pendingTasks === 1 ? "" : "s"} and {completedTasksToday} win{completedTasksToday === 1 ? "" : "s"} logged today.
        </p>
      </div>
      <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-primary-500">Rhythm</p>
          <p className="mt-1 font-semibold text-slate-900">Plan → Execute → Reflect</p>
          <p className="text-xs text-slate-500">Capture tasks, stick to the blocks, log your wins. I\'ll handle the choreography.</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-primary-500">Reminders</p>
          <p className="mt-1 font-semibold text-slate-900">I\'ll surface anything urgent</p>
          <p className="text-xs text-slate-500">Deadlines, overdue items, goal milestones—I\'ve got your back.</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-primary-500">Support</p>
          <p className="mt-1 font-semibold text-slate-900">Feeling overwhelmed?</p>
          <p className="text-xs text-slate-500">I\'ll detect overload and suggest a lighter plan or recovery time.</p>
        </div>
      </div>
    </header>
  );
}

export type { AgentHeaderProps };
