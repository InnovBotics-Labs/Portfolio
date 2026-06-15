# Prabhukumar Sivamoorthy — Portfolio

A single-page personal portfolio (Staff Engineer @ SanDisk), ported from a
[Claude Design](https://claude.ai/design) prototype ("Portfolio – Photo Hero")
into a production Next.js app.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion.

## Run it

```bash
npm run dev      # dev server → http://localhost:3000
npm run build    # production build
npm run lint     # eslint
npm run start    # serve the production build
```

## Structure

```
app/
  layout.tsx       root shell: fonts, theme init, Atmosphere, Nav/Portal, Footer, vendored scripts
  page.tsx         section composition (Hero → Marquee → AppStore → Work → About → Experience → Contact)
  globals.css      the design system, ported verbatim from the prototype (OKLCH tokens, 3 palettes × light/dark)
  api/image-slots  empty <image-slot> sidecar (served at /.image-slots.state.json via a rewrite)
components/
  ThemeProvider    theme / palette / accent / grain / 3D-backdrop state + localStorage; drives window.BG3D
  Reveal           Framer Motion scroll-reveal wrapper (replaces the prototype's .reveal + IntersectionObserver)
  Nav / Portal / Footer / BrandDot / Atmosphere
  sections/        Hero, Marquee, AppStore, Work, About, Experience, Contact
lib/content.ts     all copy (edit content here, not in markup)
public/
  bg3d.js          3D particle backdrop — ported verbatim from the prototype
  image-slot.js    drag-drop image placeholder web component — ported verbatim
  apps/            App Store sub-pages + gradient icons
```

## Theming

Theme, film grain, and the 3D backdrop are controlled by the **settings gear**
in the footer; choices persist in `localStorage`. Authored defaults: light
theme, ink palette, emerald accent, grain on, 3D on.

## TODO (placeholders to fill in)

- **Photos** — the `<image-slot>` slots show placeholders. They only persist
  drops inside the Claude Design runtime; for this site, replace each
  `<image-slot>` (hero portrait, About portrait, project shots) with a real
  `<img>` / `next/image` pointing at files in `public/`.
- **`resume.pdf`** — both résumé buttons link to `/resume.pdf`; drop the real
  file into `public/`.
- **Contact form** — currently a client-side demo; wire it to a real endpoint.
- **Portal** — sign-in/register is a front-end demo; connect a real auth provider.
