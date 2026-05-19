import { cn } from "@/lib/utils/cn";

export function ChatTypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-zinc-400", className)} aria-live="polite">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-spartan [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-spartan [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-spartan" />
      </div>
      SpartanFit IA está pensando...
    </div>
  );
}
