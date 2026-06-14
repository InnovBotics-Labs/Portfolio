/**
 * All portfolio copy, extracted verbatim from the Claude Design prototype
 * (Portfolio - Photo Hero.html). Sections map over this so editing content
 * never means touching component markup.
 *
 * Relative app links from the prototype (e.g. "apps/json-viewer.html") are
 * stored as absolute paths ("/apps/json-viewer.html") so they resolve against
 * the Next.js public/ directory.
 */

export const nav = {
  brand: { first: "Prabhukumar", rest: " Sivamoorthy" },
  links: [
    { idx: "01", label: "Apps", href: "#apps" },
    { idx: "02", label: "Work", href: "#work" },
    { idx: "03", label: "About", href: "#about" },
    { idx: "04", label: "Experience", href: "#experience" },
  ],
  cta: { label: "Contact", href: "#contact" },
};

export const hero = {
  slogan: "Staff Engineer @ SanDisk",
  titleLine1: "Building & validating",
  titleLine2: "systems that don't break.",
  sub: "I'm Prabhukumar Sivamoorthy — a decade building robust Python systems for datacenter SSDs, and the AI agents that make engineering teams measurably faster.",
  actions: [
    { label: "View selected work", href: "#work", arrow: "→", variant: "primary" as const },
    { label: "Download résumé", href: "/resume.pdf", arrow: "↓", variant: "ghost" as const, download: true },
  ],
  meta: [
    { dt: "Based in", dd: "Milpitas, California · USA" },
    { dt: "Focus", dd: "Storage · Firmware · AI" },
  ],
  stackLabel: "Core stack",
  stack: ["Python", "NVMe Datacenter SSDs", "LangChain", "LangGraph", "CrewAI", "LlamaIndex", "Llama Factory"],
  badge: "Open to senior & staff roles",
  tag: "PS — 2026",
};

export const marquee = [
  "NVMe Datacenter SSDs",
  "Firmware Verification",
  "AI Infrastructure",
  "AI Applications",
  "Multi-Agent Systems",
  "Distributed Systems",
];

export const appStore = {
  num: "01 / App Store",
  title: "Tools & apps you can open.",
  bar: { path: "prabhu-apps · v1.0.0", meta: "7 items" },
  folders: [
    {
      label: "Web Tools",
      apps: [
        { id: "appicon-pdf", name: "PDF Editor", href: "https://portfolio-yie0.onrender.com/pdf-editor", icon: "/apps/icons/pdf.svg", h: 25 },
        { id: "appicon-json", name: "JSON Viewer", href: "/apps/json-viewer.html", icon: "/apps/icons/json.svg", h: 70 },
        { id: "appicon-conv", name: "Data Converter", href: "https://portfolio-yie0.onrender.com/data-converter", icon: "/apps/icons/conv.svg", h: 190 },
      ],
    },
    {
      label: "AI & Agents",
      apps: [
        { id: "appicon-ss", name: "Storage-SSD Specs", href: "https://storage-ssd-rag.onrender.com", icon: "/apps/icons/ss.svg", h: 250 },
        { id: "appicon-ai", name: "AI Productivity Agents", href: "/apps/ai-agents.html", icon: "/apps/icons/ai.svg", h: 155 },
      ],
    },
    {
      label: "Storage & Firmware",
      apps: [
        { id: "appicon-fv", name: "Firmware Verification Suite", href: "/apps/firmware-verification.html", icon: "/apps/icons/fv.svg", h: 205 },
        { id: "appicon-st", name: "Datacenter SSD Tooling", href: "/apps/ssd-tooling.html", icon: "/apps/icons/st.svg", h: 28 },
      ],
    },
  ],
};

export type Project = {
  id: string;
  idx: string;
  year: string;
  title: string;
  href: string;
  external: boolean;
  placeholder: string;
  desc: string;
  tags: string[];
  link: { label: string; href?: string };
};

