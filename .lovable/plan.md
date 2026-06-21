## Goal

Replace the raw HTML editor in `/admin-dashboard` with a Hostinger-style **form-based editor**. You type into labelled fields per section, click **Save & publish**, and the live homepage updates — no HTML ever shown.

## How it will work

```text
 Admin Dashboard                       Database                Homepage
 ┌─────────────────────┐               ┌────────────┐         ┌─────────┐
 │ Hero    [form]      │  save JSON →  │ site_content│  read  │  /      │
 │ About   [form]      │               │  id=        │  JSON  │ renders │
 │ Experience [list]   │               │  portfolio_ │   →    │ template│
 │ Projects   [list]   │               │  data       │ inject │ + data  │
 │ Skills    [chips]   │               │  (JSON)    │ values │         │
 │ Contact   [form]    │               └────────────┘         └─────────┘
 │ [Save & publish]    │
 └─────────────────────┘
```

- Your portfolio HTML stays as the **design template** — the look never changes.
- Editable bits inside the template get wrapped with hidden marker comments (`<!--CMS:hero.eyebrow-->…<!--/CMS-->`). They are invisible on the live site.
- A render function on the server takes your saved data and swaps the values into the template every time the homepage loads.

## Sections covered by the form editor

| Tab | Fields |
|---|---|
| **Hero** | Eyebrow line · First name · Last name · Subtitle · Description (rich text) · 4 stat cards (number + label) · 3 floating chips · "View My Work" CTA · LinkedIn CTA |
| **About** | 4 paragraphs (rich text) · 4 highlight rows (title + description) |
| **Experience** | Add/edit/delete/reorder job cards: role · company · bullets · skill tags · date · type · location |
| **Projects** | Add/edit/delete/reorder project cards: category · title · description · front tags · "what's inside" text · back tags · GitHub URL · filter category |
| **Skills + Certifications** | Skill node labels (Excel, SQL, Python, Power BI, Financial Modeling, etc.) · Certification list (title + issuer + image URL) |
| **Contact** | Intro note · LinkedIn URL · GitHub URL · 4 availability rows (label + text) · Footer copyright |
| **Advanced** | Raw HTML override (kept as escape hatch — anything pasted here replaces the whole page) |

Sections **not** in the form editor because they're pure visual design with no real content to change: orbit animation, "Why Hire Me" grid, Education timeline visuals, Recommendations layout. Their text can still be edited via the Advanced tab if needed.

## Behaviour

- **Live preview** on the right side of the dashboard updates as you type (debounced 500ms).
- **Add / Remove / Move up / Move down** buttons on every list item.
- **Reset section to default** button per tab.
- **Save & publish** button writes the JSON to the database; the live homepage picks it up on next visit.
- First load: if no saved data exists, forms are prefilled with the current portfolio content as defaults.

## Technical details (for reference)

- Move `public/portfolio.html` → `src/lib/portfolio-template.html` and import it with `?raw` so the server can read it inside the Worker runtime.
- Add `<!--CMS:key-->…<!--/CMS:key-->` markers around editable text and list containers in the template (no visual change).
- New `src/lib/portfolio-render.ts`: `PortfolioData` type, defaults matching current content, `render(data): string` that does marker replacement + list rendering with HTML escaping.
- Update `src/lib/site-content.functions.ts`: add `getPortfolioData` (public read) and `savePortfolioData` (admin write) using the existing `site_content` table with a new row `id='portfolio_data'` storing the JSON in the `html` column. No DB migration needed.
- Update `src/routes/index.tsx`: call `getPortfolioHtml` which now renders template + saved data and returns HTML for the iframe `srcDoc`.
- Rewrite `src/routes/_authenticated/admin-dashboard.tsx`: tabbed UI (shadcn `Tabs`) with one form per section, repeater components for Experience/Projects/Certifications/Highlights, live `<iframe>` preview, Save button.
- Raw HTML override stays available under an **Advanced** tab and, when set, completely bypasses the template.

## Out of scope (this turn)

- Image uploads (cert images stay as URLs you paste; can add storage uploads later).
- Drag-and-drop reordering (using up/down arrow buttons instead — keeps it simple).
- Theme/color editing (your design system stays fixed).
