'use client';
/*
 * PDF Editor ("Prabhu's PDF") — ported from the Claude Design prototype.
 * The prototype's 9 global-scope JSX files are concatenated here into one
 * client module (preserving their shared-scope semantics) with a single React
 * import. The host-only Tweaks edit panel was dropped; settings are driven by
 * the in-app gear menu. Source order matches the prototype's <script> order.
 */
import React from "react";
import { createPortal } from "react-dom";
const { useState, useRef, useEffect, useCallback, useMemo } = React;
const ReactDOM = { createPortal };

/* ════════════════════ icons.jsx ════════════════════ */
// icons.jsx — consistent 24px line icons, 1.6 stroke, currentColor.
// Exposes a single <Icon name="…" /> component + Logo mark.

const ICON_PATHS = {
  // ── Tools ──
  select: 'M5 3.5 19 11l-6.2 1.6L10.5 19 5 3.5Z',
  text: 'M5 6.5V5h14v1.5M12 5v14M9 19h6',
  highlight: 'M4 19h6M9.5 14.5 13 18l6-6.5-3.5-3.5L9.5 14.5ZM9.5 14.5l-1.5 3.5 3.5-1.5',
  draw: 'M5 19l1-3.5L15.5 6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L9 18.5 5 19ZM14 7.5l2.5 2.5',
  signature: 'M4 17c2-.5 3-4 3.5-6.5C8 8 6.5 14 8 14.5s2-7 3.5-7 .5 6 2 6 2.5-3 3.5-3M4 19.5h16',
  merge: 'M8 4H5a1 1 0 0 0-1 1v6M16 4h3a1 1 0 0 1 1 1v6M9 20h6a1 1 0 0 0 1-1v-7H8v7a1 1 0 0 0 1 1Z',
  split: 'M12 3v18M7 8 4 11l3 3M17 8l3 3-3 3',

  // ── App bar / actions ──
  save: 'M5 5a1 1 0 0 1 1-1h10l3 3v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5ZM8 4v4h7V4M8 19v-5h8v5',
  download: 'M12 4v10m0 0 4-4m-4 4-4-4M5 18h14',
  protect: 'M12 3.5 19 6v5c0 4.2-2.9 7.5-7 8.5-4.1-1-7-4.3-7-8.5V6l7-2.5ZM12 11v3M12 9.6a1 1 0 1 0 0 .01',
  lock: 'M7 10V8a5 5 0 0 1 10 0v2M5.5 10h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
  unlock: 'M7 10V8a5 5 0 0 1 9.6-2M5.5 10h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',

  // ── Zoom / nav ──
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  fitWidth: 'M4 8v8M20 8v8M8 12h8m0 0-2.5-2.5M16 12l-2.5 2.5M8 12l2.5-2.5M8 12l2.5 2.5',
  chevronLeft: 'M14.5 6 8.5 12l6 6',
  chevronRight: 'M9.5 6l6 6-6 6',
  chevronDown: 'M6 9.5 12 15.5l6-6',
  chevronUp: 'M6 14.5 12 8.5l6 6',

  // ── Panels ──
  thumbs: 'M4 5h16M4 12h16M4 19h16',
  panel: 'M4 5h16v14H4V5Zm10 0v14',
  collapseRight: 'M4 5h16v14H4V5Zm10 0v14M17 9.5 14.5 12 17 14.5',

  // ── Thumbnail menu ──
  rotate: 'M19 12a7 7 0 1 1-2.5-5.4M19 4v3h-3',
  duplicate: 'M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1',
  trash: 'M5 7h14M10 7V5h4v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M10 11v6M14 11v6',
  more: 'M12 6a1 1 0 1 0 .01 0M12 12a1 1 0 1 0 .01 0M12 18a1 1 0 1 0 .01 0',
  dragHandle: 'M9 6a1 1 0 1 0 .01 0M9 12a1 1 0 1 0 .01 0M9 18a1 1 0 1 0 .01 0M15 6a1 1 0 1 0 .01 0M15 12a1 1 0 1 0 .01 0M15 18a1 1 0 1 0 .01 0',

  // ── Misc UI ──
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5 10 17.5 19 7',
  undo: 'M9 7 5 11l4 4M5 11h9a5 5 0 0 1 0 10h-3',
  redo: 'M15 7l4 4-4 4M19 11h-9a5 5 0 0 0 0 10h3',
  upload: 'M12 16V6m0 0L8 10m4-4 4 4M5 16v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2',
  file: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5',
  image: 'M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 4a1 1 0 1 0 .01 0M5 16l4-4 3 3 3.5-3.5L20 15.5',
  word: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5M8.5 12l1.2 5 1.3-3.5L12.3 17l1.2-5',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  eyeOff: 'M4 4l16 16M9.5 9.6A2.5 2.5 0 0 0 12 14.5a2.5 2.5 0 0 0 2.4-1.9M6.5 6.7C4 8.4 2.5 12 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.6-.8M11 5.6c.3 0 .7-.1 1-.1 6 0 9.5 6.5 9.5 6.5s-.8 1.5-2.2 3',
  info: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 7v5m0-8a.6.6 0 1 0 .01 0',

  // ── Text formatting ──
  bold: 'M7 5h6a3.5 3.5 0 0 1 0 7H7V5Zm0 7h7a3.5 3.5 0 0 1 0 7H7v-7Z',
  italic: 'M10 5h7M7 19h7M14 5l-4 14',
  underline: 'M7 4v6a5 5 0 0 0 10 0V4M5 20h14',
  alignLeft: 'M4 6h16M4 11h10M4 16h13',
  alignCenter: 'M4 6h16M7 11h10M5 16h14',
  alignRight: 'M4 6h16M10 11h10M7 16h13',

  // ── Type / brush ──
  type: 'M4 7V5h16v2M12 5v14M9 19h6',
  brush: 'M5 19l1-3.5L15.5 6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L9 18.5 5 19Z',
  pen: 'M16.5 3.5 20.5 7.5 9 19l-4 1 1-4L16.5 3.5Z',
  keyboard: 'M4 7h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm3 3h.01M11 10h.01M15 10h.01M7 13.5h10',
  refresh: 'M19 12a7 7 0 1 1-2-4.9M19 4v3.5h-3.5',

  // ── Settings / theme ──
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM19.4 13a7.8 7.8 0 0 0 .05-2l1.7-1.3-1.7-3-2 .8a7.7 7.7 0 0 0-1.7-1l-.3-2.1H9.6l-.3 2.1a7.7 7.7 0 0 0-1.7 1l-2-.8-1.7 3L5.6 11a7.8 7.8 0 0 0 0 2l-1.7 1.3 1.7 3 2-.8a7.7 7.7 0 0 0 1.7 1l.3 2.1h3.9l.3-2.1a7.7 7.7 0 0 0 1.7-1l2 .8 1.7-3L19.4 13Z',
  folder: 'M3.5 6.5a2 2 0 0 1 2-2h3.4l2 2.4h7.6a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6.5Z',
  edit: 'M5 19l1-3.5L15.5 6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L9 18.5 5 19ZM14 7.5l2.5 2.5',
  sun: 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z',
  monitor: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM9 20h6M12 16v4',
};

function Icon({ name, size = 20, stroke = 1.6, fill = false, style, className }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         className={className}
         style={{ display: 'block', flexShrink: 0, ...style }}
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} />
    </svg>
  );
}

function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true"
         style={{ display: 'block', flexShrink: 0 }}>
      {/* page with a folded top-right corner */}
      <path d="M7.5 2.5h9.2L23 8.8V21a3.5 3.5 0 0 1-3.5 3.5h-12A3.5 3.5 0 0 1 4 21V6A3.5 3.5 0 0 1 7.5 2.5Z" fill="var(--accent)" />
      <path d="M16.5 2.6V7a1.5 1.5 0 0 0 1.5 1.5h4.4" fill="rgba(255,255,255,.22)" />
      {/* faint text lines */}
      <path d="M8.5 11h7M8.5 13.6h9" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      {/* PDF badge tab */}
      <rect x="2.5" y="16.4" width="22.5" height="7.2" rx="1.9" fill="var(--accent-strong)" />
      <text x="13.7" y="21.85" textAnchor="middle" fill="#fff"
            fontFamily="var(--ui-font)" fontSize="5.4" fontWeight="800" letterSpacing="0.4">PDF</text>
    </svg>
  );
}

Object.assign(window, { Icon, LogoMark, ICON_PATHS });

/* ════════════════════ sampleDoc.jsx ════════════════════ */
// sampleDoc.jsx — a realistic multi-page business document used by the demo's
// "load sample" action. Pages render as styled HTML text (one source of truth
// for both the canvas sheet and the thumbnail preview, via CSS transform scale).

const PAGE_W = 816;   // US Letter @ 96dpi
const PAGE_H = 1056;

const SAMPLE_DOC = {
  name: 'Master Services Agreement — Northwind & Atlas.pdf',
  pages: [
    { id: 'p1', type: 'cover' },
    { id: 'p2', type: 'body-1' },
    { id: 'p3', type: 'body-2' },
    { id: 'p4', type: 'body-3' },
    { id: 'p5', type: 'signature' },
  ],
};

const docStyle = {
  page: {
    width: PAGE_W, height: PAGE_H, background: 'var(--doc-bg)', position: 'relative',
    fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--doc-fg)',
    padding: '92px 96px', boxSizing: 'border-box', overflow: 'hidden',
  },
  kicker: {
    fontFamily: 'var(--ui-font)', fontSize: 12, letterSpacing: '.22em',
    textTransform: 'uppercase', color: 'var(--doc-accent)', fontWeight: 600,
  },
  h1: { fontSize: 38, lineHeight: 1.18, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-.01em' },
  secNum: {
    fontFamily: 'var(--ui-font)', fontSize: 13, fontWeight: 700,
    color: 'var(--doc-accent)', letterSpacing: '.02em',
  },
  secTitle: { fontSize: 17, fontWeight: 700, margin: '0 0 8px' },
  p: { fontSize: 13.5, lineHeight: 1.72, margin: '0 0 14px', color: 'var(--doc-fg-2)', textAlign: 'justify' },
  small: { fontSize: 12, lineHeight: 1.6, color: 'var(--doc-fg-3)' },
};

function PageHeader({ n }) {
  return (
    <div style={{
      position: 'absolute', top: 40, left: 96, right: 96,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'var(--ui-font)', fontSize: 10.5, letterSpacing: '.08em',
      color: 'var(--doc-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--doc-line)',
      paddingBottom: 8,
    }}>
      <span>Master Services Agreement</span>
      <span>Confidential</span>
    </div>
  );
}
function PageFooter({ n }) {
  return (
    <div style={{
      position: 'absolute', bottom: 44, left: 96, right: 96,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'var(--ui-font)', fontSize: 10.5, color: 'var(--doc-muted)',
      borderTop: '1px solid var(--doc-line)', paddingTop: 8,
    }}>
      <span>Northwind Logistics, Inc. · Atlas Cloud Systems</span>
      <span>Page {n} of 5</span>
    </div>
  );
}

function Clause({ num, title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
        <span style={docStyle.secNum}>{num}</span>
        <h3 style={docStyle.secTitle}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CoverPage() {
  return (
    <div style={docStyle.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 120 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontFamily: 'var(--ui-font)', fontWeight: 800, fontSize: 17 }}>N</span>
        </div>
        <span style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 15, letterSpacing: '.02em' }}>
          Northwind Logistics
        </span>
      </div>

      <div style={docStyle.kicker}>Agreement No. NW-2026-0417</div>
      <h1 style={{ ...docStyle.h1, marginTop: 18, fontSize: 46 }}>Master Services<br />Agreement</h1>
      <p style={{ ...docStyle.small, maxWidth: 460, marginTop: 14, fontSize: 14 }}>
        This Master Services Agreement (the “Agreement”) governs the provision of cloud
        infrastructure and managed services between the parties identified below.
      </p>

      <div style={{
        marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28,
        maxWidth: 540,
      }}>
        {[
          ['Client', 'Northwind Logistics, Inc.', '4400 Harbor Parkway, Seattle, WA 98104'],
          ['Provider', 'Atlas Cloud Systems, LLC', '910 Market Street, Suite 1200, San Francisco, CA 94102'],
        ].map(([role, name, addr]) => (
          <div key={role}>
            <div style={{ ...docStyle.kicker, fontSize: 10.5, color: 'var(--doc-muted)' }}>{role}</div>
            <div style={{ fontSize: 15, fontWeight: 700, margin: '6px 0 4px' }}>{name}</div>
            <div style={docStyle.small}>{addr}</div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 92, left: 96, right: 96,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ ...docStyle.kicker, fontSize: 10.5, color: 'var(--doc-muted)' }}>Effective Date</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>April 17, 2026</div>
        </div>
        <div style={{ ...docStyle.small, textAlign: 'right' }}>
          Term: 36 months · Auto-renewing<br />Governing Law: State of Delaware
        </div>
      </div>
    </div>
  );
}

