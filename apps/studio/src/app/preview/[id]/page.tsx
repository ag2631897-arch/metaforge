"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { normalizeVisualDesign, type VisualDesign } from "@/lib/visual-design";

type EntityField = {
  name: string;
  type?: string;
  required?: boolean;
  enumValues?: string[];
};

type EntitySchema = {
  name: string;
  label?: string;
  fields: EntityField[];
};

type PageComponent = {
  type: string;
  label?: string;
  description?: string;
  variant?: string;
  dataSource?: { entity?: string };
  moduleId?: string;
  capabilities?: string[];
  runtimeSpec?: GeneratedRuntimeSpec;
  behavior?: {
    stateful?: boolean;
    actions?: string[];
  };
};

type GeneratedRuntimeSpec = {
  kind?: "randomizer" | "calculator" | "tracker" | "builder" | "game" | "simulator" | "formWorkflow" | "custom";
  primaryVisual?: "coin" | "dice" | "wheel" | "card" | "meter" | "board" | "canvas" | "none";
  state?: Record<string, unknown>;
  outcomes?: Array<{ id: string; label: string; value?: string; color?: string }>;
  controls?: Array<{ id: string; label: string; action: string }>;
  metrics?: Array<{ id: string; label: string; source: string }>;
};

type GeneratedState = {
  result?: string;
  history: Array<{ id: number; result: string; createdAt: string }>;
  nonce: number;
};

type WatchFace = {
  id: string;
  name: string;
  accent: string;
  secondary: string;
  face: string;
  ring: string;
  marker: "roman" | "arabic" | "minimal" | "dash";
};

const fallbackConfig = {
  app: { name: "Operations Console", description: "A responsive command center for teams, work, and decisions." },
  entities: [
    {
      name: "tasks",
      label: "Task",
      fields: [
        { name: "title", type: "string", required: true },
        { name: "status", type: "enum", enumValues: ["Backlog", "Active", "Review", "Done"] },
        { name: "owner", type: "string" },
        { name: "priority", type: "enum", enumValues: ["Low", "Medium", "High"] },
      ],
    },
  ],
  pages: [
    {
      name: "Command",
      path: "/",
      components: [
        { type: "stat", label: "Live Metrics", dataSource: { entity: "tasks" } },
        { type: "kanban", label: "Workstream", dataSource: { entity: "tasks" } },
        { type: "chart", label: "Velocity", dataSource: { entity: "tasks" } },
      ],
    },
  ],
  workflows: [],
};

const runtimeModuleTypes = new Set([
  "analogClock",
  "digitalClock",
  "watchFacePicker",
  "stopwatch",
  "timer",
  "alarmManager",
  "worldClock",
  "productCatalog",
  "cart",
  "checkout",
  "orderTracker",
  "appointmentBooking",
  "availabilityPlanner",
  "contactTimeline",
  "emailComposer",
  "inventoryManager",
  "ticketInbox",
  "roleManager",
  "settingsPanel",
  "domainModule",
  "generatedModule",
]);

const watchFaces: WatchFace[] = [
  { id: "classic", name: "Classic", accent: "#f8fafc", secondary: "#38bdf8", face: "rgba(15,23,42,0.72)", ring: "rgba(255,255,255,0.22)", marker: "roman" },
  { id: "neon", name: "Neon", accent: "#22d3ee", secondary: "#f472b6", face: "rgba(8,12,28,0.84)", ring: "rgba(34,211,238,0.45)", marker: "dash" },
  { id: "solar", name: "Solar", accent: "#facc15", secondary: "#fb923c", face: "rgba(43,28,8,0.76)", ring: "rgba(250,204,21,0.4)", marker: "arabic" },
  { id: "mint", name: "Mint", accent: "#5eead4", secondary: "#a7f3d0", face: "rgba(5,39,38,0.76)", ring: "rgba(94,234,212,0.42)", marker: "minimal" },
  { id: "mono", name: "Mono", accent: "#ffffff", secondary: "#94a3b8", face: "rgba(255,255,255,0.08)", ring: "rgba(255,255,255,0.34)", marker: "dash" },
];

const worldClockCities = [
  { city: "New York", timeZone: "America/New_York" },
  { city: "London", timeZone: "Europe/London" },
  { city: "Dubai", timeZone: "Asia/Dubai" },
  { city: "Tokyo", timeZone: "Asia/Tokyo" },
];

const bookingSlots = ["09:00", "10:30", "12:00", "14:30", "16:00"];

function getEntitySchema(config: any, entityName?: string): EntitySchema {
  const fallback = config.entities?.[0] || fallbackConfig.entities[0];
  return config.entities?.find((entity: EntitySchema) => entity.name === entityName) || fallback;
}

function getPrimaryEntityName(config: any) {
  return config.entities?.[0]?.name || "items";
}

function fieldValue(field: EntityField, index: number, entityName: string) {
  const name = field.name.toLowerCase();
  if (field.enumValues?.length) return field.enumValues[index % field.enumValues.length];
  if (field.type === "boolean") return index % 2 === 0;
  if (name === "time") return ["06:30", "07:45", "12:00", "17:30", "21:15"][index % 5];
  if (name.includes("duration")) return (index + 1) * 900;
  if (name.includes("remaining")) return (index + 1) * 600;
  if (name.includes("quantity")) return index + 1;
  if (name.includes("stock")) return 8 + index * 7;
  if (name.includes("price") || name.includes("total") || name.includes("amount") || name.includes("unitprice") || field.type === "number") return (index + 1) * 1250;
  if (name.includes("status")) return ["Backlog", "Active", "Review", "Done"][index % 4];
  if (name.includes("priority")) return ["Low", "Medium", "High"][index % 3];
  if (name.includes("email")) return `user${index + 1}@${entityName}.app`;
  if (name.includes("date") || field.type === "date") return `2026-06-${String(index + 2).padStart(2, "0")}`;
  if (name.includes("owner")) return ["Avery", "Mina", "Rowan", "Kai"][index % 4];
  if (name.includes("label")) return ["Morning focus", "Team sync", "Deep work", "Evening wrap"][index % 4];
  if (name.includes("repeat")) return ["Weekdays", "Daily", "Once", "Weekends"][index % 4];
  if (name.includes("sku")) return `SKU-${String(index + 1001).padStart(4, "0")}`;
  if (name.includes("category")) return ["Core", "Premium", "Service", "Digital"][index % 4];
  if (name.includes("customer")) return ["Avery Stone", "Mina Patel", "Rowan Lee", "Kai Brooks"][index % 4];
  if (name.includes("title") || name.includes("name")) return `${entityName.replace(/_/g, " ")} ${index + 1}`;
  return `${field.name} ${index + 1}`;
}

