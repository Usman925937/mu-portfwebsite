import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAuthPage,
});

function AdminAuthPage() {
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, jump to dashboard.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) {
        navigate({ to: "/_authenticated/admin-dashboard" as never });
      }
    })();
    // Check whether an admin has been claimed yet (controls signup visibility).
    (async () => {
      const { data, error } = await supabase.rpc("admin_exists");
      if (!cancelled) {
        if (error) setAdminExists(true); // fail closed
        else setAdminExists(!!data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const canSignUp = adminExists === false;
  const effectiveMode = canSignUp ? mode : "signin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (effectiveMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg(
            "Account created. Check your email to confirm, then come back here and sign in.",
          );
          setMode("signin");
        } else {
          navigate({ to: "/_authenticated/admin-dashboard" as never });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: "/_authenticated/admin-dashboard" as never });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08121f",
        color: "#ccd6f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0f1e33",
          border: "1px solid rgba(201,168,76,.18)",
          borderRadius: 12,
          padding: "2rem 1.75rem",
          boxShadow: "0 30px 80px rgba(0,0,0,.45)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#c9a84c",
              fontSize: "1.2rem",
              letterSpacing: ".08em",
            }}
          >
            Site Admin
          </div>
          <div
            style={{
              color: "#6b7a99",
              fontSize: ".72rem",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {effectiveMode === "signup"
              ? "Claim this site"
              : "Owner access only"}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={lblStyle}>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={lblStyle}>Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={
                effectiveMode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>

          {err && <div style={errStyle}>{err}</div>}
          {msg && <div style={msgStyle}>{msg}</div>}

          <button type="submit" disabled={busy} style={btnStyle}>
            {busy
              ? "Working..."
              : effectiveMode === "signup"
                ? "Create admin account"
                : "Sign in"}
          </button>

          {canSignUp && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              style={{
                background: "none",
                border: "none",
                color: "#6b7a99",
                cursor: "pointer",
                fontSize: ".72rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {mode === "signin"
                ? "First time? Create the admin account"
                : "Already have an account? Sign in"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#08121f",
  border: "1px solid rgba(201,168,76,.18)",
  borderRadius: 6,
  padding: ".65rem .8rem",
  color: "#fff",
  fontSize: ".9rem",
  outline: "none",
};
const lblStyle: React.CSSProperties = {
  fontSize: ".62rem",
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#6b7a99",
};
const btnStyle: React.CSSProperties = {
  background: "#c9a84c",
  color: "#08121f",
  border: "none",
  borderRadius: 6,
  padding: ".75rem 1rem",
  fontWeight: 700,
  fontSize: ".82rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  cursor: "pointer",
  marginTop: ".5rem",
};
const errStyle: React.CSSProperties = {
  background: "rgba(220,60,60,.12)",
  border: "1px solid rgba(220,60,60,.35)",
  color: "#ff8b8b",
  padding: ".5rem .65rem",
  borderRadius: 6,
  fontSize: ".78rem",
};
const msgStyle: React.CSSProperties = {
  background: "rgba(201,168,76,.1)",
  border: "1px solid rgba(201,168,76,.3)",
  color: "#e8c97a",
  padding: ".5rem .65rem",
  borderRadius: 6,
  fontSize: ".78rem",
};
