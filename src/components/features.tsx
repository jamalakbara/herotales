export function Features() {
  return (
    <section>
      <span className="section-kicker">What&apos;s inside the covers</span>
      <h2 className="section-title">
        More than a story generator. A keepsake machine.
      </h2>

      <div className="features">
        <div className="feature">
          <div className="feat-emoji">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1C1540"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l2.4 6.6L21 9l-5 4.8 1.4 7.2L12 17.8 6.6 21 8 13.8 3 9l6.6-.4z" />
            </svg>
          </div>
          <div className="feat-title">
            One child.
            <br />
            One consistent face.
          </div>
          <div className="feat-desc">
            Our character-consistency magic means your little hero looks like
            themselves across every illustration — the same freckles, the same
            brave little chin.
          </div>
        </div>
        <div className="feature">
          <div className="feat-emoji">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1C1540"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 18V8a2 2 0 012-2h4l2-2h2l2 2h4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <div className="feat-title">
            Warm voice.
            <br />
            Soft eyelids.
          </div>
          <div className="feat-desc">
            Every story comes with a storyteller&apos;s narration — warm,
            unhurried, and tuned to send wiggly little listeners gently off to
            sleep.
          </div>
        </div>
        <div className="feature">
          <div className="feat-emoji">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FBF3E3"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="3" width="16" height="18" rx="1.5" />
              <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
          </div>
          <div className="feat-title">
            A real
            <br />
            hardcover book.
          </div>
          <div className="feat-desc">
            Turn any favorite tale into a linen-spined, glossy-page keepsake.
            Printed on demand, shipped to your door — and kept forever.
          </div>
        </div>
      </div>
    </section>
  );
}
