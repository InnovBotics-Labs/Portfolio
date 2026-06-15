"use client";

import dynamic from "next/dynamic";

// Client-only: the formatter uses DOM/clipboard/DOMParser throughout.
const CodeFormatter = dynamic(() => import("@/components/code-formatter/CodeFormatter"), { ssr: false });

export default function CodeFormatterPage() {
  return <CodeFormatter />;
}
