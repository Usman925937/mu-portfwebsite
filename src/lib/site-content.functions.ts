import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const ROW_ID = "portfolio";

export const getPortfolioHtml = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverPublicClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("html, updated_at")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) {
      console.error("getPortfolioHtml error", error);
      return { html: null as string | null, updatedAt: null as string | null };
    }
    return {
      html: (data?.html as string | undefined) ?? null,
      updatedAt: (data?.updated_at as string | undefined) ?? null,
    };
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
    return {
      isAdmin: !!roleRow,
      adminExists: !!anyAdmin,
    };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    return { promoted: !!data };
  });

export const savePortfolioHtml = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        html: z.string().min(1).max(5_000_000),
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

    const { error } = await supabase
      .from("site_content")
      .upsert(
        { id: ROW_ID, html: data.html, updated_by: userId },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
