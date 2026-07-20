"use client";
import { CSSProperties, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/errors";

export function DeleteMyDataLink({ style }: { style?: CSSProperties }) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (busy) return;
    const ok = window.confirm(
      "Delete all your data? This permanently removes every child profile, story, and image, and signs you out. This cannot be undone.",
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await signOut();
      router.push("/");
    } catch (err) {
      window.alert(getErrorMessage(err, "Delete failed. Please try again."));
      setBusy(false);
    }
  }

  return (
    <a
      href="#"
      onClick={handleDelete}
      aria-busy={busy}
      style={{ marginLeft: 20, color: "inherit", textDecoration: "none", opacity: busy ? 0.5 : 1, pointerEvents: busy ? "none" : "auto", ...style }}
    >
      {busy ? "Deleting…" : "Delete all my data"}
    </a>
  );
}
