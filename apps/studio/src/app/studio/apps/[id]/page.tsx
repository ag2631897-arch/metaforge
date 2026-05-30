"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { GitHubExportModal } from "@/components/GitHubExportModal";
import { CSVImportModal } from "@/components/CSVImportModal";

interface AppData {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  liveUrl?: string | null;
  configVersion: number;
  configJson?: any;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string | null;
}

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    live: { bg: "rgba(52,211,153,0.1)", color: "var(--success)", border: "rgba(52,211,153,0.2)" },
    error: { bg: "rgba(248,113,113,0.1)", color: "var(--error)", border: "rgba(248,113,113,0.2)" },
    deploying: { bg: "rgba(251,191,36,0.1)", color: "var(--warning)", border: "rgba(251,191,36,0.2)" },
  };
  const c = colors[s] || { bg: "var(--bg-elevated)", color: "var(--text-secondary)", border: "var(--border-default)" };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[12px] font-medium capitalize"
      style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {s === "live" && <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: "var(--success)" }} />}
      {s === "deploying" && <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: "var(--warning)" }} />}
      {status}
    </span>
  );
}

export default function AppOverviewPage() {
  const params = useParams();
  const appId = params.id as string;
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(apiUrl(`/apps/${appId}`), { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setApp(json.data);
        } else {
          setError(json.error?.message || "Failed to load app");
        }
      } catch {
        setError("Failed to fetch app data");
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [appId]);

  async function downloadCode() {
    setDownloading(true);
    try {
      const res = await fetch(apiUrl(`/apps/${appId}/export/download`), {
        credentials: "include",
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${app?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "app"}-source.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Download failed
    } finally {
      setDownloading(false);
    }
  }

  const config = app?.configJson || {};
  const entities = Array.isArray(config.entities) ? config.entities : [];
  const pages = Array.isArray(config.pages) ? config.pages : [];
  const workflows = Array.isArray(config.workflows) ? config.workflows : [];
  const i18n = config.i18n;

  const cardStyle = { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" };
  const rowBorder = { borderBottom: "1px solid var(--border-subtle)" };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full" style={{ border: "3px solid var(--bg-overlay)", borderTopColor: "var(--accent-primary)" }} />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{error || "App not found"}</p>
          <Link href="/studio/apps" className="mt-4 text-[13px] transition-colors duration-[180ms]" style={{ color: "var(--accent-primary)" }}>
            ← Back to Apps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full rounded-xl overflow-hidden" style={{ ...cardStyle, boxShadow: "var(--shadow-lg)" }}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
          <div className="flex items-center gap-4">
            <Link href="/studio/apps" className="transition-colors duration-[180ms]" style={{ color: "var(--text-tertiary)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(0,201,167,0.15)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--accent-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{app.name}</h2>
            <StatusBadge status={app.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5" style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
          <nav className="flex gap-0">
            {[
              { label: "Overview", href: `/studio/apps/${appId}`, active: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { label: "Config", href: `/studio/apps/${appId}/config`, active: false, icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
              { label: "Preview", href: `/preview/${appId}`, active: false, icon: null },
              { label: "Data", href: `/studio/apps/${appId}/data`, active: false, icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" },
              { label: "Workflows", href: `/studio/apps/${appId}/workflows`, active: false, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { label: "Settings", href: `/studio/apps/${appId}/settings`, active: false, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className="py-3 px-4 text-[13px] font-medium flex items-center gap-2 transition-colors duration-[180ms]"
                style={{
                  color: tab.active ? "var(--accent-primary)" : "var(--text-tertiary)",
                  borderBottom: tab.active ? "2px solid var(--accent-primary)" : "2px solid transparent",
                }}
              >
                {tab.icon && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                )}
                {!tab.icon && <span className="text-[13px] font-bold">•</span>}
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: "var(--bg-base)" }}>
          <div className="max-w-6xl mx-auto space-y-5">

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { el: "link", href: `/preview/${appId}`, icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14", color: "var(--success)", label: "Open Live App", desc: "View your deployed app" },
                { el: "button", onClick: () => setShowGitHub(true), iconType: "github", color: "var(--text-secondary)", label: "Export to GitHub", desc: "Push code to repository" },
                { el: "button", onClick: downloadCode, disabled: downloading, icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", color: "#A78BFA", label: downloading ? "Downloading..." : "Download Code", desc: "Get source as ZIP" },
                { el: "button", onClick: () => setShowCSV(true), icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", color: "var(--info)", label: "CSV Import", desc: "Import data from CSV" },
                { el: "link", href: `/studio/apps/${appId}/config`, icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", color: "var(--accent-primary)", label: "Edit Config", desc: "Modify JSON configuration" },
              ].map((action, i) => {
                const inner = (
                  <>
                    {action.iconType === "github" ? (
                      <svg className="w-5 h-5 mb-2" style={{ color: action.color }} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-5 h-5 mb-2" style={{ color: action.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} /></svg>
                    )}
                    <div>
                      <h3 className="font-semibold text-[13px] transition-colors duration-[180ms]" style={{ color: "var(--text-primary)" }}>{action.label}</h3>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{action.desc}</p>
                    </div>
                  </>
                );
                const style = { ...cardStyle, padding: "16px", height: "96px", display: "flex", flexDirection: "column" as const, justifyContent: "space-between", cursor: "pointer", transition: "all 180ms ease" };
                if (action.el === "link") {
                  return <Link key={i} href={action.href!} className="rounded-xl group" style={style} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"; }}>{inner}</Link>;
                }
                return <button key={i} type="button" onClick={action.onClick} disabled={action.disabled} className="rounded-xl group text-left disabled:opacity-50" style={style} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"; }}>{inner}</button>;
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* App Details */}
              <div className="md:col-span-2 rounded-xl p-5" style={cardStyle}>
                <h3 className="text-[18px] font-bold mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>App Details</h3>
                <div className="space-y-0">
                  {[
                    ["Name", app.name],
                    ["Slug", <code key="slug" className="text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{app.slug}</code>],
                    ["Status", <StatusBadge key="status" status={app.status} />],
                    ["Config Version", `v${app.configVersion}`],
                    ["Entities", `${entities.length} models`],
                    ["Pages", `${pages.length} routes`],
                    ["Workflows", `${workflows.length} defined`],
                    ...(i18n ? [["Languages", `${i18n.supportedLocales?.length || 1} locales`]] : []),
                    ["Created", formatDate(app.createdAt)],
                    ["Last Deployed", formatDate(app.deployedAt)],
                  ].map(([label, value], idx, arr) => (
                    <div key={label as string} className="flex justify-between items-center py-3" style={idx < arr.length - 1 ? rowBorder : undefined}>
                      <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Entity Summary */}
                <div className="rounded-xl p-5" style={cardStyle}>
                  <h3 className="text-[18px] font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Entities</h3>
                  {entities.length === 0 ? (
                    <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No entities defined yet</p>
                  ) : (
                    <div className="space-y-2">
                      {entities.map((e: any) => (
                        <div key={e.name} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                          <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{e.name}</span>
                          <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>{e.fields?.length || 0} fields</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Workflow Summary */}
                <div className="rounded-xl p-5" style={cardStyle}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Workflows</h3>
                    <Link href={`/studio/apps/${appId}/workflows`} className="text-[11px] font-semibold" style={{ color: "var(--accent-primary)" }}>
                      View All →
                    </Link>
                  </div>
                  {workflows.length === 0 ? (
                    <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No workflows defined yet</p>
                  ) : (
                    <div className="space-y-2">
                      {workflows.slice(0, 3).map((w: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" style={{ color: "var(--info)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{w.name}</span>
                          </div>
                          <span className="text-[11px] font-semibold" style={{ color: w.enabled ? "var(--success)" : "var(--text-tertiary)" }}>
                            {w.enabled ? "Active" : "Disabled"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* i18n Summary */}
                {i18n && (
                  <div className="rounded-xl p-5" style={cardStyle}>
                    <h3 className="text-[18px] font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {(i18n.supportedLocales || ["en"]).map((locale: string) => (
                        <span
                          key={locale}
                          className="rounded-md px-2 py-1 text-[12px] font-semibold"
                          style={{
                            backgroundColor: locale === i18n.defaultLocale ? "var(--accent-muted)" : "var(--bg-elevated)",
                            color: locale === i18n.defaultLocale ? "var(--accent-primary)" : "var(--text-secondary)",
                            border: `1px solid ${locale === i18n.defaultLocale ? "rgba(0,201,167,0.15)" : "var(--border-default)"}`,
                          }}
                        >
                          {locale.toUpperCase()}
                          {locale === i18n.defaultLocale && " (default)"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGitHub && (
        <GitHubExportModal
          appId={appId}
          appName={app.name}
          onClose={() => setShowGitHub(false)}
        />
      )}
      {showCSV && (
        <CSVImportModal
          appId={appId}
          appName={app.name}
          entities={entities}
          onClose={() => setShowCSV(false)}
        />
      )}
    </>
  );
}
