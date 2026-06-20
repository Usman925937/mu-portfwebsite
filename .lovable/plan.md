## Goal

A hidden `/admin` login page (not linked anywhere on the public site) where you — and only you — can sign in and edit every text section of the portfolio. The public portfolio reads its content from the database and re-renders instantly after you save.

Think Hostinger / WordPress admin: the public URL stays clean (`/`), and the admin lives at a separate URL (`/admin`) that the world cannot discover from the site itself.

---

## What gets built

### 1. Backend (Lovable Cloud)
- Enable Lovable Cloud (Postgres + Auth).
- Tables:
  - `site_content` — single JSON document holding all editable portfolio content (hero, about, why-me cards, experience entries, projects, contact, etc.). One row, `id = 'main'`.
  - `user_roles` + `app_role` enum + `has_role()` security-definer function (the standard secure pattern — roles never live on the profile).
- RLS:
  - `site_content` → public `SELECT` (so the portfolio loads for everyone), `UPDATE` only for users with `admin` role.
  - `user_roles` → readable by authenticated users, writable only by service role.
- Seed the first admin: after you sign up once at `/admin`, a one-time server function (callable only when zero admins exist) promotes your account to `admin`. After that the endpoint becomes a no-op — no one else can self-promote.

### 2. Hidden admin URL
- New route `src/routes/admin.tsx` → login form (email + password). No link to it from the portfolio anywhere.
- New route `src/routes/_authenticated/admin-dashboard.tsx` → the editor, protected by the integration-managed auth gate + an additional `admin` role check.
- After login, non-admins get signed out immediately with a generic error.
- The portfolio's iframe / homepage has zero references to `/admin`.

### 3. Admin editor UI
A clean, sectioned form (tabs or accordion) covering every editable area:
- **Hero / Intro** — name, title, tagline, primary CTA text.
- **About / Why Me** — the three cards (icon, title, body).
- **Experience** — add/edit/remove/reorder job entries, each with bullets.
- **Projects** — add/edit/remove/reorder cards: title, category, description, link, filter tag.
- **Contact / Footer** — email, social links.

Each section has Save → writes the updated JSON document → public site updates on next load.

### 4. Public portfolio becomes data-driven
- The current static `public/portfolio.html` is rewritten as a React route that fetches `site_content` once (public read, no auth) and renders the same design with the same CSS — visually identical, just powered by data.
- All current styling, animations, the orbit graphic, the 01/02/03 numbering, mobile polish, etc. are preserved.

---

## Technical notes

- Auth: Lovable Cloud email + password. Signup is open at `/admin` only on first run (until the first admin exists); after that, signup is disabled and the page is login-only.
- Role check uses the `has_role(auth.uid(), 'admin')` SECURITY DEFINER function inside RLS — no recursive policy issues.
- Editor saves go through a `createServerFn` with `requireSupabaseAuth` middleware that also verifies the admin role server-side before any write (defense in depth, never trust the client).
- The `/admin` path is not crawlable in any nav, sitemap, or footer. (Note: it's still reachable by anyone who types the URL — that's the same model as Hostinger / WP. True obscurity would need a non-guessable path; tell me if you want that instead.)
- No edge functions needed; all server logic lives in TanStack `createServerFn`.

---

## Out of scope (ask if you want any)
- Image uploads / media library (only text content for now).
- Multi-admin / inviting other editors.
- Versioning / undo history.
- Rich-text WYSIWYG (fields are plain text + multi-line textareas; bullets are arrays).

---

## Deliverables checklist
1. Lovable Cloud enabled, tables + RLS + role helpers migrated.
2. `/admin` login page (hidden, not linked).
3. Protected admin dashboard with editors for every section.
4. Public portfolio rewritten as a data-driven route, visually identical to today.
5. Server functions for read (public) and write (admin-only) with role enforcement.
6. First-run admin bootstrap so you can claim the single admin account.

Reply "go" to build it, or tell me what to change.