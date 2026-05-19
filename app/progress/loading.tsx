import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[65vh] w-full" />
      </div>
    </div>
  );
}
