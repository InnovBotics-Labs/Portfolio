import { work, type Project } from "@/lib/content";
import { Reveal } from "../Reveal";

/** One project card in the carousel. */
function ProjectCard({ p, clone = false }: { p: Project; clone?: boolean }) {
  const mediaProps = p.external
    ? { href: p.href, target: "_blank", rel: "noopener" }
    : { href: p.href };
  return (
    <article className="proj" aria-hidden={clone || undefined}>
      <a className="proj__media" {...mediaProps}>
        <image-slot
          id={p.id}
          style={{ width: "100%", aspectRatio: "16 / 10" }}
          shape="rounded"
          radius="14"
          placeholder={p.placeholder}
        ></image-slot>
      </a>
      <div className="proj__body">
        <div className="proj__top">
          <span className="proj__idx">{p.idx}</span>
          <span className="proj__year">{p.year}</span>
        </div>
        <h3 className="proj__title">{p.title}</h3>
        <p className="proj__desc">{p.desc}</p>
        <ul className="tags">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {p.link.href ? (
          <a className="proj__link" href={p.link.href} target="_blank" rel="noopener">
            {p.link.label} <span className="btn__arrow">→</span>
          </a>
        ) : (
          <span className="proj__link">
            {p.link.label} <span className="btn__arrow">→</span>
          </span>
        )}
      </div>
    </article>
  );
}

/**
 * Selected Work: an infinite right-to-left carousel (CSS keyframe loop, edges
 * faded, pauses on hover). Cards are rendered twice — the second set is an
 * aria-hidden clone — so the -50% loop is seamless, matching the prototype.
 */
export function Work() {
  return (
    <section className="section work" id="work">
      <Reveal as="div" className="section__head">
        <p className="section__num">{work.num}</p>
        <h2 className="section__title">
          {work.title[0]}
          <br />
          {work.title[1]}
        </h2>
      </Reveal>
      <Reveal as="div" className="work__carousel">
        <div className="work__track">
          {work.projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
          {work.projects.map((p) => (
            <ProjectCard key={`clone-${p.id}`} p={p} clone />
          ))}
        </div>
      </Reveal>
      <Reveal as="p" className="work__more">
        <a href={work.more.href}>
          {work.more.label} <span className="btn__arrow">→</span>
        </a>
      </Reveal>
    </section>
  );
}
