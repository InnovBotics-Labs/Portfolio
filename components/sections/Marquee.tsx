import { Fragment } from "react";
import { marquee } from "@/lib/content";

/**
 * Infinite scrolling marquee of focus areas (CSS keyframe loop, duplicated for
 * seamlessness). `variant="hero"` pins it to the bottom edge of the hero
 * section (full-bleed, mono type) instead of standing as its own band.
 */
export function Marquee({ variant }: { variant?: "hero" }) {
  const items = [...marquee, ...marquee];
  return (
    <div className={`marquee${variant === "hero" ? " marquee--hero" : ""}`} aria-hidden="true">
      <div className="marquee__track">
        {items.map((label, i) => (
          <Fragment key={i}>
            <span>{label}</span>
            <span className="marquee__dot">✦</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
