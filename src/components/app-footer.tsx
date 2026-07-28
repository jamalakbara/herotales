import Link from "next/link";
import { DeleteMyDataLink } from "./delete-data-link";

/**
 * Shared footer for authenticated app pages. "wide" spans the 1400px page
 * grid (dashboard/shelf/keepsake); "mini" is the compact reader/form variant.
 */
export function AppFooter({ variant = "wide" }: { variant?: "wide" | "mini" }) {
  if (variant === "mini") {
    return (
      <div className="foot-mini">
        <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
        <div>
          <Link href="#">Privacy (COPPA)</Link>
          <DeleteMyDataLink style={{ marginLeft: 0 }} />
          <Link href="#">Help</Link>
        </div>
      </div>
    );
  }

  return (
    <footer className="app-foot">
      <div>© 2026 TellTales · Sweet dreams guaranteed.</div>
      <div>
        <Link href="#">Privacy (COPPA)</Link>
        <DeleteMyDataLink style={{ marginLeft: 20 }} />
        <Link href="#">Help</Link>
      </div>
    </footer>
  );
}
