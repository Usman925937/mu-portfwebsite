import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_DATA, render, type PortfolioData } from "./portfolio-render";
import { requireFreshTotp } from "./admin-auth.functions";

function serverPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

const DATA_ROW_ID = "portfolio_data";

function mergeData(saved: Partial<PortfolioData> | null): PortfolioData {
  if (!saved) return DEFAULT_DATA;
  return {
    ...DEFAULT_DATA,
    ...saved,
    hero: { ...DEFAULT_DATA.hero, ...(saved.hero ?? {}) },
    experience: saved.experience ?? DEFAULT_DATA.experience,
    projects: saved.projects ?? DEFAULT_DATA.projects,
    footerCopy: saved.footerCopy ?? DEFAULT_DATA.footerCopy,
    rawHtmlOverride: saved.rawHtmlOverride ?? "",
  };
}

async function loadData(): Promise<PortfolioData> {
  const supabase = serverPublicClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("html")
    .eq("id", DATA_ROW_ID)
    .maybeSingle();
  if (error || !data?.html) return DEFAULT_DATA;
  try {
    const parsed = JSON.parse(data.html as string) as Partial<PortfolioData>;
    return mergeData(parsed);
  } catch {
    return DEFAULT_DATA;
  }
}

export const getPortfolioHtml = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const data = await loadData();
      return { html: render(data) };
    } catch (e) {
      console.error("getPortfolioHtml error", e);
      return { html: render(DEFAULT_DATA) };
    }
  },
);

export const getPortfolioData = createServerFn({ method: "GET" }).handler(
  async () => {
    const data = await loadData();
    return { data, defaults: DEFAULT_DATA };
  },
);

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: roleRow }, { data: anyAdmin }] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle(),
      supabase.rpc("admin_exists"),
    ]);
    return { isAdmin: !!roleRow, adminExists: !!anyAdmin };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    return { promoted: !!data };
  });

// Save structured portfolio data (JSON).
export const savePortfolioData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        json: z.string().min(2).max(5_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    // Require fresh 2FA if the admin has TOTP enabled.
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("totp_enabled")
      .eq("user_id", userId)
      .maybeSingle();
    if (profile?.totp_enabled) {
      requireFreshTotp(userId);
    }
    // validate JSON
    try {
      JSON.parse(data.json);
    } catch {
      throw new Error("Invalid JSON payload");
    }
    const { error } = await supabase
      .from("site_content")
      .upsert(
        { id: DATA_ROW_ID, html: data.json, updated_by: userId },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
