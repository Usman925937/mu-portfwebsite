import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  claimFirstAdmin,
  getAdminStatus,
  getPortfolioData,
  savePortfolioData,
} from "@/lib/site-content.functions";
import {
  DEFAULT_DATA,
  render,
  type Experience,
  type PortfolioData,
  type Project,
  type Stat,
} from "@/lib/portfolio-render";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin-dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getAdminStatus);
  const fetchData = useServerFn(getPortfolioData);
  const saveData = useServerFn(savePortfolioData);
  const claim = useServerFn(claimFirstAdmin);

  const [status, setStatus] = useState<{
    isAdmin: boolean;
    adminExists: boolean;
  } | null>(null);
  const [data, setData] = useState<PortfolioData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const s = await fetchStatus();
      setStatus(s);
      const r = await fetchData();
      setData(r.data);
    } catch (e) {
      setErr((e as Error).message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [fetchStatus, fetchData]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: u }) => {
      setUserEmail(u.user?.email ?? null);
    });
    loadAll();
  }, [loadAll]);

  // Debounced live preview HTML
  const [previewHtml, setPreviewHtml] = useState<string>("");
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setPreviewHtml(render(data));
      } catch (e) {
        console.error("preview render", e);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [data]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await saveData({ data: { json: JSON.stringify(data) } });
      setMsg("Saved and published.");
    } catch (e) {
      setErr((e as Error).message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleClaim() {
    setErr(null);
    setMsg(null);
    try {
      const r = await claim();
      if (r.promoted) {
        setMsg("You are now the admin.");
        await loadAll();
      } else {
        setErr("Admin already claimed by another account.");
      }
    } catch (e) {
      setErr((e as Error).message || "Claim failed");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-[#c9a84c]">
        Loading…
      </div>
    );
  }

  if (!status?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-[#c9a84c]">
            Admin access required
          </h1>
          {status?.adminExists ? (
            <p className="text-sm opacity-70">
              An admin is already configured. You don't have admin permission.
            </p>
          ) : (
            <>
              <p className="text-sm opacity-80">
                No admin exists yet. Click below to claim the admin role for
                this account.
              </p>
              <Button onClick={handleClaim}>Make me the admin</Button>
            </>
          )}
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-[#c9a84c] font-semibold">Portfolio Admin</span>
          <span className="text-xs opacity-60">{userEmail}</span>
        </div>
        <div className="flex gap-2 items-center">
          {msg && <span className="text-emerald-400 text-xs">{msg}</span>}
          {err && <span className="text-red-400 text-xs">{err}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save & publish"}
          </Button>
          <Button variant="outline" onClick={() => loadAll()}>
            Reload
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
        <div className="overflow-y-auto p-6 border-r border-white/10">
          <Editor data={data} setData={setData} />
        </div>
        <div className="bg-[#08121f]">
          <iframe
            title="Live preview"
            srcDoc={previewHtml}
            className="w-full h-full"
            style={{ minHeight: "calc(100vh - 56px)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ============ Editor ============

type SetData = React.Dispatch<React.SetStateAction<PortfolioData>>;

function Editor({ data, setData }: { data: PortfolioData; setData: SetData }) {
  return (
    <Tabs defaultValue="hero" className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="hero">
        <HeroEditor data={data} setData={setData} />
      </TabsContent>
      <TabsContent value="experience">
        <ExperienceEditor data={data} setData={setData} />
      </TabsContent>
      <TabsContent value="projects">
        <ProjectsEditor data={data} setData={setData} />
      </TabsContent>
      <TabsContent value="contact">
        <ContactEditor data={data} setData={setData} />
      </TabsContent>
      <TabsContent value="advanced">
        <AdvancedEditor data={data} setData={setData} />
      </TabsContent>
    </Tabs>
  );
}

function Section({
  title,
  description,
  children,
  onReset,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#c9a84c]">{title}</h2>
          {description && (
            <p className="text-xs opacity-60">{description}</p>
          )}
        </div>
        {onReset && (
          <Button size="sm" variant="ghost" onClick={onReset}>
            Reset to default
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider opacity-80">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[10px] opacity-50">{hint}</p>}
    </div>
  );
}

function HeroEditor({ data, setData }: { data: PortfolioData; setData: SetData }) {
  const h = data.hero;
  const set = (patch: Partial<PortfolioData["hero"]>) =>
    setData((d) => ({ ...d, hero: { ...d.hero, ...patch } }));

  return (
    <Section
      title="Hero"
      description="The big intro at the top of the page."
      onReset={() => set(DEFAULT_DATA.hero)}
    >
      <Field label="Eyebrow line">
        <Input
          value={h.eyebrow}
          onChange={(e) => set({ eyebrow: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input
            value={h.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
          />
        </Field>
        <Field label="Last name (shown in gold)" hint="Include the period if you want one.">
          <Input
            value={h.lastName}
            onChange={(e) => set({ lastName: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Subtitle">
        <Input
          value={h.subtitle}
          onChange={(e) => set({ subtitle: e.target.value })}
        />
      </Field>
      <Field label="Description" hint="HTML allowed: wrap key phrases in <strong>…</strong>.">
        <Textarea
          rows={4}
          value={h.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Primary button text">
          <Input
            value={h.primaryCtaText}
            onChange={(e) => set({ primaryCtaText: e.target.value })}
          />
        </Field>
        <Field label="Primary button link" hint="Use #experience to scroll within page.">
          <Input
            value={h.primaryCtaHref}
            onChange={(e) => set({ primaryCtaHref: e.target.value })}
          />
        </Field>
        <Field label="Secondary button text">
          <Input
            value={h.secondaryCtaText}
            onChange={(e) => set({ secondaryCtaText: e.target.value })}
          />
        </Field>
        <Field label="Secondary button link">
          <Input
            value={h.secondaryCtaHref}
            onChange={(e) => set({ secondaryCtaHref: e.target.value })}
          />
        </Field>
      </div>

      <Repeater<Stat>
        label="Stats (small cards under the description)"
        items={h.stats}
        onChange={(stats) => set({ stats })}
        newItem={() => ({ num: "", label: "" })}
        renderItem={(s, update) => (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Number">
              <Input value={s.num} onChange={(e) => update({ num: e.target.value })} />
            </Field>
            <Field label="Label">
              <Input value={s.label} onChange={(e) => update({ label: e.target.value })} />
            </Field>
          </div>
        )}
      />

      <Repeater<string>
        label="Floating chips (top of orbit area)"
        items={h.chips}
        onChange={(chips) => set({ chips })}
        newItem={() => ""}
        renderItem={(c, update) => (
          <Input value={c} onChange={(e) => update(e.target.value)} />
        )}
      />
    </Section>
  );
}

function ExperienceEditor({ data, setData }: { data: PortfolioData; setData: SetData }) {
  return (
    <Section
      title="Experience"
      description="Job cards in the Experience section."
      onReset={() => setData((d) => ({ ...d, experience: DEFAULT_DATA.experience }))}
    >
      <Repeater<Experience>
        label="Job entries"
        items={data.experience}
        onChange={(experience) => setData((d) => ({ ...d, experience }))}
        newItem={() => ({
          role: "",
          org: "",
          bullets: [""],
          skills: [],
          date: "",
          type: "",
          location: "",
        })}
        renderItem={(e, update) => (
          <div className="space-y-2">
            <Field label="Role / Title">
              <Input value={e.role} onChange={(ev) => update({ role: ev.target.value })} />
            </Field>
            <Field label="Company / Org">
              <Input value={e.org} onChange={(ev) => update({ org: ev.target.value })} />
            </Field>
            <Field label="Bullet points (one per line)">
              <Textarea
                rows={4}
                value={e.bullets.join("\n")}
                onChange={(ev) =>
                  update({
                    bullets: ev.target.value.split("\n").filter((s) => s.length > 0),
                  })
                }
              />
            </Field>
            <Field label="Skill tags (comma separated)">
              <Input
                value={e.skills.join(", ")}
                onChange={(ev) =>
                  update({
                    skills: ev.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Date range">
                <Input value={e.date} onChange={(ev) => update({ date: ev.target.value })} />
              </Field>
              <Field label="Type">
                <Input value={e.type} onChange={(ev) => update({ type: ev.target.value })} />
              </Field>
              <Field label="Location">
                <Input value={e.location} onChange={(ev) => update({ location: ev.target.value })} />
              </Field>
            </div>
          </div>
        )}
        itemTitle={(e, i) => `${i + 1}. ${e.role || "Untitled role"}`}
      />
    </Section>
  );
}

function ProjectsEditor({ data, setData }: { data: PortfolioData; setData: SetData }) {
  return (
    <Section
      title="Projects"
      description="Project cards in the Projects section."
      onReset={() => setData((d) => ({ ...d, projects: DEFAULT_DATA.projects }))}
    >
      <Repeater<Project>
        label="Project cards"
        items={data.projects}
        onChange={(projects) => setData((d) => ({ ...d, projects }))}
        newItem={() => ({
          type: "",
          category: "excel",
          name: "",
          desc: "",
          pillsFront: [],
          insideText: "",
          pillsBack: [],
          githubUrl: "",
        })}
        renderItem={(p, update) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category label">
                <Input value={p.type} onChange={(e) => update({ type: e.target.value })} />
              </Field>
              <Field
                label="Filter tags"
                hint="Space-separated. Used by the filter buttons: excel, sql, python, finance, powerbi"
              >
                <Input value={p.category} onChange={(e) => update({ category: e.target.value })} />
              </Field>
            </div>
            <Field label="Project name">
              <Input value={p.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Short description (front of card)">
              <Textarea rows={2} value={p.desc} onChange={(e) => update({ desc: e.target.value })} />
            </Field>
            <Field label="Front pills (comma separated)">
              <Input
                value={p.pillsFront.join(", ")}
                onChange={(e) =>
                  update({
                    pillsFront: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="What's Inside (back of card)">
              <Textarea
                rows={3}
                value={p.insideText}
                onChange={(e) => update({ insideText: e.target.value })}
              />
            </Field>
            <Field label="Back pills (comma separated)">
              <Input
                value={p.pillsBack.join(", ")}
                onChange={(e) =>
                  update({
                    pillsBack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="GitHub URL">
              <Input value={p.githubUrl} onChange={(e) => update({ githubUrl: e.target.value })} />
            </Field>
          </div>
        )}
        itemTitle={(p, i) => `${i + 1}. ${p.name || "Untitled project"}`}
      />
    </Section>
  );
}

function ContactEditor({ data, setData }: { data: PortfolioData; setData: SetData }) {
  return (
    <Section
      title="Contact / Footer"
      description="Footer copyright line and the LinkedIn link used in the hero."
      onReset={() =>
        setData((d) => ({
          ...d,
          footerCopy: DEFAULT_DATA.footerCopy,
          hero: { ...d.hero, secondaryCtaHref: DEFAULT_DATA.hero.secondaryCtaHref },
        }))
      }
    >
      <Field label="LinkedIn URL (also used by the Hero LinkedIn button)">
        <Input
          value={data.hero.secondaryCtaHref}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              hero: { ...d.hero, secondaryCtaHref: e.target.value },
            }))
          }
        />
      </Field>
      <Field label="Footer copyright (HTML allowed)">
        <Textarea
          rows={2}
          value={data.footerCopy}
          onChange={(e) => setData((d) => ({ ...d, footerCopy: e.target.value }))}
        />
      </Field>
      <p className="text-xs opacity-60">
        For deeper changes to the Contact section design (GitHub links, availability rows, etc.),
        use the <strong>Advanced</strong> tab to paste an HTML override.
      </p>
    </Section>
  );
}

function AdvancedEditor({ data, setData }: { data: PortfolioData; setData: SetData }) {
  return (
    <Section
      title="Advanced: Raw HTML override"
      description="When set, this completely replaces the live homepage. Leave blank to use the form-based editor above."
      onReset={() => setData((d) => ({ ...d, rawHtmlOverride: "" }))}
    >
      <Textarea
        rows={20}
        spellCheck={false}
        className="font-mono text-xs"
        value={data.rawHtmlOverride ?? ""}
        onChange={(e) => setData((d) => ({ ...d, rawHtmlOverride: e.target.value }))}
        placeholder="<!DOCTYPE html>…"
      />
    </Section>
  );
}

// ============ Repeater ============

interface RepeaterProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (patch: T extends object ? Partial<T> : T) => void) => React.ReactNode;
  itemTitle?: (item: T, i: number) => string;
}

function Repeater<T>({
  label,
  items,
  onChange,
  newItem,
  renderItem,
  itemTitle,
}: RepeaterProps<T>) {
  const update = (i: number, value: T) => {
    const next = items.slice();
    next[i] = value;
    onChange(next);
  };
  const remove = (i: number) => {
    const next = items.slice();
    next.splice(i, 1);
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...items, newItem()]);

  return (
    <div className="space-y-2 mt-4">
      <Label className="text-xs uppercase tracking-wider opacity-80">{label}</Label>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-md p-3 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-70">
                {itemTitle ? itemTitle(it, i) : `Item ${i + 1}`}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  ↓
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(i)}>
                  ✕
                </Button>
              </div>
            </div>
            {renderItem(it, (patch) => {
              if (typeof it === "object" && it !== null) {
                update(i, { ...(it as object), ...(patch as object) } as T);
              } else {
                update(i, patch as T);
              }
            })}
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={add}>
        + Add
      </Button>
    </div>
  );
}
