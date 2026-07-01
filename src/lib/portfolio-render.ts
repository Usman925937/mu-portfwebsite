// Portfolio data model + HTML renderer.
// The template lives at src/lib/portfolio-template.html and contains
// <!--CMS:key-->original<!--/CMS:key--> markers. render() swaps the
// inner content of every marker pair with the equivalent HTML built
// from the structured data.

import template from "./portfolio-template.html?raw";

export interface Stat {
  num: string;
  label: string;
}

export interface Experience {
  role: string;
  org: string;
  bullets: string[];
  skills: string[];
  date: string;
  type: string;
  location: string;
}

export interface Project {
  type: string;
  category: string; // space-separated tags for filter: "finance excel"
  name: string;
  desc: string;
  pillsFront: string[];
  insideText: string;
  pillsBack: string[];
  githubUrl: string;
}

export interface PortfolioData {
  hero: {
    eyebrow: string;
    firstName: string;
    lastName: string;
    subtitle: string;
    description: string; // HTML allowed (kept raw)
    primaryCtaText: string;
    primaryCtaHref: string;
    secondaryCtaText: string;
    secondaryCtaHref: string;
    stats: Stat[];
    chips: string[];
  };
  experience: Experience[];
  projects: Project[];
  footerCopy: string; // HTML allowed
  rawHtmlOverride?: string; // if set, replaces the whole rendered page
}

// ---------- defaults: match the existing template ----------

