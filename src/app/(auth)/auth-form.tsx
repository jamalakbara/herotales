"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { FloatingNav } from "@/components/floating-nav";
import { AmbientDecor } from "@/components/motion/AmbientDecor";
import { Reveal } from "@/components/motion/Reveal";
import { getErrorMessage } from "@/lib/errors";
import styles from "./auth-form.module.css";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { SparklesIcon } from "@/components/ui/sparkles";
import { LockIcon } from "@/components/ui/lock";
import { CheckIcon } from "@/components/ui/check";
import { IdCardIcon } from "@/components/ui/id-card";
import { AtSignIcon } from "@/components/ui/at-sign";
import { EyeIcon } from "@/components/ui/eye";
import { EyeOffIcon } from "@/components/ui/eye-off";

type Mode = "sign-in" | "sign-up";

function clerkError(e: unknown): string {
  if (e && typeof e === "object" && "errors" in e) {
    const errs = (e as { errors?: Array<{ message?: string; longMessage?: string }> }).errors;
    if (errs && errs[0]) return errs[0].longMessage || errs[0].message || "Something went wrong.";
  }
  return getErrorMessage(e, "Something went wrong.");
}

export function AuthForm({
  initialMode,
  next,
}: {
  initialMode: Mode;
  next: string;
}) {
  const { isLoaded: siLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: suLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [oauthPending, setOauthPending] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [rememberChecked, setRememberChecked] = useState(true);

  const isSignUp = mode === "sign-up";

  const signinBtnRef = useRef<HTMLButtonElement>(null);
  const signupBtnRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 4, width: 0 });

  useEffect(() => {
    function position() {
      const active = mode === "sign-up" ? signupBtnRef.current : signinBtnRef.current;
      if (!active || !active.parentElement) return;
      const p = active.parentElement.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      setPillStyle({ left: a.left - p.left, width: a.width });
    }
    requestAnimationFrame(() => requestAnimationFrame(position));
    window.addEventListener("resize", position);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(position);
    }
    return () => window.removeEventListener("resize", position);
  }, [mode]);

  const pwScore = useMemo(() => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
    return s;
  }, [pw]);

  const pwColors = ["var(--berry)", "var(--moon)", "var(--moon)", "var(--sage)"];
  const pwLabels = ["Soft", "Cozy", "Strong", "Brave"];

  async function handleGoogle() {
    setError(null);
    if (!siLoaded || !signIn) return;
    setOauthPending(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: next,
      });
    } catch (e) {
      setError(clerkError(e));
      setOauthPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "").trim();

    if (isSignUp) {
      if (!suLoaded || !signUp) return;
      setPending(true);
      try {
        await signUp.create({ emailAddress: email, password, ...(name ? { firstName: name } : {}) });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      } catch (err) {
        setError(clerkError(err));
      } finally {
        setPending(false);
      }
    } else {
      if (!siLoaded || !signIn) return;
      setPending(true);
      try {
        const res = await signIn.create({ identifier: email, password });
        if (res.status === "complete") {
          // Let Clerk own the post-auth navigation: it waits for the session
          // cookie to commit before redirecting. A manual router.push races the
          // cookie write — on mobile the server middleware runs before the
          // cookie lands, bounces back to /sign-in, and the next attempt throws
          // "You're already signed in".
          await setSignInActive({ session: res.createdSessionId, redirectUrl: next });
        } else {
          setError("Additional verification is required to sign in.");
        }
      } catch (err) {
        setError(clerkError(err));
      } finally {
        setPending(false);
      }
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!suLoaded || !signUp) return;
    setPending(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete") {
        // Same cookie-commit race as sign-in: let Clerk handle the redirect.
        await setSignUpActive({ session: res.createdSessionId, redirectUrl: next });
      } else {
        setError("That code didn't work. Try again.");
      }
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <FloatingNav variant="auth" />

      <main>
        <div className={styles.authWrap}>
          <Reveal>
          <section className={styles.formCard} aria-labelledby="form-title">
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              {isSignUp ? "Begin your shelf" : "Welcome back"}
            </span>

            <h1 className={styles.formTitle} id="form-title">
              {isSignUp ? (
                <>Make their bedtime <span className={styles.script}>magical</span>.</>
              ) : (
                <>Tonight, the storyteller is <span className={styles.script}>you</span>.</>
              )}
            </h1>
            <p className={styles.formSub}>
              {isSignUp
                ? "Create your free account — your first story is on us, and the shelf is yours forever."
                : "Sign in to find your shelf, finish last night's chapter, or start a brand-new tale."}
            </p>

            {pendingVerification ? (
              <form noValidate onSubmit={handleVerify}>
                {error && <div className={styles.errorBanner}>{error}</div>}
                <p className={styles.formSub}>
                  We sent a 6-digit code to your email. Pop it in below to finish creating your shelf.
                </p>
                <div className={styles.field}>
                  <label htmlFor="code">Verification code</label>
                  <div className={styles.inputShell}>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      value={code}
                      onChange={(ev) => setCode(ev.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className={styles.submit} disabled={pending}>
                  {pending ? <span>Verifying…</span> : (<><span>Verify &amp; open my shelf</span><span className={styles.arr}><ArrowRightIcon size={16} /></span></>)}
                </button>
              </form>
            ) : (
            <>
            <div className={styles.modeToggle} role="tablist" aria-label="Choose sign-in or sign-up">
              <span className={styles.pill} style={{ left: pillStyle.left, width: pillStyle.width }} />
              <button
                ref={signinBtnRef}
                type="button"
                role="tab"
                aria-selected={!isSignUp}
                className={!isSignUp ? "active" : ""}
                onClick={() => setMode("sign-in")}
              >
                Sign in
              </button>
              <button
                ref={signupBtnRef}
                type="button"
                role="tab"
                aria-selected={isSignUp}
                className={isSignUp ? "active" : ""}
                onClick={() => setMode("sign-up")}
              >
                Create account
              </button>
            </div>

            <div className={styles.socials}>
              <button
                type="button"
                className={styles.socialBtn}
                aria-label="Continue with Google"
                onClick={handleGoogle}
                disabled={oauthPending || pending}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                  <path fill="#FBBC05" d="M5.85 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.67-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z" />
                </svg>
                {oauthPending ? "Opening Google…" : "Google"}
              </button>
              <button
                type="button"
                className={styles.socialBtn}
                aria-label="Continue with Apple"
                disabled
                title="Apple sign-in coming soon"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="#1C1540">
                  <path d="M16.36 12.65c-.02-2.4 1.96-3.55 2.05-3.6-1.12-1.64-2.86-1.86-3.48-1.89-1.48-.15-2.89.87-3.64.87-.76 0-1.91-.85-3.15-.83-1.62.02-3.12.94-3.95 2.39-1.69 2.93-.43 7.27 1.21 9.65.8 1.16 1.75 2.47 3 2.42 1.21-.05 1.66-.78 3.13-.78 1.46 0 1.87.78 3.15.76 1.3-.02 2.12-1.18 2.91-2.35.92-1.34 1.3-2.65 1.32-2.72-.03-.02-2.53-.97-2.55-3.92zM13.96 5.6c.66-.81 1.11-1.92.99-3.04-.96.04-2.13.64-2.81 1.44-.61.71-1.15 1.85-1 2.94 1.07.08 2.16-.55 2.82-1.34z" />
                </svg>
                Apple
              </button>
            </div>

            <div className={styles.divider}>or with email</div>

            <form noValidate onSubmit={handleSubmit}>
              {error && <div className={styles.errorBanner}>{error}</div>}

              {isSignUp && (
                <div className={styles.field}>
                  <label htmlFor="name">Your name</label>
                  <div className={styles.inputShell}>
                    <IdCardIcon size={18} className="lead" />
                    <input type="text" id="name" name="name" autoComplete="name" placeholder="e.g. Ramona" />
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputShell}>
                  <AtSignIcon size={18} className="lead" />
                  <input type="email" id="email" name="email" autoComplete="email" placeholder="grownup@bedtime.co" required />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password">
                  <span>Password</span>
                  {!isSignUp && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("We'll send a magic lantern (a.k.a. reset link) to your email. ✦");
                      }}
                    >
                      Forgot it?
                    </a>
                  )}
                </label>
                <div className={styles.inputShell}>
                  <LockIcon size={18} className="lead" />
                  <input
                    type={showPw ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder="At least 8 cozy characters"
                    required
                    minLength={8}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.togglePw}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {isSignUp && (
                  <div className={styles.pwMeter} aria-hidden="true">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={styles.pwSeg}
                        style={{
                          background: i <= pwScore ? pwColors[Math.max(0, pwScore - 1)] : "var(--paper-line)",
                        }}
                      />
                    ))}
                    <span className={styles.pwLabel}>{pwScore === 0 ? "—" : pwLabels[pwScore - 1]}</span>
                  </div>
                )}
              </div>

              <div className={styles.rowLine}>
                {isSignUp ? (
                  <label className={styles.check}>
                    <input type="checkbox" name="terms" required checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} />
                    <span className={styles.checkBox}>{termsChecked && <CheckIcon size={14} />}</span>
                    <span>I agree to the <a href="#" style={{ color: "var(--berry)" }}>terms</a> &amp; <a href="#" style={{ color: "var(--berry)" }}>privacy</a></span>
                  </label>
                ) : (
                  <label className={styles.check}>
                    <input type="checkbox" name="remember" checked={rememberChecked} onChange={e => setRememberChecked(e.target.checked)} />
                    <span className={styles.checkBox}>{rememberChecked && <CheckIcon size={14} />}</span>
                    Keep me cozy &amp; signed in
                  </label>
                )}
              </div>

              {/* Clerk Smart CAPTCHA mounts here for bot protection on sign-up */}
              <div id="clerk-captcha" />

              <button type="submit" className={styles.submit} disabled={pending || oauthPending}>
                {pending ? (
                  <span>{isSignUp ? "Creating your shelf…" : "Opening your shelf…"}</span>
                ) : (
                  <>
                    <span>{isSignUp ? "Create my shelf" : "Open my shelf"}</span>
                    <span className={styles.arr}><ArrowRightIcon size={16} /></span>
                  </>
                )}
              </button>

              <p className={styles.legal}>
                {isSignUp ? (
                  <>
                    Already have a shelf?{" "}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setMode("sign-in"); }}
                    >
                      Sign in instead
                    </a>
                  </>
                ) : (
                  <>
                    New here?{" "}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setMode("sign-up"); }}
                    >
                      Make a free account
                    </a>
                  </>
                )}
              </p>

              <div className={styles.coppa}>
                <div className={styles.coppaMark}><SparklesIcon size={16} /></div>
                <div>
                  <strong style={{ color: "var(--ink)", fontWeight: 800 }}>For grown-ups only.</strong>{" "}
                  TellTales is a parent-managed account. We never collect data on children directly — heroes are added by you, the grown-up, and stay safely on your shelf.{" "}
                  <a href="#" style={{ color: "var(--u-orange)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>Read our COPPA promise <ArrowRightIcon size={12} /></a>
                </div>
              </div>
            </form>
            </>
            )}
          </section>
          </Reveal>

          <aside className={styles.visual} aria-hidden="true">
            <div className={`${styles.float} ${styles.d1} ${styles.starDecor}`} />
            <div className={`${styles.float} ${styles.d2} ${styles.moonDecor}`} />
            <div className={`${styles.float} ${styles.d3} ${styles.cloudDecor}`} />
            <div className={`${styles.float} ${styles.d4} ${styles.starDecor}`} />
            <div className={`${styles.float} ${styles.d5} ${styles.starDecor}`} />

            <div className={`${styles.tuckBook} ${styles.tuck1}`}>
              <div>
                <div className="label">Saved · last night</div>
                <div className="title">Maya &amp; the <span className="sc">Brave Lantern</span></div>
              </div>
              <div className="meta">
                <span>Bravery</span>
                <div className="star">★</div>
              </div>
            </div>

            <div className={`${styles.tuckBook} ${styles.tuck2}`}>
              <div>
                <div className="label">Up next</div>
                <div className="title">Leo &amp; the <span className="sc">Patient Seed</span></div>
              </div>
              <div className="meta">
                <span>Patience</span>
                <div className="star">☾</div>
              </div>
            </div>

            <div className={styles.welcomeCard}>
              <AmbientDecor
                variant="dark"
                stars={[
                  { top: "16%", left: "82%" },
                  { top: "58%", left: "90%" },
                  { top: "78%", left: "8%" },
                  { top: "12%", left: "48%" },
                ]}
                fireflies={[{ left: "72%", bottom: "18%", delay: "0.8s", dur: "8s" }]}
              />
              <div className={styles.welcomeEyebrow}>Your shelf is waiting</div>
              <div className={styles.welcomeQuote}>
                A <em>14-night streak</em>, three little heroes, and one chapter unfinished — let&apos;s pick up where you left off.
              </div>
              <div className={styles.welcomeMeta}>
                <div className={styles.welcomeAvatars}>
                  <div>A</div><div>M</div><div>K</div><div>+</div>
                </div>
                <div className={styles.welcomeMetaText}>
                  Joining 2,400+ families
                  <span className="stars">★★★★★ 4.9</span>
                </div>
              </div>
            </div>

            <div className={styles.tonightStrip}>
              <div className={styles.tonightIcon}>☾</div>
              <div className={styles.tonightText}>
                <strong>Tonight&apos;s blueprint: Patience</strong>
                A gentle 5-chapter tale, ready in under a minute.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
