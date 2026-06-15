import type { Metadata } from "next";
import "@/components/pdf-editor/pdf-editor.css";

export const metadata: Metadata = {
  title: "Prabhu's PDF — Editor",
  description: "A single unified PDF editor workspace — annotate, reorder, split, merge, and protect.",
};

/**
 * Isolated root layout for the PDF editor. It owns its own <html>/<body> and
 * loads only the editor's CSS + IBM Plex fonts, so the portfolio's global
 * styles/tokens (in the (site) group) never reach this full-screen tool, and
 * vice-versa. (Next loads each route segment's CSS only for that segment.)
 */
export default function PdfEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
