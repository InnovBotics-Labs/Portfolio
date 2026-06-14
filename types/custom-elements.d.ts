import type React from "react";

/**
 * Type support for the ported <image-slot> web component (public/image-slot.js)
 * and for inline CSS custom properties used throughout the design tokens.
 */
declare module "react" {
  // Allow `style={{ "--h": 25 }}` etc.
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }

  namespace JSX {
    interface IntrinsicElements {
      "image-slot": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          shape?: "rect" | "rounded" | "circle" | "pill";
          radius?: string | number;
          mask?: string;
          fit?: "cover" | "contain" | "fill";
          position?: string;
          placeholder?: string;
          src?: string;
        },
        HTMLElement
      >;
    }
  }
}