export const DEFAULT_DATA: PortfolioData = {
  hero: {
    eyebrow:
      "ACCA Student · Finance Graduate · Big 4 Candidate · Rawalpindi, Pakistan",
    firstName: "Muhammad",
    lastName: "Usman.",
    subtitle: "Data-Driven Finance Professional",
    description:
      "A finance and accounting student with deep expertise in <strong>data analytics, financial modeling, and audit tools</strong> — bringing a rare combination of accounting acumen and data technology skills to the external audit profession.",
    primaryCtaText: "View My Work",
    primaryCtaHref: "#experience",
    secondaryCtaText: "LinkedIn Profile ↗",
    secondaryCtaHref: "https://www.linkedin.com/in/muhammadusman77/",
    stats: [
      { num: "50+", label: "Certifications" },
      { num: "12+", label: "Projects" },
      { num: "120+", label: "Shortcuts" },
      { num: "Big 4", label: "Target" },
    ],
    chips: [
      "⚡ 53 WPM · 95% Accuracy",
      "📊 50+ Certifications",
      "🏆 ACCA National Challenge Participant",
    ],
  },
  experience: [
    {
      role: "Generative AI Specialist",
      org: "Surt Works  ·  U.S.-Based Virtual Assistance & Customer Service Agency",
      bullets: [
        "Delivered client-facing generative AI projects for a U.S.-based agency.",
        "Engineered prompts across ChatGPT, Claude, Grok, Perplexity & Gemini.",
        "Cut research & delivery time using Claude and Comet workflows.",
      ],
      skills: [
        "Generative AI",
        "Prompt Engineering",
        "ChatGPT & Claude",
        "AI Research",
        "Workflow Automation",
        "Client Delivery",
      ],
      date: "Jan 2026 – Jun 2026",
      type: "Full-Time · 6 Months",
      location: "Rawalpindi · On-site",
    },
    {
      role: "Accounting & Finance Intern",
      org: "Grip Engineers  ·  ISO 9001-Certified Company",
      bullets: [
        "Hands-on exposure to corporate finance at an ISO 9001-certified firm.",
        "Supported transaction recording, account management & period-end tasks.",
        "Maintained Excel records and assisted management reporting.",
      ],
      skills: [
        "Microsoft Excel",
        "Financial Records",
        "Financial Operations",
        "Data Entry",
        "Documentation",
        "ISO 9001 Environment",
      ],
      date: "Jul 2025 – Sep 2025",
      type: "Internship · 3 Months",
      location: "Rawalpindi · On-site",
    },
    {
      role: "Accounting & Finance Intern — Banking Operations",
      org: "Askari Bank",
      bullets: [
        "Live exposure to reconciliation, compliance & regulatory workflows.",
        "Handled voucher reconciliation and bank card records with precision.",
        "Learned KYC and C Form procedures in a regulated institution.",
        "Built an Excel system consolidating ~30 locker files into one record.",
      ],
      skills: [
        "Banking Operations",
        "Financial Reconciliation",
        "KYC / Compliance",
        "Microsoft Excel",
        "Excel Shortcuts",
        "Regulatory Processes",
        "Record Management",
      ],
      date: "Aug 2024 – Sep 2024",
      type: "Internship · 2 Months",
      location: "Rawalpindi · On-site",
    },
    {
      role: "Excel Trainer — Peer Instructor",
      org: "Foundation University Islamabad",
      bullets: [
        "Trained BS A&F peers in Lookups, Pivot Tables, Power Query & modeling.",
        "Simplified complex concepts into structured, easy-to-follow lessons.",
      ],
      skills: [
        "Advanced Excel",
        "Power Query",
        "Peer Training",
        "Curriculum Design",
      ],
      date: "2023 – 2024",
      type: "Volunteer",
      location: "Rawalpindi · On-site",
    },
  ],
  projects: [
    {
      type: "Financial Modeling",
      category: "finance excel",
      name: "Financial Modeling, Valuation & Analysis",
      desc: "Comprehensive model covering DCF valuation, sensitivity analysis, and investment decision support.",
      pillsFront: ["DCF Valuation", "Sensitivity", "Financial Ratios"],
      insideText:
        "Multi-sheet model: Income Statement, Balance Sheet & Cash Flow projections. DCF engine with WACC inputs. 2-way sensitivity tables on growth rate & margin. Comparable company analysis. Real ratios: ROE, ROA, D/E.",
      pillsBack: ["NPV/WACC", "Scenario Tables", "Comparable Cos"],
      githubUrl: "https://github.com/Usman925937/Financial-Modeling",
    },
    {
      type: "Capital Budgeting",
      category: "excel finance",
      name: "Capital Budgeting Analysis",
      desc: "Applied NPV, IRR, Payback Period, and Profitability Index to evaluate competing investment projects.",
      pillsFront: ["NPV/IRR", "Payback Period", "Decision Models"],
      insideText:
        "3 competing projects evaluated via NPV, IRR, Payback & PI. Dynamic cash-flow tables using Excel NPV, IRR, XIRR functions. Decision comparison matrix showing trade-offs. Applied directly to investment appraisal under IFRS.",
      pillsBack: ["XIRR", "PI Index", "Cash Flow Modeling"],
      githubUrl: "https://github.com/Usman925937/Capital-Budgeting",
    },
    {
      type: "Scenario Planning",
      category: "excel finance",
      name: "What-If Analysis & Scenario Modeling",
      desc: "Multi-scenario models using Goal Seek, Data Tables, and Scenario Manager to stress-test projections.",
      pillsFront: ["Goal Seek", "Data Tables", "Scenario Manager"],
      insideText:
        "1-way & 2-way Data Tables for revenue/cost sensitivity. Goal Seek reverse-engineering target profits. Scenario Manager: Best/Base/Worst cases with visual output charts showing full outcome ranges.",
      pillsBack: ["1-way Tables", "2-way Tables", "Outcome Charts"],
      githubUrl: "https://github.com/Usman925937/What-If-Analysis",
    },
    {
      type: "Advanced Excel",
      category: "excel",
      name: "Advanced Pivot Table Mastery",
      desc: "Power Pivot, calculated fields, slicers, timelines, and drill-down for management reporting.",
      pillsFront: ["Power Pivot", "Slicers", "Calculated Fields"],
      insideText:
        "PivotTables from large datasets with custom calculated fields. Power Pivot data model across multiple tables. Timeline & Slicer-driven interactive dashboards. Drill-down management reporting — Big 4 workpaper ready.",
      pillsBack: ["Data Model", "Timelines", "Drill-Down"],
      githubUrl: "https://github.com/Usman925937/Advanced-Pivot-Tables",
    },
    {
      type: "Data Transformation",
      category: "excel",
      name: "Power Query & UnPivoting Data",
      desc: "Reshaped and normalized financial data using Power Query — critical for preparing GL and trial balance data.",
      pillsFront: ["Power Query", "ETL", "Data Cleaning"],
      insideText:
        "Pipeline loading multiple CSVs with transformations. UnPivot converting wide financial tables to long format. Custom columns, merging queries, data type cleaning. Refresh-ready connections for live data workflows.",
      pillsBack: ["M Language", "UnPivot", "Query Merge"],
      githubUrl: "https://github.com/Usman925937/Power-Query-UnPivot",
    },
  ],
  footerCopy:
    "© 2025 <strong>Muhammad Usman</strong> — Data-Driven Audit Professional · Rawalpindi, Pakistan",
};

// ---------- helpers ----------

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(s: string): string {
  return esc(s);
}

// Replace inner content between paired CMS markers.
function replaceMarker(
  html: string,
  key: string,
  inner: string,
): string {
  const open = `<!--CMS:${key}-->`;
  const close = `<!--/CMS:${key}-->`;
  const i = html.indexOf(open);
  if (i < 0) return html;
  const j = html.indexOf(close, i + open.length);
  if (j < 0) return html;
  return (
    html.slice(0, i + open.length) + inner + html.slice(j)
  );
}

// ---------- block builders ----------

const GITHUB_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`;

const ONEDRIVE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.8 8.2c-1.6-1.4-3.8-2.2-6-2C4 6.6 1.7 8.9 1.2 11.8 0.5 12 0 12.7 0 13.5c0 1 .8 1.8 1.8 1.8h5.5V9.5c0-.4.3-.7.7-.7.4 0 .7.3.7.7v5.8h6.9c-.2-1.4-.8-2.6-1.8-3.5-.7-.6-1.6-1-2.5-1.2h-.1c-.4-.1-.8-.4-1-.8-.4-.6-.6-1.3-.4-2 .2-.5.5-1 .9-1.4.3-.2.7-.2 1 0zm7.4 3.6c2.1.2 3.8 2 3.8 4.1 0 2.3-1.9 4.1-4.1 4.1H6.2c-2.6 0-4.6-2.1-4.6-4.6 0-.2 0-.4.1-.6h5.6v.4c0 .4.3.7.7.7.4 0 .7-.3.7-.7v-.4h7.8v.4c0 .4.3.7.7.7.4 0 .7-.3.7-.7v-.4h2.5c.2 0 .4 0 .5.1-.3-1.5-1.5-2.7-3-3-.4-.1-.7-.4-.8-.8-.4-1.6.3-3.3 1.7-4.1 1.6-1 3.7-.6 4.9.8.8 1 1.1 2.4.6 3.6-.2.4-.1.9.3 1.1.1.1.2.1.4.2z"/></svg>`;

