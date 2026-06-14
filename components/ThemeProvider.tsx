"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Ports the theme / settings logic from the prototype's main.js into React.
 * Manages theme, palette, accent hue, display font, film grain, and the 3D
 * backdrop; persists to localStorage; applies everything to <html>/<body>;
 * and drives the verbatim window.BG3D backdrop (public/bg3d.js).
 *
 * First paint is handled by the inline pre-hydration script in layout.tsx
 * (themeInitScript) so there's no flash; this provider keeps runtime changes
 * in sync and powers the footer settings gear.
 */

export type Theme = "light" | "dark";
export type Palette = "ink" | "slate" | "sand";
export type Display = "serif" | "sans";

export type Settings = {
  theme: Theme;
  palette: Palette;
  accentHue: number;
  display: Display;
  grain: boolean;
  bg3d: boolean;
};

// Authored defaults from the prototype's PORTFOLIO_TWEAKS block.
export const DEFAULTS: Settings = {
  theme: "light",
  palette: "ink",
  accentHue: 155,
  display: "sans",
  grain: true,
  bg3d: true,
};

export const STORAGE_KEY = "ps_portfolio";

export const DISPLAY_FONTS: Record<Display, string> = {
  serif: "var(--font-newsreader), Georgia, serif",
  sans: "var(--font-geist-sans), system-ui, sans-serif",
};

type Ctx = Settings & {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function readStored(): Partial<Settings> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<Settings>;
  } catch {
    return {};
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start from the authored defaults so SSR and first client render match;
  // the saved overrides are merged in a mount effect.
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const hydrated = useRef(false);

  const apply = useCallback((s: Settings) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", s.theme);
    root.setAttribute("data-palette", s.palette);
    root.style.setProperty("--accent-h", String(s.accentHue));
    root.style.setProperty("--font-display", DISPLAY_FONTS[s.display] || DISPLAY_FONTS.serif);
    root.classList.remove("preload-no-grain");
    document.body.classList.toggle("no-grain", !s.grain);
    const BG3D = (window as unknown as { BG3D?: { refreshColor: () => void; setEnabled: (on: boolean) => void } }).BG3D;
    if (BG3D) {
      BG3D.refreshColor();
      BG3D.setEnabled(s.bg3d);
    }
  }, []);

  // Merge saved settings once on mount. We intentionally render the authored
  // defaults on the server + first client paint (so SSR markup matches and the
  // pre-paint script controls the visible theme), then reconcile localStorage
  // here — the standard SSR-safe hydration pattern.
  useEffect(() => {
    const merged = { ...DEFAULTS, ...readStored() };
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read from an external store (localStorage)
    setSettings(merged);
  }, []);

  // Apply + persist on every change (after the first paint script ran).
  useEffect(() => {
    apply(settings);
    if (hydrated.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        /* ignore quota / private-mode errors */
      }
    }
  }, [settings, apply]);

  const set = useCallback<Ctx["set"]>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return <ThemeContext.Provider value={{ ...settings, set }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/**
 * Inline script injected before paint to apply saved settings (or the authored
 * defaults) to <html>/<body> so there's no flash of the wrong theme. Mirrors
 * apply() above but runs before React hydrates. window.BG3D may not exist yet
 * (its script loads afterInteractive); it self-starts enabled by default and
 * the provider re-syncs it once mounted.
 */
export const themeInitScript = `
(function(){
  try {
    var D = ${JSON.stringify(DEFAULTS)};
    var F = ${JSON.stringify(DISPLAY_FONTS)};
    var s = D;
    try { s = Object.assign({}, D, JSON.parse(localStorage.getItem("${STORAGE_KEY}") || "{}")); } catch(e){}
    var r = document.documentElement;
    r.setAttribute("data-theme", s.theme);
    r.setAttribute("data-palette", s.palette);
    r.style.setProperty("--accent-h", String(s.accentHue));
    r.style.setProperty("--font-display", F[s.display] || F.serif);
    if (!s.grain) document.documentElement.classList.add("preload-no-grain");
  } catch(e){}
})();
`;
