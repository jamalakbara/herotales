export function Nav() {
  return (
    <header>
      <nav className="nav">
        <div className="logo">
          <div className="logo-mark" />
          TellTales
        </div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#blueprints">Lessons</a>
          <a href="#pricing">Pricing</a>
          <a href="/dashboard">Sign in</a>
        </div>
        <a href="/stories/new" className="btn">Start free tale</a>
      </nav>
    </header>
  );
}
