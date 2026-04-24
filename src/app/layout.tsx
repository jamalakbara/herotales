import type { Metadata } from "next";
import { Young_Serif, Caprasimo, Nunito } from "next/font/google";
import "./globals.css";

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-young-serif",
  display: "swap",
});

const caprasimo = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caprasimo",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
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
    <html
      lang="en"
      className={`${youngSerif.variable} ${caprasimo.variable} ${nunito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
