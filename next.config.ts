import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // The ported <image-slot> component fetches this sidecar on load; serve
      // an empty store so there's no 404/400 in the console (drops aren't
      // persisted outside the design runtime — placeholders are intentional).
      { source: "/.image-slots.state.json", destination: "/api/image-slots" },
    ];
  },
};

export default nextConfig;
