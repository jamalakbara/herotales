import Link from "next/link";

export function Footer() {
  return (
    <footer className="u-footer">
      <div className="u-footer-grid">
        <div className="u-footer-brand">
          <div className="logo" style={{ color: "var(--cream)" }}>
            <div className="logo-mark" />
            TellTales
          </div>
          <div className="u-footer-brand-tag">
            Bedtime stories where
            <br />
            your child is the hero.
          </div>
        </div>

        <div className="u-footer-links">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div className="u-footer-col-h">Product</div>
              <a className="u-footer-link" href="#how">How it works</a>
              <a className="u-footer-link" href="#stories">Story lessons</a>
              <a className="u-footer-link" href="#pricing">Pricing</a>
              <a className="u-footer-link" href="#faq">FAQ</a>
            </div>
            <div>
              <div className="u-footer-col-h">Company</div>
              <Link className="u-footer-link" href="/dashboard">Sign in</Link>
              <a className="u-footer-link" href="#">Privacy (COPPA)</a>
              <a className="u-footer-link" href="#">Terms</a>
              <a className="u-footer-link" href="#">Contact</a>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 40,
              paddingTop: 20,
              borderTop: "1.5px dashed var(--paper-line)",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 700 }}>
              © 2026 TellTales. Sweet dreams guaranteed.
            </div>
            <Link href="/stories/new" className="btn btn-twilight">
              Start free tale →
            </Link>
          </div>
        </div>
      </div>

      <div className="u-footer-watermark">hello@telltales.studio</div>
    </footer>
  );
}
