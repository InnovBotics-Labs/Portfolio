import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import "../globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { Atmosphere } from "@/components/Atmosphere";
import { SiteChrome } from "@/components/SiteChrome";
import { Footer } from "@/components/Footer";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Prabhukumar Sivamoorthy — Software Engineer",
  description:
    "Staff Engineer at SanDisk — a decade building robust Python systems for datacenter SSDs, and the AI agents that make engineering teams measurably faster.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-palette="ink"
      suppressHydrationWarning
      className={`${newsreader.variable} ${jetbrains.variable} ${GeistSans.variable}`}
    >
      <body>
        {/* Apply saved/default theme before paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <Atmosphere />
          <SiteChrome />
          {children}
          <Footer />
        </ThemeProvider>
        {/* Bespoke prototype scripts, ported verbatim. */}
        <Script src="/image-slot.js" strategy="afterInteractive" />
        <Script src="/bg3d.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
