"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
}

const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  hi: "🇮🇳",
  ja: "🇯🇵",
  zh: "🇨🇳",
  ar: "🇸🇦",
};

// Simple i18n context stored in localStorage
function getStoredLocale(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("mf-locale") || "en";
}

function setStoredLocale(locale: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mf-locale", locale);
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("mf-locale-change", { detail: locale }));
  }
}

export function useLocale() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    function onLocaleChange(e: Event) {
      setLocale((e as CustomEvent).detail);
    }
    window.addEventListener("mf-locale-change", onLocaleChange);
    return () => window.removeEventListener("mf-locale-change", onLocaleChange);
  }, []);

  return locale;
}

const I18nContext = React.createContext<{
  locale: string;
  t: (key: string, fallback?: string) => string;
  messages: Record<string, string>;
}>({
  locale: "en",
  t: (key, fallback) => fallback || key,
  messages: {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(apiUrl(`/i18n/messages/${locale}`), { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMessages(json.data.messages || {});
      })
      .catch(() => {});
  }, [locale]);

  const t = useCallback(
    (key: string, fallback?: string) => messages[key] || fallback || key,
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, t, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  return React.useContext(I18nContext);
}

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [locales, setLocales] = useState<LocaleInfo[]>([]);
  const [current, setCurrent] = useState(getStoredLocale());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(apiUrl("/i18n/locales"), { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLocales(json.data.locales || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function selectLocale(code: string) {
    setCurrent(code);
    setStoredLocale(code);
    setOpen(false);
  }

  const currentLocale = locales.find((l) => l.code === current);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        id="language-switcher"
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-all duration-[180ms]"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          color: "var(--text-secondary)"
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
      >
        <span className="text-[14px]">{FLAGS[current] || "🌐"}</span>
        <span className="hidden sm:inline">{currentLocale?.name || current.toUpperCase()}</span>
        <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-lg)",
            animation: "mf-modal-in 200ms ease-out",
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <p className="text-[11px] font-semibold uppercase" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Language</p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {locales.map((locale) => (
              <button
                key={locale.code}
                type="button"
                onClick={() => selectLocale(locale.code)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-all duration-[180ms]"
                style={{
                  backgroundColor: current === locale.code ? "var(--bg-overlay)" : "transparent",
                  color: current === locale.code ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => { if (current !== locale.code) { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
                onMouseLeave={(e) => { if (current !== locale.code) { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
              >
                <span className="text-[16px]">{FLAGS[locale.code] || "🌐"}</span>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: current === locale.code ? "var(--accent-primary)" : "var(--text-primary)" }}>{locale.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{locale.nativeName}</div>
                </div>
                {current === locale.code && (
                  <svg className="h-4 w-4" style={{ color: "var(--accent-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
