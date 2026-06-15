"use client";

import dynamic from "next/dynamic";

// The editor is a heavy, browser-only app (uses window/document, canvas, DnD).
// Load it client-side only so it never runs during SSR/prerender.
const PdfEditor = dynamic(() => import("@/components/pdf-editor/PdfEditor"), {
  ssr: false,
});

export default function PdfEditorPage() {
  return (
    <div className="pdf-root">
      <PdfEditor />
    </div>
  );
}
