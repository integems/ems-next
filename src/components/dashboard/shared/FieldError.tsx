import { cn } from "@/lib/utils";

interface FieldErrorProps {
  /** A zod field error (string or string[]) or any falsy value. */
  error?: unknown;
  className?: string;
}

/**
 * Renders a single field validation message, normalising the
 * `string | string[] | undefined` shapes the forms store. Renders nothing when
 * there is no error.
 */
export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;
  const message = Array.isArray(error) ? error[0] : String(error);
  if (!message) return null;
  return <p className={cn("text-xs text-red-500", className)}>{message}</p>;
}