function BodyPage1() {
  return (
    <div style={docStyle.page}>
      <PageHeader />
      <div style={{ marginTop: 18 }}>
        <Clause num="1." title="Definitions">
          <p style={docStyle.p}>
            Capitalized terms used in this Agreement have the meanings set forth in this Section 1.
            “Services” means the cloud hosting, monitoring, and support services described in the
            applicable Statement of Work. “Confidential Information” means any non-public information
            disclosed by one party to the other, whether orally or in writing, that is designated as
            confidential or that reasonably should be understood to be confidential.
          </p>
          <p style={docStyle.p}>
            “Service Levels” means the availability and performance commitments set forth in Exhibit A.
            “Authorized Users” means employees and contractors of the Client who are permitted to access
            the Services.
          </p>
        </Clause>
        <Clause num="2." title="Provision of Services">
          <p style={docStyle.p}>
            Provider shall provide the Services in accordance with the terms of this Agreement and each
            Statement of Work. Provider will use commercially reasonable efforts to make the Services
            available 99.95% of the time, measured monthly, excluding scheduled maintenance windows
            communicated at least seventy-two (72) hours in advance.
          </p>
          <p style={docStyle.p}>
            Provider may modify the Services from time to time, provided that such modifications do not
            materially degrade the functionality or security posture relied upon by the Client.
          </p>
        </Clause>
        <Clause num="3." title="Fees and Payment">
          <p style={docStyle.p}>
            Client shall pay the fees set forth in the applicable Statement of Work. Unless otherwise
            specified, all invoices are due within thirty (30) days of receipt. Amounts not paid when due
            shall accrue interest at the lesser of 1.5% per month or the maximum rate permitted by law.
          </p>
        </Clause>
      </div>
      <PageFooter n={2} />
    </div>
  );
}

function BodyPage2() {
  return (
    <div style={docStyle.page}>
      <PageHeader />
      <div style={{ marginTop: 18 }}>
        <Clause num="4." title="Service Level Commitments">
          <p style={docStyle.p}>
            Provider commits to the monthly availability targets and corresponding service credits set
            forth in the table below. Service credits are the Client’s sole and exclusive remedy for any
            failure by Provider to meet the applicable Service Levels.
          </p>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--ui-font)',
            fontSize: 12.5, margin: '4px 0 16px',
          }}>
            <thead>
              <tr style={{ background: 'var(--doc-th-bg)' }}>
                {['Monthly Uptime', 'Classification', 'Service Credit'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontWeight: 700, color: 'var(--doc-fg-2)', borderBottom: '1.5px solid var(--doc-th-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['≥ 99.95%', 'Target met', 'None'],
                ['99.0% – 99.95%', 'Minor breach', '10% of monthly fee'],
                ['95.0% – 99.0%', 'Material breach', '25% of monthly fee'],
                ['< 95.0%', 'Severe breach', '50% of monthly fee'],
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--doc-tr-border)' }}>
                  {r.map((c, j) => (
                    <td key={j} style={{ padding: '8px 12px', color: j === 0 ? 'var(--doc-fg)' : 'var(--doc-fg-3)', fontWeight: j === 0 ? 600 : 400 }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Clause>
        <Clause num="5." title="Confidentiality">
          <p style={docStyle.p}>
            Each party agrees to protect the Confidential Information of the other party using the same
            degree of care it uses to protect its own confidential information, but in no event less than
            a reasonable degree of care. Neither party shall disclose Confidential Information to any third
            party except as expressly permitted herein.
          </p>
        </Clause>
        <Clause num="6." title="Data Protection and Security">
          <p style={docStyle.p}>
            Provider shall maintain an information security program consistent with industry standards,
            including SOC 2 Type II controls, encryption of data in transit and at rest, and annual
            third-party penetration testing. Provider shall notify Client without undue delay upon
            becoming aware of any confirmed security incident affecting Client data.
          </p>
        </Clause>
      </div>
      <PageFooter n={3} />
    </div>
  );
}

function BodyPage3() {
  return (
    <div style={docStyle.page}>
      <PageHeader />
      <div style={{ marginTop: 18 }}>
        <Clause num="7." title="Term and Termination">
          <p style={docStyle.p}>
            This Agreement commences on the Effective Date and continues for an initial term of
            thirty-six (36) months, after which it automatically renews for successive twelve (12) month
            periods unless either party provides written notice of non-renewal at least sixty (60) days
            prior to the end of the then-current term.
          </p>
          <p style={docStyle.p}>
            Either party may terminate this Agreement for material breach if such breach remains uncured
            thirty (30) days after written notice. Upon termination, Provider shall make Client data
            available for export for a period of ninety (90) days.
          </p>
        </Clause>
        <Clause num="8." title="Limitation of Liability">
          <p style={docStyle.p}>
            Except for breaches of confidentiality or indemnification obligations, neither party’s
            aggregate liability arising out of this Agreement shall exceed the total fees paid by Client
            in the twelve (12) months preceding the event giving rise to the claim. In no event shall
            either party be liable for indirect, incidental, or consequential damages.
          </p>
        </Clause>
        <Clause num="9." title="Indemnification">
          <p style={docStyle.p}>
            Provider shall defend, indemnify, and hold harmless Client from third-party claims alleging
            that the Services infringe any intellectual property right, provided that Client promptly
            notifies Provider of such claim and grants Provider sole control of the defense.
          </p>
        </Clause>
        <Clause num="10." title="General Provisions">
          <p style={docStyle.p}>
            This Agreement constitutes the entire understanding between the parties and supersedes all
            prior agreements. Any amendment must be in writing and signed by authorized representatives of
            both parties. If any provision is held unenforceable, the remaining provisions shall remain in
            full force and effect.
          </p>
        </Clause>
      </div>
      <PageFooter n={4} />
    </div>
  );
}

function SignaturePage() {
  return (
    <div style={docStyle.page}>
      <PageHeader />
      <div style={{ marginTop: 18 }}>
        <Clause num="11." title="Execution">
          <p style={docStyle.p}>
            IN WITNESS WHEREOF, the parties have caused this Agreement to be executed by their duly
            authorized representatives as of the Effective Date first written above.
          </p>
        </Clause>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 56 }}>
          {[
            ['NORTHWIND LOGISTICS, INC.', 'Eleanor Vance', 'Chief Operating Officer'],
            ['ATLAS CLOUD SYSTEMS, LLC', 'Marcus Reyes', 'VP, Enterprise Solutions'],
          ].map(([co, name, title]) => (
            <div key={co}>
              <div style={{ ...docStyle.kicker, fontSize: 10.5, color: 'var(--doc-muted)', marginBottom: 44 }}>{co}</div>
              <div style={{ borderTop: '1.5px solid var(--doc-rule)', paddingTop: 8 }}>
                <div style={{ ...docStyle.small, fontFamily: 'var(--ui-font)' }}>Signature</div>
              </div>
              <div style={{ marginTop: 22, borderTop: '1.5px solid var(--doc-rule)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                  <div style={docStyle.small}>{title}</div>
                </div>
                <div style={{ ...docStyle.small, fontFamily: 'var(--ui-font)', alignSelf: 'flex-end' }}>Date</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 80, padding: '18px 20px', borderRadius: 8, background: 'var(--doc-subtle-bg)',
          border: '1px solid var(--doc-subtle-border)', fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--doc-fg-3)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--doc-fg-2)' }}>Exhibit A — Service Level Schedule</strong> and
          <strong style={{ color: 'var(--doc-fg-2)' }}> Exhibit B — Data Processing Addendum</strong> are
          attached and incorporated herein by reference. This signature page may be executed in counterparts,
          each of which shall be deemed an original.
        </div>
      </div>
      <PageFooter n={5} />
    </div>
  );
}

function SamplePageContent({ type }) {
  switch (type) {
    case 'cover': return <CoverPage />;
    case 'body-1': return <BodyPage1 />;
    case 'body-2': return <BodyPage2 />;
    case 'body-3': return <BodyPage3 />;
    case 'signature': return <SignaturePage />;
    default: return <div style={docStyle.page} />;
  }
}

Object.assign(window, { SAMPLE_DOC, SamplePageContent, PAGE_W, PAGE_H });

/* ════════════════════ chrome.jsx ════════════════════ */
// chrome.jsx — app frame: TopBar, LeftToolbar, StatusBar, Toasts + shared
// Tooltip / Popover primitives. All state comes in via props from App.

// ── Tooltip ─────────────────────────────────────────────────────────────────
function Tip({ label, kbd, side = 'right', children }) {
  const ref = React.useRef(null);
  const [tip, setTip] = React.useState(null);
  const show = () => {
    const r = ref.current.getBoundingClientRect();
    let x, y;
    if (side === 'right') {x = r.right + 9;y = r.top + r.height / 2;} else
    if (side === 'bottom') {x = r.left + r.width / 2;y = r.bottom + 9;} else
    {x = r.left + r.width / 2;y = r.top - 9;}
    setTip({ x, y });
  };
  const hide = () => setTip(null);
  const transform = side === 'right' ? 'translateY(-50%)' :
  side === 'bottom' ? 'translateX(-50%)' : 'translate(-50%,-100%)';
  return (
    <>
      {React.cloneElement(children, { ref, onMouseEnter: show, onMouseLeave: hide, onMouseDown: hide })}
      {tip && ReactDOM.createPortal(
        <div className="tt show" style={{ left: tip.x, top: tip.y, transform }}>
          {label}{kbd && <span className="kbd">{kbd}</span>}
        </div>, document.body)}
    </>);

}

// ── Popover (anchored menu) ───────────────────────────────────────────────────
function Popover({ anchorRect, onClose, align = 'left', children }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDown = (e) => {if (ref.current && !ref.current.contains(e.target)) onClose();};
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    document.addEventListener('keydown', onKey);
    return () => {document.removeEventListener('mousedown', onDown);document.removeEventListener('keydown', onKey);};
  }, [onClose]);
  if (!anchorRect) return null;
  const left = align === 'right' ? anchorRect.right - 172 : anchorRect.left;
  return ReactDOM.createPortal(
    <div ref={ref} className="menu" style={{ left: Math.max(8, left), top: anchorRect.bottom + 6 }}>
      {children}
    </div>, document.body);
}

const TOOLS = [
{ id: 'select', icon: 'select', label: 'Select', kbd: 'V' },
{ id: 'text', icon: 'text', label: 'Add Text', kbd: 'T' },
{ id: 'highlight', icon: 'highlight', label: 'Highlight', kbd: 'H' },
{ id: 'draw', icon: 'draw', label: 'Draw', kbd: 'D' },
{ id: 'signature', icon: 'signature', label: 'Signature', kbd: 'S' },
{ sep: true },
{ id: 'merge', icon: 'merge', label: 'Merge files', kbd: 'M' },
{ id: 'split', icon: 'split', label: 'Split pages', kbd: 'P' }];


// ── Left toolbar ──────────────────────────────────────────────────────────────
function LeftToolbar({ activeTool, onTool, disabled, onOpenSettings, settingsOpen }) {
  return (
    <nav className="toolbar" aria-label="Tools">
      {TOOLS.map((t, i) => t.sep ?
      <div className="sep" key={'s' + i} /> :

      <Tip key={t.id} label={t.label} kbd={t.kbd} side="right">
          <button
          className={'iconbtn tool' + (activeTool === t.id ? ' active' : '')}
          aria-label={t.label} aria-pressed={activeTool === t.id}
          disabled={disabled}
          onClick={() => onTool(t.id)}>
            <Icon name={t.icon} size={21} />
          </button>
        </Tip>
      )}
      <div className="toolbar-spacer" />
      <Tip label="Settings" side="right">
        <button className={'iconbtn tool' + (settingsOpen ? ' active' : '')}
        aria-label="Settings" aria-haspopup="true" aria-expanded={settingsOpen}
        onClick={(e) => onOpenSettings(e.currentTarget.getBoundingClientRect())}>
          <Icon name="settings" size={21} />
        </button>
      </Tip>
    </nav>);

}

// ── Top app bar ─────────────────────────────────────────────────────────────
function TopBar({
  docName, onRename, isProtected, saveStatus, hasDoc,
  canUndo, canRedo, onUndo, onRedo, onOpen, onSave, onExport, onProtect, onFind, onFiles
}) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(docName);
  React.useEffect(() => setVal(docName), [docName]);
  const commit = () => {setEditing(false);const v = val.trim();if (v) onRename(v);else setVal(docName);};

  return (
    <header className="appbar">
      <div className="appbar-l">
        <div className="brand">
          <LogoMark />
          <b>Prabhu's <span style={{ color: 'var(--accent)' }}>PDF</span></b>
          <span className="tag">Editor</span>
        </div>
        <div className="appbar-divider" />
        <Tip label="Open file" kbd="⌘O" side="bottom">
          <button className="btn ghost" onClick={onOpen} aria-label="Open">
            <Icon name="upload" size={17} /> Open
          </button>
        </Tip>
        <Tip label="Files" side="bottom">
          <button className="iconbtn" style={{ width: 34, height: 34 }} disabled={!hasDoc} onClick={onFiles} aria-label="Files">
            <Icon name="folder" size={18} />
          </button>
        </Tip>
        <Tip label="Undo" kbd="⌘Z" side="bottom">
          <button className="iconbtn" style={{ width: 34, height: 34 }} disabled={!canUndo} onClick={onUndo} aria-label="Undo">
            <Icon name="undo" size={18} />
          </button>
        </Tip>
        <Tip label="Redo" kbd="⌘Y" side="bottom">
          <button className="iconbtn" style={{ width: 34, height: 34 }} disabled={!canRedo} onClick={onRedo} aria-label="Redo">
            <Icon name="redo" size={18} />
          </button>
        </Tip>
        <Tip label="Find" kbd="⌘F" side="bottom">
          <button className="iconbtn" style={{ width: 34, height: 34 }} disabled={!hasDoc} onClick={onFind} aria-label="Find in document">
            <Icon name="search" size={18} />
          </button>
        </Tip>
      </div>

      <div className="docname">
        {hasDoc &&
        <div className="docname-inner" onClick={() => !editing && setEditing(true)}>
            {editing ?
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)}
          onBlur={commit} onKeyDown={(e) => {if (e.key === 'Enter') commit();if (e.key === 'Escape') {setVal(docName);setEditing(false);}}} /> :

          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, fontSize: 13.5 }}>{docName}</span>
          }
            {!editing && <Icon name="edit" size={13} className="pencil" />}
            {isProtected && !editing && <span className="lockpill"><Icon name="lock" size={12} /> Protected</span>}
          </div>
        }
      </div>

      <div className="appbar-r">
        {hasDoc &&
        <span className={'savestate' + (saveStatus === 'saving' ? ' saving' : '')}>
            <span className="dot" />{saveStatus === 'saving' ? 'Saving…' : 'All changes saved'}
          </span>
        }
        <div className="appbar-divider" />
        <Tip label={isProtected ? 'Manage protection' : 'Password protect'} side="bottom">
          <button className="btn" onClick={onProtect} disabled={!hasDoc}>
            <Icon name={isProtected ? 'lock' : 'protect'} size={17} /> Protect
          </button>
        </Tip>
        <Tip label="Save" kbd="⌘S" side="bottom">
          <button className="btn" onClick={onSave} disabled={!hasDoc}>
            <Icon name="save" size={17} /> Save
          </button>
        </Tip>
        <button className="btn primary" onClick={onExport} disabled={!hasDoc}>
          <Icon name="download" size={17} /> Export
        </button>
        <div className="avatar" title="Eleanor Vance">EV</div>
      </div>
    </header>);

}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({
  pageIndex, pageCount, zoom, onZoomIn, onZoomOut, onZoomReset, onFit,
  onPrev, onNext, onGoto, saveStatus, isProtected, tool
}) {
  const [pg, setPg] = React.useState(String(pageIndex + 1));
  React.useEffect(() => setPg(String(pageIndex + 1)), [pageIndex]);
  const toolLabel = (TOOLS.find((t) => t.id === tool) || {}).label || 'Select';
  return (
    <footer className="statusbar">
      <div className="grp pagenav">
        <button onClick={onPrev} disabled={pageIndex <= 0} aria-label="Previous page"><Icon name="chevronUp" size={15} /></button>
        <span>Page</span>
        <input value={pg} onChange={(e) => setPg(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={() => onGoto(Number(pg))} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} aria-label="Page number" />
        <span>of {pageCount}</span>
        <button onClick={onNext} disabled={pageIndex >= pageCount - 1} aria-label="Next page"><Icon name="chevronDown" size={15} /></button>
      </div>
      <div className="sb-sep" />
      <div className="grp"><span style={{ color: 'var(--text-2)' }}>{toolLabel} tool</span></div>

      <div className="spacer" />

      <div className="grp">
        <Tip label="Fit to width" side="top">
          <button className="iconbtn" style={{ width: 24, height: 22, color: 'var(--text-2)' }} onClick={onFit} aria-label="Fit width"><Icon name="fitWidth" size={15} /></button>
        </Tip>
      </div>
      <div className="zoomctl">
        <button onClick={onZoomOut} aria-label="Zoom out"><Icon name="minus" size={14} /></button>
        <span className="zval" onClick={onZoomReset} title="Reset to 100%">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} aria-label="Zoom in"><Icon name="plus" size={14} /></button>
      </div>
      <div className="sb-sep" />
      <div className="grp" style={{ minWidth: 116, justifyContent: 'flex-end' }}>
        {isProtected && <Icon name="lock" size={13} style={{ color: 'var(--accent-strong)' }} />}
        <span>{saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span>
      </div>
    </footer>);

}

// ── Toasts ────────────────────────────────────────────────────────────────────
function Toasts({ toasts }) {
  return ReactDOM.createPortal(
    <div className="toasts">
      {toasts.map((t) =>
      <div key={t.id} className={'toast ' + (t.kind || 'info') + (t.out ? ' out' : '')}>
          <span className="tic"><Icon name={t.kind === 'warn' ? 'info' : 'check'} size={15} style={{ color: '#fff' }} /></span>
          <span className="tx">{t.msg}{t.sub && <small>{t.sub}</small>}</span>
        </div>
      )}
    </div>, document.body);
}

// ── Settings menu (theme + view) ──────────────────────────────────────────────
function SettingsMenu({ anchorRect, theme, onTheme, density, onDensity, thumbsOpen, onThumbs, panelOpen, onPanel, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDown = (e) => {if (ref.current && !ref.current.contains(e.target) && !e.target.closest('[aria-label="Settings"]')) onClose();};
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    document.addEventListener('keydown', onKey);
    return () => {document.removeEventListener('mousedown', onDown);document.removeEventListener('keydown', onKey);};
  }, [onClose]);
  if (!anchorRect) return null;
  const THEMES = [['light', 'sun', 'Light'], ['dark', 'moon', 'Dark'], ['system', 'monitor', 'System']];
  return ReactDOM.createPortal(
    <div ref={ref} className="menu settings-menu" style={{ left: anchorRect.right + 10, bottom: Math.max(10, window.innerHeight - anchorRect.bottom - 4), width: 212 }}>
      <div className="menu-label">Appearance</div>
      {THEMES.map(([id, ic, l]) =>
      <button key={id} className={'menu-item' + (theme === id ? ' sel' : '')} onClick={() => onTheme(id)}>
          <Icon name={ic} size={16} /> {l}
          {theme === id && <Icon name="check" size={15} style={{ marginLeft: 'auto', color: 'var(--accent-strong)' }} />}
        </button>
      )}
      <div className="menu-sep" />
      <div className="menu-label">Density</div>
      <div className="seg" style={{ margin: '2px 5px 4px' }}>
        {[['comfortable', 'Comfort'], ['compact', 'Compact']].map(([id, l]) =>
          <button key={id} className={density === id ? 'on' : ''} onClick={() => onDensity(id)}>{l}</button>
        )}
      </div>
      <div className="menu-sep" />
      <div className="menu-label">View</div>
      <button className="menu-item" onClick={onThumbs}>
        <Icon name="thumbs" size={16} /> Page thumbnails
        <span className={'mini-tgl' + (thumbsOpen ? ' on' : '')} style={{ marginLeft: 'auto' }}><i /></span>
      </button>
      <button className="menu-item" onClick={onPanel}>
        <Icon name="panel" size={16} /> Properties panel
        <span className={'mini-tgl' + (panelOpen ? ' on' : '')} style={{ marginLeft: 'auto' }}><i /></span>
      </button>
    </div>, document.body);
}

