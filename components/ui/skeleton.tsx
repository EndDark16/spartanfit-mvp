import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite]",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]",
        className,
      )}
    />
  );
}
