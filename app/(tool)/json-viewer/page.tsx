"use client";

import dynamic from "next/dynamic";

// Client-only: the formatter uses DOM/clipboard/DOMParser throughout.
const JsonViewer = dynamic(() => import("@/components/json-viewer/JsonViewer"), { ssr: false });

export default function JsonViewerPage() {
  return <JsonViewer />;
}
