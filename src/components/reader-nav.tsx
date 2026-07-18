import { Fragment, type ReactNode } from "react";
import Link from "next/link";

export type Crumb = { label: string; href?: string };

/**
 * Minimal top nav for the story reader / creation flows: logo (→ dashboard),
 * a breadcrumb trail, and an optional right-hand action slot. Distinct from
 * `DashboardNav` (the full app nav on dashboard/shelf/keepsake/heroes).
 */
export function ReaderNav({ crumbs, action }: { crumbs: Crumb[]; action?: ReactNode }) {
  return (
    <header>
      <nav className="nav">
        <Link href="/dashboard" className="logo">
          <div className="logo-mark" />
          TellTales
        </Link>
        <div className="nav-crumbs">
          {crumbs.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="sep">/</span>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="cur">{c.label}</span>}
            </Fragment>
          ))}
        </div>
        {action ?? <span />}
      </nav>
    </header>
  );
}
