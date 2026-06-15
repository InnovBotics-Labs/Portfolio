"use client";

/* ============================================================
   Prabhu's CODE Formatter (Lattice) — React port of the prototype's
   app.js + settings.js UI. Conversion logic is reused from engine.js.
   ============================================================ */
import React from "react";
import * as engine from "./engine";

const { useState, useRef, useEffect, useMemo, useCallback } = React;

const FORMATS = ["json", "yaml", "xml", "csv", "tsv", "toml"];
const LABEL = { json: "JSON", yaml: "YAML", xml: "XML", csv: "CSV", tsv: "TSV", toml: "TOML" };
const EXT = { json: "json", yaml: "yaml", xml: "xml", csv: "csv", tsv: "tsv", toml: "toml" };
const MIME = {
  json: "application/json", yaml: "text/yaml", xml: "application/xml",
  csv: "text/csv", tsv: "text/tab-separated-values", toml: "text/plain",
};
const EXT_TO_FORMAT = { json: "json", yaml: "yaml", yml: "yaml", xml: "xml", csv: "csv", tsv: "tsv", toml: "toml" };

const SAMPLES = {
  json: '{\n  "service": "lattice",\n  "version": 2,\n  "active": true,\n  "maintainer": null,\n  "formats": ["json", "yaml", "xml", "csv", "toml"],\n  "limits": {\n    "maxDepth": 64,\n    "debounceMs": 350\n  },\n  "users": [\n    { "name": "Ada",    "admin": true,  "score": 98.5 },\n    { "name": "Linus",  "admin": false, "score": 87 }\n  ]\n}',
  yaml: "service: lattice\nversion: 2\nactive: true\nmaintainer: null\nformats:\n  - json\n  - yaml\n  - xml\n  - csv\n  - toml\nlimits:\n  maxDepth: 64\n  debounceMs: 350\nusers:\n  - name: Ada\n    admin: true\n    score: 98.5\n  - name: Linus\n    admin: false\n    score: 87\n",
  xml: '<?xml version="1.0" encoding="UTF-8"?>\n<service name="lattice" version="2">\n  <active>true</active>\n  <formats>\n    <format>json</format>\n    <format>yaml</format>\n    <format>xml</format>\n  </formats>\n  <users>\n    <user admin="true">\n      <name>Ada</name>\n      <score>98.5</score>\n    </user>\n    <user admin="false">\n      <name>Linus</name>\n      <score>87</score>\n    </user>\n  </users>\n</service>',
  csv: "name,admin,score,team.size,team.region\nAda,true,98.5,4,eu-west\nLinus,false,87,9,us-east\nGrace,true,91.2,2,ap-south\n",
  tsv: "name\tadmin\tscore\tteam.size\tteam.region\nAda\ttrue\t98.5\t4\teu-west\nLinus\tfalse\t87\t9\tus-east\nGrace\ttrue\t91.2\t2\tap-south\n",
  toml: 'service = "lattice"\nversion = 2\nactive = true\nformats = ["json", "yaml", "xml", "csv", "toml"]\n\n[limits]\nmaxDepth = 64\ndebounceMs = 350\n\n[[users]]\nname = "Ada"\nadmin = true\nscore = 98.5\n\n[[users]]\nname = "Linus"\nadmin = false\nscore = 87\n',
};

const LINE_H = 22, PAD_TOP = 14;

/* ---------- helpers ---------- */
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function highlight(text, q) {
  if (!q) return escapeHtml(text);
  const re = new RegExp("(" + escapeReg(q) + ")", "ig");
  return String(text).split(re).map((p, i) => (i % 2 ? "<mark>" + escapeHtml(p) + "</mark>" : escapeHtml(p))).join("");
}

