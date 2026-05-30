"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  appId?: string | null;
  metadata?: any;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeIcon(type: string) {
  switch (type) {
    case "deploy_success":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      );
    case "deploy_failed":
    case "github_export_failed":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      );
    case "app_created":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      );
    case "github_export_success":
    case "github_export_ready":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      );
    case "csv_import":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      );
    case "workflow_triggered":
    case "workflow":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      );
    default:
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      );
  }
}

function typeColor(type: string): { color: string; bg: string; border: string } {
  switch (type) {
    case "deploy_success":
    case "github_export_success":
      return { color: "var(--success)", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
    case "deploy_failed":
    case "github_export_failed":
      return { color: "var(--error)", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" };
    case "app_created":
      return { color: "var(--accent-primary)", bg: "var(--accent-muted)", border: "rgba(0,201,167,0.2)" };
    case "workflow_triggered":
    case "workflow":
      return { color: "var(--warning)", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" };
    case "csv_import":
    case "csv_export":
      return { color: "var(--info)", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" };
    default:
      return { color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" };
  }
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/notifications?limit=30"), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data || []);
        setUnread(json.meta?.unread || 0);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listen for real-time notifications via Socket.io
  useEffect(() => {
    let socket: any = null;
    async function connectSocket() {
      try {
        const { io } = await import("socket.io-client");
        socket = io("http://localhost:3001", {
          withCredentials: true,
          transports: ["websocket", "polling"],
        });
        socket.on("connect", () => {
          // Join user room to receive personal notifications
          socket.emit("join-user", "current-user");
        });
        socket.on("notification", (notification: Notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnread((prev) => prev + 1);
        });
      } catch {
        // Socket.io not available
      }
    }
    connectSocket();
    return () => {
      socket?.disconnect();
    };
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markAllRead() {
    try {
      await fetch(apiUrl("/notifications/read-all"), {
        method: "PUT",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnread(0);
    } catch {
      // Silently fail
    }
  }

  async function markRead(id: string) {
    try {
      await fetch(apiUrl(`/notifications/${id}/read`), {
        method: "PUT",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch(apiUrl(`/notifications/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const notif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif && !notif.read) {
        setUnread((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell"
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-[180ms]"
        style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
      >
        <svg
          className="h-[18px] w-[18px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
            style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverse)", boxShadow: "0 0 8px var(--accent-glow)" }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-[400px] overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-lg)",
            animation: "mf-modal-in 200ms ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Notifications</h3>
              {unread > 0 && (
                <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-primary)" }}>
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-md px-2 py-1 text-[11px] font-semibold transition-all duration-[180ms]"
                  style={{ color: "var(--accent-primary)" }}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 transition-all duration-[180ms]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12" style={{ color: "var(--text-tertiary)" }}>
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-14 text-center">
                <svg className="mx-auto mb-3 h-10 w-10" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>No notifications yet</p>
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  You&apos;ll see app events, deploys, and workflow results here
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const tc = typeColor(n.type);
                return (
                  <div
                    key={n.id}
                    className="group flex items-start gap-3 px-5 py-3.5 transition-all duration-[180ms]"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      backgroundColor: !n.read ? "rgba(0,201,167,0.03)" : "transparent",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-overlay)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = !n.read ? "rgba(0,201,167,0.03)" : "transparent"; }}
                  >
                    {/* Icon */}
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {typeIcon(n.type)}
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-[13px] font-semibold leading-tight"
                          style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}
                        >
                          {!n.read && (
                            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
                          )}
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      {n.message && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                          {n.message}
                        </p>
                      )}
                      {/* Email status badge */}
                      {(n.metadata as any)?.email?.sent && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "var(--success)" }}>
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Email sent
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100">
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          title="Mark as read"
                          className="rounded p-1 transition-all duration-[180ms]"
                          style={{ color: "var(--text-tertiary)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-muted)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(n.id)}
                        title="Delete"
                        className="rounded p-1 transition-all duration-[180ms]"
                        style={{ color: "var(--text-tertiary)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--error)"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(248,113,113,0.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-2.5 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
