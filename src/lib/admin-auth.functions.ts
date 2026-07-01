import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as OTPAuth from "otpauth";
import {
  createHash,
  createHmac,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "crypto";

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const COOKIE_NAME = "admin_2fa";
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 min gate for the dashboard
const REAUTH_MAX_AGE_MS = 5 * 60 * 1000; // 5 min re-auth for saves
const LOCK_AFTER = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const ISSUER = "Portfolio Admin";

// --------------------------------------------------------------------------
// Crypto helpers
// --------------------------------------------------------------------------

function encKey(): Buffer {
  const raw = process.env.ADMIN_TOTP_ENC_KEY;
  if (!raw) throw new Error("ADMIN_TOTP_ENC_KEY missing");
  return createHash("sha256").update(raw).digest();
}

function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString("base64");
}

function decryptSecret(b64: string): string {
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(12, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

function cookieSecret(): string {
  const s = process.env.ADMIN_2FA_COOKIE_SECRET;
  if (!s) throw new Error("ADMIN_2FA_COOKIE_SECRET missing");
  return s;
}

function signCookie(userId: string, issuedAt: number, expiresAt: number): string {
  const payload = `${userId}.${issuedAt}.${expiresAt}`;
  const mac = createHmac("sha256", cookieSecret()).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

interface CookieState {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

function verifyCookie(value: string | undefined): CookieState | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const [userId, issuedStr, expiresStr, mac] = parts;
  const expected = createHmac("sha256", cookieSecret())
    .update(`${userId}.${issuedStr}.${expiresStr}`)
    .digest("hex");
  try {
    if (
      mac.length !== expected.length ||
      !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  const issuedAt = Number(issuedStr);
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;
  return { userId, issuedAt, expiresAt };
}

function sha256Hex(v: string): string {
  return createHash("sha256").update(v).digest("hex");
}

function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // 10-character alphanumeric, easy to read
    const raw = randomBytes(6).toString("base64url").slice(0, 10).toUpperCase();
    codes.push(raw);
  }
  return codes;
}

// --------------------------------------------------------------------------
// Admin-only guard shared across handlers
// --------------------------------------------------------------------------

async function assertAdmin(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

// Public helper used by other server fns to enforce fresh 2FA.
export function requireFreshTotp(userId: string, maxAgeMs = REAUTH_MAX_AGE_MS) {
  const state = verifyCookie(getCookie(COOKIE_NAME));
  if (!state || state.userId !== userId) {
    throw new Error("REAUTH_REQUIRED");
  }
  if (Date.now() - state.issuedAt > maxAgeMs) {
    throw new Error("REAUTH_REQUIRED");
  }
}

// --------------------------------------------------------------------------
// Server functions
// --------------------------------------------------------------------------

/** Full status snapshot for the dashboard's routing logic. */
export const getAdminSecurityState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: roleRow }, { data: profile }, { data: anyAdmin }] =
      await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
        supabase
          .from("admin_profiles")
          .select("totp_enabled, locked_until, failed_attempts")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.rpc("admin_exists"),
      ]);

    const state = verifyCookie(getCookie(COOKIE_NAME));
    const twoFactorSessionActive =
      !!state && state.userId === userId && Date.now() < state.expiresAt;

    return {
      isAdmin: !!roleRow,
      adminExists: !!anyAdmin,
      totpEnabled: !!profile?.totp_enabled,
      lockedUntil: profile?.locked_until ?? null,
      twoFactorSessionActive,
    };
  });

/** Start enrollment: create secret (unconfirmed) + backup codes. */
export const startTotpEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes.user?.email ?? "admin";

    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    const codes = generateBackupCodes();
    const hashedCodes = codes.map(sha256Hex);

    const { error } = await supabase.from("admin_profiles").upsert(
      {
        user_id: userId,
        totp_secret_enc: encryptSecret(secret.base32),
        totp_enabled: false, // still needs confirmation
        backup_codes_hashed: hashedCodes,
        failed_attempts: 0,
        locked_until: null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);

    return {
      otpauthUri: totp.toString(),
      secret: secret.base32,
      backupCodes: codes, // shown ONCE
    };
  });

