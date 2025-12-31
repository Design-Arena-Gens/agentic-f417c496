"use client";

import { DailyPlan, Task, TimeBlock } from "@/lib/types";

const blockDescriptions: Record<TimeBlock, string> = {
  morning: "Protect your freshest focus here.",
  afternoon: "Leverage momentum and collaboration windows.",
  evening: "Wrap loose ends and set up tomorrow.",
};

interface DailyPlanViewProps {
  plan: DailyPlan;
  tasks: Task[];
  onMarkComplete(id: string): void;
}

const orderedBlocks: TimeBlock[] = ["morning", "afternoon", "evening"];

export function DailyPlanView({ plan, tasks, onMarkComplete }: DailyPlanViewProps) {
  return (
    <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.2rem] text-primary-200">Today\'s Plan</span>
        <h2 className="text-2xl font-semibold">{plan.focusTheme ?? "Intentional progress, steady pace."}</h2>
        <p className="text-sm text-slate-200">I\'ll keep this plan updated as we check things off or timelines move.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {orderedBlocks.map((block) => {
          const blockTasks = plan.blocks[block]?.map((taskId) => tasks.find((task) => task.id === taskId)).filter(Boolean) ?? [];
          return (
            <div key={block} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">{block}</h3>
                <span className="text-xs uppercase tracking-widest text-primary-200">
                  {blockTasks.length ? `${blockTasks.length} block${blockTasks.length > 1 ? "s" : ""}` : "open"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-200">{blockDescriptions[block]}</p>
              <ul className="mt-3 space-y-2">
                {blockTasks.map((task) => (
                  <li key={task!.id} className="flex items-center justify-between rounded-xl bg-white/20 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-white">{task!.title}</p>
                      <p className="text-xs text-slate-200 capitalize">{task!.priority} priority · {task!.category}</p>
                    </div>
                    <button
                      onClick={() => onMarkComplete(task!.id)}
                      className="rounded-lg bg-primary-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary-400"
                    >
                      Done
                    </button>
                  </li>
                ))}
                {blockTasks.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-white/30 px-3 py-4 text-center text-xs text-slate-200">
                    Let\'s keep this window flexible for spillover or recovery.
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export type { DailyPlanViewProps };
