/** Extract a human-readable message from an unknown error. Client-safe. */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
