"use client";

import { useEffect, useRef, useState } from "react";
import { footer } from "@/lib/content";
import { useTheme } from "./ThemeProvider";

/** A labelled segmented control inside the settings popover. */
function Seg({
  label,
  options,
  current,
  onPick,
}: {
  label: string;
  options: { v: string; label: string }[];
  current: string;
  onPick: (v: string) => void;
}) {
  return (
    <>
      <p className="settings-pop__label">{label}</p>
      <div className="settings-seg">
        {options.map((o) => (
          <button key={o.v} type="button" className={o.v === current ? "active" : ""} onClick={() => onPick(o.v)}>
            {o.label}
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * Footer with the settings gear popover (Theme / Film grain / 3D backdrop),
 * ported from the prototype. Controls flow through ThemeProvider so changes
 * persist and drive window.BG3D.
 */
export function Footer() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".footer__settings")) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  return (
    <footer className="footer">
      <div className="footer__row">
        <a className="footer__brand" href="#top">
          <span className="monogram">PS</span>
        </a>
        <nav className="footer__nav" aria-label="Footer">
          {footer.nav.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="footer__end">
          <a href="#top" className="footer__top">
            Back to top ↑
          </a>
          <div className="footer__settings" ref={wrapRef}>
            <button
              className="settings-gear"
              id="settingsGear"
              type="button"
              aria-label="Display settings"
              aria-expanded={open}
              title="Display settings"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <div className="settings-pop" hidden={!open}>
              <Seg
                label="Theme"
                current={t.theme}
                onPick={(v) => t.set("theme", v as "light" | "dark")}
                options={[
                  { v: "light", label: "Light" },
                  { v: "dark", label: "Dark" },
                ]}
              />
              <Seg
                label="Film grain"
                current={t.grain ? "on" : "off"}
                onPick={(v) => t.set("grain", v === "on")}
                options={[
                  { v: "on", label: "On" },
                  { v: "off", label: "Off" },
                ]}
              />
              <Seg
                label="3D backdrop"
                current={t.bg3d ? "on" : "off"}
                onPick={(v) => t.set("bg3d", v === "on")}
                options={[
                  { v: "on", label: "On" },
                  { v: "off", label: "Off" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="footer__base">
        <span>{footer.copyright}</span>
        <span className="footer__colophon">{footer.colophon}</span>
      </div>
    </footer>
  );
}