Object.assign(window, { Tip, Popover, TOOLS, LeftToolbar, TopBar, StatusBar, Toasts, SettingsMenu });
/* ════════════════════ panels.jsx ════════════════════ */
// panels.jsx — right contextual properties panel (switches on active tool /
// selection) + Signature modal. Driven entirely by props from App.

const TEXT_COLORS = ['#1A1D21', '#5B6470', '#2563EB', '#d83a3f', '#1f9d57', '#d98a09', '#7a5af0', '#ffffff'];
const HL_COLORS = ['#FFE16A', '#A8F0C0', '#A8D4FF', '#FFB3C7', '#D9C2FF', '#FFCE99'];
const DRAW_COLORS = ['#1A1D21', '#2563EB', '#d83a3f', '#1f9d57', '#d98a09', '#7a5af0'];
const FONT_FAMILIES = [
  { v: 'var(--ui-font)', l: 'IBM Plex Sans' },
  { v: 'Georgia, serif', l: 'Georgia' },
  { v: 'Helvetica, Arial, sans-serif', l: 'Helvetica' },
  { v: '"IBM Plex Mono", monospace', l: 'IBM Plex Mono' },
];

function Field({ label, hint, children }) {
  return (
    <div className="field">
      {label && <div className="field-lbl">{label}</div>}
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

function Swatches({ colors, value, onChange }) {
  return (
    <div className="swatches">
      {colors.map((c) => (
        <button key={c} className={'swatch' + (value === c ? ' on' : '')} aria-label={c}
                style={{ background: c, boxShadow: c === '#ffffff' ? '0 0 0 1px var(--border-strong)' : undefined }}
                onClick={() => onChange(c)} />
      ))}
    </div>
  );
}

function Stepper({ value, min = 1, max = 200, step = 1, unit, onChange }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease"><Icon name="minus" size={14} /></button>
      <input className="mid" value={unit ? value + unit : value}
             onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n))); }} />
      <button onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase"><Icon name="plus" size={14} /></button>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return <button className="tgl" data-on={on ? '1' : '0'} role="switch" aria-checked={on} onClick={() => onChange(!on)}><i /></button>;
}

// ── password strength ──
function pwStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[0-9]/.test(pw) && /[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}
const STRENGTH_LBL = ['', 'Weak', 'Fair', 'Good', 'Strong'];

// ── Panel bodies ──
function TextProps({ tp, setTP, selected }) {
  return (
    <>
      <div className="sub">{selected ? 'Editing the selected text box.' : 'Click anywhere on a page to place a new text box, then type.'}</div>
      <Field label="Font">
        <select className="input" value={tp.family} onChange={(e) => setTP({ family: e.target.value })}>
          {FONT_FAMILIES.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="Size"><Stepper value={tp.size} min={6} max={120} onChange={(v) => setTP({ size: v })} /></Field>
        <Field label="Weight">
          <select className="input" value={tp.weight} onChange={(e) => setTP({ weight: Number(e.target.value) })}>
            <option value={400}>Regular</option><option value={500}>Medium</option>
            <option value={600}>Semibold</option><option value={700}>Bold</option>
          </select>
        </Field>
      </div>
      <Field label="Alignment">
        <div className="seg">
          {['left', 'center', 'right'].map((a) => (
            <button key={a} className={tp.align === a ? 'on' : ''} onClick={() => setTP({ align: a })} aria-label={a}>
              <Icon name={'align' + a[0].toUpperCase() + a.slice(1)} size={16} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Color"><Swatches colors={TEXT_COLORS} value={tp.color} onChange={(c) => setTP({ color: c })} /></Field>
    </>
  );
}

function HighlightProps({ hp, setHP }) {
  return (
    <>
      <div className="sub">Click and drag across a page to highlight a region.</div>
      <Field label="Color"><Swatches colors={HL_COLORS} value={hp.color} onChange={(c) => setHP({ color: c })} /></Field>
      <Field label={`Opacity — ${Math.round(hp.opacity * 100)}%`}>
        <input className="range" type="range" min={20} max={80} value={hp.opacity * 100}
               onChange={(e) => setHP({ opacity: Number(e.target.value) / 100 })} />
      </Field>
      <div style={{ height: 1, background: 'var(--border)' }} />
      <div className="field">
        <div className="field-lbl">Preview</div>
        <div style={{ position: 'relative', fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>
          The quick brown fox jumps over <mark style={{ background: hp.color, opacity: 1, color: 'inherit', boxShadow: `0 0 0 2px ${hp.color}`, padding: '0 2px', borderRadius: 2, backgroundColor: `color-mix(in srgb, ${hp.color} ${hp.opacity * 100}%, transparent)` }}>the lazy dog</mark> near the river.
        </div>
      </div>
    </>
  );
}

function DrawProps({ dp, setDP }) {
  return (
    <>
      <div className="sub">Draw freehand on the page. Hold and drag to sketch.</div>
      <Field label="Stroke color"><Swatches colors={DRAW_COLORS} value={dp.color} onChange={(c) => setDP({ color: c })} /></Field>
      <Field label={`Thickness — ${dp.width}px`}>
        <input className="range" type="range" min={1} max={16} value={dp.width} onChange={(e) => setDP({ width: Number(e.target.value) })} />
      </Field>
      <div className="field">
        <div className="field-lbl">Preview</div>
        <svg width="100%" height="46" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <path d="M16 30 Q60 6 100 26 T200 22" fill="none" stroke={dp.color} strokeWidth={dp.width} strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
}

function SignatureProps({ savedSigs, onAddSig, onPlaceSig }) {
  return (
    <>
      <div className="sub">Create a signature, then click a page to place it. Drag to reposition and use the corner handle to resize.</div>
      <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onAddSig}>
        <Icon name="plus" size={16} /> Create signature
      </button>
      {savedSigs.length > 0 && (
        <Field label="Saved signatures" hint="Click to drop on the current page.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedSigs.map((s) => (
              <button key={s.id} className="input" style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 6 }}
                      onClick={() => onPlaceSig(s)}>
                {s.kind === 'image'
                  ? <img src={s.data} alt="signature" style={{ maxHeight: 44, maxWidth: '100%' }} />
                  : <span style={{ fontFamily: '"Segoe Script","Brush Script MT",cursive', fontSize: 26, color: 'var(--text)' }}>{s.text}</span>}
              </button>
            ))}
          </div>
        </Field>
      )}
    </>
  );
}

function SplitProps({ pageCount, splitFrom, splitTo, setSplit, selectedCount, onSplit }) {
  return (
    <>
      <div className="sub">Choose a page range to extract into a new PDF, or multi-select pages in the thumbnail strip.</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <Field label="From page"><Stepper value={splitFrom} min={1} max={pageCount} onChange={(v) => setSplit(v, splitTo)} /></Field>
        <Field label="To page"><Stepper value={splitTo} min={1} max={pageCount} onChange={(v) => setSplit(splitFrom, v)} /></Field>
      </div>
      <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)' }}>
        {selectedCount > 0
          ? <><b style={{ color: 'var(--text)' }}>{selectedCount}</b> page{selectedCount > 1 ? 's' : ''} selected in the strip.</>
          : <>Will extract <b style={{ color: 'var(--text)' }}>{Math.abs(splitTo - splitFrom) + 1}</b> pages (p{Math.min(splitFrom, splitTo)}–p{Math.max(splitFrom, splitTo)}).</>}
      </div>
      <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onSplit}>
        <Icon name="split" size={16} /> Split into new PDF
      </button>
    </>
  );
}

