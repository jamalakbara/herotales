export function Pricing() {
  return (
    <section id="pricing">
      <span className="section-kicker">Pick your shelf</span>
      <h2 className="section-title">Simple pricing. Unlimited bedtimes.</h2>
      <p className="section-sub">
        Cancel whenever. The stories you&apos;ve made are always yours to keep.
      </p>

      <div className="pricing-grid">
        <div className="plan">
          <div className="plan-name">Firefly</div>
          <div className="plan-price">
            Free<span className="per"> / forever</span>
          </div>
          <div className="plan-tag">For trying us out tonight.</div>
          <ul className="plan-feats">
            <li className="plan-feat">1 story per month</li>
            <li className="plan-feat">All 5 value blueprints</li>
            <li className="plan-feat">Read-along illustrations</li>
            <li className="plan-feat">Save up to 3 favorites</li>
          </ul>
          <a href="#" className="btn plan-cta">Start free</a>
        </div>

        <div className="plan featured">
          <div className="plan-badge">Most loved</div>
          <div className="plan-name">Lantern</div>
          <div className="plan-price">
            $9<span className="per"> / month</span>
          </div>
          <div className="plan-tag">The nightly bedtime habit.</div>
          <ul className="plan-feats">
            <li className="plan-feat">Unlimited stories</li>
            <li className="plan-feat">Warm-voice audio narration</li>
            <li className="plan-feat">Up to 3 child heroes</li>
            <li className="plan-feat">Unlimited saved favorites</li>
            <li className="plan-feat">20% off printed keepsake books</li>
          </ul>
          <a href="#" className="btn btn-berry plan-cta">
            Start 7 days free
          </a>
        </div>

        <div className="plan">
          <div className="plan-name">Constellation</div>
          <div className="plan-price">
            $18<span className="per"> / month</span>
          </div>
          <div className="plan-tag">
            For bigger families &amp; grandparents.
          </div>
          <ul className="plan-feats">
            <li className="plan-feat">Everything in Lantern</li>
            <li className="plan-feat">Up to 8 child heroes</li>
            <li className="plan-feat">Voice cloning for family narrators</li>
            <li className="plan-feat">1 free keepsake book / month</li>
            <li className="plan-feat">Priority story generation</li>
          </ul>
          <a href="#" className="btn plan-cta">Choose Constellation</a>
        </div>
      </div>
    </section>
  );
}
