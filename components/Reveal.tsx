"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Framer Motion replacement for the prototype's `.reveal` + IntersectionObserver
 * scroll animation. Renders the requested semantic element (no extra wrapper, so
 * grid/flex layouts are preserved) and fades/translates it in on first view.
 * `d` reproduces the hero's staggered transition-delay (d * 90ms). Honors
 * prefers-reduced-motion by rendering statically.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const MOTION = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  dl: motion.dl,
  ul: motion.ul,
  li: motion.li,
  section: motion.section,
  article: motion.article,
  h2: motion.h2,
} as const;

type Tag = keyof typeof MOTION;

export function Reveal({
  as = "div",
  d = 0,
  className,
  style,
  id,
  children,
  ariaHidden,
}: {
  as?: Tag;
  d?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
  ariaHidden?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp = MOTION[as];

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -8% 0px" },
        transition: { duration: 0.8, ease: EASE, delay: d * 0.09 },
      };

  return (
    <Comp className={className} style={style} id={id} aria-hidden={ariaHidden} {...motionProps}>
      {children}
    </Comp>
  );
}
