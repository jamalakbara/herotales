"use client";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";

/**
 * Single-shot authenticated JSON fetch with cancellation — the common
 * "load page data once" effect (dashboard, keepsake picker). For anything
 * fancier (parallel fetches, param-driven refetch, fire-and-forget) write
 * the effect by hand; don't grow options onto this hook.
 */
export function useFetchJson<T>(url: string, errorLabel: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${errorLabel} (${r.status})`);
        return (await r.json()) as T;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getErrorMessage(e, errorLabel));
      });
    return () => {
      cancelled = true;
    };
  }, [url, errorLabel]);

  return { data, error, loading: !data && !error };
}
