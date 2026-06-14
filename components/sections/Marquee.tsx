import { Fragment } from "react";
import { marquee } from "@/lib/content";

/** Infinite scrolling marquee of focus areas (CSS keyframe loop, duplicated for seamlessness). */
export function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
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