// One bottom-up pass: match count, filter-visible paths, and matched containers (auto-expand).
function analyze(model, parsed, qLower) {
  const visible = new Set(), subtree = new Set();
  let count = 0;
  if (!parsed) return { count, visible, subtree };
  function walk(label, value, path, force) {
    const type = engine.typeOf(value);
    const container = type === "object" || type === "array";
    let self = false;
    if (qLower) {
      if (String(label).toLowerCase().indexOf(qLower) !== -1) self = true;
      if (!container) {
        const vs = (value === null ? "null" : String(value)).toLowerCase();
        if (vs.indexOf(qLower) !== -1) self = true;
      }
      if (self) count++;
    }
    const childForce = force || self;
    let sub = self;
    if (container) {
      const entries = type === "array"
        ? value.map((v, i) => [String(i), v, path + "[" + i + "]"])
        : Object.keys(value).map((k) => [k, value[k], path + "." + k]);
      for (const [l, v, p] of entries) { if (walk(l, v, p, childForce)) sub = true; }
    }
    if (!qLower || force || sub) visible.add(path);
    if (qLower && sub && container) subtree.add(path);
    return sub;
  }
  walk("root", model, "root", false);
  return { count, visible, subtree };
}

function collectContainerPaths(value, path, acc) {
  const t = engine.typeOf(value);
  if (t === "array") { acc.push(path); value.forEach((v, i) => collectContainerPaths(v, path + "[" + i + "]", acc)); }
  else if (t === "object") { acc.push(path); Object.keys(value).forEach((k) => collectContainerPaths(value[k], path + "." + k, acc)); }
  return acc;
}

