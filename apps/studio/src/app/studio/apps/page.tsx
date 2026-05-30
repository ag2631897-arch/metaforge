"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { useTranslations } from "@/components/LanguageSwitcher";

interface AppRecord {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  liveUrl?: string | null;
  configVersion: number;
  configJson?: any;
  updatedAt: string;
  deployedAt?: string | null;
}

interface DashboardStats {
  totalApps: number;
  liveApps: number;
  draftApps: number;
  deployingApps: number;
  requestsToday: number;
  storageUsedBytes: number;
  storageUsedLabel: string;
}

const themes = [
  { accent: "var(--accent-primary)", muted: "var(--accent-muted)", bar: "linear-gradient(90deg, #00C9A7, #00E5BF)" },
  { accent: "#34D399", muted: "rgba(52,211,153,0.12)", bar: "linear-gradient(90deg, #34D399, #6EE7B7)" },
  { accent: "#A78BFA", muted: "rgba(167,139,250,0.12)", bar: "linear-gradient(90deg, #A78BFA, #C4B5FD)" },
  { accent: "#FBBF24", muted: "rgba(251,191,36,0.12)", bar: "linear-gradient(90deg, #FBBF24, #FCD34D)" },
  { accent: "#60A5FA", muted: "rgba(96,165,250,0.12)", bar: "linear-gradient(90deg, #60A5FA, #93C5FD)" },
];

function getHash(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getConfigStats(app: AppRecord) {
  const config = app.configJson || {};
  return {
    entities: Array.isArray(config.entities) ? config.entities.length : 0,
    pages: Array.isArray(config.pages) ? config.pages.length : 0,
    workflows: Array.isArray(config.workflows) ? config.workflows.length : 0,
    components: Array.isArray(config.pages)
      ? config.pages.reduce((sum: number, page: any) => sum + (Array.isArray(page.components) ? page.components.length : 0), 0)
      : 0,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Not deployed";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    live: { bg: "rgba(52,211,153,0.1)", color: "var(--success)", border: "rgba(52,211,153,0.2)" },
    error: { bg: "rgba(248,113,113,0.1)", color: "var(--error)", border: "rgba(248,113,113,0.2)" },
    deploying: { bg: "rgba(251,191,36,0.1)", color: "var(--warning)", border: "rgba(251,191,36,0.2)" },
  };
  const s = styles[normalized] || { bg: "var(--bg-elevated)", color: "var(--text-secondary)", border: "var(--border-default)" };

  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium capitalize"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  );
}

function AppGlyph({ index }: { index: number }) {
  const paths = [
    "M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 9h8M8 13h5",
    "M4 7h16M7 4v16M17 4v16M4 17h16",
    "M12 4v16m8-8H4",
    "M7 7h10v10H7zM3 3h18v18H3z",
    "M13 10V3L4 14h7v7l9-11h-7z",
  ];

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={paths[index % paths.length]} />
    </svg>
  );
}

