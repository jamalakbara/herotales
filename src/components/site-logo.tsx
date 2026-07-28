import Link from "next/link";

/** Shared logo mark used across every nav variant and the coming-soon splash (DRY). */
export function SiteLogo({ href }: { href: string }) {
  return (
    <Link href={href} className="logo fnav-logo">
      <div className="logo-mark" />
      TellTales
    </Link>
  );
}
