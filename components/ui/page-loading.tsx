import { cn } from "@/lib/utils/cn";
import { Sparkles } from "lucide-react";
import { Skeleton } from "./skeleton";

interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageLoading({
  title = "Cargando experiencia",
  subtitle = "Estamos preparando tu panel...",
  className,
}: PageLoadingProps) {
  return (
    <div className={cn("min-h-screen bg-page-gradient p-4", className)}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-spartan/30 bg-spartan/10 px-3 py-1 text-xs font-semibold text-spartan-light">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            SpartanFit cargando
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/3 animate-[loading-slide_1.4s_ease-in-out_infinite] rounded-full bg-spartan" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[46vh]" />
      </div>
    </div>
  );
}
