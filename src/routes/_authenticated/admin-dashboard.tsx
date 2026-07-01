import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import {
  claimFirstAdmin,
  getPortfolioData,
  savePortfolioData,
} from "@/lib/site-content.functions";
import {
  approveUser,
  clearTotpSession,
  confirmTotpEnrollment,
  disableTotp,
  getAdminSecurityState,
  listPendingUsers,
  rejectUser,
  startTotpEnrollment,
  verifyTotp,
} from "@/lib/admin-auth";
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

type SecurityState = Awaited<ReturnType<typeof getAdminSecurityState>>;

function AdminDashboard() {
  const navigate = useNavigate();
  const fetchState = useServerFn(getAdminSecurityState);
  const claim = useServerFn(claimFirstAdmin);
  const clearSession = useServerFn(clearTotpSession);

  const [state, setState] = useState<SecurityState | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setState(await fetchState());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchState]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: u }) => {
      setUserEmail(u.user?.email ?? null);
    });
    reload();
  }, [reload]);

  async function handleSignOut() {
    await clearSession().catch(() => {});
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  async function handleClaim() {
    setErr(null);
    setMsg(null);
    try {
      const r = await claim();
      if (r.promoted) {
        setMsg("You are now the admin.");
        await reload();
      } else {
        setErr("Admin already claimed by another account.");
      }
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>;

  if (!state?.isAdmin) {
    return (
      <FullScreenPanel title="Admin access" email={userEmail} onSignOut={handleSignOut}>
        {state?.adminExists ? (
          <>
            <p className="text-sm opacity-80">
              Your account is <strong>pending approval</strong>. An existing admin
              needs to approve you before you can access the editor.
            </p>
            <Button variant="outline" onClick={reload}>Check again</Button>
          </>
        ) : (
          <>
            <p className="text-sm opacity-80">
              No admin exists yet. Claim the admin role for this account to begin.
            </p>
            <Button onClick={handleClaim}>Make me the admin</Button>
          </>
        )}
        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
      </FullScreenPanel>
    );
  }

  if (!state.totpEnabled) {
    return (
      <FullScreenPanel title="Set up two-factor authentication" email={userEmail} onSignOut={handleSignOut}>
        <TotpEnrollment onDone={reload} />
      </FullScreenPanel>
    );
  }

  if (!state.twoFactorSessionActive) {
    return (
      <FullScreenPanel title="Enter verification code" email={userEmail} onSignOut={handleSignOut}>
        <TotpChallenge onDone={reload} lockedUntil={state.lockedUntil} />
      </FullScreenPanel>
    );
  }

  return <DashboardMain onSignOut={handleSignOut} userEmail={userEmail} onReloadState={reload} />;
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-[#c9a84c]">
      {children}
    </div>
  );
}

function FullScreenPanel({
  title, email, onSignOut, children,
}: { title: string; email: string | null; onSignOut: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-white p-6">
      <div className="w-full max-w-md bg-[#0f1e33] border border-[#c9a84c]/20 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#c9a84c]">{title}</h1>
            {email && <p className="text-xs opacity-60 mt-1">{email}</p>}
          </div>
          <Button size="sm" variant="ghost" onClick={onSignOut}>Sign out</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TotpEnrollment({ onDone }: { onDone: () => void }) {
  const start = useServerFn(startTotpEnrollment);
  const confirm = useServerFn(confirmTotpEnrollment);
  const [phase, setPhase] = useState<"idle" | "show" | "done">("idle");
  const [secret, setSecret] = useState("");
  const [qr, setQr] = useState("");
  const [backup, setBackup] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function begin() {
    setErr(null); setBusy(true);
    try {
      const r = await start();
      setSecret(r.secret); setBackup(r.backupCodes);
      setQr(await QRCode.toDataURL(r.otpauthUri, { margin: 1, width: 220 }));
      setPhase("show");
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      await confirm({ data: { code } });
      setPhase("done");
      setTimeout(onDone, 1000);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  if (phase === "idle") {
    return (
      <div className="space-y-3">
        <p className="text-sm opacity-80">
          Install an authenticator app (Google Authenticator, Authy, 1Password) on
          your phone, then click below to reveal a QR code.
        </p>
        <Button onClick={begin} disabled={busy}>
          {busy ? "Preparing…" : "Reveal QR code"}
        </Button>
        {err && <p className="text-red-400 text-sm">{err}</p>}
      </div>
    );
  }

  if (phase === "done") {
    return <p className="text-emerald-400 text-sm">2FA enabled. Loading dashboard…</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-md">
        {qr && <img src={qr} alt="Scan QR" className="w-[220px] h-[220px]" />}
      </div>
      <div className="text-xs opacity-70">
        Can't scan? Enter this secret manually:
        <code className="block mt-1 p-2 bg-black/40 rounded text-[#c9a84c] break-all">
          {secret}
        </code>
      </div>
      <div className="text-xs">
        <div className="uppercase tracking-wider opacity-60 mb-1">
          Backup codes (save these somewhere safe — shown only once)
        </div>
        <div className="grid grid-cols-2 gap-1 p-2 bg-black/40 rounded font-mono text-[11px]">
          {backup.map((c) => (<span key={c}>{c}</span>))}
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wider opacity-80">
          Enter the 6-digit code from your app
        </Label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric" pattern="[0-9]*" autoFocus placeholder="123456"
        />
      </div>
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <Button type="submit" disabled={busy || code.length < 6}>
        {busy ? "Verifying…" : "Confirm and enable 2FA"}
      </Button>
    </form>
  );
}

function TotpChallenge({
  onDone, lockedUntil,
}: { onDone: () => void; lockedUntil: string | null }) {
  const verify = useServerFn(verifyTotp);
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = lockedUntil && new Date(lockedUntil).getTime() > Date.now();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      await verify({ data: { code, useBackup } });
      onDone();
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm opacity-80">
        {useBackup
          ? "Enter one of your saved backup codes."
          : "Open your authenticator app and enter the 6-digit code."}
      </p>
      {locked && (
        <p className="text-red-400 text-sm">
          Locked until {new Date(lockedUntil!).toLocaleTimeString()}.
        </p>
      )}
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        inputMode={useBackup ? "text" : "numeric"}
        pattern={useBackup ? undefined : "[0-9]*"}
        autoFocus
        placeholder={useBackup ? "BACKUP-CODE" : "123456"}
        disabled={!!locked}
      />
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <div className="flex justify-between items-center gap-2">
        <button
          type="button"
          className="text-xs opacity-70 hover:opacity-100 underline"
          onClick={() => { setUseBackup((v) => !v); setCode(""); }}
        >
          {useBackup ? "Use authenticator app" : "Use a backup code instead"}
        </button>
        <Button type="submit" disabled={busy || !!locked || code.length < 6}>
          {busy ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </form>
  );
}

function DashboardMain({
  userEmail, onSignOut, onReloadState,
}: { userEmail: string | null; onSignOut: () => void; onReloadState: () => void }) {
  const fetchData = useServerFn(getPortfolioData);
  const saveData = useServerFn(savePortfolioData);
  const verify = useServerFn(verifyTotp);

  const [data, setData] = useState<PortfolioData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reauth, setReauth] = useState<null | { after: () => Promise<void> }>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchData();
      setData(r.data);
    } catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  }, [fetchData]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const [previewHtml, setPreviewHtml] = useState<string>("");
  useEffect(() => {
    const t = setTimeout(() => {
      try { setPreviewHtml(render(data)); } catch (e) { console.error(e); }
    }, 400);
    return () => clearTimeout(t);
  }, [data]);

  async function doSave() {
    await saveData({ data: { json: JSON.stringify(data) } });
    setMsg("Saved and published.");
  }

  async function handleSave() {
    setSaving(true); setMsg(null); setErr(null);
    try { await doSave(); }
    catch (e) {
      const m = (e as Error).message;
      if (m.includes("REAUTH_REQUIRED")) {
        setReauth({ after: doSave });
      } else { setErr(m); }
    } finally { setSaving(false); }
  }

  async function handleReauthVerify(code: string) {
    await verify({ data: { code } });
    const cb = reauth?.after;
    setReauth(null);
    if (cb) {
      setSaving(true);
      try { await cb(); } catch (e) { setErr((e as Error).message); }
      finally { setSaving(false); }
    }
  }

  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[#c9a84c] font-semibold">Portfolio Admin</span>
          <span className="text-xs opacity-60">{userEmail}</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
            2FA active
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {msg && <span className="text-emerald-400 text-xs">{msg}</span>}
          {err && <span className="text-red-400 text-xs">{err}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save & publish"}
          </Button>
          <Button variant="outline" onClick={() => loadAll()}>Reload</Button>
          <Button variant="ghost" onClick={onSignOut}>Sign out</Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
        <div className="overflow-y-auto p-6 border-r border-white/10">
          <Editor data={data} setData={setData} onSecurityChange={onReloadState} />
        </div>
        <div className="bg-[#08121f]">
          <iframe
            title="Live preview" srcDoc={previewHtml}
            className="w-full h-full" style={{ minHeight: "calc(100vh - 56px)" }}
          />
        </div>
      </div>

      {reauth && (
        <ReauthModal onCancel={() => setReauth(null)} onSubmit={handleReauthVerify} />
      )}
    </div>
  );
}

function ReauthModal({
  onCancel, onSubmit,
}: { onCancel: () => void; onSubmit: (code: string) => Promise<void> }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await onSubmit(code); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-[#0f1e33] border border-[#c9a84c]/20 rounded-xl p-5 space-y-3">
        <h2 className="text-[#c9a84c] font-semibold">Confirm with 2FA</h2>
        <p className="text-xs opacity-70">
          Enter a fresh 6-digit code from your authenticator app to publish changes.
        </p>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric" pattern="[0-9]*" autoFocus placeholder="123456"
        />
        {err && <p className="text-red-400 text-xs">{err}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={busy || code.length < 6}>
            {busy ? "Verifying…" : "Verify & publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============ Editor ============

type SetData = React.Dispatch<React.SetStateAction<PortfolioData>>;

function Editor({
  data,
  setData,
  onSecurityChange,
}: {
  data: PortfolioData;
  setData: SetData;
  onSecurityChange: () => void;
}) {
  return (
    <Tabs defaultValue="hero" className="w-full">
      <TabsList className="grid grid-cols-6 mb-4">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
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
      <TabsContent value="users">
        <UsersEditor onSecurityChange={onSecurityChange} />
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderItem: (item: T, update: (patch: any) => void) => React.ReactNode;
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

function UsersEditor({ onSecurityChange }: { onSecurityChange: () => void }) {
  const list = useServerFn(listPendingUsers);
  const approve = useServerFn(approveUser);
  const reject = useServerFn(rejectUser);
  const disable = useServerFn(disableTotp);
  const [pending, setPending] = useState<Array<{ id: string; email: string; createdAt: string }>>([]);
  const [admins, setAdmins] = useState<Array<{ id: string; email: string; isSelf: boolean }>>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null); setBusy(true);
    try {
      const r = await list();
      setPending(r.pending);
      setAdmins(r.admins);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }, [list]);

  useEffect(() => { load(); }, [load]);

  async function act(fn: () => Promise<unknown>, label: string) {
    setBusy(true); setErr(null); setMsg(null);
    try { await fn(); setMsg(label); await load(); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <Section title="Users" description="Approve or remove admin accounts.">
      {err && <p className="text-red-400 text-sm">{err}</p>}
      {msg && <p className="text-emerald-400 text-sm">{msg}</p>}

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider opacity-80">
          Pending approval ({pending.length})
        </Label>
        {pending.length === 0 && <p className="text-xs opacity-60">No pending signups.</p>}
        {pending.map((u) => (
          <div key={u.id} className="flex items-center justify-between border border-white/10 rounded p-2 bg-white/[0.02]">
            <div>
              <div className="text-sm">{u.email}</div>
              <div className="text-[10px] opacity-50">signed up {new Date(u.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => act(() => approve({ data: { userId: u.id } }), "User approved as admin.")} disabled={busy}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => act(() => reject({ data: { userId: u.id } }), "User removed.")} disabled={busy}>Reject</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mt-6">
        <Label className="text-xs uppercase tracking-wider opacity-80">
          Admins ({admins.length})
        </Label>
        {admins.map((u) => (
          <div key={u.id} className="flex items-center justify-between border border-white/10 rounded p-2 bg-white/[0.02]">
            <div className="text-sm">
              {u.email} {u.isSelf && <span className="text-[10px] text-[#c9a84c] ml-1">(you)</span>}
            </div>
            {!u.isSelf && (
              <Button size="sm" variant="outline" onClick={() => act(() => reject({ data: { userId: u.id } }), "Admin removed.")} disabled={busy}>Remove</Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-white/10 pt-4 space-y-2">
        <Label className="text-xs uppercase tracking-wider opacity-80 text-red-300">Danger zone</Label>
        <p className="text-xs opacity-60">
          Disable your 2FA. You'll be prompted to set it up again on the next sign-in.
        </p>
        <Button size="sm" variant="outline" onClick={() => act(async () => { await disable(); onSecurityChange(); }, "2FA disabled.")} disabled={busy}>
          Disable my 2FA
        </Button>
      </div>
    </Section>
  );
}
