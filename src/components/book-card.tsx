import Link from "next/link";
import { CSSProperties, type ReactNode } from "react";
import { BookCover } from "@/components/book-cover";
import type { BookView } from "@/lib/story-view";
import { CheckIcon } from "@/components/ui/check";
import { AxeIcon } from "@/components/ui/axe";
import { HeartHandshakeIcon } from "@/components/ui/heart-handshake";
import { FishSymbolIcon } from "@/components/ui/fish-symbol";
import { BicepsFlexedIcon } from "@/components/ui/biceps-flexed";
import { HeartIcon } from "@/components/ui/heart";
import { SparklesIcon } from "@/components/ui/sparkles";
import { PlusIcon } from "@/components/ui/plus";

const COVER_STAR_ICONS: Record<string, ReactNode> = {
  Bravery: <AxeIcon size={14} />,
  Honesty: <HeartHandshakeIcon size={14} />,
  Patience: <FishSymbolIcon size={14} />,
  Kindness: <HeartIcon size={14} />,
  Persistence: <BicepsFlexedIcon size={14} />,
};

/**
 * Shared book card — BookCover plus the caption block below it, with the
 * page-level wrapper (Link for navigation, div for the keepsake picker).
 * Used on the dashboard shelf, the full shelf, and the keepsake picker.
 */

type SizeKey = "lg" | "md" | "sm";

const CAPTION: Record<SizeKey, { title: number; meta: number }> = {
  lg: { title: 15.5, meta: 12 },
  md: { title: 14, meta: 11.5 },
  sm: { title: 13.5, meta: 11 },
};

function Caption({ book, size }: { book: BookView; size: SizeKey }) {
  const c = CAPTION[size];
  return (
    <div>
      <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: c.title, color: "var(--twilight)", lineHeight: 1.15, marginBottom: 2 }}>{book.infoTitle}</div>
      <div style={{ fontSize: c.meta, color: "var(--ink-soft)", fontWeight: 600, display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ color: "var(--berry)", fontWeight: 800 }}>For {book.forKid}</span>
        <span style={{ opacity: 0.4 }}>·</span><span>{book.theme}</span>
        {book.when && <><span style={{ opacity: 0.4 }}>·</span><span>{book.when}</span></>}
      </div>
    </div>
  );
}

export function BookCard({
  book,
  size = "md",
  index,
  onClick,
  selected = false,
}: {
  book: BookView;
  size?: SizeKey;
  /** Grid position for the staggered entry animation (`--i` var, defaults to 0). */
  index?: number;
  /** Selectable-picker mode (keepsake): renders a div instead of a Link. */
  onClick?: () => void;
  selected?: boolean;
}) {
  const styleVars = index != null ? ({ "--i": index } as CSSProperties) : undefined;

  if (onClick) {
    return (
      <div onClick={onClick} className="kp-pick kp-stagger" style={{ ...styleVars, position: "relative" }}>
        <BookCover
          size={size}
          coverClassName="kp-pick-cov"
          accent={book.accent}
          selected={selected}
          label={book.label}
          title={book.title}
          script={book.script}
          theme={book.theme}
          footerRight={book.forKid}
          overlay={selected ? (
            <div className="kp-pick-check" style={{ position: "absolute", top: -10, right: -10, width: 34, height: 34, borderRadius: "50%", background: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 3 }}><CheckIcon size={16} /></div>
          ) : undefined}
        />
        <Caption book={book} size={size} />
      </div>
    );
  }

  return (
    <Link href={book.href} className="dash-book-card dash-book-card-anim" style={{ ...styleVars, textDecoration: "none", display: "block", position: "relative" }}>
      <BookCover size={size} animated accent={book.accent} coverUrl={book.coverUrl} badge={book.badge} label={book.label} title={book.title} script={book.script} theme={book.theme} star={COVER_STAR_ICONS[book.theme] ?? <SparklesIcon size={14} />} />
      <Caption book={book} size={size} />
    </Link>
  );
}

const NEW_TALE: Record<SizeKey, { plus: number; plusFont: number; plusMb: number; title: number; sub: number; mb: number; pad: string }> = {
  lg: { plus: 48, plusFont: 28, plusMb: 14, title: 18, sub: 12, mb: 12, pad: "0 16px" },
  md: { plus: 42, plusFont: 24, plusMb: 10, title: 16, sub: 11, mb: 10, pad: "0 12px" },
  sm: { plus: 38, plusFont: 22, plusMb: 10, title: 15, sub: 11, mb: 10, pad: "0 12px" },
};

/** Dashed "Craft a new tale" tile that sits at the end of a book grid. */
export function NewTaleCard({ href, size = "md", index }: { href: string; size?: SizeKey; index?: number }) {
  const s = NEW_TALE[size];
  const styleVars = index != null ? ({ "--i": index } as CSSProperties) : undefined;
  return (
    <Link
      href={href}
      className="dash-book-card dash-book-card-anim"
      style={{ ...styleVars, textDecoration: "none", display: "block", position: "relative" }}
    >
      <div className="dash-new-cover" style={{ aspectRatio: "5/6.4", borderRadius: "6px 12px 12px 6px", border: "2.5px dashed var(--paper-line)", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--twilight)", textAlign: "center", marginBottom: s.mb }}>
        <div className="dash-plus-anim" style={{ width: s.plus, height: s.plus, borderRadius: "50%", background: "var(--u-orange)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: s.plusMb }}><PlusIcon size={s.plusFont} /></div>
        <div style={{ fontFamily: "var(--font-young-serif), serif", fontSize: s.title }}>Craft a new tale</div>
        <div style={{ fontSize: s.sub, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4, padding: s.pad, lineHeight: 1.35 }}>Takes about 3 minutes. ~40 seconds to conjure.</div>
      </div>
    </Link>
  );
}
