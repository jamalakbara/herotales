const BLUEPRINTS = [
  {
    icon: "★",
    name: "Bravery",
    desc: "Facing what goes bump in the dark — and the classroom.",
    num: "Blueprint 01",
  },
  {
    icon: "✓",
    name: "Honesty",
    desc: "Owning the broken vase, the fib, the feeling.",
    num: "Blueprint 02",
  },
  {
    icon: "⟲",
    name: "Patience",
    desc: "Waiting, watching, letting good things grow slowly.",
    num: "Blueprint 03",
  },
  {
    icon: "♡",
    name: "Kindness",
    desc: "Seeing the lonely friend, helping the smaller one.",
    num: "Blueprint 04",
  },
  {
    icon: "↑",
    name: "Persistence",
    desc: "Try, tumble, try again — the long beautiful way.",
    num: "Blueprint 05",
  },
];

export function Blueprints() {
  return (
    <section id="blueprints">
      <div className="blueprints">
        <span className="section-kicker">Value blueprints</span>
        <h2 className="section-title">
          Five little lessons, woven into every adventure.
        </h2>
        <p className="section-sub">
          Pick the lesson of the day. We turn it into a story that sticks —
          because your child lived it as the main character.
        </p>

        <div className="blueprint-grid">
          {BLUEPRINTS.map((bp) => (
            <div key={bp.name} className="bp-card">
              <div>
                <div className="bp-icon">{bp.icon}</div>
                <div className="bp-name">{bp.name}</div>
                <div className="bp-desc">{bp.desc}</div>
              </div>
              <div className="bp-num">{bp.num}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
