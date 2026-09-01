import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <LoadingSpinner label="Loading…" />
    </div>
  );
}
