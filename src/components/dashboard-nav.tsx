"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <header style={{ position: "relative", zIndex: 2 }}>
      <nav className="dash-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 48px", maxWidth: 1400, margin: "0 auto" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-caprasimo), serif", fontSize: 26, color: "var(--twilight)", textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, background: "var(--twilight)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 3px 0 var(--moon)" }}>
            <div style={{ width: 22, height: 22, background: "var(--moon)", borderRadius: "50%", boxShadow: "inset -6px -2px 0 var(--twilight)" }} />
          </div>
          TellTales
        </Link>
        <div className="dash-nav-links" style={{ display: "flex", gap: 28, fontWeight: 700, fontSize: 14 }}>
          {[
            { href: "/dashboard", label: "Home" },
            { href: "/shelf", label: "Shelf" },
            { href: "/stories/new", label: "New story" },
            { href: "/keepsake-books", label: "Keepsake books" },
            { href: "#", label: "Settings" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className={`dash-nav-link ${isActive(href) ? "dash-nav-link-active" : ""}`}>{label}</Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/stories/new" className="dash-btn" style={{ padding: "10px 18px", fontSize: 13.5 }}>+ New story</Link>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--berry)", color: "var(--cream)", border: "2px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 16, cursor: "pointer" }}>
            R
          </div>
        </div>
      </nav>
    </header>
  );
}
