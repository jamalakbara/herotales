import type { Metadata, Viewport } from "next";
import { Lexend, Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const quicksand = Quicksand({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "HeroTales AI - Personalized Stories for Your Child",
    template: "%s | HeroTales AI",
  },
  description:
    "Create magical bedtime stories where your child is the hero. AI-powered personalized storytelling that teaches values like bravery, kindness, and honesty.",
  keywords: [
    "children stories",
    "personalized stories",
    "AI stories",
    "bedtime stories",
    "kids stories",
    "educational stories",
  ],
  authors: [{ name: "HeroTales AI" }],
  creator: "HeroTales AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://herotales.ai",
    siteName: "HeroTales AI",
    title: "HeroTales AI - Personalized Stories for Your Child",
    description:
      "Create magical bedtime stories where your child is the hero. AI-powered personalized storytelling that teaches values.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeroTales AI - Personalized Stories for Your Child",
    description:
      "Create magical bedtime stories where your child is the hero.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFBF5" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1D29" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lexend.variable} ${quicksand.variable} antialiased min-h-screen`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
