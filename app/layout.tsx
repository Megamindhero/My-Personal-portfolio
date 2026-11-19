import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/geist-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Josep Kingsley — Crypto community growth strategist",
  description:
    "I build and grow Web3 communities on Discord, Telegram and X. 600 → 3,000+ members, 400% DAU, real numbers.",
  openGraph: {
    title: "Josep Kingsley",
    description: "Crypto community growth strategist · Partner at Mitooshi · Safary Club Cohort 1",
    type: "website",
  },
  twitter: { card: "summary_large_image", creator: "@josepkingsley" },
};

export const viewport: Viewport = { themeColor: "#0a0a09" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
