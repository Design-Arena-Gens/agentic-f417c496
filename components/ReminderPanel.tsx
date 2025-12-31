"use client";

import { Reminder, Task } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface ReminderPanelProps {
  reminders: Reminder[];
  tasks: Task[];
  onAcknowledge(id: string): void;
}

export function ReminderPanel({ reminders, tasks, onAcknowledge }: ReminderPanelProps) {
  const activeReminders = reminders.filter((reminder) => !reminder.acknowledged);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-lg font-semibold text-slate-900">Upcoming Reminders</h2>
      <p className="text-sm text-slate-500">I\'ll nudge you ahead of deadlines and catch anything that slips.</p>
      <ul className="mt-4 space-y-3">
        {activeReminders.map((reminder) => {
          const task = tasks.find((item) => item.id === reminder.taskId);
          return (
            <li key={reminder.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{reminder.message}</p>
                {task ? <p className="text-xs text-slate-500">Linked Task: {task.title}</p> : null}
                <p className="mt-2 text-xs text-primary-600">{formatDistanceToNow(new Date(reminder.remindAt), { addSuffix: true })}</p>
              </div>
              <button
                onClick={() => onAcknowledge(reminder.id)}
                className="rounded-xl border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-600 transition hover:border-primary-300 hover:bg-primary-50"
              >
                Got it
              </button>
            </li>
          );
        })}
        {activeReminders.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No reminders right now. I\'ll let you know the moment something needs attention.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export type { ReminderPanelProps };
