"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@/components/ui/arrow-right";

type Status = "idle" | "loading" | "done" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="cs-note" role="status">
        You&apos;re on the list — we&apos;ll email you the moment tuck-in time gets its upgrade.
      </p>
    );
  }

  return (
    <form className="cs-form" onSubmit={onSubmit} noValidate>
      <input
        type="email"
        required
        className="txt-input cs-input"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        aria-label="Email address"
        autoComplete="email"
      />
      <button
        type="submit"
        className="btn btn-berry btn-lg cs-submit"
        disabled={status === "loading"}
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        {status === "loading" ? "Adding…" : (
          <>
            Notify me <ArrowRightIcon size={16} />
          </>
        )}
      </button>
      {status === "error" && (
        <p className="cs-note cs-note-error" role="alert">
          Please enter a valid email and try again.
        </p>
      )}
    </form>
  );
}
