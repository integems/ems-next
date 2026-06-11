import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { HTMLAttributes } from "react";

export type AIThinkingProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

/**
 * An "AI is thinking" indicator: a pulsing assistant glyph next to a typing
 * bubble with three bouncing dots. Shown while a response is being prepared
 * (request submitted / tools running) before tokens start streaming in.
 */
export const AIThinking = ({ className, label, ...props }: AIThinkingProps) => (
  <div
    className={cn("flex items-center gap-2 py-4", className)}
    aria-live="polite"
    {...props}
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
    </div>
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
      <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
      <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
      <span className="size-2 rounded-full bg-primary/60 animate-bounce" />
      {label ? (
        <span className="ml-1 text-xs text-muted-foreground">{label}</span>
      ) : null}
    </div>
  </div>
);
