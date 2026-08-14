import { Bell, ShieldAlert, CheckCircle2 } from "lucide-react";

type Props = {
  unreadCount: number;
  criticalCount: number;
};

export default function AlertSummaryCards({
  unreadCount,
  criticalCount,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Unread alerts */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Unread alerts</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
            <Bell className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-900">{unreadCount}</p>
        <p className="mt-1 text-xs text-slate-500">Needs your attention</p>
      </div>

      {/* Critical signals */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Critical signals</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-900">
          {criticalCount}
        </p>
        <p className="mt-1 text-xs text-slate-500">Across active lanes</p>
      </div>

      {/* Response rate */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Response rate</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-900">—</p>
        <p className="mt-1 text-xs text-emerald-600">Not available yet</p>
      </div>
    </div>
  );
}