/* ---------- recursive tree node ---------- */
function TreeNode({ label, value, path, isArrayChild, query, mode, analysis, collapsed, onToggle, onCopyPath }) {
  const type = engine.typeOf(value);
  const container = type === "object" || type === "array";
  const q = query.trim();
  if (q && mode === "filter" && !analysis.visible.has(path)) return null;

  const entries = container
    ? (type === "array"
      ? value.map((v, i) => ({ label: String(i), value: v, path: path + "[" + i + "]", arr: true }))
      : Object.keys(value).map((k) => ({ label: k, value: value[k], path: path + "." + k, arr: false })))
    : null;

  let isCollapsed = !!collapsed[path];
  if (q && analysis.subtree.has(path)) isCollapsed = false;

  const disp = value === null ? "null" : String(value);
  const toggle = (e) => { e.preventDefault(); e.stopPropagation(); onToggle(path); };

  return (
    <div className={"node t-" + type + (isCollapsed ? " collapsed" : "")}>
      <div className="node-row">
        <span
          className={"caret" + (container ? "" : " leaf")}
          role={container ? "button" : undefined}
          tabIndex={container ? 0 : undefined}
          aria-label={container ? "Toggle " + label : undefined}
          onClick={container ? toggle : undefined}
          onKeyDown={container ? (e) => { if (e.key === "Enter" || e.key === " ") toggle(e); } : undefined}
        >
          <svg viewBox="0 0 10 10" fill="currentColor"><path d="M2 1l5 4-5 4z" /></svg>
        </span>
        <span
          className={"node-key" + (isArrayChild ? " idx" : "")}
          role="button" tabIndex={0} title={"Copy path  ·  " + path}
          onClick={() => onCopyPath(path)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCopyPath(path); } }}
          dangerouslySetInnerHTML={{ __html: q ? highlight(String(label), q) : escapeHtml(String(label)) }}
        />
        <span className="colon">:</span>
        <span className="badge">{type}</span>
        {container
          ? <span className="count">{type === "array" ? "[" + entries.length + "]" : "{" + entries.length + "}"}</span>
          : <span className={"val t-" + type} dangerouslySetInnerHTML={{ __html: q ? highlight(disp, q) : escapeHtml(disp) }} />}
      </div>
      {container && (
        <div className={"node-children" + (isCollapsed ? " collapsed" : "")}>
          {entries.map((en) => (
            <TreeNode key={en.path} label={en.label} value={en.value} path={en.path} isArrayChild={en.arr}
              query={query} mode={mode} analysis={analysis} collapsed={collapsed} onToggle={onToggle} onCopyPath={onCopyPath} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- main ---------- */
export default function JsonViewer() {
  const [inputText, setInputText] = useState(SAMPLES.json);
  const [inFormat, setInFormat] = useState("json");
  const [outFormat, setOutFormat] = useState("yaml");
  const [model, setModel] = useState(undefined);
  const [parsed, setParsed] = useState(false);
  const [error, setError] = useState(null); // { message, loc }
  const [search, setSearch] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [mode, setMode] = useState("filter");
  const [collapsed, setCollapsed] = useState({});
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [outCollapsed, setOutCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const taRef = useRef(null);
  const gutterRef = useRef(null);
  const bandRef = useRef(null);
  const fileRef = useRef(null);
  const toastSeq = useRef(0);

  /* ---- theme: defaults to light; user toggles in Settings ---- */
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  /* ---- toasts ---- */
  const toast = useCallback((label, code) => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t, { id, label, code }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))), 1700);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1950);
  }, []);

  const copyToClipboard = useCallback((text, label, code) => {
    const done = () => toast(label, code);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else done();
  }, [toast]);

  /* ---- parse ---- */
  const runParse = useCallback((text, fmt) => {
    if (text.trim() === "") { setModel(undefined); setParsed(false); setError(null); return; }
    try {
      let m = engine.parse(fmt, text);
      if (m === undefined) m = null;
      setModel(m); setParsed(true); setError(null);
    } catch (e) {
      setModel(undefined); setParsed(false);
      setError({ message: e && e.message ? e.message : "Unknown error", loc: e && e.loc ? e.loc : null });
    }
  }, []);

  // debounced parse on input/format change
  useEffect(() => {
    const id = setTimeout(() => runParse(inputText, inFormat), 350);
    return () => clearTimeout(id);
  }, [inputText, inFormat, runParse]);

  // initial parse (sample) immediately
  useEffect(() => { runParse(SAMPLES.json, "json"); }, [runParse]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearchApplied(search), 120);
    return () => clearTimeout(id);
  }, [search]);

  /* ---- gutter + error band ---- */
  const errorLine = error && error.loc && error.loc.line ? error.loc.line : 0;
  const lineCount = useMemo(() => inputText.split("\n").length, [inputText]);

  const positionBand = useCallback(() => {
    const ta = taRef.current, band = bandRef.current;
    if (!ta || !band) return;
    if (!errorLine) { band.style.display = "none"; return; }
    band.style.display = "block";
    band.style.top = PAD_TOP + (errorLine - 1) * LINE_H - ta.scrollTop + "px";
  }, [errorLine]);

  useEffect(() => {
    positionBand();
    if (errorLine && taRef.current) {
      const ta = taRef.current;
      const lineTop = PAD_TOP + (errorLine - 1) * LINE_H;
      const view = ta.clientHeight;
      if (lineTop < ta.scrollTop || lineTop > ta.scrollTop + view - LINE_H) {
        ta.scrollTop = Math.max(0, lineTop - view / 2);
        if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
        positionBand();
      }
    }
  }, [errorLine, positionBand, lineCount]);

  const onEditorScroll = () => {
    const ta = taRef.current;
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    positionBand();
  };

  /* ---- tree analysis ---- */
  const analysis = useMemo(
    () => analyze(model, parsed, searchApplied.trim().toLowerCase()),
    [model, parsed, searchApplied],
  );

  const onToggle = useCallback((path) => {
    setCollapsed((c) => { const n = { ...c }; if (n[path]) delete n[path]; else n[path] = true; return n; });
  }, []);
  const onCopyPath = useCallback((path) => copyToClipboard(path, "Path copied", path), [copyToClipboard]);
  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    if (!parsed) return;
    const next = {};
    collectContainerPaths(model, "root", []).forEach((p) => { if (p !== "root") next[p] = true; });
    setCollapsed(next);
  };

  /* ---- output ---- */
  const output = useMemo(() => {
    if (!parsed) return { kind: "info", text: "Output appears here once the input parses cleanly." };
    try { return { kind: "ok", text: engine.serialize(outFormat, model) }; }
    catch (e) { return { kind: "err", text: "Couldn't convert to " + LABEL[outFormat] + " —\n\n" + (e && e.message ? e.message : "Conversion failed.") }; }
  }, [parsed, outFormat, model]);

  const outputHtml = useMemo(() => {
    const q = searchApplied.trim();
    if (output.kind === "ok" && q && mode === "highlight") return { __html: highlight(output.text, q) };
    return null;
  }, [output, searchApplied, mode]);

  const lossy = output.kind === "ok" && (outFormat === "csv" || outFormat === "tsv");

  const doCopyOutput = () => { if (output.kind === "ok") copyToClipboard(output.text, "Copied " + LABEL[outFormat] + " output"); };
  const doDownload = () => {
    if (output.kind !== "ok") return;
    const blob = new Blob([output.text], { type: MIME[outFormat] + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "lattice." + EXT[outFormat];
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Downloaded", "lattice." + EXT[outFormat]);
  };

  /* ---- toolbar actions ---- */
  const visualize = () => runParse(inputText, inFormat);
  const loadSample = () => { const t = SAMPLES[inFormat] || SAMPLES.json; setInputText(t); runParse(t, inFormat); };
  const clearAll = () => { setInputText(""); setCollapsed({}); setModel(undefined); setParsed(false); setError(null); if (taRef.current) taRef.current.focus(); };
  const onUpload = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      const fmt = EXT_TO_FORMAT[ext] || inFormat;
      setInputText(text); setInFormat(fmt); setCollapsed({}); runParse(text, fmt);
      toast("Loaded", f.name);
    };
    reader.onerror = () => toast("Couldn't read that file");
    reader.readAsText(f);
    e.target.value = "";
  };

  /* ---- settings popover ---- */
  useEffect(() => {
    if (!settingsOpen) return;
    const onDoc = () => setSettingsOpen(false);
    const onKey = (e) => { if (e.key === "Escape") setSettingsOpen(false); };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey); };
  }, [settingsOpen]);

  // ⌘/Ctrl+Enter visualize (when focused in editor handled via textarea key; global too)
  const onEditorKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); visualize(); } };

  /* ---- status content ---- */
  let statusKind = "", statusNode = null;
  if (inputText.trim() === "") {
    statusKind = "";
    statusNode = (<>Waiting for input — paste {LABEL[inFormat]}, or hit <button className="inline-link" onClick={loadSample}>Sample</button>.</>);
  } else if (error) {
    statusKind = "err";
    statusNode = (<>Couldn&apos;t read as {LABEL[inFormat]}{error.loc && error.loc.line ? <span className="loc"> line {error.loc.line}{error.loc.column ? " · column " + error.loc.column : ""}</span> : null} — <span className="where">{error.message}</span></>);
  } else if (parsed) {
    statusKind = "ok";
    statusNode = summarize(model, inFormat);
  }

  const matchMeta = searchApplied.trim()
    ? <><b>{analysis.count}</b> match{analysis.count === 1 ? "" : "es"}</>
    : null;

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <svg className="glyph" viewBox="0 0 24 24" aria-hidden="true">
            <path className="brk" d="M8.2 6.5L3.5 12l4.7 5.5" />
            <path className="brk" d="M15.8 6.5L20.5 12l-4.7 5.5" />
            <path className="slash" d="M13.6 5l-3.2 14" />
          </svg>
          <span className="name"><b>Prabhu&apos;s CODE</b><span className="brand-badge">Formatter</span></span>
        </div>
        <span className="nav-div"></span>
        <div className="nav-actions">
          <button className="iconbtn primary" title="Visualize  ·  ⌘↵" aria-label="Visualize" onClick={visualize}>
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <button className="iconbtn" title="Load sample data" aria-label="Load sample data" onClick={loadSample}>
            <svg viewBox="0 0 24 24"><path d="M4 4h16v6H4zM4 14h10v6H4z" /></svg>
          </button>
          <button className="iconbtn" title="Upload a file" aria-label="Upload a file" onClick={() => fileRef.current && fileRef.current.click()}>
            <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14" /></svg>
          </button>
          <input ref={fileRef} type="file" accept=".json,.yaml,.yml,.xml,.csv,.tsv,.toml,.txt" hidden onChange={onUpload} />
          <button className="iconbtn" title="Clear input" aria-label="Clear input" onClick={clearAll}>
            <svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
          </button>
        </div>
        <span className="spacer"></span>
        <div className="nav-actions">
          <button className="iconbtn" title="Copy output" aria-label="Copy output" disabled={output.kind !== "ok"} onClick={doCopyOutput}>
            <svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
          </button>
          <button className="iconbtn" title="Download output" aria-label="Download output" disabled={output.kind !== "ok"} onClick={doDownload}>
            <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
          </button>
        </div>
        <span className="nav-div"></span>
        <button className="gear" aria-haspopup="true" aria-expanded={settingsOpen} aria-label="Settings"
          onClick={(e) => { e.stopPropagation(); setSettingsOpen((v) => !v); }}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l1.7-1.3-1.7-3-2 .8a7.7 7.7 0 0 0-2.6-1.5L14.4 3h-3.4l-.4 2.1a7.7 7.7 0 0 0-2.6 1.5l-2-.8-1.7 3 1.7 1.3a7.8 7.8 0 0 0 0 3l-1.7 1.3 1.7 3 2-.8a7.7 7.7 0 0 0 2.6 1.5l.4 2.1h3.4l.4-2.1a7.7 7.7 0 0 0 2.6-1.5l2 .8 1.7-3z" /></svg>
        </button>
        <div className={"settings-pop" + (settingsOpen ? " open" : "")} role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
          <h4>Settings</h4>
          <p className="sub">appearance</p>
          <div className="settings-row">
            <span className="lbl">Theme</span>
            <span className="spacer"></span>
            <div className="seg theme-seg" role="group" aria-label="Theme">
              <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
                <svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>Dark
              </button>
              <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>Light
              </button>
            </div>
          </div>
          <p className="settings-hint">Dark uses a GitHub-style canvas; Light is a warm editor paper. The six type-colors retune for legibility on each.</p>
        </div>
      </header>

      <main className={"workspace" + (treeCollapsed ? " tree-collapsed" : "") + (outCollapsed ? " out-collapsed" : "")}>
        {/* INPUT */}
        <section className="panel" aria-label="Input">
          <div className="panel-head">
            <span className="panel-title">Input</span>
            <span className="spacer"></span>
            <span className="field-label">format</span>
            <span className="select"><select aria-label="Input format" value={inFormat} onChange={(e) => setInFormat(e.target.value)}>
              {FORMATS.map((f) => <option key={f} value={f}>{LABEL[f]}</option>)}
            </select></span>
          </div>
          <div className="editor-wrap">
            <div className="gutter" id="gutter" aria-hidden="true" ref={gutterRef}>
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i} className={"ln" + (i + 1 === errorLine ? " err" : "")}>{i + 1}</span>
              ))}
            </div>
            <div className="editor-host">
              <div className="err-band" ref={bandRef}></div>
              <textarea id="input" spellCheck={false} autoComplete="off" autoCapitalize="off" wrap="off"
                placeholder="Paste JSON, YAML, XML, CSV, TSV or TOML here…"
                ref={taRef} value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onScroll={onEditorScroll} onKeyDown={onEditorKey} />
            </div>
          </div>
          <div className={"status " + statusKind}><span className="dot"></span><span className="msg">{statusNode}</span></div>
        </section>

        {/* TREE */}
        <section className="panel" id="tree-panel" aria-label="Tree explorer">
          <button className="panel-rail" title="Show tree explorer" aria-label="Show tree explorer" onClick={() => setTreeCollapsed(false)}>
            <svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6" /></svg>
            <span className="rail-label">Tree Explorer</span>
          </button>
          <div className="panel-body">
            <div className="panel-head">
              <span className="panel-title">Tree Explorer</span>
              <span className="spacer"></span>
              <button className="head-toggle" title="Collapse tree explorer" aria-label="Collapse tree explorer" aria-expanded={!treeCollapsed} onClick={() => setTreeCollapsed(true)}>
                <svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6" /></svg>
              </button>
            </div>
            <div className="tree-controls">
              <div className="search-row">
                <label className="search-box">
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                  <input type="text" placeholder="Search keys & values…" autoComplete="off" spellCheck={false}
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <button className="clear-x" aria-label="Clear search" style={{ visibility: search ? "visible" : "hidden" }}
                    onClick={() => { setSearch(""); setSearchApplied(""); }}>×</button>
                </label>
                <div className="seg" role="group" aria-label="Search mode">
                  <button aria-pressed={mode === "filter"} onClick={() => setMode("filter")}>Filter</button>
                  <button aria-pressed={mode === "highlight"} onClick={() => setMode("highlight")}>Highlight</button>
                </div>
              </div>
              <div className="tree-meta">
                <span className="count">{matchMeta}</span>
                <span className="spacer"></span>
                <button className="lnk" onClick={expandAll}>⊕ Expand all</button>
                <button className="lnk" onClick={collapseAll}>⊖ Collapse all</button>
              </div>
            </div>
            <div className="tree-scroll">
              <div className="tree" id="tree">
                {!parsed
                  ? <div className="tree-empty" dangerouslySetInnerHTML={{ __html: model === undefined && inputText.trim() !== "" ? "Fix the input to explore the tree." : "Paste data on the left, choose its format, then <b>Visualize</b>.<br>The structure shows up here as a navigable tree." }} />
                  : (searchApplied.trim() && analysis.visible.size === 0 && mode === "filter")
                    ? <div className="tree-empty">No keys or values match &quot;{searchApplied.trim()}&quot;.</div>
                    : <TreeNode label="root" value={model} path="root" isArrayChild={false} query={searchApplied} mode={mode} analysis={analysis} collapsed={collapsed} onToggle={onToggle} onCopyPath={onCopyPath} />}
              </div>
            </div>
          </div>
        </section>

        {/* OUTPUT */}
        <section className="panel" id="output-panel" aria-label="Output">
          <button className="panel-rail" title="Show output panel" aria-label="Show output panel" onClick={() => setOutCollapsed(false)}>
            <svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6" /></svg>
            <span className="rail-label">Output</span>
          </button>
          <div className="panel-body">
            <div className="panel-head">
              <button className="head-toggle" title="Collapse output panel" aria-label="Collapse output panel" aria-expanded={!outCollapsed} onClick={() => setOutCollapsed(true)}>
                <svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6" /></svg>
              </button>
              <span className="panel-title">Output</span>
              <span className="spacer"></span>
              <span className="field-label">convert to</span>
              <span className="select"><select aria-label="Convert to format" value={outFormat} onChange={(e) => setOutFormat(e.target.value)}>
                {FORMATS.map((f) => <option key={f} value={f}>{LABEL[f]}</option>)}
              </select></span>
            </div>
            <div className="output-wrap" id="output-wrap">
              {output.kind === "ok"
                ? (outputHtml ? <pre id="output" dangerouslySetInnerHTML={outputHtml} /> : <pre id="output">{output.text}</pre>)
                : <div className={"output-msg " + output.kind}>{output.text}</div>}
            </div>
            <div className="output-foot" style={{ display: lossy ? "flex" : "none" }}>
              <span className="note">{lossy ? "Flattened with dot-notation headers · lossy for deep/irregular data" : ""}</span>
            </div>
          </div>
        </section>
      </main>

      <div className="toast-host" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={"toast" + (t.leaving ? " leaving" : "")}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
            <span>{t.label}{t.code ? <> <code>{t.code}</code></> : null}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function summarize(model, inFormat) {
  const t = engine.typeOf(model);
  if (t === "object") { const n = Object.keys(model).length; return "Parsed " + LABEL[inFormat] + " · " + n + " key" + (n === 1 ? "" : "s"); }
  if (t === "array") { const c = model.length; return "Parsed " + LABEL[inFormat] + " · " + c + " item" + (c === 1 ? "" : "s"); }
  return "Parsed " + LABEL[inFormat] + " · single " + t + " value";
}