function MergeProps({ onAddFiles }) {
  return (
    <>
      <div className="sub">Add more PDFs, images, or Word files — they’ll be converted and appended as new pages.</div>
      <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onAddFiles}>
        <Icon name="plus" size={16} /> Add files to merge
      </button>
      <div className="fmt-chips" style={{ justifyContent: 'flex-start', marginTop: 4 }}>
        <span className="fmt-chip"><Icon name="file" size={14} /> PDF</span>
        <span className="fmt-chip"><Icon name="image" size={14} /> PNG · JPG</span>
        <span className="fmt-chip"><Icon name="word" size={14} /> DOCX</span>
      </div>
    </>
  );
}

function ProtectProps({ pw, setPw, pw2, setPw2, perms, setPerms, isProtected, onApply, onRemove }) {
  const [show, setShow] = React.useState(false);
  const strength = pwStrength(pw);
  const match = pw && pw === pw2;
  return (
    <>
      <div className="sub">Encrypt this document with a password. Recipients must enter it to open the file.</div>
      <Field label="Password">
        <div className="input-pw">
          <input className="input" type={show ? 'text' : 'password'} value={pw} placeholder="Enter password"
                 onChange={(e) => setPw(e.target.value)} />
          <button className="iconbtn reveal" onClick={() => setShow(!show)} aria-label="Toggle visibility"><Icon name={show ? 'eyeOff' : 'eye'} size={16} /></button>
        </div>
        {pw && (
          <div>
            <div className={'meter s' + strength}><i /><i /><i /><i /></div>
            <div className="field-hint" style={{ marginTop: 5 }}>Strength: <b style={{ color: 'var(--text-2)' }}>{STRENGTH_LBL[strength]}</b></div>
          </div>
        )}
      </Field>
      <Field label="Confirm password">
        <input className="input" type={show ? 'text' : 'password'} value={pw2} placeholder="Re-enter password"
               onChange={(e) => setPw2(e.target.value)}
               style={{ borderColor: pw2 && !match ? '#e5484d' : undefined }} />
        {pw2 && !match && <div className="field-hint" style={{ color: '#e5484d' }}>Passwords don’t match.</div>}
      </Field>
      <div style={{ height: 1, background: 'var(--border)' }} />
      <div className="field-lbl">Permissions</div>
      {[
        ['print', 'Allow printing'],
        ['copy', 'Allow copying text'],
        ['edit', 'Allow editing'],
      ].map(([k, l]) => (
        <div className="toggle-row" key={k}>
          <span className="lbl">{l}</span>
          <Toggle on={perms[k]} onChange={(v) => setPerms({ ...perms, [k]: v })} />
        </div>
      ))}
    </>
  );
}

