// engine.ts — the real PDF engine behind the editor.
// pdf.js (pdfjs-dist) renders real pages, extracts text, and reads outlines.
// pdf-lib builds/edits documents and flattens annotations on export.
// Encryption (qpdf-wasm) is layered on in crypto.ts and called from exportPdf.

import * as pdfjsLib from "pdfjs-dist";
import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
  LineCapStyle,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { encryptPdf, decryptPdf } from "./crypto";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf-editor/pdf.worker.min.mjs";

export type PageSize = { w: number; h: number };
export type TocNode = { title: string; page: number; level: number; children: TocNode[] };

export type Annotation = {
  id: string;
  type: "text" | "highlight" | "draw" | "signature";
  x: number;
  y: number;
  w: number;
  h?: number;
  // text
  text?: string;
  family?: string;
  size?: number;
  weight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  // highlight
  opacity?: number;
  // draw
  points?: { x: number; y: number }[];
  width?: number;
  // signature
  sig?: { kind: "image" | "text"; data?: string; text?: string };
};

type Source = {
  id: string;
  bytes: Uint8Array; // decrypted, editable bytes (for pdf-lib)
  pdfjs: pdfjsLib.PDFDocumentProxy;
  password?: string;
};

const sources = new Map<string, Source>();
let seq = 0;

export class PasswordRequiredError extends Error {
  constructor() {
    super("password required");
    this.name = "PasswordRequiredError";
  }
}

export function getSource(docId: string): Source | undefined {
  return sources.get(docId);
}

/** Load a PDF: render-ready via pdf.js, edit-ready bytes for pdf-lib. */
export async function loadPdf(input: Uint8Array, password?: string): Promise<{ docId: string; sizes: PageSize[] }> {
  let bytes = input;
  // If the bytes are encrypted, decrypt to editable bytes first (qpdf). pdf.js
  // can render encrypted PDFs with a password, but pdf-lib cannot edit them.
  let pdfjs: pdfjsLib.PDFDocumentProxy;
  try {
    pdfjs = await pdfjsLib.getDocument({ data: bytes.slice(), password }).promise;
  } catch (e) {
    if ((e as { name?: string })?.name === "PasswordException") throw new PasswordRequiredError();
    throw e;
  }
  // Detect encryption: if a password was supplied (or the PDF is encrypted),
  // produce decrypted bytes so editing/export works.
  if (password) {
    try {
      bytes = await decryptPdf(bytes, password);
    } catch {
      /* fall back to original bytes; export may need re-supply */
    }
  }
  const id = "d" + ++seq;
  const sizes: PageSize[] = [];
  for (let i = 1; i <= pdfjs.numPages; i++) {
    const page = await pdfjs.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    sizes.push({ w: vp.width, h: vp.height });
  }
  sources.set(id, { id, bytes, pdfjs, password });
  return { docId: id, sizes };
}

/** Wrap an image file in a single-page PDF sized to the image. */
export async function imageToPdf(file: File): Promise<Uint8Array> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.create();
  const img = file.type.includes("png") ? await doc.embedPng(buf) : await doc.embedJpg(buf);
  const page = doc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  return doc.save();
}

/**
 * Render a source page into a canvas as an offscreen bitmap. Only the canvas
 * pixel dimensions are set (not its CSS size) — the caller styles it to fill a
 * point-sized sheet, so `quality` is just supersampling for zoom crispness.
 */
