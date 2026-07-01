import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_DATA, type PortfolioData } from "./portfolio-render";

const DATA_ROW_ID = "portfolio_data";

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

export const getPublicPortfolioData = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverPublicClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("html")
      .eq("id", DATA_ROW_ID)
      .maybeSingle();
    if (error || !data?.html) {
      return { data: DEFAULT_DATA };
    }
    try {
      const parsed = JSON.parse(data.html as string) as Partial<PortfolioData>;
      return { data: mergeData(parsed) };
    } catch {
      return { data: DEFAULT_DATA };
    }
  },
);
