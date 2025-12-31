"use client";

import { Task, Goal } from "@/lib/types";
import { computeCoachingInsights } from "@/lib/insights";

interface CoachingPanelProps {
  tasks: Task[];
  goals: Goal[];
}

export function CoachingPanel({ tasks, goals }: CoachingPanelProps) {
  const insights = computeCoachingInsights(tasks, goals);

  return (
    <section className="rounded-3xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-sm">
      <h2 className="text-lg font-semibold">Productivity Coaching</h2>
      <p className="text-sm text-primary-100">I\'m watching your workload and making sure you stay energized and consistent.</p>
      <ul className="mt-4 space-y-3">
        {insights.map((insight) => (
          <li key={insight.id} className="rounded-2xl bg-white/15 p-4 text-sm">
            <p className="font-semibold text-white">{insight.title}</p>
            <p className="mt-1 text-primary-100">{insight.message}</p>
            {insight.actions?.length ? (
              <ul className="mt-3 space-y-1 text-xs text-primary-50">
                {insight.actions.map((action) => (
                  <li key={action}>• {action}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
        {insights.length === 0 ? (
          <li className="rounded-2xl bg-white/10 p-4 text-sm text-primary-100">
            Steady pace today. Keep using the plan and I\'ll speak up when something needs attention.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export type { CoachingPanelProps };
