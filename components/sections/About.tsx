import { about } from "@/lib/content";
import { Reveal } from "../Reveal";

/** About: sticky portrait slot + bio + a categorised skills grid. */
export function About() {
  return (
    <section className="section about" id="about">
      <Reveal as="div" className="section__head">
        <p className="section__num">{about.num}</p>
      </Reveal>
      <div className="about__grid">
        <Reveal as="div" className="about__portrait">
          <image-slot
            id={about.portrait.id}
            style={{ width: "100%", aspectRatio: "4 / 5" }}
            shape="rounded"
            radius="16"
            placeholder={about.portrait.placeholder}
          ></image-slot>
          <p className="about__sig">{about.sig}</p>
        </Reveal>
        <Reveal as="div" className="about__body">
          <h2 className="about__lead">{about.lead}</h2>
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="skills">
            {about.skills.map((col) => (
              <div className="skills__col" key={col.label}>
                <p className="skills__label">{col.label}</p>
                <ul>
                  {col.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
