"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { BookTextIcon } from "@/components/ui/book-text";
import { HomeIcon } from "@/components/ui/home";
import { MenuIcon } from "@/components/ui/menu";
import { PlusIcon } from "@/components/ui/plus";
import { SquareStackIcon } from "@/components/ui/square-stack";

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
        <Link href="/stories/new" className="btn btn-berry fnav-cta" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <PlusIcon size={14} /> New story
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
    <Link href={back.href} className="reader-back" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <ArrowLeftIcon size={16} /> {back.label}
    </Link>
  );
}

function AuthInner() {
  return (
    <>
      <SiteLogo href="/" />
      <div className="fnav-right" style={{ marginLeft: "auto" }}>
        <Link href="/" className="btn btn-ghost fnav-cta" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeftIcon size={16} /> Back home
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
  const name = user?.fullName ?? user?.firstName ?? null;
  const imageUrl = user?.imageUrl ?? null;
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
        aria-label="Open menu"
        className="fnav-avatar"
      >
        <MenuIcon size={18} />
      </button>
      {open && (
        <div role="menu" className="fnav-menu">
          {/* Profile header */}
          <div className="fnav-menu-profile">
            <div className="fnav-menu-avatar-lg">
              {imageUrl ? (
                <Image src={imageUrl} alt={name ?? email ?? "Profile"} width={44} height={44} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              ) : (
                initial
              )}
            </div>
            <div className="fnav-menu-identity">
              {name && <div className="fnav-menu-name">{name}</div>}
              <div className="fnav-menu-email">{email ?? "—"}</div>
            </div>
          </div>
          {/* Pill links hide ≤720px — the menu carries navigation on mobile. */}
          <div className="fnav-menu-links">
            <Link href="/dashboard" className="fnav-menu-nav-link" onClick={() => setOpen(false)}>
              <HomeIcon size={15} /> Home
            </Link>
            <Link href="/shelf" className="fnav-menu-nav-link" onClick={() => setOpen(false)}>
              <BookTextIcon size={15} /> Shelf
            </Link>
            <Link href="/keepsake-books" className="fnav-menu-nav-link" onClick={() => setOpen(false)}>
              <SquareStackIcon size={15} /> Keepsake books
            </Link>
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
