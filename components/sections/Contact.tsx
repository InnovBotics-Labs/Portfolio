"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { contact } from "@/lib/content";
import { Reveal } from "../Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Contact: intro + links on the left, a (demo) message form on the right. */
export function Contact() {
  const reduce = useReducedMotion();
  const [note, setNote] = useState<{ text: string; color: string }>({ text: "", color: "" });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();
    if (!name || !email || !message) {
      setNote({ text: "Please fill in every field.", color: "oklch(0.7 0.15 30)" });
      return;
    }
    setNote({ text: `Thanks, ${name.split(" ")[0]} — message noted. I'll be in touch.`, color: "var(--accent)" });
    form.reset();
  };

  const formMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -8% 0px" },
        transition: { duration: 0.8, ease: EASE },
      };

  return (
    <section className="section contact" id="contact">
      <div className="contact__grid">
        <Reveal as="div" className="contact__intro">
          <p className="section__num">{contact.num}</p>
          <h2 className="contact__title">
            {contact.title[0]}
            <br />
            <em>{contact.title[1]}</em>
          </h2>
          <p className="contact__lede">{contact.lede}</p>
          <ul className="contact__links">
            {contact.links.map((l) => (
              <li key={l.k}>
                <span className="contact__k">{l.k}</span>
                <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener" } : {})}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <motion.form className="contact__form" onSubmit={onSubmit} noValidate {...formMotion}>
          <div className="field">
            <label htmlFor="cf-name">Name</label>
            <input id="cf-name" name="name" type="text" autoComplete="name" required placeholder="Jane Recruiter" />
          </div>
          <div className="field">
            <label htmlFor="cf-email">Email</label>
            <input id="cf-email" name="email" type="email" autoComplete="email" required placeholder="jane@company.com" />
          </div>
          <div className="field">
            <label htmlFor="cf-msg">Message</label>
            <textarea id="cf-msg" name="message" rows={4} required placeholder="A line about the role or project…"></textarea>
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            Send message <span className="btn__arrow">→</span>
          </button>
          <p className="contact__note" role="status" aria-live="polite" style={{ color: note.color }}>
            {note.text}
          </p>
        </motion.form>
      </div>
    </section>
  );
}