function buildInitialData(config: any) {
  const entities: EntitySchema[] = Array.isArray(config.entities) && config.entities.length > 0 ? config.entities : fallbackConfig.entities;

  return entities.reduce<Record<string, any[]>>((acc, entity: EntitySchema) => {
    acc[entity.name] = Array.from({ length: 5 }).map((_, index) => {
      const record: Record<string, any> = { id: Date.now() + index };
      entity.fields.forEach((field) => {
        record[field.name as keyof typeof record] = fieldValue(field, index, entity.name);
      });
      return record;
    });
    return acc;
  }, {});
}

function visualVars(visual: VisualDesign) {
  return {
    "--mf-bg": visual.palette.background,
    "--mf-surface": visual.palette.surface,
    "--mf-surface-strong": visual.palette.surfaceStrong,
    "--mf-text": visual.palette.text,
    "--mf-muted": visual.palette.muted,
    "--mf-primary": visual.palette.primary,
    "--mf-secondary": visual.palette.secondary,
    "--mf-accent": visual.palette.accent,
    "--mf-glow": visual.palette.glow,
    "--mf-radius": `${visual.radius}px`,
    "--mf-glass": String(visual.glass),
    "--mf-heading": visual.typography.heading,
    "--mf-body": visual.typography.body,
  } as React.CSSProperties;
}

function surfaceClass(visual: VisualDesign, type?: string) {
  const skin = visual.componentSkins[type || ""] || "glass";
  if (skin === "filled") return "border border-white/10 bg-[var(--mf-surface-strong)] shadow-2xl shadow-black/25";
  if (skin === "outline") return "border border-white/20 bg-transparent shadow-xl shadow-black/10";
  if (skin === "split") return "border border-white/10 bg-gradient-to-br from-white/15 to-white/5 shadow-2xl shadow-black/20";
  if (skin === "stacked") return "border border-white/10 bg-[var(--mf-surface)] shadow-[12px_12px_0_rgba(255,255,255,0.08)]";
  return "border border-white/[0.14] bg-[var(--mf-surface)] shadow-2xl shadow-black/20 backdrop-blur-2xl";
}

function componentTitle(component: PageComponent, entityName: string) {
  return component.label || `${entityName.replace(/_/g, " ")} ${component.type}`;
}

function getStatusColumns(schema: EntitySchema) {
  const statusField = schema.fields.find((field) => field.name.toLowerCase().includes("status"));
  return statusField?.enumValues?.length ? statusField.enumValues : ["Backlog", "Active", "Review", "Done"];
}

