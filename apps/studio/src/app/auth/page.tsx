"use client";

import React, { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

type Mode = "signin" | "register";

const passwordChecks = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "Contains a letter", test: (value: string) => /[A-Za-z]/.test(value) },
  { label: "Contains a number", test: (value: string) => /\d/.test(value) },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [callbackUrl, setCallbackUrl] = useState("/studio/apps");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/studio/apps");
  }, []);

  const passedChecks = useMemo(
    () => passwordChecks.filter((check) => check.test(password)).length,
    [password],
  );
  const passwordReady = passedChecks === passwordChecks.length;
  const passwordsMatch = mode === "signin" || password === confirmPassword;

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (!passwordReady) {
        setError("Password must be at least 8 characters and include a letter and number.");
        return;
      }
      if (!passwordsMatch) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const registerRes = await fetch(apiUrl("/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const registerJson = await registerRes.json();
        if (!registerRes.ok || !registerJson.success) {
          throw new Error(registerJson.error?.message || "Could not create your account.");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(mode === "register" ? "Account created, but sign in failed." : "Invalid email or password.");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="hidden px-12 py-10 lg:flex lg:flex-col lg:justify-between" style={{ backgroundColor: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent-primary)", boxShadow: "0 0 16px var(--accent-glow)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--text-inverse)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
              </svg>
            </div>
            <span className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>MetaForge</span>
          </div>

          <div className="max-w-2xl">
            <div
              className="mb-5 inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-semibold"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-primary)", border: "1px solid rgba(0,201,167,0.15)" }}
            >
              Developer Studio Access
            </div>
            <h1 className="text-[48px] font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: "1.1" }}>
              Build serious applications from metadata, workflows, and AI.
            </h1>
            <p className="mt-5 max-w-xl text-[18px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
              Sign in to manage apps, ship generated APIs, edit workflows visually, and deploy no-code UI patterns from one focused workspace.
            </p>
          </div>

          <div className="grid max-w-3xl grid-cols-3 gap-3">
            {["Schema", "Workflows", "Deployment"].map((item) => (
              <div key={item} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{item}</div>
                <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: "var(--bg-overlay)" }}>
                  <div className="h-1 rounded-full" style={{ backgroundColor: "var(--accent-primary)", width: item === "Schema" ? "88%" : item === "Workflows" ? "72%" : "94%" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent-primary)" }}>
                  <svg className="h-5 w-5" style={{ color: "var(--text-inverse)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
                  </svg>
                </div>
                <span className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>MetaForge</span>
              </div>
              <h1 className="text-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Developer Studio</h1>
            </div>

            <div className="rounded-xl p-1.5" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-md)" }}>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-[180ms]"
                  style={{
                    backgroundColor: mode === "signin" ? "var(--accent-primary)" : "transparent",
                    color: mode === "signin" ? "var(--text-inverse)" : "var(--text-secondary)",
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-[180ms]"
                  style={{
                    backgroundColor: mode === "register" ? "var(--accent-primary)" : "transparent",
                    color: mode === "register" ? "var(--text-inverse)" : "var(--text-secondary)",
                  }}
                >
                  Create account
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-lg)" }}>
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl })}
                className="mb-3 flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-semibold transition-all duration-[180ms]"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-overlay)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }}
              >
                <span className="text-[14px]">Continue with GitHub</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: "#333" }}>
                  <svg className="h-5 w-5 fill-current" style={{ color: "var(--text-inverse)" }} viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </span>
              </button>

              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-semibold transition-all duration-[180ms]"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-overlay)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }}
              >
                <span className="text-[14px]">Continue with Google</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-md font-bold" style={{ backgroundColor: "white", color: "var(--text-inverse)" }}>G</span>
              </button>

              <div className="my-6 flex items-center gap-3 text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                <div className="h-px flex-1" style={{ backgroundColor: "var(--border-default)" }} />
                Email
                <div className="h-px flex-1" style={{ backgroundColor: "var(--border-default)" }} />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label htmlFor="name" className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      Name
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full outline-none transition-all duration-[180ms]"
                      style={inputStyle}
                      placeholder="Your name"
                      autoComplete="name"
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full outline-none transition-all duration-[180ms]"
                    style={inputStyle}
                    placeholder="developer@metaforge.app"
                    autoComplete="email"
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full outline-none transition-all duration-[180ms]"
                    style={inputStyle}
                    placeholder="At least 8 characters"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                  />
                </div>

                {mode === "register" && (
                  <>
                    <div>
                      <label htmlFor="confirm-password" className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        Confirm password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full outline-none transition-all duration-[180ms]"
                        style={inputStyle}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
                        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                      />
                    </div>

                    <div className="rounded-lg p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                      <div className="mb-3 flex gap-1">
                        {passwordChecks.map((check) => (
                          <div
                            key={check.label}
                            className="h-1 flex-1 rounded-full transition-colors duration-[180ms]"
                            style={{ backgroundColor: check.test(password) ? "var(--success)" : "var(--bg-overlay)" }}
                          />
                        ))}
                      </div>
                      <div className="grid gap-1.5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {passwordChecks.map((check) => (
                          <div key={check.label} style={{ color: check.test(password) ? "var(--success)" : undefined }}>
                            {check.test(password) ? "Pass" : "Need"}: {check.label}
                          </div>
                        ))}
                        <div style={{ color: passwordsMatch ? "var(--success)" : undefined }}>
                          {passwordsMatch ? "Pass" : "Need"}: passwords match
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="rounded-lg px-4 py-3 text-[13px]" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--error)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg px-4 py-3 text-[14px] font-semibold transition-all duration-[180ms] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: isSubmitting ? "var(--bg-overlay)" : "var(--accent-primary)",
                    color: isSubmitting ? "var(--text-tertiary)" : "var(--text-inverse)",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)"; } }}
                  onMouseLeave={(e) => { if (!isSubmitting) { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; } }}
                >
                  {isSubmitting ? "Working..." : mode === "register" ? "Create account and enter Studio" : "Sign in to Studio"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
