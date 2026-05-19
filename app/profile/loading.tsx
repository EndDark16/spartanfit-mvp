import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[620px] w-full" />
      </div>
    </div>
  );
}
