import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import styles from "./sso-callback.module.css";

// Clerk lands the OAuth redirect here and completes the sign-in/up, then
// forwards to redirectUrlComplete (the `next` path passed from the auth form).
// New OAuth accounts run a sign-up transfer, which triggers Clerk's Smart
// CAPTCHA bot protection — it needs a #clerk-captcha mount point on this page.
export default function SSOCallbackPage() {
  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.mark} aria-hidden="true" />
        <span className={styles.eyebrow}>Almost there</span>
        <h1 className={styles.title}>Tucking you in…</h1>
        <p className={styles.sub}>
          Finishing your sign-in and getting your shelf ready. This only takes a
          moment.
        </p>
        <div className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
      <div id="clerk-captcha" />
    </main>
  );
}
