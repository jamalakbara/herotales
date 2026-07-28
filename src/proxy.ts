import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/stories(.*)",
  "/shelf(.*)",
  "/keepsake-books(.*)",
  "/heroes(.*)",
]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Next.js 16 uses `proxy.ts` (renamed from `middleware.ts`); Clerk's middleware
// handler is exported under that name here.
export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Pre-launch gate: when COMING_SOON=true (prod only), wall off the app —
  // auth + all protected routes redirect to the /coming-soon splash. The
  // marketing landing ("/"), /coming-soon, and /api/waitlist pass through.
  if (process.env.COMING_SOON === "true" && (isProtected(req) || isAuthRoute(req))) {
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtected(req) && !userId) {
    const next = req.nextUrl.pathname;
    return redirectToSignIn({ returnBackUrl: next });
  }

  if (isAuthRoute(req) && userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/inngest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
