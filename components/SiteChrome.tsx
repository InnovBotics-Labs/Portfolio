"use client";

import { useState } from "react";
import { Nav } from "./Nav";
import { Portal } from "./Portal";

/**
 * Owns the fixed-position chrome (Nav + Portal modal) and the shared open
 * state between the nav's Portal button and the modal.
 */
export function SiteChrome() {
  const [portalOpen, setPortalOpen] = useState(false);
  return (
    <>
      <Nav onPortal={() => setPortalOpen(true)} />
      <Portal open={portalOpen} onClose={() => setPortalOpen(false)} />
    </>
  );
}
