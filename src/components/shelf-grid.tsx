import type { ReactNode } from "react";

/**
 * Ink plank + cream book tray (the "shelf"). Surface styling lives in the
 * .shelf-plank / .shelf-grid classes in globals.css; `size="lg"` adds the
 * -lg modifiers (4-col dashboard shelf) plus .dash-shelf-grid so the
 * dashboard's narrow-breakpoint rules keep applying.
 */
export function ShelfPlankGrid({
  size = "md",
  plankClassName,
  className,
  children,
}: {
  size?: "lg" | "md";
  plankClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  const lg = size === "lg";
  const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
  return (
    <>
      <div className={cx("shelf-plank", lg && "shelf-plank-lg", plankClassName)} />
      <div className={cx("shelf-grid", lg && "shelf-grid-lg dash-shelf-grid", className)}>
        {children}
      </div>
    </>
  );
}
