import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

// umano type system: Playfair Display = display headings (proprietary "AM Le
// Cygne" substitute — umano's own declared fallback); Inter = body/UI + accents.
// The CSS variable names are kept so existing class references pick up the swap.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-young-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const playfairAccent = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic"],
  variable: "--font-caprasimo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TellTales — Bedtime stories where your child is the hero",
  description:
    "TellTales spins a fresh 5-chapter adventure around your child — their name, their face, their bravery — and narrates it in a warm voice that makes bedtime feel like magic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${playfair.variable} ${playfairAccent.variable} ${inter.variable}`}
        // Browser extensions (e.g. Google Tag Assistant) inject data-* attrs on
        // <html> before hydration; suppress the resulting top-level attribute
        // mismatch. Only silences <html>'s own attrs, not the tree below.
        suppressHydrationWarning
      >
        <body>
          <SmoothScroll>{children}</SmoothScroll>
        </body>
      </html>
    </ClerkProvider>
  );
}
