import type { Metadata } from "next";
import "@/components/json-viewer/lattice.css";

export const metadata: Metadata = {
  title: "Prabhu's Formatter — data tree explorer & converter",
  description: "Explore and convert JSON, YAML, XML, CSV, TSV and TOML in one place.",
};

/**
 * Isolated root layout for the JSON formatter — its own <html>/<body> and only
 * lattice.css, so its full-screen styles/theme can't reach the portfolio or the
 * pdf-editor (Next loads a route segment's CSS only for that segment).
 * `data-theme` starts dark; Settings reconciles to the OS preference on mount.
 */
export default function JsonViewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