const ONEDRIVE_FOLDER_URL = "https://1drv.ms/f/c/9d518972e8543096/IgCAedY-cwdoRpcjpdXvwn2sAUobQW2w9H_5be5p5mB0kdQ?e=3yUW5Z";

function renderExperience(items: Experience[]): string {
  return items
    .map(
      (e) => `<div class="exp-card">
      <div class="exp-left">
        <div class="exp-role">${esc(e.role)}</div>
        <div class="exp-org">${esc(e.org)}</div>
        <ul class="exp-bullets">${e.bullets
          .map((b) => `<li>${esc(b)}</li>`)
          .join("")}</ul>
        <div class="exp-skills">${e.skills
          .map((s) => `<span class="exp-skill">${esc(s)}</span>`)
          .join("")}</div>
      </div>
      <div class="exp-right">
        <div class="exp-date">${esc(e.date)}</div>
        <div class="exp-type">${esc(e.type)}</div>
        <div style="font-size:0.65rem;color:var(--gray-text);margin-top:0.4rem;">${esc(
          e.location,
        )}</div>
      </div>
    </div>`,
    )
    .join("\n    ");
}

function renderProjects(items: Project[]): string {
  return items
    .map(
      (p) => `<div class="pcard" data-cat="${escAttr(
        p.category,
      )}"><div class="pcard-inner"><div class="pcard-f"><div class="p-type">${esc(
        p.type,
      )}</div><div class="p-name">${esc(p.name)}</div><div class="p-desc">${esc(
        p.desc,
      )}</div><div class="p-pills">${p.pillsFront
        .map((x) => `<span class="ppill">${esc(x)}</span>`)
        .join(
          "",
        )}</div><div class="hover-hint">Hover to explore →</div></div><div class="pcard-b"><div><div class="b-label">What's Inside</div><div class="b-text">${esc(
        p.insideText,
      )}</div></div><div class="p-pills">${p.pillsBack
        .map((x) => `<span class="ppill">${esc(x)}</span>`)
        .join(
          "",
        )}<a href="${escAttr(
        p.githubUrl,
      )}" target="_blank" rel="noopener" class="p-github">${GITHUB_SVG} View on GitHub</a></div></div></div></div>`,
    )
    .join("\n    ");
}

// ---------- main render ----------

export function render(data: PortfolioData): string {
  if (data.rawHtmlOverride && data.rawHtmlOverride.trim().length > 0) {
    return data.rawHtmlOverride;
  }
  const h = data.hero;
  let html = template;

  html = replaceMarker(
    html,
    "hero.eyebrowBlock",
    `<p class="hero-eyebrow">${esc(h.eyebrow)}</p>`,
  );
  html = replaceMarker(
    html,
    "hero.h1Block",
    `<h1>${esc(h.firstName)}<br><span>${esc(h.lastName)}</span></h1>`,
  );
  html = replaceMarker(
    html,
    "hero.subtitleBlock",
    `<p class="hero-subtitle">${esc(h.subtitle)}</p>`,
  );
  html = replaceMarker(
    html,
    "hero.descBlock",
    `<p class="hero-desc">${h.description}</p>`,
  );
  html = replaceMarker(
    html,
    "hero.ctasBlock",
    `<a class="btn-primary" id="viewWorkBtn" href="${escAttr(
      h.primaryCtaHref,
    )}" role="button">${esc(h.primaryCtaText)}</a>
      <a class="btn-outline" id="linkedinBtn" href="${escAttr(
        h.secondaryCtaHref,
      )}" target="_blank" rel="noopener noreferrer" role="button">${esc(
        h.secondaryCtaText,
      )}</a>`,
  );
  html = replaceMarker(
    html,
    "hero.statsList",
    h.stats
      .map(
        (s) =>
          `<div><div class="stat-num">${esc(
            s.num,
          )}</div><div class="stat-label">${esc(s.label)}</div></div>`,
      )
      .join("\n      "),
  );
  html = replaceMarker(
    html,
    "hero.chipsList",
    h.chips
      .map((c) => `<div class="stat-chip">${esc(c)}</div>`)
      .join("\n    "),
  );
  html = replaceMarker(
    html,
    "experience.list",
    "\n    " + renderExperience(data.experience) + "\n  ",
  );
  html = replaceMarker(
    html,
    "projects.list",
    "\n    " + renderProjects(data.projects) + "\n  ",
  );
  html = replaceMarker(html, "footer.copy", data.footerCopy);

  return html;
}
