export function Quote() {
  return (
    <section className="quote-section">
      <div className="quote-mark">&ldquo;</div>
      <div style={{ position: "relative" }}>
        <div className="quote-body">
          Bedtime used to be a battle. Now my daughter sprints upstairs because{" "}
          <em>she</em> wants to know what happens to <em>her</em> in the next
          chapter.
        </div>
        <div
          className="quote-meta-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div className="quote-author">
            <div className="quote-avatar">R</div>
            <div>
              <div className="quote-name">Ramona S.</div>
              <div className="quote-role">
                Mom to Ada, age 5 · TellTales member since March
              </div>
            </div>
          </div>
          <div className="quote-stats" style={{ display: "flex", gap: 28 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-young-serif), serif",
                  fontSize: 36,
                  lineHeight: 1,
                  color: "var(--moon)",
                }}
              >
                4.9
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                  marginTop: 4,
                }}
              >
                App Store
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(251,243,227,0.3)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-young-serif), serif",
                  fontSize: 36,
                  lineHeight: 1,
                  color: "var(--moon)",
                }}
              >
                2,400+
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                  marginTop: 4,
                }}
              >
                Happy families
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(251,243,227,0.3)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-young-serif), serif",
                  fontSize: 36,
                  lineHeight: 1,
                  color: "var(--moon)",
                }}
              >
                62k
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                  marginTop: 4,
                }}
              >
                Stories told
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
