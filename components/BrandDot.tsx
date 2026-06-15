"use client";

import { useEffect, useRef } from "react";

/**
 * The accent dot beside the wordmark blinks "PS" (Prabhukumar Sivamoorthy) in
 * Morse code — a signature easter egg ported from the prototype's main.js.
 * Pauses to a steady dot on brand hover, stops when the tab is hidden, and
 * respects prefers-reduced-motion.
 */

const MORSE: Record<string, string> = { P: ".--.", S: "..." };
const MSG = "PS";
const UNIT = 190; // ms per dit
const ACCENT = "var(--accent)";

export function BrandDot() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Build a flat timeline of {on, dur} segments.
    const seq: { on: boolean; dur: number }[] = [];
    const chars = MSG.split("");
    chars.forEach((ch, ci) => {
      const code = MORSE[ch] || "";
      for (let i = 0; i < code.length; i++) {
        seq.push({ on: true, dur: code[i] === "-" ? 3 : 1 });
        seq.push({ on: false, dur: 1 }); // intra-character gap
      }
      if (seq.length) seq[seq.length - 1].dur = ci === chars.length - 1 ? 9 : 3;
    });

    dot.style.transition = "opacity .12s ease, box-shadow .12s ease, transform .12s ease";
    let idx = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let paused = false;

    function lit(on: boolean) {
      if (!dot) return;
      if (on) {
        dot.style.opacity = "1";
        dot.style.transform = "scale(1.25)";
        dot.style.boxShadow =
          "0 0 10px 2px color-mix(in oklab, " + ACCENT + " 75%, transparent), 0 0 0 4px color-mix(in oklab, " + ACCENT + " 22%, transparent)";
      } else {
        dot.style.opacity = "0.28";
        dot.style.transform = "scale(1)";
        dot.style.boxShadow = "0 0 0 4px color-mix(in oklab, " + ACCENT + " 14%, transparent)";
      }
    }

    function step() {
      if (paused) return;
      const seg = seq[idx];
      lit(seg.on);
      idx = (idx + 1) % seq.length;
      timer = setTimeout(step, seg.dur * UNIT);
    }

    const brand = dot.closest(".nav__brand");
    const onEnter = () => {
      paused = true;
      if (timer) clearTimeout(timer);
      dot.style.opacity = "1";
      dot.style.transform = "scale(1)";
      dot.style.boxShadow = "0 0 0 4px color-mix(in oklab, " + ACCENT + " 22%, transparent)";
    };
    const onLeave = () => {
      if (paused) {
        paused = false;
        step();
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
      } else if (!paused) {
        step();
      }
    };

    if (brand) {
      brand.addEventListener("mouseenter", onEnter);
      brand.addEventListener("mouseleave", onLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);
    step();

    return () => {
      if (timer) clearTimeout(timer);
      if (brand) {
        brand.removeEventListener("mouseenter", onEnter);
        brand.removeEventListener("mouseleave", onLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <span className="wordmark__dot" ref={ref} />;
}
