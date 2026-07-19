"use client";
import type { ReactNode } from "react";

export type PlanCta = { label: string; variant?: "berry" } & (
  | { href: string }
  | { disabled: true; title?: string }
);

export type PlanCardProps = {
  name: string;
  price: string;
  /** Includes the leading separator, e.g. " / month", " / book". */
  per: string;
  tag: string;
  /** Strings or JSX for emphasis, e.g. <strong>20% off</strong>. */
  feats: ReactNode[];
  badge?: string;
  featured?: boolean;
  /** Click-to-feature: makes the whole card selectable. */
  onSelect?: () => void;
  cta: PlanCta;
};

export function PlanCard({ name, price, per, tag, feats, badge, featured, onSelect, cta }: PlanCardProps) {
  const cardClass = ["plan", featured && "featured", onSelect && "plan-selectable"]
    .filter(Boolean)
    .join(" ");
  const ctaClass = cta.variant === "berry" ? "btn btn-berry plan-cta" : "btn plan-cta";

  return (
    <div className={cardClass} onClick={onSelect}>
      {badge && <div className="plan-badge">{badge}</div>}
      <div className="plan-name">{name}</div>
      <div className="plan-price">
        {price}
        <span className="per">{per}</span>
      </div>
      <div className="plan-tag">{tag}</div>
      <ul className="plan-feats">
        {feats.map((feat, i) => (
          <li key={i} className="plan-feat">
            {feat}
          </li>
        ))}
      </ul>
      {"href" in cta ? (
        <a href={cta.href} className={ctaClass}>
          {cta.label}
        </a>
      ) : (
        <button
          disabled
          title={cta.title}
          className={ctaClass}
          onClick={(e) => e.stopPropagation()}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
