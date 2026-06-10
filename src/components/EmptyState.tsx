import { Inbox, Filter, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "no-data" | "no-filter";

const VARIANTS: Record<
  EmptyStateVariant,
  { icon: LucideIcon; message: string }
> = {
  "no-data": {
    icon: Inbox,
    message: "No records available.",
  },
  "no-filter": {
    icon: Filter,
    message: "Select and apply a filter to view records.",
  },
};

interface EmptyStateProps {
  /** Chooses the default icon and message. */
  variant?: EmptyStateVariant;
  /** Overrides the default message for the chosen variant. */
  message?: string;
  className?: string;
}

/**
 * Centered empty-state placeholder with a large, faded icon and a muted message.
 * Use `variant="no-filter"` before a filter is applied and `variant="no-data"`
 * when a filter is applied but no records match.
 */
export function EmptyState({
  variant = "no-data",
  message,
  className,
}: EmptyStateProps) {
  const { icon: Icon, message: defaultMessage } = VARIANTS[variant];

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 py-12 text-center text-muted-foreground",
        className,
      )}
    >
      <Icon
        strokeWidth={1.25}
        // ~10% of the screen width, faded to match the muted message color.
        className="h-[10vw] w-[10vw] min-h-12 min-w-12 opacity-40"
        aria-hidden="true"
      />
      <p className="text-sm">{message ?? defaultMessage}</p>
    </div>
  );
}