function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatDuration(ms: number) {
  const safeMs = Math.max(0, ms);
  const minutes = Math.floor(safeMs / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const centiseconds = Math.floor((safeMs % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function currency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function clockAngles(now: Date) {
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  return {
    hour: hours * 30,
    minute: minutes * 6,
    second: seconds * 6,
  };
}

function generatedKey(component: PageComponent) {
  return component.moduleId || component.label || component.type;
}

function defaultRuntimeSpec(component: PageComponent): GeneratedRuntimeSpec {
  const label = `${component.label || ""} ${component.description || ""}`.toLowerCase();
  if (label.includes("coin") && (label.includes("toss") || label.includes("flip") || label.includes("heads") || label.includes("tails"))) {
    return {
      kind: "randomizer",
      primaryVisual: "coin",
      outcomes: [
        { id: "heads", label: "Heads", value: "Heads", color: "#f8d66d" },
        { id: "tails", label: "Tails", value: "Tails", color: "#8bd3ff" },
      ],
      controls: [
        { id: "flip", label: "Flip Coin", action: "randomize" },
        { id: "reset", label: "Reset History", action: "reset" },
      ],
      metrics: [
        { id: "total", label: "Total Flips", source: "history.length" },
        { id: "heads", label: "Heads", source: "history.heads" },
        { id: "tails", label: "Tails", source: "history.tails" },
      ],
    };
  }

  return {
    kind: "custom",
    primaryVisual: "card",
    controls: [
      { id: "run", label: "Run", action: "append" },
      { id: "reset", label: "Reset", action: "reset" },
    ],
    metrics: [{ id: "runs", label: "Runs", source: "history.length" }],
  };
}

function generatedMetricValue(metric: { source: string }, state: GeneratedState) {
  if (metric.source === "history.length") return state.history.length;
  if (metric.source === "history.heads") return state.history.filter((item) => item.result.toLowerCase() === "heads").length;
  if (metric.source === "history.tails") return state.history.filter((item) => item.result.toLowerCase() === "tails").length;
  if (metric.source === "history.last") return state.history[0]?.result || "None";
  return state.history.length;
}

export default function AppPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const appId = resolvedParams.id;

  const [config, setConfig] = useState<any>(null);
  const [activePage, setActivePage] = useState("");
  const [dataStore, setDataStore] = useState<Record<string, any[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEntityForModal, setActiveEntityForModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [assistantDraft, setAssistantDraft] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [files, setFiles] = useState<string[]>(["Brand kit.pdf", "Launch notes.md"]);
  const [now, setNow] = useState(() => new Date());
  const [selectedFace, setSelectedFace] = useState(watchFaces[0].id);
  const [stopwatchBaseMs, setStopwatchBaseMs] = useState(0);
  const [stopwatchStartedAt, setStopwatchStartedAt] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [alarmDraft, setAlarmDraft] = useState({ time: "07:30", label: "Morning focus", repeatDays: "Weekdays" });
  const [checkoutDraft, setCheckoutDraft] = useState({ customer: "", email: "", address: "" });
  const [selectedSlot, setSelectedSlot] = useState(bookingSlots[0]);
  const [bookingDraft, setBookingDraft] = useState({ customer: "", service: "Consultation" });
  const [noteDraft, setNoteDraft] = useState("");
  const [timelineNotes, setTimelineNotes] = useState<string[]>(["Initial discovery call completed.", "Proposal follow-up scheduled."]);
  const [emailDraft, setEmailDraft] = useState({ recipient: "", subject: "", body: "" });
  const [domainActionLog, setDomainActionLog] = useState<Record<string, string[]>>({});
  const [generatedStates, setGeneratedStates] = useState<Record<string, GeneratedState>>({});
  const [settings, setSettings] = useState<Record<string, boolean>>({
    notifications: true,
    analytics: true,
    approvals: false,
    publicSharing: false,
  });

  useEffect(() => {
    const loadPreviewConfig = async () => {
      let loadedConfig = null;

      try {
        const res = await fetch(apiUrl(`/apps/${appId}/config`), { credentials: "include" });
        const json = await res.json();
        if (json.success && json.data?.config) loadedConfig = json.data.config;
      } catch (error) {
        console.error(error);
      }

      if (!loadedConfig) {
        const stored = localStorage.getItem("metaforge-generated-config");
        if (stored) {
          try {
            loadedConfig = JSON.parse(stored);
          } catch (error) {
            console.error(error);
          }
        }
      }

      const nextConfig = loadedConfig || fallbackConfig;
      setConfig(nextConfig);
      setActivePage(nextConfig.pages?.[0]?.name || "Command");
      setDataStore(buildInitialData(nextConfig));
    };

    loadPreviewConfig();
  }, [appId]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = window.setInterval(() => {
      setTimerRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const visual = useMemo(
    () =>
      normalizeVisualDesign(
        config?.visualDesign || config?.studio?.visualDesign,
        `${config?.app?.name || appId}-${config?.app?.description || ""}`,
      ),
    [appId, config],
  );

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border border-white/10 border-t-white" />
      </div>
    );
  }

  const pages = Array.isArray(config.pages) && config.pages.length > 0 ? config.pages : fallbackConfig.pages;
  const currentPage = pages.find((page: any) => page.name === activePage) || pages[0];
  const layoutClass =
    visual.layout === "topbar"
      ? "flex-col"
      : visual.layout === "split"
        ? "lg:grid lg:grid-cols-[320px_minmax(0,1fr)]"
        : "lg:grid lg:grid-cols-[280px_minmax(0,1fr)]";
  const contentPadding = visual.density === "compact" ? "p-4" : visual.density === "spacious" ? "p-8 lg:p-10" : "p-6 lg:p-8";
  const selectedWatchFace = watchFaces.find((face) => face.id === selectedFace) || watchFaces[0];
  const stopwatchElapsedMs = stopwatchBaseMs + (stopwatchStartedAt ? now.getTime() - stopwatchStartedAt : 0);

  const updateRecords = (entity: string, updater: (records: any[]) => any[]) => {
    setDataStore((current) => ({
      ...current,
      [entity]: updater(current[entity] || []),
    }));
  };

  const handleAddNew = (entity: string) => {
    setActiveEntityForModal(entity);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!activeEntityForModal) return;
    setDataStore((current) => ({
      ...current,
      [activeEntityForModal]: [{ id: Date.now(), ...formData }, ...(current[activeEntityForModal] || [])],
    }));
    setIsModalOpen(false);
  };

  const handleDelete = (entity: string, id: number) => {
    setDataStore((current) => ({
      ...current,
      [entity]: (current[entity] || []).filter((item) => item.id !== id),
    }));
  };

  const addCartItem = (product: any) => {
    updateRecords("cart_items", (items) => {
      const existing = items.find((item) => item.productName === product.name);
      if (existing) {
        return items.map((item) => (item.id === existing.id ? { ...item, quantity: numberValue(item.quantity, 1) + 1 } : item));
      }
      return [{ id: Date.now(), productName: product.name, quantity: 1, unitPrice: numberValue(product.price, 49) }, ...items];
    });
  };

  const runGeneratedAction = (component: PageComponent, action: string) => {
    const key = generatedKey(component);
    const spec = component.runtimeSpec || defaultRuntimeSpec(component);
    setGeneratedStates((current) => {
      const state = current[key] || { result: String(spec.state?.result || "Ready"), history: [], nonce: 0 };
      if (action === "reset") {
        return { ...current, [key]: { result: "Ready", history: [], nonce: state.nonce + 1 } };
      }

      const outcomes = spec.outcomes?.length
        ? spec.outcomes
        : [
            { id: "success", label: "Success", value: "Success", color: visual.palette.primary },
            { id: "again", label: "Try Again", value: "Try Again", color: visual.palette.secondary },
          ];
      const selected = outcomes[Math.floor(Math.random() * outcomes.length)];
      const result = selected.value || selected.label;
      const nextState = {
        result,
        history: [{ id: Date.now(), result, createdAt: new Date().toLocaleTimeString() }, ...state.history],
        nonce: state.nonce + 1,
      };

      return { ...current, [key]: nextState };
    });
  };

  const renderComponent = (component: PageComponent, index: number) => {
    const entityName = component.dataSource?.entity || getPrimaryEntityName(config);
    const schema = getEntitySchema(config, entityName);
    const records = dataStore[entityName] || [];
    const title = componentTitle(component, entityName);
    const metric = records.length;
    const cardStyle = { borderRadius: `var(--mf-radius)`, animationDelay: `${index * 90}ms` };
    const isRuntimeModule = runtimeModuleTypes.has(component.type);

    if (component.type === "stat") {
      const stats = [
        { label: "Records", value: metric },
        { label: "Active", value: Math.max(metric - 1, 0) },
        { label: "Automations", value: config.workflows?.length || 0 },
      ];

      return (
        <section key={`${component.type}-${title}-${index}`} className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, statIndex) => (
            <div
              key={stat.label}
              className={`mf-motion-${visual.motion} ${surfaceClass(visual, component.type)} overflow-hidden p-5 transition duration-500 hover:-translate-y-1 hover:border-white/30`}
              style={{ ...cardStyle, animationDelay: `${(index + statIndex) * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--mf-muted)]">{stat.label}</span>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--mf-accent)] shadow-[0_0_24px_var(--mf-glow)]" />
              </div>
              <div className="mt-4 font-[var(--mf-heading)] text-4xl font-black text-[var(--mf-text)]">{stat.value}</div>
            </div>
          ))}
        </section>
      );
    }

    return (
      <section
        key={`${component.type}-${title}-${index}`}
        className={`mf-motion-${visual.motion} ${surfaceClass(visual, component.type)} overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-white/25`}
        style={cardStyle}
      >
        <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-[var(--mf-heading)] text-lg font-black capitalize text-[var(--mf-text)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--mf-muted)]">
              {component.description || `${records.length} records in ${entityName.replace(/_/g, " ")}`}
            </p>
          </div>
          {entityName && !isRuntimeModule && (
            <button
              type="button"
              onClick={() => handleAddNew(entityName)}
              className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
            >
              Add New
            </button>
          )}
        </div>

        {renderComponentBody(component, schema, records, entityName)}
      </section>
    );
  };

  const renderComponentBody = (component: PageComponent, schema: EntitySchema, records: any[], entityName: string) => {
    if (component.type === "analogClock") {
      const angles = clockAngles(now);
      const numerals = selectedWatchFace.marker === "roman" ? ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"] : ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
          <div className="relative mx-auto aspect-square w-full max-w-[420px] rounded-full border border-white/15 bg-black/20 p-5 shadow-[0_0_80px_var(--mf-glow)]">
            <svg viewBox="0 0 220 220" className="h-full w-full overflow-visible">
              <defs>
                <radialGradient id="clockFace" cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor={selectedWatchFace.face} />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
                </radialGradient>
              </defs>
              <circle cx="110" cy="110" r="104" fill="url(#clockFace)" stroke={selectedWatchFace.ring} strokeWidth="4" />
              <circle cx="110" cy="110" r="91" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {Array.from({ length: 60 }).map((_, marker) => {
                const major = marker % 5 === 0;
                return (
                  <line
                    key={marker}
                    x1="110"
                    y1={major ? "18" : "23"}
                    x2="110"
                    y2={major ? "30" : "28"}
                    stroke={major ? selectedWatchFace.accent : "rgba(255,255,255,0.28)"}
                    strokeWidth={major ? 2.4 : 1}
                    strokeLinecap="round"
                    transform={`rotate(${marker * 6} 110 110)`}
                  />
                );
              })}
              {selectedWatchFace.marker !== "dash" &&
                numerals.map((label, index) => {
                  const angle = (index * 30 - 90) * (Math.PI / 180);
                  const x = 110 + Math.cos(angle) * 72;
                  const y = 110 + Math.sin(angle) * 72 + 5;
                  return (
                    <text key={label} x={x} y={y} textAnchor="middle" fontSize={selectedWatchFace.marker === "minimal" ? "8" : "12"} fontWeight="800" fill={selectedWatchFace.accent}>
                      {selectedWatchFace.marker === "minimal" && index % 3 !== 0 ? "" : label}
                    </text>
                  );
                })}
              <line x1="110" y1="110" x2="110" y2="63" stroke={selectedWatchFace.accent} strokeWidth="7" strokeLinecap="round" transform={`rotate(${angles.hour} 110 110)`} />
              <line x1="110" y1="118" x2="110" y2="42" stroke={selectedWatchFace.secondary} strokeWidth="4" strokeLinecap="round" transform={`rotate(${angles.minute} 110 110)`} />
              <line x1="110" y1="124" x2="110" y2="34" stroke="var(--mf-accent)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angles.second} 110 110)`} />
              <circle cx="110" cy="110" r="7" fill={selectedWatchFace.accent} stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-5">
              <div className="text-sm font-bold text-[var(--mf-muted)]">Current face</div>
              <div className="mt-2 font-[var(--mf-heading)] text-3xl font-black text-[var(--mf-text)]">{selectedWatchFace.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Hour", "Minute", "Second"].map((label, index) => (
                <div key={label} className="rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/15 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-[var(--mf-muted)]">{label}</div>
                  <div className="mt-2 text-xl font-black text-[var(--mf-text)]">{[now.getHours(), now.getMinutes(), now.getSeconds()][index].toString().padStart(2, "0")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (component.type === "digitalClock") {
      return (
        <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-6 shadow-[0_0_60px_var(--mf-glow)]">
            <div className="font-[var(--mf-heading)] text-5xl font-black tracking-tight text-[var(--mf-text)] md:text-7xl">
              {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="mt-4 text-lg font-bold text-[var(--mf-muted)]">
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-5">
            <div className="text-sm font-bold text-[var(--mf-muted)]">Timezone</div>
            <div className="mt-2 text-2xl font-black text-[var(--mf-text)]">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
          </div>
        </div>
      );
    }

    if (component.type === "watchFacePicker") {
      return (
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
          {watchFaces.map((face) => {
            const active = selectedFace === face.id;
            return (
              <button
                key={face.id}
                type="button"
                onClick={() => setSelectedFace(face.id)}
                className={`rounded-[calc(var(--mf-radius)-6px)] border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                  active ? "border-white/30 bg-white/[0.14]" : "border-white/10 bg-black/10 hover:bg-white/[0.08]"
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: face.accent }} />
                  <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: face.secondary }} />
                </div>
                <div className="font-[var(--mf-heading)] text-lg font-black text-[var(--mf-text)]">{face.name}</div>
                <div className="mt-3 aspect-square rounded-full border p-3" style={{ borderColor: face.ring, background: face.face }}>
                  <div className="flex h-full items-center justify-center rounded-full border border-white/10 text-sm font-black" style={{ color: face.accent }}>
                    {face.marker === "roman" ? "XII" : face.marker === "minimal" ? "12" : "|"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (component.type === "worldClock") {
      return (
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
          {worldClockCities.map((item) => (
            <div key={item.city} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-5">
              <div className="text-sm font-bold text-[var(--mf-muted)]">{item.city}</div>
              <div className="mt-3 font-[var(--mf-heading)] text-3xl font-black text-[var(--mf-text)]">
                {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: item.timeZone })}
              </div>
              <div className="mt-2 text-xs font-bold text-[var(--mf-muted)]">{item.timeZone}</div>
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "stopwatch") {
      const running = stopwatchStartedAt !== null;
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-6">
            <div className="font-[var(--mf-heading)] text-6xl font-black tracking-tight text-[var(--mf-text)] md:text-8xl">{formatDuration(stopwatchElapsedMs)}</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (running) {
                    setStopwatchBaseMs(stopwatchElapsedMs);
                    setStopwatchStartedAt(null);
                  } else {
                    setStopwatchStartedAt(Date.now());
                  }
                }}
                className="rounded-full px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20"
                style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => stopwatchElapsedMs > 0 && setLaps((current) => [stopwatchElapsedMs, ...current])}
                className="rounded-full border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-black text-[var(--mf-text)]"
              >
                Lap
              </button>
              <button
                type="button"
                onClick={() => {
                  setStopwatchBaseMs(0);
                  setStopwatchStartedAt(null);
                  setLaps([]);
                }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-[var(--mf-muted)]"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
            <div className="mb-3 text-sm font-black text-[var(--mf-muted)]">Laps</div>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {(laps.length ? laps : [stopwatchElapsedMs].filter(Boolean)).map((lap, index) => (
                <div key={`${lap}-${index}`} className="flex items-center justify-between rounded-[calc(var(--mf-radius)-10px)] bg-black/15 px-3 py-2 text-sm">
                  <span className="font-bold text-[var(--mf-muted)]">Lap {laps.length ? laps.length - index : 1}</span>
                  <span className="font-black text-[var(--mf-text)]">{formatDuration(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (component.type === "timer") {
      const timerPresets = [60, 300, 900, 1800];
      return (
        <div className="p-5">
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-6">
            <div className="font-[var(--mf-heading)] text-6xl font-black tracking-tight text-[var(--mf-text)] md:text-8xl">{formatTimer(timerRemaining)}</div>
            <div className="mt-6 flex flex-wrap gap-3">
              {timerPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setTimerDuration(preset);
                    setTimerRemaining(preset);
                    setTimerRunning(false);
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-[var(--mf-text)]"
                >
                  {formatTimer(preset)}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => timerRemaining > 0 && setTimerRunning((current) => !current)}
                className="rounded-full px-5 py-3 text-sm font-black text-white"
                style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
              >
                {timerRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRemaining(timerDuration);
                  setTimerRunning(false);
                }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-[var(--mf-muted)]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (component.type === "alarmManager") {
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-5">
            <div className="grid gap-3">
              <label className="text-sm font-bold text-[var(--mf-muted)]">
                Time
                <input
                  type="time"
                  value={alarmDraft.time}
                  onChange={(event) => setAlarmDraft((current) => ({ ...current, time: event.target.value }))}
                  className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-2 text-[var(--mf-text)] outline-none"
                />
              </label>
              <label className="text-sm font-bold text-[var(--mf-muted)]">
                Label
                <input
                  value={alarmDraft.label}
                  onChange={(event) => setAlarmDraft((current) => ({ ...current, label: event.target.value }))}
                  className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-2 text-[var(--mf-text)] outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  updateRecords(entityName, (items) => [
                    { id: Date.now(), time: alarmDraft.time, label: alarmDraft.label || "Alarm", enabled: true, repeatDays: alarmDraft.repeatDays },
                    ...items,
                  ])
                }
                className="rounded-full px-4 py-3 text-sm font-black text-white"
                style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
              >
                Add Alarm
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {records.map((alarm) => (
              <div key={alarm.id} className="flex flex-col gap-3 rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-[var(--mf-heading)] text-3xl font-black text-[var(--mf-text)]">{alarm.time}</div>
                  <div className="text-sm font-bold text-[var(--mf-muted)]">{alarm.label} - {alarm.repeatDays || "Once"}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateRecords(entityName, (items) => items.map((item) => (item.id === alarm.id ? { ...item, enabled: !item.enabled } : item)))}
                    className={`rounded-full px-4 py-2 text-sm font-black ${alarm.enabled ? "bg-white text-black" : "border border-white/10 text-[var(--mf-muted)]"}`}
                  >
                    {alarm.enabled ? "On" : "Off"}
                  </button>
                  <button type="button" onClick={() => handleDelete(entityName, alarm.id)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-[var(--mf-muted)]">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (component.type === "productCatalog") {
      return (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {records.map((product) => (
            <div key={product.id} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 transition hover:-translate-y-1 hover:bg-white/[0.12]">
              <div className="mb-4 h-24 rounded-[calc(var(--mf-radius)-10px)] border border-white/10" style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }} />
              <div className="font-[var(--mf-heading)] text-xl font-black text-[var(--mf-text)]">{product.name || product.title}</div>
              <div className="mt-1 text-sm font-bold text-[var(--mf-muted)]">{product.category || "Featured"}</div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-black text-[var(--mf-text)]">{currency(numberValue(product.price, 49))}</span>
                <button type="button" onClick={() => addCartItem(product)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "cart") {
      const subtotal = records.reduce((sum, item) => sum + numberValue(item.unitPrice, 0) * numberValue(item.quantity, 1), 0);
      const tax = Math.round(subtotal * 0.08);
      const total = subtotal + tax;
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-5 text-sm font-bold text-[var(--mf-muted)]">Cart is empty.</div>
            ) : (
              records.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-black text-[var(--mf-text)]">{item.productName || item.name}</div>
                    <div className="text-sm text-[var(--mf-muted)]">{currency(numberValue(item.unitPrice, 0))} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateRecords(entityName, (items) => items.map((row) => (row.id === item.id ? { ...row, quantity: Math.max(1, numberValue(row.quantity, 1) - 1) } : row)))} className="h-9 w-9 rounded-full border border-white/10 text-[var(--mf-text)]">
                      -
                    </button>
                    <span className="w-8 text-center font-black text-[var(--mf-text)]">{item.quantity}</span>
                    <button type="button" onClick={() => updateRecords(entityName, (items) => items.map((row) => (row.id === item.id ? { ...row, quantity: numberValue(row.quantity, 1) + 1 } : row)))} className="h-9 w-9 rounded-full border border-white/10 text-[var(--mf-text)]">
                      +
                    </button>
                    <button type="button" onClick={() => handleDelete(entityName, item.id)} className="ml-2 text-sm font-black text-[var(--mf-accent)]">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-5">
            <div className="space-y-3 text-sm font-bold text-[var(--mf-muted)]">
              <div className="flex justify-between"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{currency(tax)}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-xl font-black text-[var(--mf-text)]"><span>Total</span><span>{currency(total)}</span></div>
            </div>
          </div>
        </div>
      );
    }

    if (component.type === "checkout") {
      const cartItems = dataStore.cart_items || [];
      const total = cartItems.reduce((sum, item) => sum + numberValue(item.unitPrice, 0) * numberValue(item.quantity, 1), 0);
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-3">
            {(["customer", "email", "address"] as const).map((field) => (
              <label key={field} className="text-sm font-bold capitalize text-[var(--mf-muted)]">
                {field}
                <input
                  value={checkoutDraft[field]}
                  onChange={(event) => setCheckoutDraft((current) => ({ ...current, [field]: event.target.value }))}
                  className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-3 text-[var(--mf-text)] outline-none"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => {
                if (!cartItems.length) return;
                updateRecords(entityName, (orders) => [
                  { id: Date.now(), orderNumber: `ORD-${Date.now().toString().slice(-5)}`, customer: checkoutDraft.customer || "Guest", total, status: "Paid" },
                  ...orders,
                ]);
                setDataStore((current) => ({ ...current, cart_items: [] }));
              }}
              className="rounded-full px-5 py-3 text-sm font-black text-white"
              style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
            >
              Place Order
            </button>
          </div>
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-5">
            <div className="text-sm font-bold text-[var(--mf-muted)]">Order total</div>
            <div className="mt-2 text-4xl font-black text-[var(--mf-text)]">{currency(total)}</div>
            <div className="mt-4 text-sm text-[var(--mf-muted)]">{cartItems.length} cart item{cartItems.length === 1 ? "" : "s"}</div>
          </div>
        </div>
      );
    }

    if (component.type === "orderTracker") {
      const statuses = ["Pending", "Paid", "Fulfilled"];
      return (
        <div className="space-y-3 p-5">
          {records.map((order) => (
            <div key={order.id} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-black text-[var(--mf-text)]">{order.orderNumber || order.title}</div>
                  <div className="text-sm text-[var(--mf-muted)]">{order.customer || order.owner} - {currency(numberValue(order.total, 0))}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateRecords(entityName, (items) => items.map((item) => (item.id === order.id ? { ...item, status } : item)))}
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${order.status === status ? "bg-white text-black" : "border border-white/10 text-[var(--mf-muted)]"}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "appointmentBooking") {
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {bookingSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-[calc(var(--mf-radius)-6px)] border p-4 text-left transition ${selectedSlot === slot ? "border-white/30 bg-white/[0.14]" : "border-white/10 bg-white/[0.08]"}`}
              >
                <div className="text-2xl font-black text-[var(--mf-text)]">{slot}</div>
                <div className="mt-2 text-sm font-bold text-[var(--mf-muted)]">Available</div>
              </button>
            ))}
          </div>
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-5">
            <label className="text-sm font-bold text-[var(--mf-muted)]">
              Customer
              <input value={bookingDraft.customer} onChange={(event) => setBookingDraft((current) => ({ ...current, customer: event.target.value }))} className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-2 text-[var(--mf-text)] outline-none" />
            </label>
            <label className="mt-3 block text-sm font-bold text-[var(--mf-muted)]">
              Service
              <input value={bookingDraft.service} onChange={(event) => setBookingDraft((current) => ({ ...current, service: event.target.value }))} className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-2 text-[var(--mf-text)] outline-none" />
            </label>
            <button
              type="button"
              onClick={() => updateRecords(entityName, (items) => [{ id: Date.now(), customer: bookingDraft.customer || "Guest", service: bookingDraft.service, startTime: selectedSlot, status: "Confirmed" }, ...items])}
              className="mt-4 w-full rounded-full px-4 py-3 text-sm font-black text-white"
              style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
            >
              Book {selectedSlot}
            </button>
          </div>
        </div>
      );
    }

    if (component.type === "availabilityPlanner") {
      return (
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
          {records.map((slot) => (
            <div key={slot.id} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
              <div className="font-black text-[var(--mf-text)]">{slot.label || slot.startTime}</div>
              <div className="mt-1 text-sm text-[var(--mf-muted)]">Capacity {slot.capacity || 1}</div>
              <button
                type="button"
                onClick={() => updateRecords(entityName, (items) => items.map((item) => (item.id === slot.id ? { ...item, open: !item.open } : item)))}
                className={`mt-4 rounded-full px-4 py-2 text-sm font-black ${slot.open ? "bg-white text-black" : "border border-white/10 text-[var(--mf-muted)]"}`}
              >
                {slot.open ? "Open" : "Blocked"}
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "contactTimeline") {
      const contact = records[0] || { name: "Primary Contact", email: "contact@example.com", stage: "Lead" };
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-5">
            <div className="font-[var(--mf-heading)] text-2xl font-black text-[var(--mf-text)]">{contact.name}</div>
            <div className="mt-1 text-sm text-[var(--mf-muted)]">{contact.email}</div>
            <div className="mt-4 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm font-black text-[var(--mf-text)]">{contact.stage}</div>
            <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} className="mt-5 h-24 w-full resize-none rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 p-3 text-[var(--mf-text)] outline-none" placeholder="Add note" />
            <button
              type="button"
              onClick={() => {
                if (!noteDraft.trim()) return;
                setTimelineNotes((current) => [noteDraft.trim(), ...current]);
                setNoteDraft("");
              }}
              className="mt-3 w-full rounded-full px-4 py-2 text-sm font-black text-white"
              style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
            >
              Save Note
            </button>
          </div>
          <div className="space-y-3">
            {timelineNotes.map((note, index) => (
              <div key={`${note}-${index}`} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
                <div className="text-sm font-bold text-[var(--mf-muted)]">Activity {timelineNotes.length - index}</div>
                <div className="mt-2 text-[var(--mf-text)]">{note}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (component.type === "emailComposer") {
      return (
        <div className="grid gap-4 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={emailDraft.recipient} onChange={(event) => setEmailDraft((current) => ({ ...current, recipient: event.target.value }))} className="rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-3 text-[var(--mf-text)] outline-none" placeholder="Recipient" />
            <input value={emailDraft.subject} onChange={(event) => setEmailDraft((current) => ({ ...current, subject: event.target.value }))} className="rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-3 text-[var(--mf-text)] outline-none" placeholder="Subject" />
          </div>
          <textarea value={emailDraft.body} onChange={(event) => setEmailDraft((current) => ({ ...current, body: event.target.value }))} className="h-40 resize-none rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 p-3 text-[var(--mf-text)] outline-none" placeholder="Body" />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => updateRecords(entityName, (items) => [{ id: Date.now(), ...emailDraft, status: "Draft" }, ...items])}
              className="rounded-full px-4 py-2 text-sm font-black text-white"
              style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
            >
              Save Draft
            </button>
            <button type="button" onClick={() => setEmailDraft((current) => ({ ...current, body: `${current.body}\n\nFollowing up on our last conversation.`.trim() }))} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-[var(--mf-text)]">
              Insert Follow-up
            </button>
          </div>
        </div>
      );
    }

    if (component.type === "inventoryManager") {
      return (
        <div className="space-y-3 p-5">
          {records.map((item) => {
            const stock = numberValue(item.stock, 0);
            const low = stock <= numberValue(item.reorderPoint, 5);
            return (
              <div key={item.id} className="flex flex-col gap-3 rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-black text-[var(--mf-text)]">{item.name}</div>
                  <div className="text-sm text-[var(--mf-muted)]">{item.sku} - {item.supplier || "Supplier"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {low && <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-black">Low</span>}
                  <button type="button" onClick={() => updateRecords(entityName, (items) => items.map((row) => (row.id === item.id ? { ...row, stock: Math.max(0, stock - 1) } : row)))} className="h-9 w-9 rounded-full border border-white/10 text-[var(--mf-text)]">
                    -
                  </button>
                  <span className="w-12 text-center text-xl font-black text-[var(--mf-text)]">{stock}</span>
                  <button type="button" onClick={() => updateRecords(entityName, (items) => items.map((row) => (row.id === item.id ? { ...row, stock: stock + 5 } : row)))} className="h-9 w-9 rounded-full border border-white/10 text-[var(--mf-text)]">
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (component.type === "ticketInbox") {
      return (
        <div className="grid gap-3 p-5">
          {records.map((ticket) => (
            <div key={ticket.id} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-black text-[var(--mf-text)]">{ticket.subject || ticket.title}</div>
                  <div className="text-sm text-[var(--mf-muted)]">{ticket.priority} priority - {ticket.owner || "Unassigned"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Open", "Pending", "Resolved"].map((status) => (
                    <button key={status} type="button" onClick={() => updateRecords(entityName, (items) => items.map((item) => (item.id === ticket.id ? { ...item, status } : item)))} className={`rounded-full px-3 py-1.5 text-xs font-black ${ticket.status === status ? "bg-white text-black" : "border border-white/10 text-[var(--mf-muted)]"}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "roleManager") {
      const roles = ["Admin", "Editor", "Viewer"];
      return (
        <div className="space-y-3 p-5">
          {records.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-black text-[var(--mf-text)]">{user.name}</div>
                <div className="text-sm text-[var(--mf-muted)]">{user.email}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <button key={role} type="button" onClick={() => updateRecords(entityName, (items) => items.map((item) => (item.id === user.id ? { ...item, role } : item)))} className={`rounded-full px-3 py-1.5 text-xs font-black ${user.role === role ? "bg-white text-black" : "border border-white/10 text-[var(--mf-muted)]"}`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "settingsPanel") {
      return (
        <div className="grid gap-3 p-5 md:grid-cols-2">
          {Object.entries(settings).map(([key, enabled]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSettings((current) => ({ ...current, [key]: !enabled }))}
              className="flex items-center justify-between rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 text-left transition hover:bg-white/[0.12]"
            >
              <span className="font-black capitalize text-[var(--mf-text)]">{key.replace(/([A-Z])/g, " $1")}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${enabled ? "bg-white text-black" : "border border-white/10 text-[var(--mf-muted)]"}`}>{enabled ? "On" : "Off"}</span>
            </button>
          ))}
        </div>
      );
    }

    if (component.type === "generatedModule") {
      const spec = component.runtimeSpec || defaultRuntimeSpec(component);
      const key = generatedKey(component);
      const state = generatedStates[key] || { result: String(spec.state?.result || "Ready"), history: [], nonce: 0 };
      const outcomes = spec.outcomes?.length
        ? spec.outcomes
        : [
            { id: "success", label: "Success", value: "Success", color: visual.palette.primary },
            { id: "again", label: "Try Again", value: "Try Again", color: visual.palette.secondary },
          ];
      const controls = spec.controls?.length ? spec.controls : [{ id: "run", label: "Run", action: "append" }];
      const activeOutcome = outcomes.find((outcome) => (outcome.value || outcome.label) === state.result) || outcomes[0];
      const isCoin = spec.primaryVisual === "coin";

      return (
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col items-center justify-center rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-6">
            <div
              key={state.nonce}
              className={`relative flex aspect-square w-full max-w-[360px] items-center justify-center rounded-full border shadow-[0_0_80px_var(--mf-glow)] ${
                isCoin ? "animate-[mf-coin-pop_640ms_cubic-bezier(0.16,1,0.3,1)]" : ""
              }`}
              style={{
                borderColor: activeOutcome.color || visual.palette.primary,
                background: isCoin
                  ? `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.72), ${activeOutcome.color || visual.palette.primary} 38%, rgba(0,0,0,0.35) 100%)`
                  : `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})`,
              }}
            >
              <div className="absolute inset-8 rounded-full border border-black/20" />
              <div className="text-center">
                <div className="font-[var(--mf-heading)] text-5xl font-black text-black/80">{isCoin ? (state.result === "Tails" ? "T" : state.result === "Heads" ? "H" : "?") : "Go"}</div>
                <div className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-black/60">{state.result}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {controls.map((control) => (
                <button
                  key={control.id}
                  type="button"
                  onClick={() => runGeneratedAction(component, control.action)}
                  className="rounded-full px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
                  style={{ background: control.action === "reset" ? "rgba(255,255,255,0.12)" : `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
                >
                  {control.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(spec.metrics?.length ? spec.metrics : [{ id: "total", label: "Total", source: "history.length" }]).map((metric) => (
                <div key={metric.id} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
                  <div className="text-xs font-black uppercase tracking-wide text-[var(--mf-muted)]">{metric.label}</div>
                  <div className="mt-2 text-3xl font-black text-[var(--mf-text)]">{generatedMetricValue(metric, state)}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4">
              <div className="mb-3 text-sm font-black text-[var(--mf-muted)]">History</div>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {(state.history.length ? state.history : [{ id: 0, result: "No runs yet", createdAt: "" }]).map((item) => (
                  <div key={`${item.id}-${item.result}`} className="flex items-center justify-between rounded-[calc(var(--mf-radius)-10px)] bg-black/15 px-3 py-2 text-sm">
                    <span className="font-black text-[var(--mf-text)]">{item.result}</span>
                    <span className="text-[var(--mf-muted)]">{item.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (component.type === "domainModule") {
      const actions = component.capabilities?.length ? component.capabilities : component.behavior?.actions?.length ? component.behavior.actions : ["create", "update", "run-action"];
      const log = domainActionLog[component.moduleId || component.label || component.type] || [];
      return (
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-3 md:grid-cols-2">
            {actions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() =>
                  setDomainActionLog((current) => {
                    const key = component.moduleId || component.label || component.type;
                    return { ...current, [key]: [`${action.replace(/-/g, " ")} completed at ${new Date().toLocaleTimeString()}`, ...(current[key] || [])] };
                  })
                }
                className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-4 text-left font-black capitalize text-[var(--mf-text)] transition hover:-translate-y-1 hover:bg-white/[0.12]"
              >
                {action.replace(/-/g, " ")}
              </button>
            ))}
          </div>
          <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 text-sm font-black text-[var(--mf-muted)]">Activity</div>
            <div className="space-y-2">
              {(log.length ? log : ["Ready for interaction."]).map((item) => (
                <div key={item} className="rounded-[calc(var(--mf-radius)-10px)] bg-white/[0.08] px-3 py-2 text-sm text-[var(--mf-text)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (component.type === "table" || component.type === "list") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-[var(--mf-muted)]">
              <tr>
                {schema.fields.slice(0, 5).map((field) => (
                  <th key={field.name} className="px-5 py-3 font-bold capitalize">
                    {field.name}
                  </th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-white/[0.08] transition hover:bg-white/[0.08]">
                  {schema.fields.slice(0, 5).map((field) => (
                    <td key={field.name} className="px-5 py-4 text-[var(--mf-text)]">
                      {String(record[field.name] ?? "")}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => handleDelete(entityName, record.id)} className="text-sm font-bold text-[var(--mf-accent)]">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (component.type === "kanban") {
      const columns = getStatusColumns(schema);
      const statusField = schema.fields.find((field) => field.name.toLowerCase().includes("status"))?.name || "status";

      return (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column, columnIndex) => {
            const columnRecords = records.filter((record) => String(record[statusField] || columns[columnIndex % columns.length]) === column);
            return (
              <div key={column} className="min-h-52 rounded-[calc(var(--mf-radius)-4px)] border border-white/10 bg-black/10 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-[var(--mf-text)]">{column}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--mf-muted)]">{columnRecords.length}</span>
                </div>
                <div className="space-y-3">
                  {columnRecords.map((record) => (
                    <div key={record.id} className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/10 p-3 shadow-lg shadow-black/10">
                      <div className="font-bold text-[var(--mf-text)]">{record.title || record.name || `${entityName} ${record.id}`}</div>
                      <div className="mt-2 text-xs text-[var(--mf-muted)]">{record.owner || record.priority || visual.palette.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (component.type === "form") {
      return (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {schema.fields.slice(0, 6).map((field) => (
            <label key={field.name} className="text-sm font-semibold capitalize text-[var(--mf-muted)]">
              {field.name}
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-2 text-[var(--mf-text)] outline-none transition focus:border-[var(--mf-primary)]"
                placeholder={field.name}
              />
            </label>
          ))}
        </div>
      );
    }

    if (component.type === "chart") {
      const heights = records.map((_, index) => 34 + ((index * 17 + visual.seed.length * 3) % 58));
      return (
        <div className="p-5">
          <div className="flex h-72 items-end gap-3 rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/10 p-5">
            {(heights.length ? heights : [48, 72, 38, 86, 60]).map((height, index) => (
              <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-full shadow-[0_0_28px_var(--mf-glow)] transition duration-700 hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${visual.palette.secondary}, ${visual.palette.primary})`,
                  }}
                />
                <span className="text-xs text-[var(--mf-muted)]">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (component.type === "calendar") {
      return (
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-7">
          {Array.from({ length: 14 }).map((_, dayIndex) => (
            <div key={`day-${dayIndex}`} className="min-h-28 rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-white/[0.08] p-3">
              <div className="text-xs font-black text-[var(--mf-muted)]">Day {dayIndex + 1}</div>
              {dayIndex % 3 === 0 && (
                <div className="mt-3 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: visual.palette.primary }}>
                  Scheduled
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (component.type === "assistant") {
      return (
        <div className="p-5">
          <textarea
            value={assistantDraft}
            onChange={(event) => setAssistantDraft(event.target.value)}
            className="h-28 w-full resize-none rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-3 text-[var(--mf-text)] outline-none transition placeholder:text-[var(--mf-muted)] focus:border-[var(--mf-primary)]"
            placeholder="Ask anything..."
          />
          <button
            type="button"
            onClick={() => setAssistantResponse(assistantDraft ? `Generated next actions for "${assistantDraft}"` : "Generated next actions for this workspace")}
            className="mt-3 rounded-full px-4 py-2 text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.accent})` }}
          >
            Run Prompt
          </button>
          {assistantResponse && <div className="mt-4 rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/10 p-4 text-sm text-[var(--mf-text)]">{assistantResponse}</div>}
        </div>
      );
    }

    if (component.type === "file") {
      return (
        <div className="p-5">
          <button
            type="button"
            onClick={() => setFiles((current) => [`Asset ${current.length + 1}.png`, ...current])}
            className="w-full rounded-[calc(var(--mf-radius)-6px)] border border-dashed border-white/20 bg-white/[0.08] p-8 text-center font-bold text-[var(--mf-text)] transition hover:bg-white/[0.12]"
          >
            Upload Asset
          </button>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {files.map((file) => (
              <div key={file} className="rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/10 px-3 py-2 text-sm text-[var(--mf-text)]">
                {file}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const actions = component.capabilities?.length ? component.capabilities : ["create", "update", "run-action"];
    const logKey = `${component.type}-${component.label || "module"}`;
    const log = domainActionLog[logKey] || [];

    return (
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-white/[0.08] p-5">
          <div className="font-[var(--mf-heading)] text-xl font-black text-[var(--mf-text)]">{component.label || "Custom Module"}</div>
          <p className="mt-2 text-sm leading-6 text-[var(--mf-muted)]">{component.description || "Generated module"}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => setDomainActionLog((current) => ({ ...current, [logKey]: [`${action.replace(/-/g, " ")} completed`, ...(current[logKey] || [])] }))}
                className="rounded-full border border-white/10 bg-white/[0.12] px-4 py-2 text-sm font-bold capitalize text-[var(--mf-text)] transition hover:bg-white/[0.18]"
              >
                {action.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[calc(var(--mf-radius)-6px)] border border-white/10 bg-black/20 p-4">
          <div className="mb-3 text-sm font-black text-[var(--mf-muted)]">Activity</div>
          <div className="space-y-2">
            {(log.length ? log : ["No actions yet."]).map((item) => (
              <div key={item} className="rounded-[calc(var(--mf-radius)-10px)] bg-white/[0.08] px-3 py-2 text-sm text-[var(--mf-text)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const modalSchema = activeEntityForModal ? getEntitySchema(config, activeEntityForModal) : null;

  return (
    <div
      className={`relative flex h-screen overflow-hidden text-[var(--mf-text)] ${layoutClass}`}
      style={{ ...visualVars(visual), background: "var(--mf-bg)", fontFamily: "var(--mf-body)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-18%] h-96 w-96 rounded-full bg-[var(--mf-primary)] opacity-30 blur-3xl" />
        <div className="absolute right-[-10%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-[var(--mf-secondary)] opacity-25 blur-3xl" />
        <div className="absolute bottom-[-22%] left-[34%] h-[28rem] w-[28rem] rounded-full bg-[var(--mf-accent)] opacity-20 blur-3xl" />
      </div>

      <aside
        className={`relative z-10 ${visual.layout === "topbar" ? "border-b border-white/10 px-5 py-4" : "border-r border-white/10 p-5"} bg-[var(--mf-surface)] backdrop-blur-2xl`}
      >
        <div className={visual.layout === "topbar" ? "flex items-center justify-between gap-5" : "flex h-full flex-col"}>
          <div>
            <div className="font-[var(--mf-heading)] text-2xl font-black tracking-tight text-[var(--mf-text)]">{config.app?.name || "Generated App"}</div>
            <p className="mt-2 max-w-72 text-sm leading-5 text-[var(--mf-muted)]">{config.app?.description || visual.style}</p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--mf-muted)]">
              {pages.length} pages
            </div>
          </div>

          <nav className={`${visual.layout === "topbar" ? "flex flex-wrap gap-2" : "mt-8 flex-1 space-y-2"}`}>
            {pages.map((page: any) => {
              const active = activePage === page.name;
              return (
                <button
                  key={page.name}
                  type="button"
                  onClick={() => setActivePage(page.name)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition duration-300 ${
                    active ? "border-white/20 text-white shadow-lg shadow-black/[0.15]" : "border-transparent text-[var(--mf-muted)] hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-[var(--mf-text)]"
                  }`}
                  style={active ? { background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` } : undefined}
                >
                  {page.name}
                </button>
              );
            })}
          </nav>

          <Link href="/studio/apps" className={`${visual.layout === "topbar" ? "" : "mt-6"} text-sm font-bold text-[var(--mf-muted)] transition hover:text-[var(--mf-text)]`}>
            Exit to Studio
          </Link>
        </div>
      </aside>

      <main className={`relative z-10 min-w-0 flex-1 overflow-y-auto ${contentPadding}`}>
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[var(--mf-muted)]">
              Preview
            </div>
            <h1 className="font-[var(--mf-heading)] text-4xl font-black tracking-tight text-[var(--mf-text)] lg:text-6xl">{currentPage?.name || "Dashboard"}</h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-[var(--mf-muted)] backdrop-blur-xl">
            {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        <div className="grid gap-5">{currentPage?.components?.map((component: PageComponent, index: number) => renderComponent(component, index))}</div>
      </main>

      {isModalOpen && activeEntityForModal && modalSchema && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/[0.45] p-4 backdrop-blur-xl">
          <div className={`${surfaceClass(visual, "modal")} w-full max-w-lg p-5`} style={{ borderRadius: "var(--mf-radius)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-[var(--mf-heading)] text-xl font-black capitalize text-[var(--mf-text)]">New {activeEntityForModal}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-[var(--mf-text)]">
                Close
              </button>
            </div>
            <div className="space-y-4">
              {modalSchema.fields.map((field) => (
                <label key={field.name} className="block text-sm font-semibold capitalize text-[var(--mf-muted)]">
                  {field.name}
                  <input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={formData[field.name] || ""}
                    onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))}
                    className="mt-2 w-full rounded-[calc(var(--mf-radius)-8px)] border border-white/10 bg-black/20 px-3 py-2 text-[var(--mf-text)] outline-none transition focus:border-[var(--mf-primary)]"
                    placeholder={field.name}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-[var(--mf-muted)]">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${visual.palette.primary}, ${visual.palette.secondary})` }}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
