import { experience } from "@/lib/content";
import { Reveal } from "../Reveal";

/** Experience timeline. */
export function Experience() {
  return (
    <section className="section experience" id="experience">
      <Reveal as="div" className="section__head">
        <p className="section__num">{experience.num}</p>
        <h2 className="section__title">{experience.title}</h2>
      </Reveal>
      <ol className="timeline">
        {experience.items.map((item) => (
          <Reveal as="li" className="tl" key={item.when}>
            <div className="tl__when">{item.when}</div>
            <div className="tl__what">
              <h3>
                {item.role} <span className="tl__co">{item.company}</span>
              </h3>
              <p>{item.desc}</p>
              {item.tags.length > 0 && (
                <ul className="tags">
                  {item.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
      <Reveal as="p" className="experience__cv">
        <a href={experience.cv.href} download className="btn btn--ghost">
          {experience.cv.label} <span className="btn__arrow">↓</span>
        </a>
      </Reveal>
    </section>
  );
}
