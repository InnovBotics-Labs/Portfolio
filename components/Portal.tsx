"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sign-in / register modal (the nav "Portal" button). Front-end demo ported
 * from the prototype's main.js: Google/GitHub OAuth buttons show a "wire up
 * OAuth" state, the email form returns a demo magic-link message, and Esc /
 * backdrop / close-button all dismiss it.
 */

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.397 1.02.005 2.04.135 3 .397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.561C20.565 21.917 24 17.495 24 12.292 24 5.78 18.63.5 12 .5z" />
  </svg>
);

type Mode = "signin" | "register";

export function Portal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<{ text: string; color: string }>({ text: "", color: "" });
  const [email, setEmail] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any demo status when dismissing so it doesn't linger on reopen.
  const close = useCallback(() => {
    setStatus({ text: "", color: "" });
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const signin = mode === "signin";

  const oauth = (provider: string) => {
    setStatus({ text: `Connecting to ${provider}…`, color: "var(--text-dim)" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus({ text: `Demo mode — wire up ${provider} OAuth to finish.`, color: "var(--accent)" });
    }, 900);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ text: "Enter your email to continue.", color: "oklch(0.7 0.15 30)" });
      return;
    }
    setStatus({
      text: (signin ? "Magic link sent to " : "Account ready for ") + email.trim() + " (demo).",
      color: "var(--accent)",
    });
  };

  return (
    <div className={`portal${open ? " open" : ""}`} id="portal" aria-hidden={!open}>
      <div className="portal__backdrop" onClick={close} />
      <div className="portal__card" role="dialog" aria-modal="true" aria-label="Portal">
        <button className="portal__close" aria-label="Close" type="button" onClick={close}>
          ×
        </button>
        <div className="portal__brand">
          <span className="monogram">PS</span>
        </div>
        <h3 className="portal__title">{signin ? "Welcome back" : "Create your account"}</h3>
        <p className="portal__sub">
          {signin
            ? "Sign in to access your tools, drafts, and saved work."
            : "Register to save drafts, sync tools, and track your work."}
        </p>
        <div className="portal__tabs">
          <button type="button" className={`portal__tab${signin ? " active" : ""}`} onClick={() => setMode("signin")}>
            Sign in
          </button>
          <button type="button" className={`portal__tab${!signin ? " active" : ""}`} onClick={() => setMode("register")}>
            Register
          </button>
        </div>
        <div className="portal__providers">
          <button className="oauth" type="button" onClick={() => oauth("Google")}>
            <GoogleIcon />
            <span>{(signin ? "Continue" : "Sign up") + " with Google"}</span>
          </button>
          <button className="oauth" type="button" onClick={() => oauth("GitHub")}>
            <GithubIcon />
            <span>{(signin ? "Continue" : "Sign up") + " with GitHub"}</span>
          </button>
        </div>
        <div className="portal__or">
          <span>or</span>
        </div>
        <form className="portal__form" onSubmit={submit}>
          <input
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn--primary btn--block">
            {signin ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="portal__status" role="status" aria-live="polite" style={{ color: status.color }}>
          {status.text}
        </p>
        <p className="portal__fine">
          Demo portal — connect your auth provider to enable real sign-in. We never post without permission.
        </p>
      </div>
    </div>
  );
}
