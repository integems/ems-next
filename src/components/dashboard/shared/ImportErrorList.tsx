interface ImportErrorListProps {
  /**
   * The form's error object. Numeric keys are treated as row indices (from an
   * Excel import or spreadsheet edit) and summarised; other keys are ignored.
   */
  errors: Record<string, unknown>;
}

/**
 * Summarises row-level import errors (keyed by row index) as a red list.
 * Renders nothing when there are no row errors.
 */
export function ImportErrorList({ errors }: ImportErrorListProps) {
  const rowKeys = Object.keys(errors).filter((k) => !isNaN(Number(k)));
  if (rowKeys.length === 0) return null;

  return (
    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/30">
      <p className="mb-1 font-medium text-red-600">
        Some rows have errors and were skipped:
      </p>
      <ul className="list-disc space-y-0.5 pl-5 text-red-600">
        {rowKeys.map((k) => (
          <li key={k}>
            Row {Number(k) + 1}:{" "}
            {Object.values(errors[k] as Record<string, string[]>)
              .flat()
              .join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
