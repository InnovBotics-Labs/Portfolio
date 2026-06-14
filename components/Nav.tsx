"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { BrandDot } from "./BrandDot";

/**
 * Fixed top nav: wordmark (with the Morse BrandDot), primary links, Portal
 * trigger, and a hamburger for ≤880px. Ports the scrolled-state, mobile-menu
 * toggle, and Esc/outside-click close behaviour from the prototype's main.js.
 */
export function Nav({ onPortal }: { onPortal: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("#nav")) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [menuOpen]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`} id="nav">
      <a className="nav__brand" href="#top" aria-label="Home">
        <span className="wordmark">
          <BrandDot />
          <span className="wordmark__name">
            <b>{nav.brand.first}</b>
            {" "}
            {nav.brand.rest.trim()}
          </span>
        </span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        {nav.links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            <span className="nav__idx">{l.idx}</span> {l.label}
          </a>
        ))}
        <a href={nav.cta.href} className="nav__cta" onClick={() => setMenuOpen(false)}>
          {nav.cta.label}
        </a>
      </nav>
      <div className="nav__actions">
        <button className="nav__portal" id="portalBtn" type="button" onClick={onPortal}>
          Portal <span aria-hidden="true">→</span>
        </button>
        <button
          className="nav__burger"
          id="navBurger"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="nav"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