/** Confirm enrollment with a live code. */
export const confirmTotpEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(6).max(10) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { data: row } = await supabase
      .from("admin_profiles")
      .select("totp_secret_enc")
      .eq("user_id", userId)
      .maybeSingle();
    if (!row?.totp_secret_enc) throw new Error("Start enrollment first");

    const secret = decryptSecret(row.totp_secret_enc);
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const delta = totp.validate({ token: data.code.trim(), window: 1 });
    if (delta === null) throw new Error("Invalid code. Try again.");

    await supabase
      .from("admin_profiles")
      .update({ totp_enabled: true })
      .eq("user_id", userId);

    setSessionCookie(userId);
    return { ok: true };
  });

function setSessionCookie(userId: string) {
  const now = Date.now();
  const value = signCookie(userId, now, now + SESSION_TTL_MS);
  setCookie(COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/** Verify a code (login or re-auth). Handles lockout. */
export const verifyTotp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        code: z.string().min(6).max(12),
        useBackup: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { data: row } = await supabase
      .from("admin_profiles")
      .select(
        "totp_secret_enc, totp_enabled, backup_codes_hashed, failed_attempts, locked_until",
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (!row?.totp_enabled) throw new Error("2FA not enabled");

    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
      throw new Error(
        `Too many attempts. Try again after ${new Date(row.locked_until).toLocaleTimeString()}.`,
      );
    }

    const raw = data.code.trim().toUpperCase().replace(/\s+/g, "");

    let ok = false;
    let updatedBackup: string[] | null = null;

    if (data.useBackup) {
      const hashed = sha256Hex(raw);
      const idx = row.backup_codes_hashed.indexOf(hashed);
      if (idx >= 0) {
        updatedBackup = row.backup_codes_hashed.filter((_, i) => i !== idx);
        ok = true;
      }
    } else {
      const secret = decryptSecret(row.totp_secret_enc!);
      const totp = new OTPAuth.TOTP({
        issuer: ISSUER,
        secret: OTPAuth.Secret.fromBase32(secret),
      });
      ok = totp.validate({ token: raw, window: 1 }) !== null;
    }

    if (!ok) {
      const attempts = (row.failed_attempts ?? 0) + 1;
      const locked =
        attempts >= LOCK_AFTER
          ? new Date(Date.now() + LOCK_DURATION_MS).toISOString()
          : null;
      await supabase
        .from("admin_profiles")
        .update({
          failed_attempts: locked ? 0 : attempts,
          locked_until: locked,
        })
        .eq("user_id", userId);
      throw new Error(
        locked
          ? "Too many wrong codes. Locked for 15 minutes."
          : "Invalid code.",
      );
    }

    await supabase
      .from("admin_profiles")
      .update({
        failed_attempts: 0,
        locked_until: null,
        ...(updatedBackup ? { backup_codes_hashed: updatedBackup } : {}),
      })
      .eq("user_id", userId);

    setSessionCookie(userId);
    return { ok: true, backupCodesRemaining: (updatedBackup ?? row.backup_codes_hashed).length };
  });

/** Disable 2FA (requires fresh 2FA). */
export const disableTotp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    requireFreshTotp(userId);
    await supabase
      .from("admin_profiles")
      .update({
        totp_enabled: false,
        totp_secret_enc: null,
        backup_codes_hashed: [],
      })
      .eq("user_id", userId);
    setCookie(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return { ok: true };
  });

/** Clear the 2FA-verified cookie (does not sign the user out of Supabase). */
export const clearTotpSession = createServerFn({ method: "POST" }).handler(
  async () => {
    setCookie(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return { ok: true };
  },
);

// --------------------------------------------------------------------------
// User approval
// --------------------------------------------------------------------------

export const listPendingUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    requireFreshTotp(userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersRes, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const { data: adminRows, error: adminErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (adminErr) throw new Error(adminErr.message);
    const adminIds = new Set((adminRows ?? []).map((r) => r.user_id));

    const pending = usersRes.users
      .filter((u) => !adminIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "(no email)",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
      }));

    const admins = usersRes.users
      .filter((u) => adminIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "(no email)",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
        isSelf: u.id === userId,
      }));

    return { pending, admins };
  });

export const approveUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    requireFreshTotp(userId);
    const { error } = await supabase.rpc("promote_to_admin", {
      _target: data.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const rejectUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    requireFreshTotp(userId);
    if (data.userId === userId) throw new Error("Cannot remove yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
