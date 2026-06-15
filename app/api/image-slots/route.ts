import { NextResponse } from "next/server";

/**
 * Empty image-slot sidecar. The ported <image-slot> web component
 * (public/image-slot.js) fetches "/.image-slots.state.json" on load to hydrate
 * any saved drops; outside the Claude Design runtime there are none, so we
 * return an empty store (served via the rewrite in next.config.ts) to keep the
 * console clean. Image placeholders are intentional — real photos go here later.
 */
export function GET() {
  return NextResponse.json({});
}