export async function renderPage(
  docId: string,
  srcIndex: number,
  quality: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const src = sources.get(docId);
  if (!src) return;
  const page = await src.pdfjs.getPage(srcIndex + 1);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vp = page.getViewport({ scale: quality * dpr });
  canvas.width = Math.floor(vp.width);
  canvas.height = Math.floor(vp.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
}

export type TextItem = { str: string; x: number; y: number; w: number; h: number };

/** Text items for a page in viewport@scale1 coordinates (y-down, top-left). */
export async function getPageText(docId: string, srcIndex: number): Promise<TextItem[]> {
  const src = sources.get(docId);
  if (!src) return [];
  const page = await src.pdfjs.getPage(srcIndex + 1);
  const vp = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items: TextItem[] = [];
  for (const it of content.items as Array<{ str: string; transform: number[]; width: number; height: number }>) {
    if (!it.str) continue;
    const tx = pdfjsLib.Util.transform(vp.transform, it.transform);
    const fontH = Math.hypot(tx[2], tx[3]);
    items.push({ str: it.str, x: tx[4], y: tx[5] - fontH, w: it.width, h: fontH });
  }
  return items;
}

/** Outline (bookmarks) → nested TOC; resolves destinations to page indexes. */
export async function getOutline(docId: string): Promise<TocNode[]> {
  const src = sources.get(docId);
  if (!src) return [];
  const outline = await src.pdfjs.getOutline().catch(() => null);
  if (!outline || !outline.length) return [];

  const pageIndexOf = async (dest: unknown): Promise<number> => {
    try {
      let explicit = dest;
      if (typeof dest === "string") explicit = await src.pdfjs.getDestination(dest);
      if (!Array.isArray(explicit)) return 0;
      const ref = explicit[0];
      return await src.pdfjs.getPageIndex(ref);
    } catch {
      return 0;
    }
  };

  type RawItem = { title: string; dest: unknown; items: RawItem[] };
  const walk = async (items: RawItem[], level: number): Promise<TocNode[]> => {
    const out: TocNode[] = [];
    for (const it of items) {
      const page = await pageIndexOf(it.dest);
      out.push({ title: it.title, page, level, children: it.items?.length ? await walk(it.items, level + 1) : [] });
    }
    return out;
  };
  return walk(outline as RawItem[], 0);
}

// ── find ─────────────────────────────────────────────────────────────────

const textCache = new Map<string, TextItem[]>();
async function cachedText(docId: string, srcIndex: number): Promise<TextItem[]> {
  const k = docId + ":" + srcIndex;
  let t = textCache.get(k);
  if (!t) {
    t = await getPageText(docId, srcIndex);
    textCache.set(k, t);
  }
  return t;
}

export type Match = { page: number; idx: number; rects: { x: number; y: number; w: number; h: number }[] };

/** Search the ordered pages for a query; returns matches in page-point coords. */
export async function searchPages(
  pages: { docId: string; srcIndex: number }[],
  query: string,
  matchCase: boolean,
): Promise<Match[]> {
  const q0 = (query || "").trim();
  if (!q0) return [];
  const q = matchCase ? q0 : q0.toLowerCase();
  const out: Match[] = [];
  let idx = 0;
  for (let pi = 0; pi < pages.length; pi++) {
    const p = pages[pi];
    const items = await cachedText(p.docId, p.srcIndex);
    for (const it of items) {
      const hay = matchCase ? it.str : it.str.toLowerCase();
      let i = hay.indexOf(q);
      while (i !== -1) {
        const per = it.w / Math.max(1, it.str.length);
        out.push({ page: pi, idx: idx++, rects: [{ x: it.x + i * per, y: it.y, w: per * q.length, h: it.h }] });
        i = hay.indexOf(q, i + q.length);
      }
    }
  }
  return out;
}

// ── table of contents ──────────────────────────────────────────────────────

export type TocEntry = { key: string; text: string; page: number; title?: boolean; children: TocEntry[] };

/** Build a 2-level TOC from a real outline (mapped to display indices); falls
    back to a per-page list when the PDF has no bookmarks. */
export async function buildToc(
  pages: { docId: string; srcIndex: number }[],
): Promise<{ nodes: TocEntry[]; generated: boolean }> {
  const displayOf = (docId: string, src: number) => pages.findIndex((p) => p.docId === docId && p.srcIndex === src);
  const nodes: TocEntry[] = [];
  for (const docId of new Set(pages.map((p) => p.docId))) {
    const outline = await getOutline(docId);
    for (const top of outline) {
      const di = displayOf(docId, top.page);
      if (di < 0) continue;
      const node: TocEntry = { key: docId + ":" + di + ":" + top.title, text: top.title, page: di, title: top.level === 0, children: [] };
      for (const c of top.children) {
        const cd = displayOf(docId, c.page);
        if (cd >= 0) node.children.push({ key: node.key + ":c:" + c.title, text: c.title, page: cd, children: [] });
      }
      nodes.push(node);
    }
  }
  nodes.sort((a, b) => a.page - b.page);
  if (nodes.length) return { nodes, generated: false };
  return { nodes: pages.map((_, i) => ({ key: "pg" + i, text: "Page " + (i + 1), page: i, children: [] })), generated: true };
}

// ── export ─────────────────────────────────────────────────────────────────

const HEX = (c: string): [number, number, number] => {
  let h = c.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function fontFor(doc: PDFDocument, family: string | undefined, weight: number | undefined, fonts: Map<string, PDFFont>) {
  const bold = (weight || 400) >= 600;
  const f = (family || "").toLowerCase();
  let name: StandardFonts;
  if (f.includes("mono") || f.includes("courier")) name = bold ? StandardFonts.CourierBold : StandardFonts.Courier;
  else if (f.includes("times") || f.includes("serif") || f.includes("newsreader")) name = bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
  else name = bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
  let cached = fonts.get(name);
  if (!cached) {
    cached = doc.embedStandardFont(name);
    fonts.set(name, cached);
  }
  return cached;
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (para === "") {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

async function flatten(doc: PDFDocument, page: PDFPage, annos: Annotation[], fonts: Map<string, PDFFont>) {
  const H = page.getHeight();
  for (const a of annos) {
    if (a.type === "highlight") {
      const [r, g, b] = HEX(a.color || "#FFE16A");
      page.drawRectangle({ x: a.x, y: H - a.y - (a.h || 0), width: a.w, height: a.h || 0, color: rgb(r, g, b), opacity: a.opacity ?? 0.4 });
    } else if (a.type === "draw" && a.points) {
      const [r, g, b] = HEX(a.color || "#1A1D21");
      for (let i = 0; i < a.points.length - 1; i++) {
        const p0 = a.points[i];
        const p1 = a.points[i + 1];
        page.drawLine({
          start: { x: a.x + p0.x, y: H - (a.y + p0.y) },
          end: { x: a.x + p1.x, y: H - (a.y + p1.y) },
          thickness: a.width || 2,
          color: rgb(r, g, b),
          lineCap: LineCapStyle.Round,
        });
      }
    } else if (a.type === "text" && a.text) {
      const size = a.size || 16;
      const font = fontFor(doc, a.family, a.weight, fonts);
      const [r, g, b] = HEX(a.color || "#1A1D21");
      const lines = wrap(a.text, font, size, a.w);
      const lh = size * 1.4;
      lines.forEach((ln, i) => {
        let x = a.x;
        if (a.align === "center") x = a.x + (a.w - font.widthOfTextAtSize(ln, size)) / 2;
        else if (a.align === "right") x = a.x + (a.w - font.widthOfTextAtSize(ln, size));
        page.drawText(ln, { x, y: H - a.y - size - i * lh, size, font, color: rgb(r, g, b) });
      });
    } else if (a.type === "signature" && a.sig) {
      const h = a.h || a.w * 0.4;
      if (a.sig.kind === "image" && a.sig.data) {
        const png = await doc.embedPng(a.sig.data);
        page.drawImage(png, { x: a.x, y: H - a.y - h, width: a.w, height: h });
      } else if (a.sig.text) {
        const font = doc.embedStandardFont(StandardFonts.TimesRomanItalic);
        page.drawText(a.sig.text, { x: a.x + 6, y: H - a.y - h * 0.6, size: h * 0.5, font, color: rgb(0.08, 0.14, 0.25) });
      }
    }
  }
}

export type PageRef = { docId: string; srcIndex: number; rotation?: number };

/** Build a new PDF from ordered page refs, applying rotation + flattened annotations. */
export async function buildPdf(
  refs: PageRef[],
  annotations: Record<string, Annotation[]>,
  pageIds: string[],
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const loaded = new Map<string, PDFDocument>();
  const fonts = new Map<string, PDFFont>();
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    let srcDoc = loaded.get(ref.docId);
    if (!srcDoc) {
      const src = sources.get(ref.docId);
      if (!src) continue;
      srcDoc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      loaded.set(ref.docId, srcDoc);
    }
    const [copied] = await out.copyPages(srcDoc, [ref.srcIndex]);
    if (ref.rotation) copied.setRotation(degrees(((copied.getRotation().angle || 0) + ref.rotation) % 360));
    out.addPage(copied);
    const annos = annotations[pageIds[i]];
    if (annos && annos.length) await flatten(out, copied, annos, fonts);
  }
  return out.save();
}

export async function exportPdf(
  refs: PageRef[],
  annotations: Record<string, Annotation[]>,
  pageIds: string[],
  opts?: { password?: string; perms?: { print: boolean; copy: boolean; edit: boolean } },
): Promise<Uint8Array> {
  let bytes = await buildPdf(refs, annotations, pageIds);
  if (opts?.password) bytes = await encryptPdf(bytes, opts.password, opts.perms);
  return bytes;
}
