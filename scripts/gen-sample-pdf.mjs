// Generates a real multi-page sample PDF for the editor's "Load sample document".
// Run: node scripts/gen-sample-pdf.mjs  → public/pdf-editor/sample.pdf
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "node:fs";

const W = 612, H = 792; // US Letter, points
const ink = rgb(0.14, 0.16, 0.18);
const dim = rgb(0.36, 0.4, 0.44);
const accent = rgb(0.15, 0.32, 0.75);

const doc = await PDFDocument.create();
doc.setTitle("Master Services Agreement — Northwind Logistics");
const reg = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const serif = await doc.embedFont(StandardFonts.TimesRomanBold);

const header = (page, n) => {
  page.drawText("Northwind Logistics", { x: 56, y: H - 56, size: 11, font: bold, color: ink });
  page.drawText(`MSA · NW-2026-0417`, { x: W - 200, y: H - 56, size: 9, font: reg, color: dim });
  page.drawLine({ start: { x: 56, y: H - 66 }, end: { x: W - 56, y: H - 66 }, thickness: 0.7, color: rgb(0.9, 0.91, 0.93) });
  page.drawText(`Page ${n} of 5`, { x: W / 2 - 28, y: 40, size: 9, font: reg, color: dim });
};

const para = (page, y, lines, font = reg, size = 11, color = ink, lh = 16) => {
  lines.forEach((ln, i) => page.drawText(ln, { x: 56, y: y - i * lh, size, font, color }));
  return y - lines.length * lh;
};

const PAGES = [
  {
    title: "Master Services Agreement",
    body: [
      "This Master Services Agreement (the “Agreement”) governs the provision",
      "of cloud infrastructure and managed services between the parties identified",
      "below. By executing this Agreement the parties agree to the following terms.",
      "",
      "CLIENT:  Northwind Logistics, Inc. — 4400 Harbor Parkway, Seattle, WA 98104",
      "PROVIDER: Atlas Cloud Systems, LLC — 910 Market Street, San Francisco, CA",
    ],
  },
  {
    title: "1. Definitions  ·  2. Provision of Services",
    body: [
      "1.1 “Services” means the cloud hosting, storage, and managed operations",
      "described in each Statement of Work executed under this Agreement.",
      "1.2 “Confidential Information” means non-public information disclosed by a",
      "party that is marked or reasonably understood to be confidential.",
      "",
      "2.1 The Provider shall perform the Services with reasonable skill and care in",
      "accordance with the service levels set out in Schedule A.",
    ],
  },
  {
    title: "3. Fees and Payment  ·  4. Service Level Commitments",
    body: [
      "3.1 The Client shall pay the fees set out in the applicable Statement of Work",
      "within thirty (30) days of the invoice date.",
      "4.1 The Provider commits to 99.95% monthly uptime for production workloads.",
      "4.2 Service credits accrue per the Service Credit Schedule when uptime falls",
      "below the committed threshold in any calendar month.",
    ],
  },
  {
    title: "5. Confidentiality  ·  6. Data Protection & Security",
    body: [
      "5.1 Each party shall protect the other's Confidential Information using no",
      "less than reasonable care and shall not disclose it to third parties.",
      "6.1 The Provider maintains an information security program aligned to ISO",
      "27001 and SOC 2 Type II, including encryption in transit and at rest.",
      "6.2 The Provider shall notify the Client of any data breach without undue",
      "delay and in any event within seventy-two (72) hours.",
    ],
  },
  {
    title: "11. Execution",
    body: [
      "IN WITNESS WHEREOF, the parties have executed this Agreement as of the",
      "Effective Date by their duly authorized representatives.",
      "",
      "CLIENT — Northwind Logistics, Inc.",
      "Signature: ____________________________   Date: ______________",
      "",
      "PROVIDER — Atlas Cloud Systems, LLC",
      "Signature: ____________________________   Date: ______________",
    ],
  },
];

PAGES.forEach((p, i) => {
  const page = doc.addPage([W, H]);
  header(page, i + 1);
  page.drawText("AGREEMENT", { x: 56, y: H - 110, size: 9, font: bold, color: accent });
  let y = H - 140;
  // title (wrap-free, two-size)
  page.drawText(p.title, { x: 56, y, size: 22, font: serif, color: ink });
  y -= 44;
  para(page, y, p.body);
});

const bytes = await doc.save();
writeFileSync(new URL("../public/pdf-editor/sample.pdf", import.meta.url), bytes);
console.log("wrote public/pdf-editor/sample.pdf", bytes.length, "bytes");
