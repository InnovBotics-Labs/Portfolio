import { heroOrbit } from "@/lib/content";

/**
 * The hero's right column: a 3D SanDisk SSD ("planet") with the tech stack as
 * satellites orbiting it on tilted elliptical rings. Static markup only — the
 * orbital motion + auto-fit scaling are driven by the vendored
 * public/hero-orbit.js, which targets #orbitSystem, the .sat[data-r/-a/-s]
 * spans, and the --scale custom property. IDs/classes must match it exactly.
 *
 * Rendered inside the `.hero3d` Reveal wrapper in Hero.tsx.
 */
export function HeroOrbit() {
  const { ssd, satellites, legend } = heroOrbit;
  return (
    <>
      <div className="hero3d__glow"></div>
      <div className="orbit-system" id="orbitSystem">
        <div className="orbit-ring orbit-ring--lang"></div>
        <div className="orbit-ring orbit-ring--fw"></div>
        <div className="orbit-ring orbit-ring--inf"></div>
        <div className="orbit-ring orbit-ring--ml"></div>
        <div className="orbit-ring orbit-ring--std"></div>

        <div className="ssd">
          <div className="ssd__case">
            <span className="ssd__screw ssd__screw--tl"></span>
            <span className="ssd__screw ssd__screw--tr"></span>
            <span className="ssd__screw ssd__screw--bl"></span>
            <span className="ssd__screw ssd__screw--br"></span>
            <div className="ssd__label">
              <div className="ssd__top">
                <span className="ssd__brand">{ssd.brand}</span>
                <span className="ssd__tier">{ssd.tier}</span>
              </div>
              <div className="ssd__model">{ssd.model}</div>
              <div className="ssd__cap">
                <b>{ssd.cap.value}</b>
                <span>{ssd.cap.unit}</span>
              </div>
              <div className="ssd__barcode"></div>
              <div className="ssd__meta">
                {ssd.meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
            <div className="ssd__shine"></div>
          </div>
        </div>

        {satellites.map((sat, i) => (
          <span
            key={`${sat.label}-${i}`}
            className={`sat sat--${sat.group}`}
            data-r={sat.r}
            data-a={sat.a}
            data-s={sat.s}
          >
            {sat.label}
          </span>
        ))}
      </div>
      <ul className="orbit-legend">
        {legend.map((l) => (
          <li key={l.group} style={{ "--lg": `var(--g-${l.group})` }}>
            <i></i>
            {l.label}
          </li>
        ))}
      </ul>
    </>
  );
}