export default function AppsDashboard() {
  const { t } = useTranslations();
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function fetchDashboard() {
    setError(null);
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch(apiUrl("/apps"), { credentials: "include" }),
        fetch(apiUrl("/apps/stats"), { credentials: "include" }),
      ]);

      const [appsJson, statsJson] = await Promise.all([appsRes.json(), statsRes.json()]);
      if (!appsRes.ok || !appsJson.success) throw new Error(appsJson.error?.message || "Failed to fetch apps.");
      if (!statsRes.ok || !statsJson.success) throw new Error(statsJson.error?.message || "Failed to fetch dashboard stats.");

      setApps(appsJson.data || []);
      setStats(statsJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load apps.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return apps;
    return apps.filter((app) =>
      [app.name, app.description || "", app.slug, app.status].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [apps, query]);

  async function deleteApp(appId: string) {
    if (!window.confirm("Delete this app? This removes the Studio record and saved config.")) return;

    const res = await fetch(apiUrl(`/apps/${appId}`), {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setError(json.error?.message || "Failed to delete app.");
      return;
    }
    await fetchDashboard();
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div
            className="mb-3 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.08em", backgroundColor: "var(--accent-muted)", color: "var(--accent-primary)", border: "1px solid rgba(0,201,167,0.15)" }}
          >
            {t("dashboard.workspace", "Application Workspace")}
          </div>
          <h1 className="text-[36px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: "1.2", letterSpacing: "-0.02em" }}>{t("dashboard.title", "Your Apps")}</h1>
          <p className="mt-2 max-w-2xl text-[15px]" style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
            {t("dashboard.subtitle", "Manage generated apps, configs, workflow automation, and deploy status from one place.")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("dashboard.filter", "Filter apps...")}
              className="h-10 w-full rounded-lg pl-10 pr-4 text-[13px] outline-none transition-all duration-[180ms] sm:w-64"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
            />
          </div>
          <Link
            href="/studio/new"
            className="inline-flex h-10 items-center justify-center rounded-lg px-5 text-[13px] font-semibold transition-all duration-[180ms]"
            style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverse)", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t("actions.create", "New App")}
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg px-4 py-3 text-[13px]" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--error)" }}>
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: t("dashboard.totalApps", "Total Apps"), value: loading ? "--" : stats?.totalApps ?? apps.length, caption: `${stats?.liveApps ?? 0} ${t("dashboard.live", "live")}` },
          { label: t("dashboard.requests", "Requests Today"), value: loading ? "--" : (stats?.requestsToday ?? 0).toLocaleString(), caption: t("dashboard.activity", "Deploy and workflow activity") },
          { label: t("dashboard.storage", "Storage Used"), value: loading ? "--" : stats?.storageUsedLabel ?? "0 B", caption: t("dashboard.storageCaption", "Saved configs and deploy logs") },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }} />
            </div>
            <div className="text-[32px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: "1.2" }}>{item.value}</div>
            <p className="mt-1.5 text-[11px] font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.01em" }}>{item.caption}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="mf-skeleton h-72 rounded-xl" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px dashed var(--border-default)", backgroundColor: "var(--bg-surface)" }}>
          <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{apps.length === 0 ? t("dashboard.noApps", "No apps yet") : t("dashboard.noMatch", "No matching apps")}</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px]" style={{ color: "var(--text-secondary)" }}>
            {apps.length === 0
              ? t("dashboard.noAppsDesc", "Create your first app with AI, prebuilt UI patterns, or your own custom no-code features.")
              : t("dashboard.noMatchDesc", "Adjust the search filter to find another app.")}
          </p>
          <Link
            href="/studio/new"
            className="mt-6 inline-flex items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold transition-all duration-[180ms]"
            style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverse)" }}
          >
            {t("actions.create", "Create App")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredApps.map((app) => {
            const index = getHash(app.slug || app.id);
            const theme = themes[index % themes.length];
            const appStats = getConfigStats(app);

            return (
              <article
                key={app.id}
                className="group overflow-hidden rounded-xl transition-all duration-[180ms]"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}
              >
                <div className="h-1" style={{ background: theme.bar }} />
                <div className="p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: theme.muted, color: theme.accent, border: `1px solid ${theme.accent}20` }}
                    >
                      <AppGlyph index={index} />
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <Link href={`/studio/apps/${app.id}`} className="block">
                    <h3
                      className="line-clamp-1 text-[18px] font-bold transition-colors duration-[180ms] group-hover:opacity-80"
                      style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                    >{app.name}</h3>
                    <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-[1.5]" style={{ color: "var(--text-secondary)" }}>
                      {app.description || t("app.noDesc", "No description yet. Add app context in the config editor.")}
                    </p>
                  </Link>

                  <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                    {[
                      [t("app.entities", "Entities"), appStats.entities],
                      [t("app.pages", "Pages"), appStats.pages],
                      [t("app.ui", "UI"), appStats.components],
                      [t("app.flows", "Flows"), appStats.workflows],
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-lg px-2 py-2.5" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                        <div className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>{value as number}</div>
                        <div className="mt-0.5 text-[10px] font-semibold uppercase" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>{label as string}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <span>v{app.configVersion}</span>
                    <span>{app.deployedAt ? `${t("app.deployed", "Deployed")} ${formatDate(app.deployedAt)}` : t("app.notDeployed", "Not deployed")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-elevated)" }}>
                  <div className="flex gap-4">
                    <Link href={`/studio/apps/${app.id}`} className="text-[13px] font-semibold transition-colors duration-[180ms]" style={{ color: "var(--accent-primary)" }}>
                      {t("app.overview", "Overview")}
                    </Link>
                    <Link href={`/studio/apps/${app.id}/workflows`} className="text-[13px] font-semibold transition-colors duration-[180ms]" style={{ color: "var(--info)" }}>
                      {t("app.workflow", "Workflow")}
                    </Link>
                    <Link href={`/preview/${app.id}`} className="text-[13px] font-semibold transition-colors duration-[180ms]" style={{ color: "var(--success)" }}>
                      {t("app.preview", "Preview")}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteApp(app.id)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold transition-all duration-[180ms]"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--error)"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(248,113,113,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    {t("actions.delete", "Delete")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
