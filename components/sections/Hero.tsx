import { hero } from "@/lib/content";
import { Reveal } from "../Reveal";
import { HeroOrbit } from "./HeroOrbit";
import { Marquee } from "./Marquee";

/** Full-bleed hero: copy on the left, 3D orbiting SSD on the right, marquee pinned to the bottom. */
export function Hero() {
  return (
    <section className="shero" id="hero">
      <div className="shero__text">
        <Reveal as="p" className="shero__slogan" d={0}>
          <span className="status__dot"></span>
          Staff Engineer @ <strong className="shero__slogan-em">SanDisk</strong>
        </Reveal>
        <h1 className="shero__title">
          <Reveal as="span" d={1}>
            {hero.titleLine1}
          </Reveal>
          <Reveal as="span" className="shero__title-em" d={2}>
            {hero.titleLine2}
          </Reveal>
        </h1>
        <Reveal as="p" className="shero__sub" d={3}>
          I&apos;m <strong>Prabhukumar Sivamoorthy</strong> — a decade building robust Python systems for
          datacenter SSDs, and the AI agents that make engineering teams measurably faster.
        </Reveal>
        <Reveal as="div" className="shero__actions" d={4}>
          {hero.actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className={`btn ${a.variant === "primary" ? "btn--primary" : "btn--ghost"}`}
              {...(a.download ? { download: true } : {})}
            >
              {a.label} <span className="btn__arrow">{a.arrow}</span>
            </a>
          ))}
        </Reveal>
        <Reveal as="dl" className="shero__contact" d={5}>
          {hero.meta.map((m) => (
            <div key={m.dt}>
              <dt>{m.dt}</dt>
              <dd>{m.dd}</dd>
            </div>
          ))}
        </Reveal>
      </div>

      <Reveal as="div" className="hero3d" d={3} ariaHidden>
        <HeroOrbit />
      </Reveal>

      <Marquee variant="hero" />
    </section>
  );
}
