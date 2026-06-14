import { appStore } from "@/lib/content";
import { Reveal } from "../Reveal";

/** Glassmorphic file-explorer "App Store": tools grouped into category folders. */
export function AppStore() {
  return (
    <section className="section appstore" id="apps">
      <Reveal as="div" className="section__head">
        <p className="section__num">{appStore.num}</p>
        <h2 className="section__title">{appStore.title}</h2>
      </Reveal>
      <Reveal as="div" className="explorer">
        <div className="explorer__bar">
          <span className="explorer__dots">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="explorer__path">{appStore.bar.path}</span>
          <span className="explorer__meta">{appStore.bar.meta}</span>
        </div>
        <div className="explorer__body">
          {appStore.folders.map((folder) => (
            <div className="folder" key={folder.label}>
              <p className="folder__label">{folder.label}</p>
              <div className="folder__grid">
                {folder.apps.map((app) => (
                  <a
                    key={app.id}
                    className="appicon"
                    href={app.href}
                    target="_blank"
                    rel="noopener"
                    style={{ "--h": app.h }}
                  >
                    <span className="appicon__tile">
                      <image-slot
                        id={app.id}
                        style={{ width: "100%", height: "100%" }}
                        shape="rounded"
                        radius="16"
                        src={app.icon}
                        placeholder="Icon"
                      ></image-slot>
                    </span>
                    <span className="appicon__name">{app.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal as="p" className="appstore__note">
        Each icon opens its tool in a new tab — drag your own icon onto any tile to customise.{" "}
        <a href="#contact">Want one added?</a>
      </Reveal>
    </section>
  );
}
