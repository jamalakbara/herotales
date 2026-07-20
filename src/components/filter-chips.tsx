"use client";

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
}: {
  options: readonly string[];
  active: string;
  onSelect: (filter: string) => void;
  size?: "md" | "sm";
}) {
  const md = size === "md";
  return (
    <div style={{ display: "flex", gap: md ? 8 : 6, flexWrap: "wrap", alignItems: "center" }}>
      {options.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`dash-fc${active === f ? " dash-fc-active" : ""}`}
          style={{ padding: md ? "8px 14px" : "7px 14px", background: "var(--cream-deep)", border: "none", borderRadius: 999, fontWeight: 700, fontSize: md ? 13 : 12.5, color: "var(--twilight)", cursor: "pointer" }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
