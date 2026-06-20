import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  claimFirstAdmin,
  getAdminStatus,
  getPortfolioHtml,
  savePortfolioHtml,
} from "@/lib/site-content.functions";

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
  const fetchHtml = useServerFn(getPortfolioHtml);
  const saveHtml = useServerFn(savePortfolioHtml);
  const claim = useServerFn(claimFirstAdmin);

  const [status, setStatus] = useState<{
    isAdmin: boolean;
    adminExists: boolean;
  } | null>(null);
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const s = await fetchStatus();
      setStatus(s);
      const r = await fetchHtml();
      if (r.html) {
        setHtml(r.html);
      } else {
        // Seed from the static fallback so the editor always has something to work with.
        try {
          const res = await fetch("/portfolio.html");
          const text = await res.text();
          setHtml(text);
        } catch {
          setHtml("");
        }
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClaim() {
    setErr(null);
    setMsg(null);
    try {
      const r = await claim();
      if (r.promoted) {
        setMsg("You are now the admin.");
        await loadAll();
      } else {
        setErr("Admin already exists.");
        await loadAll();
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to claim");
    }
  }

  async function handleSave() {
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      await saveHtml({ data: { html } });
      setMsg("Saved. The public site is updated.");
      setPreviewKey((k) => k + 1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08121f",
        color: "#ccd6f6",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(201,168,76,.15)",
          background: "#0f1e33",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#c9a84c",
              fontSize: "1.05rem",
            }}
          >
            Portfolio Admin
          </div>
          <div
            style={{
              fontSize: ".66rem",
              color: "#6b7a99",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            Edit anything. Save. It's live.
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <a href="/" target="_blank" rel="noreferrer" style={linkBtnStyle}>
            View site
          </a>
          <button onClick={handleSignOut} style={ghostBtnStyle}>
            Sign out
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: "2rem" }}>Loading…</div>
      ) : status && !status.isAdmin ? (
        <div style={{ padding: "2rem", maxWidth: 560 }}>
          {!status.adminExists ? (
            <>
              <h2 style={{ marginBottom: ".5rem" }}>Claim admin access</h2>
              <p style={{ color: "#6b7a99", marginBottom: "1rem" }}>
                No admin has been set up yet. Click below to make this account
                the site owner. After that, no one else can claim it.
              </p>
              <button onClick={handleClaim} style={primaryBtnStyle}>
                Make me the admin
              </button>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: ".5rem" }}>Not authorized</h2>
              <p style={{ color: "#6b7a99" }}>
                This account doesn't have admin access. Sign out and use the
                owner account.
              </p>
            </>
          )}
          {err && <div style={errStyle}>{err}</div>}
          {msg && <div style={msgStyle}>{msg}</div>}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 0,
            height: "calc(100vh - 73px)",
          }}
        >
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid rgba(201,168,76,.15)",
              minWidth: 0,
            }}
          >
            <div style={toolbarStyle}>
              <span style={pillStyle}>portfolio.html</span>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button
                  onClick={loadAll}
                  disabled={saving}
                  style={ghostBtnStyle}
                >
                  Reload
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={primaryBtnStyle}
                >
                  {saving ? "Saving…" : "Save & publish"}
                </button>
              </div>
            </div>
            {(err || msg) && (
              <div style={{ padding: "0 1rem" }}>
                {err && <div style={errStyle}>{err}</div>}
                {msg && <div style={msgStyle}>{msg}</div>}
              </div>
            )}
            <textarea
              spellCheck={false}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              style={{
                flex: 1,
                width: "100%",
                background: "#08121f",
                color: "#e8edf7",
                border: "none",
                outline: "none",
                padding: "1rem",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12.5,
                lineHeight: 1.5,
                resize: "none",
              }}
            />
          </section>

          <section
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              background: "#020611",
            }}
          >
            <div style={toolbarStyle}>
              <span style={pillStyle}>Live preview</span>
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                style={ghostBtnStyle}
              >
                Refresh
              </button>
            </div>
            <iframe
              key={previewKey}
              title="preview"
              srcDoc={html}
              style={{ flex: 1, width: "100%", border: 0, background: "#fff" }}
            />
          </section>
        </div>
      )}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  background: "#c9a84c",
  color: "#08121f",
  border: "none",
  borderRadius: 6,
  padding: ".55rem 1rem",
  fontWeight: 700,
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  cursor: "pointer",
};
const ghostBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: "#ccd6f6",
  border: "1px solid rgba(201,168,76,.3)",
  borderRadius: 6,
  padding: ".5rem .9rem",
  fontSize: ".72rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  cursor: "pointer",
};
const linkBtnStyle: React.CSSProperties = {
  ...ghostBtnStyle,
  textDecoration: "none",
  display: "inline-block",
};
const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: ".75rem 1rem",
  borderBottom: "1px solid rgba(201,168,76,.15)",
  background: "#0f1e33",
};
const pillStyle: React.CSSProperties = {
  fontSize: ".66rem",
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#6b7a99",
};
const errStyle: React.CSSProperties = {
  background: "rgba(220,60,60,.12)",
  border: "1px solid rgba(220,60,60,.35)",
  color: "#ff8b8b",
  padding: ".5rem .65rem",
  borderRadius: 6,
  fontSize: ".78rem",
  margin: ".5rem 0",
};
const msgStyle: React.CSSProperties = {
  background: "rgba(201,168,76,.1)",
  border: "1px solid rgba(201,168,76,.3)",
  color: "#e8c97a",
  padding: ".5rem .65rem",
  borderRadius: 6,
  fontSize: ".78rem",
  margin: ".5rem 0",
};
