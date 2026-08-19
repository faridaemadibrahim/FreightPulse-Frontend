import { getPorts } from "@/lib/api/ports";
import RouteBriefClient from "@/components/briefs/RouteBriefClient";

export default async function RouteBriefPage() {
  const ports = await getPorts().catch(() => []);

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          ✨ AI route intelligence
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Route Brief</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Turn live freight signals into a clear, decision-ready recommendation for your next shipment.
        </p>
      </div>

      <div className="pt-4">
        <RouteBriefClient ports={ports} />
      </div>
    </div>
  );
}
