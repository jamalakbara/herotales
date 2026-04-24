export function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="dot" />
          Bedtime, reinvented
        </span>
        <h1 className="hero-title">
          Tonight, your little one is the{" "}
          <span className="highlight">hero</span>{" "}
          <span className="sparkle">✦</span> of their own storybook.
        </h1>
        <p className="hero-sub">
          TellTales spins a fresh 5-chapter adventure around your child — their
          name, their face, their bravery — and narrates it in a warm voice
          that makes bedtime feel like magic.
        </p>
        <div className="hero-ctas">
          <a href="/stories/new" className="btn btn-lg btn-berry">
            Make tonight&apos;s story →
          </a>
          <a href="#" className="btn btn-lg btn-ghost">
            Listen to a sample
          </a>
        </div>
        <div className="hero-proof">
          <div className="avatars">
            <div>A</div>
            <div>M</div>
            <div>K</div>
            <div>+</div>
          </div>
          <div>
            <div>
              <span className="stars">★★★★★</span> 4.9 from 2,400+ families
            </div>
          </div>
        </div>
      </div>

      <div className="storybook-stage" aria-hidden="true">
        <div className="float decor-1 star-decor" />
        <div className="float decor-2 moon-decor" />
        <div className="float decor-3 cloud-decor" />
        <div
          className="float decor-4 star-decor"
          style={{ background: "var(--berry)", width: 26, height: 26 }}
        />
        <div
          className="float decor-5 star-decor"
          style={{ background: "var(--sage)" }}
        />

        <div className="book book-1">
          <div>
            <div className="book-label">Chapter one</div>
            <div className="book-title">
              Maya and the <span className="script-inline">Brave Lantern</span>
            </div>
          </div>
          <div className="book-meta">
            <span>Bravery · Ages 4-6</span>
            <div className="book-star">★</div>
          </div>
        </div>
        <div className="book book-2">
          <div>
            <div className="book-label">Tonight&apos;s tale</div>
            <div className="book-title">
              Leo &amp; the <span className="script-inline">Patient Seed</span>
            </div>
          </div>
          <div className="book-meta">
            <span>Patience · 12 min read</span>
            <div className="book-star">☾</div>
          </div>
        </div>
        <div className="book book-3">
          <div>
            <div className="book-label">New adventure</div>
            <div className="book-title">
              Noor &amp; the <span className="script-inline">Honest Fox</span>
            </div>
          </div>
          <div className="book-meta">
            <span>Honesty · 5 chapters</span>
            <div className="book-star">✦</div>
          </div>
        </div>
      </div>
    </section>
  );
}