// ── Panel shell ──
function RightPanel(props) {
  const { mode, onClose } = props;
  const META = {
    text: { icon: 'text', title: 'Text' },
    highlight: { icon: 'highlight', title: 'Highlight' },
    draw: { icon: 'draw', title: 'Draw' },
    signature: { icon: 'signature', title: 'Signature' },
    split: { icon: 'split', title: 'Split' },
    merge: { icon: 'merge', title: 'Merge' },
    protect: { icon: 'protect', title: 'Protect document' },
    select: { icon: 'info', title: 'Document' },
  }[mode] || { icon: 'info', title: 'Properties' };

  let body, foot = null;
  if (mode === 'text') body = <TextProps tp={props.tp} setTP={props.setTP} selected={props.selectedKind === 'text'} />;
  else if (mode === 'highlight') body = <HighlightProps hp={props.hp} setHP={props.setHP} />;
  else if (mode === 'draw') body = <DrawProps dp={props.dp} setDP={props.setDP} />;
  else if (mode === 'signature') body = <SignatureProps savedSigs={props.savedSigs} onAddSig={props.onAddSig} onPlaceSig={props.onPlaceSig} />;
  else if (mode === 'split') body = <SplitProps {...props} />;
  else if (mode === 'merge') body = <MergeProps onAddFiles={props.onAddFiles} />;
  else if (mode === 'protect') {
    body = <ProtectProps {...props} />;
    const match = props.pw && props.pw === props.pw2;
    foot = (
      <div className="panel-foot">
        {props.isProtected
          ? <>
              <button className="btn primary" style={{ justifyContent: 'center' }} disabled={!match} onClick={props.onApply}><Icon name="lock" size={16} /> Update password</button>
              <button className="btn ghost" style={{ justifyContent: 'center', color: '#d83a3f' }} onClick={props.onRemove}><Icon name="unlock" size={16} /> Remove protection</button>
            </>
          : <button className="btn primary" style={{ justifyContent: 'center' }} disabled={!match} onClick={props.onApply}><Icon name="lock" size={16} /> Protect document</button>}
      </div>
    );
  } else {
    // select / default → document info
    body = (
      <>
        <div className="props-empty" style={{ alignItems: 'stretch', textAlign: 'left', padding: 0, color: 'inherit' }}>
          <Field label="Document">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[['Pages', props.pageCount], ['Page size', 'US Letter'], ['Security', props.isProtected ? 'Password-protected' : 'None'], ['Status', 'All changes saved']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </Field>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <div className="sub">Pick a tool from the left to edit. Select an object on the page to see its properties here.</div>
        </div>
      </>
    );
  }

  return (
    <aside className="props auto-collapse">
      <div className="props-hd">
        <div className="ttl"><Icon name={META.icon} size={17} /> {META.title}</div>
        <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={onClose} aria-label="Collapse panel"><Icon name="collapseRight" size={17} /></button>
      </div>
      <div className="props-body">{body}</div>
      {foot}
    </aside>
  );
}

// ── Signature modal ──
function SignatureModal({ onClose, onSave }) {
  const [tab, setTab] = React.useState('draw');
  const [typed, setTyped] = React.useState('');
  const canvasRef = React.useRef(null);
  const [hasInk, setHasInk] = React.useState(false);

  React.useEffect(() => {
    if (tab !== 'draw') return;
    const c = canvasRef.current; if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio; c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d'); ctx.scale(ratio, ratio);
    const ink = (getComputedStyle(document.documentElement).getPropertyValue('--doc-ink') || '#15233f').trim() || '#15233f';
    ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let drawing = false, last = null;
    const pos = (e) => { const r = c.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
    const down = (e) => { drawing = true; last = pos(e); e.preventDefault(); };
    const move = (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; setHasInk(true); e.preventDefault(); };
    const up = () => { drawing = false; };
    c.addEventListener('mousedown', down); c.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down, { passive: false }); c.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
    return () => { c.removeEventListener('mousedown', down); c.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); c.removeEventListener('touchstart', down); c.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); };
  }, [tab]);

  const clear = () => { const c = canvasRef.current; const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); setHasInk(false); };
  const save = () => {
    if (tab === 'draw') { if (!hasInk) return; onSave({ id: 'sig' + Date.now(), kind: 'image', data: canvasRef.current.toDataURL('image/png') }); }
    else if (tab === 'type') { if (!typed.trim()) return; onSave({ id: 'sig' + Date.now(), kind: 'text', text: typed.trim() }); }
    else { onSave({ id: 'sig' + Date.now(), kind: 'text', text: typed.trim() || 'A. Sample' }); }
  };
  const canSave = tab === 'draw' ? hasInk : tab === 'type' ? typed.trim() : true;

  return ReactDOM.createPortal(
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(560px,94vw)' }}>
        <div className="modal-hd">
          <div><h3>Create signature</h3><p>Draw, type, or upload — it’ll be saved for reuse.</p></div>
          <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="sigtabs">
            {[['draw', 'pen', 'Draw'], ['type', 'keyboard', 'Type'], ['upload', 'upload', 'Upload']].map(([id, ic, l]) => (
              <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><Icon name={ic} size={16} /> {l}</button>
            ))}
          </div>
          {tab === 'draw' && (
            <div>
              <div className="sigpad" style={{ height: 180 }}>
                <canvas ref={canvasRef} style={{ height: 180 }} />
                <div className="baseline" /><div className="hint">Sign above the line</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn ghost" onClick={clear}><Icon name="refresh" size={15} /> Clear</button>
              </div>
            </div>
          )}
          {tab === 'type' && (
            <div>
              <input className="input" autoFocus placeholder="Type your name" value={typed} onChange={(e) => setTyped(e.target.value)} style={{ height: 44, fontSize: 15 }} />
              <div className="sigpad" style={{ height: 120, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Segoe Script","Brush Script MT",cursive', fontSize: 46, color: 'var(--doc-ink)' }}>{typed || 'Your name'}</span>
              </div>
            </div>
          )}
          {tab === 'upload' && (
            <div>
              <div className="dropzone" style={{ padding: '36px 24px', borderRadius: 12 }}>
                <div className="dzicon" style={{ width: 52, height: 52, borderRadius: 14 }}><Icon name="image" size={26} /></div>
                <p style={{ fontSize: 13 }}>Drop a PNG of your signature, or click to browse. For this demo, a typed fallback is used.</p>
                <input className="input" placeholder="Name for fallback" value={typed} onChange={(e) => setTyped(e.target.value)} style={{ maxWidth: 240, marginTop: 12 }} />
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={save}><Icon name="check" size={16} /> Save signature</button>
        </div>
      </div>
    </div>, document.body);
}

Object.assign(window, { RightPanel, SignatureModal, pwStrength });

/* ════════════════════ workspace.jsx ════════════════════ */
// workspace.jsx — center canvas (pages + live annotation tools + zoom), the
// thumbnail strip (drag-reorder, hover menu, multi-select), and the empty +
// converting states.

const PAGE_RATIO = PAGE_W / PAGE_H;

// ── helper: render a page's static content + annotation overlay at a scale ──
function PageInner({ page, annotations, interactive, tool, toolProps, selectedId,
                     onAddAnno, onUpdateAnno, onSelectAnno, onDeleteAnno, onBeginEdit, pendingSig, onPlacedSig, zoom }) {
  const layerRef = React.useRef(null);
  const [draft, setDraft] = React.useState(null); // live highlight/draw

  const toPage = (e) => {
    const r = layerRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
  };

  const onLayerDown = (e) => {
    if (!interactive) return;
    if (e.target.closest('.anno')) return; // existing anno handles itself
    const p = toPage(e);
    if (tool === 'select') { onSelectAnno(null); return; }
    if (tool === 'text') {
      const id = 'a' + Date.now();
      onAddAnno({ id, type: 'text', x: p.x, y: p.y, w: 240, text: '',
        family: toolProps.tp.family, size: toolProps.tp.size, weight: toolProps.tp.weight,
        color: toolProps.tp.color, align: toolProps.tp.align });
      onSelectAnno(id);
      return;
    }
    if (tool === 'signature' && pendingSig) {
      const id = 'a' + Date.now();
      const w = 200, h = 80;
      onAddAnno({ id, type: 'signature', x: p.x - w / 2, y: p.y - h / 2, w, h, sig: pendingSig });
      onSelectAnno(id); onPlacedSig();
      return;
    }
    if (tool === 'highlight' || tool === 'draw') {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
      if (tool === 'highlight') setDraft({ type: 'highlight', x: p.x, y: p.y, ox: p.x, oy: p.y, w: 0, h: 0 });
      else setDraft({ type: 'draw', points: [p], minx: p.x, miny: p.y, maxx: p.x, maxy: p.y });
    }
  };
  const onLayerMove = (e) => {
    if (!draft) return;
    const p = toPage(e);
    if (draft.type === 'highlight') {
      setDraft({ ...draft, x: Math.min(p.x, draft.ox), y: Math.min(p.y, draft.oy), w: Math.abs(p.x - draft.ox), h: Math.abs(p.y - draft.oy) });
    } else {
      setDraft({ ...draft, points: [...draft.points, p], minx: Math.min(draft.minx, p.x), miny: Math.min(draft.miny, p.y), maxx: Math.max(draft.maxx, p.x), maxy: Math.max(draft.maxy, p.y) });
    }
  };
  const onLayerUp = () => {
    if (!draft) return;
    const id = 'a' + Date.now();
    if (draft.type === 'highlight' && draft.w > 6 && draft.h > 6) {
      onAddAnno({ id, type: 'highlight', x: draft.x, y: draft.y, w: draft.w, h: Math.max(draft.h, toolProps.hp.minH || draft.h), color: toolProps.hp.color, opacity: toolProps.hp.opacity });
    } else if (draft.type === 'draw' && draft.points.length > 1) {
      const pad = toolProps.dp.width;
      const ox = draft.minx - pad, oy = draft.miny - pad;
      onAddAnno({ id, type: 'draw', x: ox, y: oy, w: (draft.maxx - draft.minx) + pad * 2, h: (draft.maxy - draft.miny) + pad * 2,
        points: draft.points.map((pt) => ({ x: pt.x - ox, y: pt.y - oy })), color: toolProps.dp.color, width: toolProps.dp.width });
    }
    setDraft(null);
  };

  const cursorCls = interactive ? (
    tool === 'text' ? 'cursor-text' : (tool === 'highlight' || tool === 'draw') ? 'cursor-cross' :
    (tool === 'signature' && pendingSig) ? 'cursor-copy' : '') : '';

  return (
    <>
      <SamplePageContent type={page.type} />
      <div ref={layerRef} className={'anno-layer ' + cursorCls}
           onPointerDown={onLayerDown} onPointerMove={onLayerMove} onPointerUp={onLayerUp}>
        {annotations.map((a) => (
          <AnnoView key={a.id} a={a} interactive={interactive} zoom={zoom}
                    selected={interactive && selectedId === a.id} tool={tool}
                    onSelect={onSelectAnno} onUpdate={onUpdateAnno} onDelete={onDeleteAnno} onBeginEdit={onBeginEdit} />
        ))}
        {draft && draft.type === 'highlight' && (
          <div style={{ position: 'absolute', left: draft.x, top: draft.y, width: draft.w, height: draft.h,
            background: `color-mix(in srgb, ${toolProps.hp.color} ${toolProps.hp.opacity * 100}%, transparent)`,
            outline: '1px dashed ' + toolProps.hp.color }} />
        )}
        {draft && draft.type === 'draw' && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <polyline points={draft.points.map((p) => p.x + ',' + p.y).join(' ')} fill="none" stroke={toolProps.dp.color} strokeWidth={toolProps.dp.width} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </>
  );
}

// ── single annotation (interactive or static) ──
function AnnoView({ a, selected, interactive, tool, zoom, onSelect, onUpdate, onDelete, onBeginEdit }) {
  const dragData = React.useRef(null);

  const startMove = (e) => {
    if (!interactive || tool !== 'select') return;
    e.stopPropagation();
    onSelect(a.id);
    if (a.type === 'text' && selected) return; // allow text editing when already selected
    onBeginEdit && onBeginEdit();
    dragData.current = { sx: e.clientX, sy: e.clientY, ox: a.x, oy: a.y };
    const move = (ev) => {
      const d = dragData.current; if (!d) return;
      onUpdate(a.id, { x: d.ox + (ev.clientX - d.sx) / zoom, y: d.oy + (ev.clientY - d.sy) / zoom });
    };
    const up = () => { dragData.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };
  const startResize = (e) => {
    e.stopPropagation(); e.preventDefault();
    onBeginEdit && onBeginEdit();
    const d = { sx: e.clientX, sy: e.clientY, ow: a.w, oh: a.h };
    const move = (ev) => {
      const nw = Math.max(28, d.ow + (ev.clientX - d.sx) / zoom);
      if (a.type === 'text') onUpdate(a.id, { w: nw });
      else { const ratio = d.oh / d.ow; onUpdate(a.id, { w: nw, h: a.type === 'signature' ? nw * ratio : Math.max(14, d.oh + (ev.clientY - d.sy) / zoom) }); }
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  const base = { left: a.x, top: a.y };
  const showHandles = selected && interactive;

  if (a.type === 'highlight') {
    return (
      <div className={'anno' + (selected ? ' selected' : '')} style={{ ...base, width: a.w, height: a.h,
        background: `color-mix(in srgb, ${a.color} ${a.opacity * 100}%, transparent)`, borderRadius: 2 }}
        onPointerDown={startMove}>
        {showHandles && <><div className="anno-handle se" onPointerDown={startResize} /><button className="anno-del" onPointerDown={(e) => { e.stopPropagation(); onDelete(a.id); }}><Icon name="close" size={11} /></button></>}
      </div>
    );
  }
  if (a.type === 'draw') {
    return (
      <div className={'anno' + (selected ? ' selected' : '')} style={{ ...base, width: a.w, height: a.h }} onPointerDown={startMove}>
        <svg width={a.w} height={a.h} style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}>
          <polyline points={a.points.map((p) => p.x + ',' + p.y).join(' ')} fill="none" stroke={a.color} strokeWidth={a.width} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showHandles && <button className="anno-del" onPointerDown={(e) => { e.stopPropagation(); onDelete(a.id); }}><Icon name="close" size={11} /></button>}
      </div>
    );
  }
  if (a.type === 'signature') {
    return (
      <div className={'anno' + (selected ? ' selected' : '')} style={{ ...base, width: a.w, height: a.h, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onPointerDown={startMove}>
        {a.sig.kind === 'image'
          ? <img src={a.sig.data} alt="signature" style={{ maxWidth: '100%', maxHeight: '100%', pointerEvents: 'none' }} draggable={false} />
          : <span style={{ fontFamily: '"Segoe Script","Brush Script MT",cursive', fontSize: a.h * 0.5, color: 'var(--doc-ink)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{a.sig.text}</span>}
        {showHandles && <><div className="anno-handle se" onPointerDown={startResize} /><button className="anno-del" onPointerDown={(e) => { e.stopPropagation(); onDelete(a.id); }}><Icon name="close" size={11} /></button></>}
      </div>
    );
  }
  // text
  const ref = React.useRef(null);
  React.useEffect(() => { if (selected && ref.current && document.activeElement !== ref.current && !a.text) ref.current.focus(); }, [selected]);
  return (
    <div className={'anno' + (selected ? ' selected' : '')} style={{ ...base, width: a.w }} onPointerDown={startMove}>
      <div ref={ref} className="anno-text" contentEditable={interactive && selected} suppressContentEditableWarning
           style={{ fontFamily: a.family, fontSize: a.size, fontWeight: a.weight, color: a.color, textAlign: a.align }}
           onFocus={() => onBeginEdit && onBeginEdit()}
           onBlur={(e) => onUpdate(a.id, { text: e.currentTarget.textContent })}
           onPointerDown={(e) => { if (selected) e.stopPropagation(); }}>
        {a.text}
      </div>
      {showHandles && <><div className="anno-handle se" onPointerDown={startResize} /><button className="anno-del" onPointerDown={(e) => { e.stopPropagation(); onDelete(a.id); }}><Icon name="close" size={11} /></button></>}
    </div>
  );
}

// ── Canvas ──
function Canvas(props) {
  const { pages, zoom, currentIndex, scrollToken, onCurrentChange, onWheelZoom, splitSel, tool } = props;
  const scrollRef = React.useRef(null);
  const sheetRefs = React.useRef({});
  const programmatic = React.useRef(false);

  // scroll to a page when status-bar nav fires
  React.useEffect(() => {
    const el = sheetRefs.current[currentIndex];
    const sc = scrollRef.current;
    if (el && sc) { programmatic.current = true; sc.scrollTo({ top: el.offsetTop - 28, behavior: 'smooth' }); setTimeout(() => (programmatic.current = false), 400); }
  }, [scrollToken]);

  const onScroll = () => {
    if (programmatic.current) return;
    const sc = scrollRef.current; const mid = sc.scrollTop + sc.clientHeight / 2.4;
    let best = 0, bestD = Infinity;
    pages.forEach((p, i) => { const el = sheetRefs.current[i]; if (!el) return; const c = el.offsetTop + el.offsetHeight / 2; const d = Math.abs(c - mid); if (d < bestD) { bestD = d; best = i; } });
    if (best !== currentIndex) onCurrentChange(best);
  };

  React.useEffect(() => {
    const sc = scrollRef.current; if (!sc) return;
    const wheel = (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); onWheelZoom(e.deltaY < 0 ? 1 : -1, e); } };
    sc.addEventListener('wheel', wheel, { passive: false });
    return () => sc.removeEventListener('wheel', wheel);
  }, [onWheelZoom]);

  return (
    <div className="canvas-scroll" ref={scrollRef} onScroll={onScroll}>
      <div className="canvas-pages">
        {pages.map((page, i) => (
          <div key={page.id} className={'sheet-wrap' + (i === currentIndex ? ' current' : '') + (splitSel.includes(page.id) ? ' split-sel' : '')}
               ref={(el) => (sheetRefs.current[i] = el)}
               style={{ width: PAGE_W * zoom, height: PAGE_H * zoom }}
               onClick={() => { if (tool === 'split') props.onToggleSplit(page.id); }}>
            <div className="sheet" style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${zoom}) rotate(${page.rotation || 0}deg)`,
                 transformOrigin: 'top left', ...(page.rotation ? { transformOrigin: 'center center', position: 'absolute', top: (PAGE_H * zoom - PAGE_H) / 2, left: (PAGE_W * zoom - PAGE_W) / 2 } : {}) }}>
              <PageInner page={page} annotations={props.annotations[page.id] || []} interactive={tool !== 'split'}
                tool={tool} toolProps={props.toolProps} selectedId={props.selectedId} zoom={zoom}
                onAddAnno={(an) => props.onAddAnno(page.id, an)} onUpdateAnno={props.onUpdateAnno}
                onSelectAnno={props.onSelectAnno} onDeleteAnno={props.onDeleteAnno} onBeginEdit={props.onBeginEdit}
                pendingSig={props.pendingSig} onPlacedSig={props.onPlacedSig} />
              {(props.searchMatches || []).filter((m) => m.page === i).map((m) => m.rects.map((r, k) => (
                <div key={m.idx + '-' + k} className={'search-hit' + (m.idx === props.currentMatch ? ' current' : '')}
                     style={{ left: r.x, top: r.y, width: r.w, height: r.h }} />
              )))}
            </div>
            <div className="sheet-num">{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Thumbnail (measures width, scales page content) ──
function Thumb({ page, annotations }) {
  const ref = React.useRef(null);
  const [scale, setScale] = React.useState(0.12);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const set = () => setScale(el.clientWidth / PAGE_W);
    set();
    const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="thumb-fill" style={{ position: 'absolute', inset: 0 }}>
      <div className="thumb-render" style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale}) rotate(${page.rotation || 0}deg)`, transformOrigin: page.rotation ? 'center center' : 'top left' }}>
        <SamplePageContent type={page.type} />
        <div className="anno-layer" style={{ pointerEvents: 'none' }}>
          {(annotations || []).map((a) => <AnnoView key={a.id} a={a} interactive={false} zoom={1} />)}
        </div>
      </div>
    </div>
  );
}

function ThumbStrip(props) {
  const { pages, currentIndex, splitSel, tool, annotations, onSelect, onReorder, onMenu, collapsed, tab, onTab, onTocNav } = props;
  const [drag, setDrag] = React.useState(null); // {from, x, y}
  const [dropAt, setDropAt] = React.useState(null);
  const rowRefs = React.useRef({});
  const suppressClick = React.useRef(false);

  // press → may become a drag once moved past threshold; otherwise stays a click
  const beginPress = (e, i) => {
    if (e.target.closest('.thumb-menu-btn')) return;
    if (e.button != null && e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    let started = false, lastDrop = null;
    suppressClick.current = false;
    const findDrop = (cy) => {
      let at = pages.length;
      for (let j = 0; j < pages.length; j++) { const el = rowRefs.current[j]; if (!el) continue; const r = el.getBoundingClientRect(); if (cy < r.top + r.height / 2) { at = j; break; } }
      return at;
    };
    const move = (ev) => {
      if (!started) {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 5) return;
        started = true; suppressClick.current = true;
        setDrag({ from: i, x: ev.clientX, y: ev.clientY });
      }
      setDrag((d) => d && { ...d, x: ev.clientX, y: ev.clientY });
      lastDrop = findDrop(ev.clientY);
      setDropAt(lastDrop);
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      setDrag(null); setDropAt(null);
      if (started && lastDrop != null) { let to = lastDrop; if (to > i) to--; if (to !== i) onReorder(i, to); }
      // if we dragged, swallow the trailing click (reset on next press)
      suppressClick.current = started;
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  if (collapsed) return null;
  return (
    <aside className="thumbs auto-collapse" style={{ width: tab === 'contents' ? 248 : 152 }}>
      <div className="leftnav-tabs">
        <button className={'tab' + (tab === 'pages' ? ' on' : '')} onClick={() => onTab('pages')}>Pages</button>
        <button className={'tab' + (tab === 'contents' ? ' on' : '')} onClick={() => onTab('contents')}>Contents</button>
        <button className="iconbtn lt-collapse" onClick={props.onCollapse} aria-label="Hide panel"><Icon name="chevronLeft" size={16} /></button>
      </div>
      {tab === 'contents' ? (
        <TOCTree pages={pages} currentIndex={currentIndex} onNav={onTocNav} generated />
      ) : (
      <div className="thumbs-scroll">
        {pages.map((page, i) => (
          <React.Fragment key={page.id}>
            {dropAt === i && drag && <div className="drop-line" />}
            <div className={'thumb-row' + (drag && drag.from === i ? ' dragging' : '')} ref={(el) => (rowRefs.current[i] = el)}>
              <span className="thumb-idx" onPointerDown={(e) => beginPress(e, i)} title="Drag to reorder" style={{ cursor: 'grab' }}>{i + 1}</span>
              <div className={'thumb' + (i === currentIndex ? ' current' : '') + (splitSel.includes(page.id) ? ' sel' : '')}
                   style={{ cursor: 'grab' }}
                   onPointerDown={(e) => beginPress(e, i)}
                   onClick={() => { if (suppressClick.current) return; onSelect(i, page.id); }}>
                <Thumb page={page} annotations={annotations[page.id]} />
                {splitSel.includes(page.id) && <span className="thumb-sel-badge"><Icon name="check" size={12} /></span>}
                {page.rotation ? <span className="thumb-rot">{page.rotation}°</span> : null}
                <button className="thumb-menu-btn" onClick={(e) => { e.stopPropagation(); onMenu(e, i, page); }} aria-label="Page options"><Icon name="more" size={15} /></button>
              </div>
            </div>
          </React.Fragment>
        ))}
        {dropAt === pages.length && drag && <div className="drop-line" />}
      </div>
      )}
      {drag && ReactDOM.createPortal(
        <div className="thumb-ghost" style={{ left: drag.x - 48, top: drag.y - 30 }}>
          <div style={{ position: 'relative', aspectRatio: '816/1056', background: 'var(--doc-bg)' }}><Thumb page={pages[drag.from]} annotations={annotations[pages[drag.from].id]} /></div>
        </div>, document.body)}
    </aside>
  );
}

// ── Empty state ──
function EmptyState({ onLoadSample, onBrowse, dragOver, onDrop, onDragOver, onDragLeave }) {
  return (
    <div className="empty">
      <div className={'dropzone' + (dragOver ? ' over' : '')} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        <div className="dzicon"><Icon name="upload" size={34} /></div>
        <h2>Drop a file to start editing</h2>
        <p>Drag &amp; drop a <b>PDF</b>, <b>image</b>, or <b>Word</b> document here. Non-PDF files are converted automatically.</p>
        <div className="dz-actions">
          <button className="btn primary" onClick={onBrowse}><Icon name="upload" size={17} /> Browse files</button>
          <button className="btn" onClick={onLoadSample}><Icon name="file" size={17} /> Load sample document</button>
        </div>
        <div className="fmt-chips">
          <span className="fmt-chip"><Icon name="file" size={14} /> PDF</span>
          <span className="fmt-chip"><Icon name="image" size={14} /> PNG · JPG</span>
          <span className="fmt-chip"><Icon name="word" size={14} /> DOC · DOCX</span>
        </div>
        <div className="dz-hint"><Icon name="protect" size={14} /> Files stay on your device — nothing is uploaded.</div>
      </div>
    </div>
  );
}

// ── Converting overlay ──
function Converting({ files }) {
  const [pct, setPct] = React.useState(8);
  React.useEffect(() => { const t = setInterval(() => setPct((p) => Math.min(100, p + Math.random() * 22)), 240); return () => clearInterval(t); }, []);
  return (
    <div className="converting">
      <div className="conv-card">
        <div className="spinner" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Converting to PDF…</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3 }}>Preparing your document</div>
        </div>
        <div className="conv-files">
          {files.map((f, i) => (
            <div className="conv-file" key={i}>
              <span className="ci"><Icon name={f.icon} size={17} /></span>
              <span className="cn">{f.name}</span>
              <span className="cs">{pct >= 100 ? '✓' : Math.round(pct) + '%'}</span>
            </div>
          ))}
        </div>
        <div className="bar"><i style={{ width: pct + '%' }} /></div>
      </div>
    </div>
  );
}

Object.assign(window, { Canvas, ThumbStrip, EmptyState, Converting, AnnoView });

/* ════════════════════ search-toc.jsx ════════════════════ */
// search-toc.jsx — find-in-document (FindBar + DOM match collector) and the
// auto-generated, nested Table of Contents (model builder + TOCTree).

// ── Search: scan the rendered canvas pages for a query, return page-space rects ──
// Page-space coords are zoom-independent (derived by dividing screen rects by the
// sheet's live scale), so highlights stay correct at any zoom.
function collectMatches(query, matchCase) {
  const q0 = (query || '').trim();
  if (!q0) return [];
  const sheets = document.querySelectorAll('.canvas-pages .sheet');
  const out = [];
  const q = matchCase ? q0 : q0.toLowerCase();
  sheets.forEach((sheet, pageIdx) => {
    if (sheet.style.transform && sheet.style.transform.includes('rotate(') && !sheet.style.transform.includes('rotate(0')) {
      // skip rotated pages — rect math would be off
    }
    const sr = sheet.getBoundingClientRect();
    const scale = sr.width / 816; // PAGE_W
    if (!scale) return;
    const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue && n.nodeValue.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue;
      const hay = matchCase ? raw : raw.toLowerCase();
      let i = hay.indexOf(q);
      while (i !== -1) {
        try {
          const range = document.createRange();
          range.setStart(node, i); range.setEnd(node, i + q.length);
          const rects = [...range.getClientRects()].map((r) => ({
            x: (r.left - sr.left) / scale, y: (r.top - sr.top) / scale,
            w: r.width / scale, h: r.height / scale,
          })).filter((r) => r.w > 0 && r.h > 0);
          if (rects.length) out.push({ page: pageIdx, rects });
        } catch (e) {}
        i = hay.indexOf(q, i + q.length);
      }
    }
  });
  return out.map((m, idx) => ({ ...m, idx }));
}

// ── Find bar (drops from the top bar) ──
function FindBar({ query, onQuery, matchCase, onToggleCase, total, current, onNext, onPrev, onClose, inputRef }) {
  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? onPrev() : onNext(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };
  return (
    <div className="find-bar" role="search">
      <Icon name="search" size={16} style={{ color: 'var(--text-3)', marginLeft: 2 }} />
      <input ref={inputRef} className="find-input" placeholder="Find in document" value={query}
             onChange={(e) => onQuery(e.target.value)} onKeyDown={onKey} aria-label="Find in document" />
      <span className="find-count">{query ? `${total ? current + 1 : 0}/${total}` : '0/0'}</span>
      <button className={'find-aa' + (matchCase ? ' on' : '')} onClick={onToggleCase}
              title="Match case" aria-pressed={matchCase}>Aa</button>
      <div className="find-div" />
      <button className="iconbtn find-nav" onClick={onPrev} disabled={!total} aria-label="Previous match"><Icon name="chevronUp" size={16} /></button>
      <button className="iconbtn find-nav" onClick={onNext} disabled={!total} aria-label="Next match"><Icon name="chevronDown" size={16} /></button>
      <div className="find-div" />
      <button className="iconbtn find-nav" onClick={onClose} aria-label="Close find"><Icon name="close" size={16} /></button>
    </div>
  );
}

// ── Table of Contents model ──
// The sample MSA ships without an embedded outline, so the app derives one from
// the headings present on each page type. Each page contributes its entries;
// because the TOC is rebuilt from the live `pages` array, reordering / inserting /
// merging pages updates it automatically.
const TOC_MAP = {
  cover: [{ id: 'title', text: 'Master Services Agreement', title: true }],
  'body-1': [
    { id: 's1', text: '1. Definitions' },
    { id: 's2', text: '2. Provision of Services' },
    { id: 's3', text: '3. Fees and Payment' },
  ],
  'body-2': [
    { id: 's4', text: '4. Service Level Commitments', children: [{ id: 's4a', text: 'Service Credit Schedule' }] },
    { id: 's5', text: '5. Confidentiality' },
    { id: 's6', text: '6. Data Protection & Security' },
  ],
  'body-3': [
    { id: 's7', text: '7. Term and Termination' },
    { id: 's8', text: '8. Limitation of Liability' },
    { id: 's9', text: '9. Indemnification' },
    { id: 's10', text: '10. General Provisions' },
  ],
  signature: [
    { id: 's11', text: '11. Execution', children: [
      { id: 's11a', text: 'Signature Block' },
      { id: 's11b', text: 'Exhibits A & B' },
    ] },
  ],
};
const TYPE_LABEL = { cover: 'Cover Page', 'body-1': 'Document Page', 'body-2': 'Document Page', 'body-3': 'Document Page', signature: 'Signature Page' };

function buildTOC(pages) {
  const nodes = [];
  pages.forEach((page, pageIdx) => {
    const entries = TOC_MAP[page.type];
    if (entries) {
      entries.forEach((e) => {
        nodes.push({
          key: page.id + '-' + e.id, text: e.text, page: pageIdx, title: !!e.title,
          children: (e.children || []).map((c) => ({ key: page.id + '-' + c.id, text: c.text, page: pageIdx })),
        });
      });
    } else {
      // unknown / imported page — still give it a navigable entry
      nodes.push({ key: page.id + '-pg', text: (TYPE_LABEL[page.type] || 'Page') + ' ' + (pageIdx + 1), page: pageIdx, children: [] });
    }
  });
  return nodes;
}

// ── TOC tree ──
function TOCTree({ pages, currentIndex, onNav, generated }) {
  const toc = buildTOC(pages);
  const [collapsed, setCollapsed] = React.useState({});
  const toggle = (k) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));
  return (
    <div className="toc">
      {generated && (
        <div className="toc-badge"><Icon name="info" size={13} /> Auto-generated outline</div>
      )}
      {toc.length === 0 && <div className="toc-empty">No headings detected yet.</div>}
      {toc.map((n) => {
        const hasKids = n.children && n.children.length > 0;
        const open = !collapsed[n.key];
        return (
          <div key={n.key}>
            <div className="toc-line">
              <button className={'toc-chev' + (hasKids ? '' : ' no-kids')}
                      onClick={(e) => { e.stopPropagation(); toggle(n.key); }} aria-label={open ? 'Collapse' : 'Expand'}>
                <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} />
              </button>
              <button className={'toc-row' + (n.title ? ' lvl-title' : '') + (n.page === currentIndex ? ' current' : '')}
                      onClick={() => onNav(n.page)}>
                <span className="toc-text">{n.text}</span>
                <span className="toc-pg">{n.page + 1}</span>
              </button>
            </div>
            {hasKids && open && (
              <div className="toc-children">
                {n.children.map((c) => (
                  <div className="toc-line" key={c.key}>
                    <span className="toc-chev no-kids" />
                    <button className={'toc-row toc-sub' + (c.page === currentIndex ? ' current' : '')} onClick={() => onNav(c.page)}>
                      <span className="toc-text">{c.text}</span>
                      <span className="toc-pg">{c.page + 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { collectMatches, FindBar, buildTOC, TOCTree });

/* ════════════════════ files.jsx ════════════════════ */
// files.jsx — Split result dialog + Files (session outputs) view + shared
// MiniPage preview. Driven by props from App.

function MiniPage({ page, w = 92 }) {
  const scale = w / PAGE_W;
  return (
    <div style={{ width: w, height: PAGE_H * scale, background: 'var(--doc-bg)', borderRadius: 4,
      overflow: 'hidden', boxShadow: '0 0 0 1px var(--border-strong)', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <SamplePageContent type={page.type} />
      </div>
    </div>
  );
}

// ── Split result dialog ──
function SplitResultModal({ result, onDownload, onOpen, onClose }) {
  const [name, setName] = React.useState(result.name);
  const n = result.pages.length;
  return ReactDOM.createPortal(
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(620px,95vw)' }}>
        <div className="modal-hd">
          <div>
            <h3>Split result</h3>
            <p>{n} page{n > 1 ? 's' : ''} extracted into a new PDF. Your original document is unchanged.</p>
          </div>
          <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ marginBottom: 16 }}>
            <div className="field-lbl">File name</div>
            <div style={{ position: 'relative' }}>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                     style={{ paddingRight: 44, fontWeight: 500 }} autoFocus
                     onFocus={(e) => { const i = e.target.value.lastIndexOf('.pdf'); if (i > 0) e.target.setSelectionRange(0, i); }} />
            </div>
          </div>
          <div className="field-lbl" style={{ marginBottom: 8 }}>Pages in this PDF</div>
          <div className="split-preview">
            {result.pages.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <MiniPage page={p} w={92} />
                <span style={{ fontFamily: 'var(--mono-font)', fontSize: 10.5, color: 'var(--text-3)' }}>{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={() => onOpen(name.trim() || result.name)}><Icon name="file" size={16} /> Open as new document</button>
          <button className="btn primary" onClick={() => onDownload(name.trim() || result.name)}><Icon name="download" size={16} /> Download</button>
        </div>
      </div>
    </div>, document.body);
}

// ── Files (session outputs) view ──
const FILE_KIND = {
  document: { icon: 'file', label: 'Document' },
  split: { icon: 'split', label: 'Split' },
  export: { icon: 'download', label: 'Export' },
  merge: { icon: 'merge', label: 'Merged' },
};
function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  return Math.floor(s / 3600) + 'h ago';
}

function FileRow({ file, badge, isCurrent, onOpen, onDownload, onRename, onDelete }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(file.name);
  React.useEffect(() => setVal(file.name), [file.name]);
  const meta = FILE_KIND[file.kind] || FILE_KIND.document;
  const commit = () => { setEditing(false); const v = val.trim(); if (v && v !== file.name) onRename(v); else setVal(file.name); };
  return (
    <div className={'file-row' + (isCurrent ? ' current' : '')}>
      <div className="file-ic"><Icon name={meta.icon} size={20} /></div>
      <div className="file-main">
        {editing ? (
          <input className="input" style={{ height: 30, fontSize: 13 }} value={val} autoFocus
                 onChange={(e) => setVal(e.target.value)} onBlur={commit}
                 onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(file.name); setEditing(false); } }} />
        ) : (
          <div className="file-name" onDoubleClick={() => setEditing(true)} title={file.name}>{file.name}</div>
        )}
        <div className="file-meta">
          {file.pages.length} page{file.pages.length > 1 ? 's' : ''} · {meta.label}{file.when ? ' · ' + timeAgo(file.when) : ''}
          {isCurrent && ' · open now'}
        </div>
      </div>
      {badge && <span className="file-badge">{badge}</span>}
      <div className="file-actions">
        <Tip label="Rename" side="top"><button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => setEditing(true)} aria-label="Rename"><Icon name="edit" size={16} /></button></Tip>
        <Tip label="Download" side="top"><button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => onDownload(file)} aria-label="Download"><Icon name="download" size={16} /></button></Tip>
        {isCurrent
          ? <button className="btn" disabled style={{ height: 30, padding: '0 10px' }}>Current</button>
          : <button className="btn" style={{ height: 30, padding: '0 12px' }} onClick={() => onOpen(file)}><Icon name="eye" size={15} /> Open</button>}
        {onDelete && !isCurrent && <Tip label="Remove" side="top"><button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => onDelete(file)} aria-label="Remove"><Icon name="trash" size={16} /></button></Tip>}
      </div>
    </div>
  );
}

function FilesModal({ workingDoc, files, onOpen, onDownload, onRenameWorking, onRenameFile, onDelete, onClose }) {
  return ReactDOM.createPortal(
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(640px,95vw)' }}>
        <div className="modal-hd">
          <div><h3>Files</h3><p>Documents and outputs from this session. Double-click a name to rename.</p></div>
          <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="files-list">
            <FileRow file={workingDoc} badge="Working" isCurrent
                     onRename={onRenameWorking} onDownload={onDownload} />
            {files.length === 0 && (
              <div className="files-empty">
                <Icon name="folder" size={26} />
                <p>No outputs yet. Splitting, merging or exporting will list files here.</p>
              </div>
            )}
            {files.map((f) => (
              <FileRow key={f.id} file={f} onOpen={onOpen} onDownload={onDownload}
                       onRename={(name) => onRenameFile(f.id, name)} onDelete={onDelete} />
            ))}
          </div>
        </div>
      </div>
    </div>, document.body);
}

Object.assign(window, { MiniPage, SplitResultModal, FilesModal });

/* ════════════════════ app.jsx ════════════════════ */
// app.jsx — root: state, undo/redo history, file flows, keyboard shortcuts,
// thumbnail menu, confirm dialog, Tweaks, and mount.

// React + hooks are imported at the top of the bundled module (PdfEditor.jsx).

const TWEAK_DEFAULTS = {
  accent: "#2563EB",
  theme: "light",
  density: "comfortable",
  radius: 7,
};

const DENSE_CSS = `
  .app.dense .canvas-pages{gap:18px;padding:22px 24px 64px}
  .app.dense .appbar{height:50px}
  .app.dense .toolbar{width:56px}
  .app.dense .tool{width:40px;height:40px}
  .app.dense .props-body{gap:14px;padding:13px}
  .app.dense .thumbs-scroll{gap:2px;padding:8px 0}
  .app.dense .props{width:268px}
`;

let toastSeq = 0;

function useSystemDark() {
  const [d, setD] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e) => setD(e.matches);
    m.addEventListener ? m.addEventListener('change', h) : m.addListener(h);
    return () => { m.removeEventListener ? m.removeEventListener('change', h) : m.removeListener(h); };
  }, []);
  return d;
}

function App() {
  // Settings state (was the Claude Design host `useTweaks`); driven by the gear menu.
  const [t, setT] = useState(TWEAK_DEFAULTS);
  const setTweak = useCallback((k, v) => setT((p) => ({ ...p, [k]: v })), []);

  // doc lifecycle
  const [loaded, setLoaded] = useState(false);
  const [converting, setConverting] = useState(null);
  const [docName, setDocName] = useState(SAMPLE_DOC.name);
  const [pages, setPages] = useState([]);
  const [annotations, setAnnotations] = useState({});

  // view
  const [tool, setTool] = useState('select');
  const [selectedAnnoId, setSelectedAnnoId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollToken, setScrollToken] = useState(0);
  const [zoom, setZoom] = useState(0.92);
  const [thumbsOpen, setThumbsOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  // protection
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [protectOpen, setProtectOpen] = useState(false);
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [perms, setPerms] = useState({ print: true, copy: true, edit: false });

  // tool props
  const [tp, setTp] = useState({ family: 'var(--ui-font)', size: 16, weight: 500, color: '#1A1D21', align: 'left' });
  const [hp, setHp] = useState({ color: '#FFE16A', opacity: 0.4, minH: 18 });
  const [dp, setDp] = useState({ color: '#2563EB', width: 3 });

  // signature
  const [sigModal, setSigModal] = useState(false);
  const [savedSigs, setSavedSigs] = useState([]);
  const [pendingSig, setPendingSig] = useState(null);

  // split
  const [splitSel, setSplitSel] = useState([]);
  const [splitFrom, setSplitFrom] = useState(1);
  const [splitTo, setSplitTo] = useState(1);

  // misc UI
  const [toasts, setToasts] = useState([]);
  const [thumbMenu, setThumbMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [leftTab, setLeftTab] = useState('pages');
  const [splitResult, setSplitResult] = useState(null);
  const [outputFiles, setOutputFiles] = useState([]);
  const [filesOpen, setFilesOpen] = useState(false);
  const saveTimer = useRef(null);
  const systemDark = useSystemDark();

  // search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const findInputRef = useRef(null);

  // history
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const snap = () => ({ pages, annotations, docName, isProtected, password });
  const applySnap = (s) => { setPages(s.pages); setAnnotations(s.annotations); setDocName(s.docName); setIsProtected(s.isProtected); setPassword(s.password); };
  const record = useCallback(() => { setPast((p) => [...p.slice(-49), snap()]); setFuture([]); });
  const undo = () => setPast((p) => { if (!p.length) return p; setFuture((f) => [snap(), ...f]); applySnap(p[p.length - 1]); return p.slice(0, -1); });
  const redo = () => setFuture((f) => { if (!f.length) return f; setPast((p) => [...p, snap()]); applySnap(f[0]); return f.slice(1); });

  // ── toasts ──
  const toast = useCallback((msg, kind = 'info', sub) => {
    const id = ++toastSeq;
    setToasts((ts) => [...ts, { id, msg, kind, sub }]);
    setTimeout(() => setToasts((ts) => ts.map((x) => x.id === id ? { ...x, out: true } : x)), 2600);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 2900);
  }, []);

  const markSaving = useCallback(() => {
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus('saved'), 850);
  }, []);

  // ── load / convert ──
  const fitToWidth = useCallback(() => {
    const el = document.querySelector('.canvas-scroll');
    if (!el) return;
    const z = Math.min(1.6, Math.max(0.4, (el.clientWidth - 80) / PAGE_W));
    setZoom(Math.round(z * 100) / 100);
  }, []);

  const doLoad = (newPages, name, ann = {}) => {
    setPages(newPages); setAnnotations(ann); setDocName(name); setLoaded(true);
    setPast([]); setFuture([]); setCurrentIndex(0);
    setSplitFrom(1); setSplitTo(newPages.length);
    setTimeout(fitToWidth, 60);
  };

  // ── session files (outputs) ──
  const addFile = (f) => setOutputFiles((prev) => [{ id: 'f' + Date.now() + Math.random().toString(36).slice(2, 5), when: Date.now(), ...f }, ...prev]);
  const snapshotWorking = () => setOutputFiles((prev) => {
    if (prev.some((x) => x.kind === 'document' && x.name === docName && x.pages.length === pages.length)) return prev;
    return [{ id: 'f' + Date.now(), when: Date.now(), kind: 'document', name: docName, pages, annotations }, ...prev];
  });
  const openFileRecord = (file) => { snapshotWorking(); doLoad(file.pages.map((p) => ({ ...p })), file.name, file.annotations || {}); setFilesOpen(false); toast('Opened', 'success', file.name); };
  const downloadFile = (file) => toast('PDF downloaded', 'success', file.name);
  const renameFile = (id, name) => setOutputFiles((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  const deleteFile = (file) => setOutputFiles((prev) => prev.filter((f) => f.id !== file.id));

  const startConvert = (files, after) => {
    setConverting(files);
    setTimeout(() => { setConverting(null); after(); }, 1500);
  };

  const loadSample = () => {
    const ps = SAMPLE_DOC.pages.map((p) => ({ ...p, rotation: 0 }));
    startConvert([{ name: SAMPLE_DOC.name, icon: 'file' }], () => { doLoad(ps, SAMPLE_DOC.name); toast('Document ready', 'success', '5 pages loaded'); });
  };
  const openFile = () => {
    if (!loaded) return loadSample();
    // simulate browse → convert sample again
    startConvert([{ name: 'Northwind-MSA-2026.pdf', icon: 'file' }], () => { doLoad(SAMPLE_DOC.pages.map((p) => ({ ...p, rotation: 0 })), SAMPLE_DOC.name); toast('Document opened', 'success'); });
  };

  // ── annotation ops ──
  const beginEdit = useCallback(() => record(), [pages, annotations, docName, isProtected, password]);
  const addAnno = (pageId, anno) => { record(); setAnnotations((a) => ({ ...a, [pageId]: [...(a[pageId] || []), anno] })); markSaving(); };
  const updateAnno = (id, patch) => {
    setAnnotations((a) => {
      const n = {}; for (const k in a) n[k] = a[k].map((x) => x.id === id ? { ...x, ...patch } : x); return n;
    }); markSaving();
  };
  const deleteAnno = (id) => { record(); setAnnotations((a) => { const n = {}; for (const k in a) n[k] = a[k].filter((x) => x.id !== id); return n; }); setSelectedAnnoId(null); markSaving(); };

  const selectedAnno = useMemo(() => { for (const k in annotations) { const f = annotations[k].find((x) => x.id === selectedAnnoId); if (f) return f; } return null; }, [annotations, selectedAnnoId]);

  // tool-prop setters that also update a live selection
  const setTP = (patch) => { setTp((p) => ({ ...p, ...patch })); if (selectedAnno && selectedAnno.type === 'text') updateAnno(selectedAnno.id, patch); };
  const setHP = (patch) => { setHp((p) => ({ ...p, ...patch })); if (selectedAnno && selectedAnno.type === 'highlight') updateAnno(selectedAnno.id, patch); };
  const setDP = (patch) => { setDp((p) => ({ ...p, ...patch })); if (selectedAnno && selectedAnno.type === 'draw') updateAnno(selectedAnno.id, patch); };

  // ── page ops ──
  const reorder = (from, to) => { record(); setPages((p) => { const n = [...p]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; }); markSaving(); toast('Page moved', 'info'); };
  const rotatePage = (i) => { record(); setPages((p) => p.map((pg, j) => j === i ? { ...pg, rotation: ((pg.rotation || 0) + 90) % 360 } : pg)); markSaving(); };
  const duplicatePage = (i) => { record(); setPages((p) => { const n = [...p]; const src = n[i]; const copy = { ...src, id: 'p' + Date.now() }; n.splice(i + 1, 0, copy); return n; }); markSaving(); toast('Page duplicated', 'info'); };
  const deletePage = (i) => {
    setConfirm({
      title: 'Delete this page?', body: `Page ${i + 1} will be removed from the document. You can undo this action.`,
      confirmLabel: 'Delete page', danger: true,
      onConfirm: () => { record(); setPages((p) => p.filter((_, j) => j !== i)); markSaving(); toast('Page deleted', 'info'); setConfirm(null); },
    });
  };

  // ── merge / split / protect / export ──
  const mergeFiles = () => {
    const startIdx = pages.length;
    startConvert([{ name: 'Addendum-B.docx', icon: 'word' }, { name: 'Cover-letter.png', icon: 'image' }], () => {
      record();
      setPages((p) => [...p, { id: 'p' + Date.now(), type: 'body-2', rotation: 0 }, { id: 'p' + (Date.now() + 1), type: 'cover', rotation: 0 }]);
      markSaving(); setLeftTab('pages'); setCurrentIndex(startIdx); setScrollToken((x) => x + 1);
      toast('2 files merged', 'success', 'Jumped to the new pages');
    });
  };
  const doSplit = () => {
    let chosen;
    if (splitSel.length > 0) chosen = pages.filter((p) => splitSel.includes(p.id));
    else { const a = Math.min(splitFrom, splitTo), b = Math.max(splitFrom, splitTo); chosen = pages.slice(a - 1, b); }
    if (!chosen.length) return;
    const base = docName.replace(/\.pdf$/i, '');
    const ann = {}; chosen.forEach((p) => { if (annotations[p.id]) ann[p.id] = annotations[p.id]; });
    setSplitResult({ name: `${base} — extract (${chosen.length} ${chosen.length > 1 ? 'pages' : 'page'}).pdf`, pages: chosen.map((p) => ({ ...p })), annotations: ann });
  };
  const splitDownload = (name) => { addFile({ kind: 'split', name, pages: splitResult.pages, annotations: splitResult.annotations }); toast('PDF downloaded', 'success', name); setSplitResult(null); setSplitSel([]); };
  const splitOpen = (name) => { snapshotWorking(); addFile({ kind: 'split', name, pages: splitResult.pages, annotations: splitResult.annotations }); doLoad(splitResult.pages.map((p) => ({ ...p })), name, splitResult.annotations); setSplitResult(null); setSplitSel([]); setTool('select'); toast('Opened split document', 'success', name); };
  const applyProtect = () => {
    record(); setIsProtected(true); setPassword(pw); setProtectOpen(false); setPw(''); setPw2('');
    toast('Document protected', 'success', 'Password and permissions applied');
  };
  const removeProtect = () => { record(); setIsProtected(false); setPassword(''); setProtectOpen(false); toast('Protection removed', 'info'); };
  const exportPdf = () => { markSaving(); addFile({ kind: 'export', name: docName, pages, annotations }); toast('PDF exported', 'success', isProtected ? 'Encrypted · added to Files' : 'Downloaded · added to Files'); };
  const save = () => { markSaving(); setTimeout(() => toast('All changes saved', 'success'), 120); };

  // ── tool selection ──
  const pickTool = (id) => {
    setTool(id); setProtectOpen(false);
    if (id !== 'signature') setPendingSig(null);
    if (id !== 'split') setSplitSel([]);
    if (id === 'merge') { /* panel shows merge */ }
    setPanelOpen(true);
  };
  const onProtectBtn = () => { setProtectOpen((v) => { const n = !v; if (n) { setPanelOpen(true); } return n; }); };

  // ── thumbnail interactions ──
  const onThumbSelect = (i, pageId) => {
    if (tool === 'split') { toggleSplit(pageId); }
    else { setCurrentIndex(i); setScrollToken((x) => x + 1); }
  };
  const toggleSplit = (pageId) => setSplitSel((s) => s.includes(pageId) ? s.filter((x) => x !== pageId) : [...s, pageId]);
  const openThumbMenu = (e, i, page) => { const r = e.currentTarget.getBoundingClientRect(); setThumbMenu({ rect: r, index: i, page }); };

  // ── signatures ──
  const onSaveSig = (sig) => { setSavedSigs((s) => [...s, sig]); setSigModal(false); setPendingSig(sig); setTool('signature'); toast('Signature saved', 'success', 'Click a page to place it'); };
  const placeSig = (sig) => { setPendingSig(sig); setTool('signature'); toast('Click a page to place the signature', 'info'); };

  // ── zoom ──
  const setZ = (z) => setZoom(Math.min(4, Math.max(0.25, Math.round(z * 100) / 100)));
  const onWheelZoom = (dir) => setZ(zoom * (dir > 0 ? 1.1 : 1 / 1.1));
  const gotoPage = (n) => { const i = Math.min(pages.length, Math.max(1, n || 1)) - 1; setCurrentIndex(i); setScrollToken((x) => x + 1); };

  // ── search ──
  const openFind = () => { setSearchOpen(true); setTimeout(() => findInputRef.current && findInputRef.current.select(), 30); };
  const closeFind = () => { setSearchOpen(false); setMatches([]); setCurrentMatch(-1); };
  const nextMatch = () => { if (matches.length) setCurrentMatch((c) => (c + 1) % matches.length); };
  const prevMatch = () => { if (matches.length) setCurrentMatch((c) => (c - 1 + matches.length) % matches.length); };

  // recompute matches when query / options / page order change
  useEffect(() => {
    if (!loaded || !searchOpen || !searchQuery.trim()) { setMatches([]); setCurrentMatch(-1); return; }
    const id = setTimeout(() => {
      const m = collectMatches(searchQuery, matchCase);
      setMatches(m); setCurrentMatch(m.length ? 0 : -1);
    }, 40);
    return () => clearTimeout(id);
  }, [searchQuery, matchCase, searchOpen, loaded, pages, zoom]);

  // scroll the current match into view
  useEffect(() => {
    if (currentMatch < 0 || !matches[currentMatch]) return;
    const m = matches[currentMatch];
    const sc = document.querySelector('.canvas-scroll');
    const wrap = document.querySelectorAll('.canvas-pages .sheet-wrap')[m.page];
    if (sc && wrap) {
      const r = m.rects[0];
      const top = wrap.offsetTop + (r ? r.y * zoom : 0) - sc.clientHeight * 0.32;
      sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    setCurrentIndex(m.page);
  }, [currentMatch, matches]);

  const navToPage = (i) => { setCurrentIndex(i); setScrollToken((x) => x + 1); };

  // ── keyboard ──
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.matches('input,textarea,[contenteditable="true"]');
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); if (loaded) save(); return; }
      if (mod && e.key.toLowerCase() === 'f') { e.preventDefault(); if (loaded) openFind(); return; }
      if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZ(zoom * 1.1); return; }
      if (mod && e.key === '-') { e.preventDefault(); setZ(zoom / 1.1); return; }
      if (typing) return;
      if (e.key === 'Escape') { if (searchOpen) { closeFind(); return; } setSelectedAnnoId(null); setThumbMenu(null); setProtectOpen(false); setPendingSig(null); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnoId) { e.preventDefault(); deleteAnno(selectedAnnoId); return; }
      if (!loaded) return;
      const map = { v: 'select', t: 'text', h: 'highlight', d: 'draw', s: 'signature', m: 'merge', p: 'split' };
      if (map[e.key.toLowerCase()] && !mod) pickTool(map[e.key.toLowerCase()]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // resize → refit if zoom near fit
  useEffect(() => { const r = () => {}; window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);

  // ── derived panel mode ──
  const panelMode = protectOpen ? 'protect' : (selectedAnno ? selectedAnno.type : tool);

  const effectiveDark = t.theme === 'dark' || (t.theme === 'system' && systemDark);
  // light keeps the chosen accent; dark uses GitHub green
  const GH_GREEN = '#238636';
  const accentColor = effectiveDark ? GH_GREEN : t.accent;

  // mirror theme + tokens onto <html> so portaled UI (modals, toasts, menus) themes too
  useEffect(() => {
    const r = document.documentElement;
    r.classList.toggle('theme-dark', effectiveDark);
    r.style.setProperty('--accent', accentColor);
    r.style.setProperty('--radius', t.radius + 'px');
  }, [effectiveDark, accentColor, t.radius]);

  // keep the default text-tool color readable when the page flips light/dark
  useEffect(() => {
    setTp((p) => {
      if (effectiveDark && p.color === '#1A1D21') return { ...p, color: '#ffffff' };
      if (!effectiveDark && p.color === '#ffffff') return { ...p, color: '#1A1D21' };
      return p;
    });
  }, [effectiveDark]);

  const appClass = 'app' + (effectiveDark ? ' theme-dark' : '') + (t.density === 'compact' ? ' dense' : '');
  const rootStyle = { '--accent': accentColor, '--radius': t.radius + 'px' };

  return (
    <div className={appClass} style={rootStyle}>
      {t.density === 'compact' && <style>{DENSE_CSS}</style>}

      <TopBar
        docName={docName} onRename={(v) => { record(); setDocName(v); markSaving(); }}
        isProtected={isProtected} saveStatus={saveStatus} hasDoc={loaded}
        canUndo={past.length > 0} canRedo={future.length > 0} onUndo={undo} onRedo={redo}
        onOpen={openFile} onSave={save} onExport={exportPdf} onProtect={onProtectBtn} onFind={openFind} onFiles={() => setFilesOpen(true)} />

      <div className="app-mid">
        <LeftToolbar activeTool={tool} onTool={pickTool} disabled={!loaded}
          settingsOpen={!!settingsAnchor} onOpenSettings={(rect) => setSettingsAnchor((a) => a ? null : rect)} />

        {loaded && thumbsOpen && (
          <ThumbStrip pages={pages} currentIndex={currentIndex} splitSel={splitSel} tool={tool}
            annotations={annotations} onSelect={onThumbSelect} onReorder={reorder} onMenu={openThumbMenu}
            tab={leftTab} onTab={setLeftTab} onTocNav={navToPage}
            onCollapse={() => setThumbsOpen(false)} />
        )}

        <div className="stage">
          {!loaded && !converting && (
            <EmptyState onLoadSample={loadSample} onBrowse={openFile} dragOver={dragOver}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); loadSample(); }} />
          )}
          {converting && <Converting files={converting} />}
          {loaded && !converting && searchOpen && (
            <FindBar query={searchQuery} onQuery={setSearchQuery} matchCase={matchCase}
              onToggleCase={() => setMatchCase((v) => !v)} total={matches.length} current={currentMatch}
              onNext={nextMatch} onPrev={prevMatch} onClose={closeFind} inputRef={findInputRef} />
          )}
          {loaded && !converting && (
            <Canvas pages={pages} zoom={zoom} currentIndex={currentIndex} scrollToken={scrollToken}
              onCurrentChange={setCurrentIndex} onWheelZoom={onWheelZoom} tool={tool}
              annotations={annotations} toolProps={{ tp, hp, dp }} selectedId={selectedAnnoId}
              onAddAnno={(pid, an) => addAnno(pid, an)} onUpdateAnno={updateAnno}
              onSelectAnno={setSelectedAnnoId}
              onDeleteAnno={deleteAnno} onBeginEdit={beginEdit}
              pendingSig={pendingSig} onPlacedSig={() => setPendingSig(null)}
              searchMatches={searchOpen ? matches : null} currentMatch={currentMatch}
              splitSel={splitSel} onToggleSplit={toggleSplit} />
          )}

          {loaded && (
            <StatusBar pageIndex={currentIndex} pageCount={pages.length} zoom={zoom}
              onZoomIn={() => setZ(zoom * 1.1)} onZoomOut={() => setZ(zoom / 1.1)} onZoomReset={() => setZ(1)} onFit={fitToWidth}
              onPrev={() => gotoPage(currentIndex)} onNext={() => gotoPage(currentIndex + 2)} onGoto={gotoPage}
              saveStatus={saveStatus} isProtected={isProtected} tool={tool} />
          )}

          {/* re-open thumbs / panel toggles */}
          {loaded && !thumbsOpen && (
            <button className="btn" style={{ position: 'absolute', left: 12, top: 12, height: 30, padding: '0 10px', zIndex: 12 }} onClick={() => setThumbsOpen(true)}>
              <Icon name="thumbs" size={15} /> Pages
            </button>
          )}
          {loaded && !panelOpen && (
            <button className="btn" style={{ position: 'absolute', right: 12, top: 12, height: 30, padding: '0 10px', zIndex: 12 }} onClick={() => setPanelOpen(true)}>
              <Icon name="panel" size={15} /> Properties
            </button>
          )}
        </div>

        {loaded && panelOpen && (
          <RightPanel mode={panelMode} onClose={() => { setPanelOpen(false); setProtectOpen(false); }}
            selectedKind={selectedAnno && selectedAnno.type}
            tp={tp} setTP={setTP} hp={hp} setHP={setHP} dp={dp} setDP={setDP}
            savedSigs={savedSigs} onAddSig={() => setSigModal(true)} onPlaceSig={placeSig}
            pageCount={pages.length} splitFrom={splitFrom} splitTo={splitTo}
            setSplit={(f, to) => { setSplitFrom(f); setSplitTo(to); }} selectedCount={splitSel.length} onSplit={doSplit}
            onAddFiles={mergeFiles} isProtected={isProtected}
            pw={pw} setPw={setPw} pw2={pw2} setPw2={setPw2} perms={perms} setPerms={setPerms}
            onApply={applyProtect} onRemove={removeProtect} />
        )}
      </div>

      {/* thumbnail menu */}
      {thumbMenu && (
        <Popover anchorRect={thumbMenu.rect} align="right" onClose={() => setThumbMenu(null)}>
          <button className="menu-item" onClick={() => { rotatePage(thumbMenu.index); setThumbMenu(null); }}><Icon name="rotate" size={16} /> Rotate 90°</button>
          <button className="menu-item" onClick={() => { duplicatePage(thumbMenu.index); setThumbMenu(null); }}><Icon name="duplicate" size={16} /> Duplicate</button>
          <button className="menu-item" onClick={() => { setScrollToken((x) => x + 1); setCurrentIndex(thumbMenu.index); setThumbMenu(null); }}><Icon name="eye" size={16} /> Go to page</button>
          <div className="menu-sep" />
          <button className="menu-item danger" onClick={() => { const idx = thumbMenu.index; setThumbMenu(null); deletePage(idx); }} disabled={pages.length <= 1}><Icon name="trash" size={16} /> Delete page</button>
        </Popover>
      )}

      {/* signature modal */}
      {sigModal && <SignatureModal onClose={() => setSigModal(false)} onSave={onSaveSig} />}

      {/* split result */}
      {splitResult && <SplitResultModal result={splitResult} onDownload={splitDownload} onOpen={splitOpen} onClose={() => setSplitResult(null)} />}

      {/* files view */}
      {filesOpen && (
        <FilesModal workingDoc={{ name: docName, pages, kind: 'document', when: null }} files={outputFiles}
          onOpen={openFileRecord} onDownload={downloadFile}
          onRenameWorking={(name) => { record(); setDocName(name); markSaving(); }}
          onRenameFile={renameFile} onDelete={deleteFile} onClose={() => setFilesOpen(false)} />
      )}

      {/* settings menu */}
      {settingsAnchor && (
        <SettingsMenu anchorRect={settingsAnchor} theme={t.theme} onTheme={(v) => setTweak('theme', v)}
          density={t.density} onDensity={(v) => setTweak('density', v)}
          thumbsOpen={thumbsOpen} onThumbs={() => setThumbsOpen((v) => !v)}
          panelOpen={panelOpen} onPanel={() => setPanelOpen((v) => !v)}
          onClose={() => setSettingsAnchor(null)} />
      )}

      {/* confirm dialog */}
      {confirm && ReactDOM.createPortal(
        <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && setConfirm(null)}>
          <div className="modal" style={{ width: 'min(420px,92vw)' }}>
            <div className="modal-hd"><div><h3>{confirm.title}</h3></div></div>
            <div className="modal-body"><p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{confirm.body}</p></div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn primary" style={confirm.danger ? { background: '#d83a3f' } : {}} onClick={confirm.onConfirm}>{confirm.confirmLabel}</button>
            </div>
          </div>
        </div>, document.body)}

      <Toasts toasts={toasts} />
    </div>
  );
}

export default App;
