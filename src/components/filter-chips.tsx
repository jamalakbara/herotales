"use client";

import type { ReactNode } from "react";
import { HeartIcon } from "@/components/ui/heart";

function renderLabel(f: string): ReactNode {
  if (f.includes("♡") || f.includes("♥")) {
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{f.replace("♡", "").replace("♥", "").trim()} <HeartIcon size={12} /></span>;
  }
  return f;
}

/**
 * Blueprint/favorite filter pill row (dashboard shelf header, shelf toolbar).
 * Renders the shared .dash-fc / .dash-fc-active classes; selection = orange
 * fill per the design system.
 */
export function FilterChips({
  options,
  active,
  onSelect,
  size = "md",
  className,
}: {
  options: readonly string[];
  active: string;
  onSelect: (filter: string) => void;
  size?: "md" | "sm";
  className?: string;
}) {
  const md = size === "md";
  return (
    <div className={className} style={{ display: "flex", gap: md ? 8 : 6, flexWrap: "wrap", alignItems: "center" }}>
      {options.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`dash-fc${active === f ? " dash-fc-active" : ""}`}
          style={{ padding: md ? "8px 14px" : "7px 14px", background: "var(--cream-deep)", border: "none", borderRadius: 999, fontWeight: 700, fontSize: 13, color: "var(--twilight)", cursor: "pointer" }}
        >
          {renderLabel(f)}
        </button>
      ))}
    </div>
  );
}
