"use client";

import { Card } from "@/components/ui/card";

interface RouteBriefStatusProps {
  origin: string;
  destination: string;
  cargoType: "TEU" | "FEU";
  currentStepIndex: number;
  getPortName: (code: string) => string;
}

export default function RouteBriefStatus({
  origin,
  destination,
  cargoType,
  currentStepIndex,
  getPortName,
}: RouteBriefStatusProps) {
  const loadingSteps = [
    { id: 1, label: "Reviewing current rate benchmarks" },
    { id: 2, label: "Checking port congestion and dwell times" },
    { id: 3, label: "Comparing carrier schedules" },
    { id: 4, label: "Writing your route recommendation" },
  ];

  return (
    <Card className="max-w-2xl mx-auto border border-border shadow-md overflow-hidden rounded-2xl bg-background">
      <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8">
        {/* Sparkles Box */}
        <div className="flex items-center justify-center p-4 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V4M12 20V21M4 12H3M21 12H20M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 5.636L5.636 6.343M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
            Building your brief
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Analyzing {getPortName(origin)} to {getPortName(destination)}
          </h3>
          <p className="text-sm text-muted-foreground">
            We're connecting the latest signals for your {cargoType === "TEU" ? "20ft" : "40ft"} shipment.
          </p>
        </div>

        {/* checklist steps */}
        <div className="w-full max-w-md text-left space-y-4 pt-4">
          {loadingSteps.map((s) => {
            const isCompleted = currentStepIndex > s.id;
            const isActive = currentStepIndex === s.id;

            return (
              <div key={s.id} className="flex items-center gap-3.5">
                {isCompleted ? (
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 8 9 4" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs">
                    {s.id}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-bold text-xs">
                    {s.id}
                  </div>
                )}

                <span className={`text-sm font-medium ${
                  isCompleted ? "text-muted-foreground line-through opacity-80" : isActive ? "text-foreground font-semibold" : "text-muted-foreground/60"
                }`}>
                  {s.label}
                </span>

                {isActive && (
                  <span className="flex h-2 w-2 relative ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStepIndex / loadingSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
