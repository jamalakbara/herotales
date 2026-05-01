"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/(auth)/actions";

function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ width: "100%", padding: "9px 14px", border: "1.5px solid var(--ink)", borderRadius: 999, background: "var(--moon)", color: "var(--ink)", fontWeight: 800, fontSize: 13, cursor: pending ? "wait" : "pointer", boxShadow: "2px 2px 0 var(--ink)" }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function DashboardNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setEmail(session?.user?.email ?? null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const initial = (email ?? "?").trim().slice(0, 1).toUpperCase();

  return (
    <header style={{ position: "relative", zIndex: 100 }}>
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
          ].map(({ href, label }) => (
            <Link key={href} href={href} className={`dash-nav-link ${isActive(href) ? "dash-nav-link-active" : ""}`}>{label}</Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/stories/new" className="dash-btn" style={{ padding: "10px 18px", fontSize: 13.5 }}>+ New story</Link>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--berry)", color: "var(--cream)", border: "2px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-caprasimo), serif", fontSize: 16, cursor: "pointer", padding: 0 }}
            >
              {initial}
            </button>
            {open && (
              <div role="menu" style={{ position: "absolute", top: 48, right: 0, minWidth: 220, background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 14, boxShadow: "5px 5px 0 var(--ink)", padding: 12, zIndex: 50 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 4 }}>Signed in as</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--twilight)", marginBottom: 12, wordBreak: "break-all" }}>{email ?? "—"}</div>
                <form action={signOut}>
                  <SignOutButton />
                </form>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
