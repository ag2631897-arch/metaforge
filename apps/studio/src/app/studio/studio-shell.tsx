"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NotificationPanel } from "@/components/NotificationPanel";
import { LanguageSwitcher, useTranslations } from "@/components/LanguageSwitcher";



export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslations();

  const navItems = [
    {
      label: t("nav.apps", "Apps"),
      href: "/studio/apps",
      match: (path: string) => path.startsWith("/studio/apps"),
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      ),
    },
    {
      label: t("nav.build", "Build"),
      href: "/studio/new",
      match: (path: string) => path.startsWith("/studio/new"),
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    },
    {
      label: t("nav.templates", "Templates"),
      href: "/studio/templates",
      match: (path: string) => path.startsWith("/studio/templates"),
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
      ),
    },
    {
      label: t("nav.api", "API"),
      href: "/studio/api",
      match: (path: string) => path.startsWith("/studio/api"),
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    },
    {
      label: t("nav.docs", "Docs"),
      href: "/studio/docs",
      match: (path: string) => path.startsWith("/studio/docs"),
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
      <aside className="z-20 flex w-[260px] flex-col" style={{ backgroundColor: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)" }}>
        <div className="flex h-16 items-center px-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Link href="/studio/apps" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent-primary)", boxShadow: "0 0 16px var(--accent-glow)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--text-inverse)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>MetaForge</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-all duration-[180ms]"
                style={{
                  background: active ? "var(--accent-muted)" : "transparent",
                  color: active ? "var(--accent-primary)" : "var(--text-secondary)",
                  border: "none",
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth" })}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all duration-[180ms]"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-overlay)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-primary)", border: "1px solid rgba(0,201,167,0.2)" }}>
                N
              </div>
              <div>
                <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{t("Profile")}</div>
                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{t("Sign out")}</div>
              </div>
            </div>
            <svg className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 flex h-14 items-center justify-between px-6" style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
          <div className="max-w-xl flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t("Search apps, configs, workflows...")}
                className="w-full rounded-lg py-2 pl-10 pr-4 text-[13px] outline-none transition-all duration-[180ms]"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationPanel />
            <Link
              href="/studio/new"
              className="inline-flex items-center rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-[180ms]"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-inverse)",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {t("actions.create", "New App")}
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto p-6" style={{ backgroundColor: "var(--bg-base)" }}>{children}</div>
      </main>
    </div>
  );
}