export const work = {
  num: "02 / Selected Work",
  title: ["Systems I've designed, built,", "and kept running in production."],
  projects: [
    {
      id: "proj-specrag",
      idx: "01",
      year: "2025",
      title: "Storage-SSD Specs",
      href: "https://storage-ssd-rag.onrender.com",
      external: true,
      placeholder: "Storage-SSD Specs — product shot",
      desc: "A retrieval-augmented assistant over the datacenter SSD specifications — built for both humans and AI agents, with an MCP server so agents can query the standards directly and cite the source.",
      tags: ["Python", "RAG", "MCP", "LangChain"],
      link: { label: "Open app", href: "https://storage-ssd-rag.onrender.com" },
    },
    {
      id: "proj-firmware",
      idx: "02",
      year: "2024",
      title: "Firmware Verification Suite",
      href: "#contact",
      external: false,
      placeholder: "Firmware Verification — product shot",
      desc: "Python automation that exercises and validates SSD firmware against the NVMe and PCIe standards — turning manual verification into repeatable, instrumented test runs.",
      tags: ["Python", "NVMe", "PCIe", "Automation"],
      link: { label: "Case study" },
    },
    {
      id: "proj-agents",
      idx: "03",
      year: "2025",
      title: "AI Productivity Agents",
      href: "#contact",
      external: false,
      placeholder: "AI Agents — product shot",
      desc: "Agentic tooling that automates day-to-day engineering workflows — drafting, triage, and knowledge retrieval — measurably lifting team productivity.",
      tags: ["LangChain", "LangGraph", "CrewAI", "MCP"],
      link: { label: "Case study" },
    },
    {
      id: "proj-tooling",
      idx: "04",
      year: "2023",
      title: "Datacenter SSD Tooling",
      href: "#contact",
      external: false,
      placeholder: "SSD Tooling — product shot",
      desc: "Internal Python platforms for hardware–software integration and data-driven validation across datacenter SSD programs.",
      tags: ["Python", "SQL", "Docker", "K8s"],
      link: { label: "Case study" },
    },
  ] satisfies Project[],
  more: { label: "Full archive available on request", href: "#contact" },
};

export const about = {
  num: "03 / About",
  portrait: { id: "portrait", placeholder: "Drop your portrait" },
  sig: "— PS",
  lead: "I build robust Python systems for datacenter storage — and the AI tools that make engineering teams faster.",
  paragraphs: [
    "I'm a Staff Engineer at SanDisk with a decade of software engineering behind me, focused on Python development and system design for storage. Day to day I advance datacenter SSD technologies across the NVMe and PCIe standards, and lead cross-functional teams toward solutions that ship.",
    "Lately I've been building AI into our engineering environment — agents and retrieval tools that raise productivity and efficiency. Earlier, at Western Digital, I led similar efforts improving data-driven workflows. I pair a strong problem-solving instinct with a collaborative style that helps teams hit their goals.",
  ],
  skills: [
    { label: "Languages", items: ["Python", "SQL"] },
    { label: "Agent Frameworks", items: ["LangChain", "LangGraph", "CrewAI", "AutoGen", "smolagents"] },
    { label: "LLM Infra", items: ["vLLM", "Ollama", "llama.cpp", "KV cache"] },
    { label: "RAG & Training", items: ["LlamaIndex", "Llama Factory", "MCP", "A2A"] },
    { label: "Storage & Platform", items: ["Datacenter SSDs", "NVMe · PCIe", "Docker", "Kubernetes"] },
  ],
};

export const experience = {
  num: "04 / Experience",
  title: "A decade across storage & AI.",
  items: [
    {
      when: "2025 — Present",
      role: "Staff Engineer",
      company: "· SanDisk",
      desc: "Advancing datacenter SSD technologies across the NVMe and PCIe standards, and building AI agents and retrieval tools that make engineering teams measurably faster. Lead cross-functional collaboration to ship robust Python systems.",
      tags: ["Python", "NVMe", "LangChain"],
    },
    {
      when: "2018 — 2025",
      role: "Software Engineer",
      company: "· Western Digital",
      desc: "Led engineering efforts improving data-driven workflows and delivering robust software for hardware–software integration across storage programs.",
      tags: ["Python", "SQL", "Storage"],
    },
    {
      when: "2016 — 2017",
      role: "M.S., Computer Engineering",
      company: "· University of Houston–Clear Lake",
      desc: "Master of Science in Computer Engineering.",
      tags: [],
    },
  ],
  cv: { label: "Download full résumé (PDF)", href: "/resume.pdf" },
};

export const contact = {
  num: "05 / Contact",
  title: ["Let's build something", "that lasts."],
  lede: "Hiring, collaborating, or just comparing notes on a gnarly systems problem — my inbox is open.",
  links: [
    { k: "Email", label: "PrabhukumarSivamoorthy@gmail.com", href: "mailto:PrabhukumarSivamoorthy@gmail.com", external: false },
    { k: "LinkedIn", label: "/in/prabhukumarsivamoorthy", href: "https://www.linkedin.com/in/prabhukumarsivamoorthy", external: true },
    { k: "GitHub", label: "@PrabhukumarSivamoorthy", href: "https://github.com/PrabhukumarSivamoorthy", external: true },
  ],
};

export const footer = {
  nav: [
    { label: "Apps", href: "#apps" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ],
  copyright: "© 2026 Prabhukumar Sivamoorthy",
  colophon: "Set in Newsreader, Geist & JetBrains Mono",
};
