# Admin Security Hardening

Layer three protections on top of the existing email/password admin login:
1. **Authenticator-app 2FA (TOTP)** required on every admin sign-in
2. **Admin approval** for anyone who signs up
3. **Re-authentication** (fresh TOTP code) before publishing changes

## User experience

**First-time setup (you, the existing admin)**
- After signing in, if 2FA isn't enabled yet, the dashboard shows a "Set up 2FA" screen with a QR code + secret key.
- You scan it in Google Authenticator / Authy / 1Password, enter a 6-digit code to confirm, and 2FA is locked on.
- A set of one-time backup codes is shown once so you can recover if you lose your phone.

**Normal sign-in**
- Enter email + password → prompted for the 6-digit code from your authenticator app → dashboard loads.
- Wrong code just re-prompts; 5 wrong codes in a row temporarily blocks further attempts for 15 minutes.

**Publishing edits (re-auth)**
- When you click "Save & Publish", a modal asks for a fresh 6-digit code before the changes are written to the live site.
- The re-auth lasts 5 minutes, so several saves in a row only prompt once.

**New signups**
- The `/admin` page still lets anyone create an account, but new accounts land in a "Pending approval" state and see a friendly "Waiting for admin approval" screen instead of the dashboard.
- A new **Users** tab in your dashboard lists pending accounts with **Approve** / **Reject** buttons. Only approved users can proceed to 2FA setup and the editor.

## Technical details

**Database (new migration)**
- `admin_profiles` table: `user_id` (PK, FK → auth.users), `totp_secret` (encrypted), `totp_enabled` bool, `backup_codes` (hashed array), `failed_attempts` int, `locked_until` timestamptz.
- `user_roles` gains a new enum value `pending` (default for new signups). Existing `admin` rows unchanged; `has_role` continues to work.
- New enum value requires a small helper: `approve_admin(user_id)` SECURITY DEFINER function that only current admins can call.

**TOTP implementation**
- Use `otpauth` npm package (pure JS, Worker-compatible) for secret generation + code verification (RFC 6238, 30s window, ±1 step tolerance).
- Secret is generated server-side, stored encrypted at rest with an app secret (`ADMIN_TOTP_ENC_KEY`, auto-generated).
- QR code rendered client-side with `qrcode` package (data URL, no external service).

**Server functions** (`src/lib/admin-auth.functions.ts`, all `.middleware([requireSupabaseAuth])`)
- `getAdminStatus` — returns `{ role, totpEnabled, approved }` for the current user.
- `startTotpEnrollment` — generates secret, returns provisioning URI + backup codes (only if not yet enabled).
- `confirmTotpEnrollment({ code })` — verifies code, marks `totp_enabled = true`.
- `verifyTotp({ code })` — verifies code, sets a short-lived signed cookie `admin_2fa_verified` (15 min for session, 5 min for re-auth).
- `listPendingUsers` / `approveUser({ userId })` / `rejectUser({ userId })` — admin-only.
- `savePortfolioData` (existing) gains a check that `admin_2fa_verified` cookie is fresh (≤ 5 min old) or throws → triggers the re-auth modal.

**Routes**
- `/admin` (existing) — sign in / sign up form; on success routes based on status.
- `/admin-dashboard` (existing, protected) gains an inner gate:
  - `role = pending` → "Awaiting approval" screen.
  - `role = admin` + `totp_enabled = false` → "Set up 2FA" screen.
  - `role = admin` + `totp_enabled = true` + no fresh 2FA cookie → "Enter 6-digit code" screen.
  - Otherwise → full dashboard, now with a **Users** tab.

**Rate limiting**
- Track `failed_attempts` and `locked_until` on `admin_profiles`. 5 fails → 15-min lock. Cleared on any successful verify.

**Secrets**
- `ADMIN_TOTP_ENC_KEY` — auto-generated 64-char secret for encrypting TOTP secrets at rest.
- `ADMIN_2FA_COOKIE_SECRET` — auto-generated 64-char secret for signing the 2FA-verified cookie.

**Packages to add**
- `otpauth` (TOTP), `qrcode` (QR image data URL).

## Out of scope

- Email/SMS delivery of codes (you chose authenticator app).
- Recovery via email — recovery is only via backup codes shown at setup time.
- Multiple admin roles / permissions beyond `admin` vs `pending`.
