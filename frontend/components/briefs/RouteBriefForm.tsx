import { useState } from "react";
import { Port } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RouteBriefRequest } from "@/lib/api/route-brief";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";

interface RouteBriefFormProps {
  ports: Port[];
  onSubmit: (request: RouteBriefRequest) => void;
  isLoading?: boolean;
}

export default function RouteBriefForm({ ports, onSubmit, isLoading = false }: RouteBriefFormProps) {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [containerType, setContainerType] = useState<"20ft" | "40ft">("40ft");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      alert("Please select both Origin and Destination ports.");
      return;
    }
    if (origin === destination) {
      alert("Origin and Destination ports must be different.");
      return;
    }
    onSubmit({
      origin,
      destination,
      cargo_type: containerType === "20ft" ? "TEU" : "FEU",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full max-w-7xl mx-auto p-1">
      {/* Left side: The Interactive Form */}
      <Card className="lg:col-span-2 shadow-xs border border-border">
        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between p-6">
          <div className="space-y-6">
            {/* Header section with Icon */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Generate a route intelligence brief
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select your lane and cargo profile. FreightPulse will combine rates, port conditions, and carrier signals into one concise brief.
                </p>
              </div>
            </div>

            {/* Dropdowns side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin Port Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Origin port
                </label>
                <Select value={origin} onValueChange={(val) => setOrigin(val ?? "")} disabled={isLoading}>
                  <SelectTrigger className="w-full h-11 px-3 bg-background border border-input rounded-lg flex items-center justify-between text-muted-foreground focus:ring-2 focus:ring-ring">
                    <span className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select origin port" />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-y-auto">
                    {ports.map((port) => (
                      <SelectItem key={port.id} value={port.code || port.name}>
                        {port.name} ({port.code || port.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Port Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Destination port
                </label>
                <Select value={destination} onValueChange={(val) => setDestination(val ?? "")} disabled={isLoading}>
                  <SelectTrigger className="w-full h-11 px-3 bg-background border border-input rounded-lg flex items-center justify-between text-muted-foreground focus:ring-2 focus:ring-ring">
                    <span className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select destination port" />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-y-auto">
                    {ports.map((port) => (
                      <SelectItem key={port.id} value={port.code || port.name}>
                        {port.name} ({port.code || port.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Container Profiles selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Container profile
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 20ft Card */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setContainerType("20ft")}
                  className={`text-left cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between disabled:opacity-60 disabled:cursor-not-allowed ${
                    containerType === "20ft"
                      ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20 ring-1 ring-blue-600 dark:ring-blue-500"
                      : "border-border hover:border-muted-foreground/30 bg-background"
                  }`}
                >
                  <span className="font-semibold text-foreground">20ft container</span>
                  <span className="text-xs text-muted-foreground mt-1">Compact dry cargo profile</span>
                </button>

                {/* 40ft Card */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setContainerType("40ft")}
                  className={`text-left cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between disabled:opacity-60 disabled:cursor-not-allowed ${
                    containerType === "40ft"
                      ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20 ring-1 ring-blue-600 dark:ring-blue-500"
                      : "border-border hover:border-muted-foreground/30 bg-background"
                  }`}
                >
                  <span className="font-semibold text-foreground">40ft container</span>
                  <span className="text-xs text-muted-foreground mt-1">Standard high-cube profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer of the form with button and time warning */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-border">
            <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Usually ready in under 30 seconds
            </span>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Generate brief
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Right side: Dark "What you'll get" promotional/informational panel */}
      <Card className="bg-[#0f172a] text-white border-0 shadow-lg flex flex-col justify-between p-6 rounded-2xl relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            What you'll get
          </span>

          <h3 className="text-2xl font-bold tracking-tight leading-snug">
            A sharper view of your next move.
          </h3>

          <div className="space-y-5 pt-2">
            {/* Rate Outlook */}
            <div className="flex gap-4">
              <div className="flex-none p-2 h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Rate outlook</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Current price benchmark with near-term direction.
                </p>
              </div>
            </div>

            {/* Risk Signals */}
            <div className="flex gap-4">
              <div className="flex-none p-2 h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Risk signals</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Port, carrier, and schedule risks in one view.
                </p>
              </div>
            </div>

            {/* Actionable recommendation */}
            <div className="flex gap-4">
              <div className="flex-none p-2 h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Actionable recommendation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A practical route recommendation for your cargo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info box */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 leading-relaxed">
          Briefs use your selected lane, current network conditions, and the latest carrier advisories.
        </div>
      </Card>
    </div>
  );
}
