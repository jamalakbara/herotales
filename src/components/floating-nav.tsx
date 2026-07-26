"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";

export type Crumb = { label: string; href?: string };

type FloatingNavProps =
  | { variant: "marketing" }
  | { variant: "app" }
  | { variant: "reader"; crumbs: Crumb[]; action?: ReactNode }
  | { variant: "auth" };

const MARKETING_SECTIONS = [
  { id: "how", label: "How it works" },
  { id: "stories", label: "Story lessons" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

const APP_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/shelf", label: "Shelf" },
  { href: "/keepsake-books", label: "Keepsake books" },
];

/** Shared logo mark used across every nav variant (DRY). */
function SiteLogo({ href }: { href: string }) {
  return (
    <Link href={href} className="logo fnav-logo">
      <div className="logo-mark" />
      TellTales
    </Link>
  );
}

/**
 * One floating pill nav for the whole app. Replaces the old Nav / DashboardNav /
 * ReaderNav. Fixed + centered, condenses to logo+CTA at the top of the page and
 * expands its links once you scroll past the hero (umano's pill-nav behaviour).
 */
export function FloatingNav(props: FloatingNavProps) {
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 60));

  return (
    <header className="fnav-shell">
      <nav className={`fnav-pill ${condensed ? "fnav-condensed" : ""}`}>
        {props.variant === "marketing" && <MarketingInner />}
        {props.variant === "app" && <AppInner />}
        {props.variant === "reader" && (
          <ReaderInner crumbs={props.crumbs} action={props.action} />
        )}
        {props.variant === "auth" && <AuthInner />}
      </nav>
    </header>
  );
}

function MarketingInner() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const ids = MARKETING_SECTIONS.map((s) => s.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <SiteLogo href="/" />
      <div className="fnav-links fnav-collapse">
        {MARKETING_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`fnav-link ${active === s.id ? "fnav-link-active" : ""}`}
          >
            {s.label}
          </a>
        ))}
      </div>
      <Link href="/stories/new" className="btn btn-berry fnav-cta">
        Start free tale
      </Link>
    </>
  );
}

function AppInner() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <SiteLogo href="/dashboard" />
      <div className="fnav-links fnav-swap">
        {APP_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`fnav-link ${isActive(href) ? "fnav-link-active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="fnav-right">
        <Link href="/stories/new" className="btn btn-berry fnav-cta">
          + New story
        </Link>
        <UserMenu />
      </div>
    </>
  );
}

function ReaderInner({ crumbs, action }: { crumbs: Crumb[]; action?: ReactNode }) {
  return (
    <>
      <SiteLogo href="/dashboard" />
      <div className="nav-crumbs fnav-crumbs">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span className="cur">{c.label}</span>
            )}
          </Fragment>
        ))}
      </div>
      <div className="fnav-right">{action ?? <span />}</div>
    </>
  );
}

/**
 * Mobile-only back link that stands in for the crumb trail (hidden ≤720px).
 * Render at the top of a reader page's content, above the title — pass the same
 * `crumbs` given to <FloatingNav variant="reader">. Targets the last linked crumb.
 */
export function ReaderBack({ crumbs }: { crumbs: Crumb[] }) {
  const back = [...crumbs].reverse().find((c) => c.href);
  if (!back?.href) return null;
  return (
    <Link href={back.href} className="reader-back">
      ← {back.label}
    </Link>
  );
}

function AuthInner() {
  return (
    <>
      <SiteLogo href="/" />
      <div className="fnav-right" style={{ marginLeft: "auto" }}>
        <Link href="/" className="btn btn-ghost fnav-cta">
          ← Back home
        </Link>
      </div>
    </>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  const initial = (email ?? "?").trim().slice(0, 1).toUpperCase();

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="fnav-avatar"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" className="fnav-menu">
          <div className="fnav-menu-label">Signed in as</div>
          <div className="fnav-menu-email">{email ?? "—"}</div>
          {/* Pill links hide ≤720px — the menu carries navigation on mobile. */}
          <div className="fnav-menu-links">
            {APP_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="fnav-link" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="fnav-menu-signout"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
