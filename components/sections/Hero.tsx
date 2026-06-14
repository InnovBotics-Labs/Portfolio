import { hero } from "@/lib/content";
import { Reveal } from "../Reveal";

/** Split-screen "Photo Hero": copy on the left, framed photo slot on the right. */
export function Hero() {
  return (
    <section className="shero" id="hero">
      <div className="shero__text">
        <Reveal as="p" className="shero__slogan" d={0}>
          <span className="status__dot"></span>
          {hero.slogan}
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
        <Reveal as="div" className="shero__stack" d={6}>
          <span className="shero__stack-k">{hero.stackLabel}</span>
          <ul className="shero__chips">
            {hero.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Reveal as="div" className="shero__media" d={2}>
        <div className="shero__frame">
          <image-slot
            id="hero-portrait"
            style={{ width: "100%", height: "100%" }}
            shape="rounded"
            radius="20"
            placeholder="Drop your photo here"
          ></image-slot>
        </div>
        <span className="shero__badge">
          <span className="status__dot"></span>
          {hero.badge}
        </span>
        <span className="shero__tag">{hero.tag}</span>
      </Reveal>
    </section>
  );
}
