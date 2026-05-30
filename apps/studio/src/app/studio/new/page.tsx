"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { createVisualDesign } from "@/lib/visual-design";

type CustomFeature = {
  id: string;
  name: string;
  type: "page" | "component" | "workflow" | "integration";
  description: string;
};

type DomainEntity = {
  name: string;
  label: string;
  fields: Array<{ name: string; type: string; required?: boolean; enumValues?: string[] }>;
};

type RuntimeSpec = {
  kind: "randomizer" | "calculator" | "tracker" | "builder" | "game" | "simulator" | "formWorkflow" | "custom";
  primaryVisual?: "coin" | "dice" | "wheel" | "card" | "meter" | "board" | "canvas" | "none";
  state?: Record<string, unknown>;
  outcomes?: Array<{ id: string; label: string; value?: string; color?: string }>;
  controls?: Array<{ id: string; label: string; action: string }>;
  metrics?: Array<{ id: string; label: string; source: string }>;
};

type SourceFile = {
  path: string;
  purpose: string;
  content: string;
};

type FunctionalModule = {
  id: string;
  type: string;
  label: string;
  description: string;
  page: string;
  path: string;
  dataSource?: { entity?: string };
  variant?: string;
  capabilities: string[];
  apiRoutes: string[];
  businessLogic: string[];
  runtimeSpec?: RuntimeSpec;
  sourceFiles?: SourceFile[];
  entities?: DomainEntity[];
};

const componentCatalog = [
  { id: "dashboard", label: "Dashboard", type: "stat", description: "Metrics, recent activity, and status panels" },
  { id: "table", label: "Data Table", type: "table", description: "Searchable CRUD table for an entity" },
  { id: "form", label: "Form Builder", type: "form", description: "Create and edit records with generated fields" },
  { id: "kanban", label: "Kanban", type: "kanban", description: "Pipeline stages for workflow-heavy apps" },
  { id: "calendar", label: "Calendar", type: "calendar", description: "Schedule-based pages and reminders" },
  { id: "analytics", label: "Analytics", type: "chart", description: "Charts over saved entity records" },
  { id: "file-manager", label: "File Manager", type: "file", description: "Upload and organize app assets" },
  { id: "ai-assistant", label: "AI Assistant", type: "assistant", description: "Prompt panel for user-facing AI actions" },
];

const templates = [
  {
    id: "crm",
    name: "CRM",
    prompt: "A CRM with contacts, companies, deals, pipeline stages, email reminders, notes, and a sales dashboard.",
    components: ["dashboard", "table", "form", "kanban", "analytics"],
  },
  {
    id: "ops",
    name: "Operations",
    prompt: "An internal operations portal with tasks, owners, approvals, SLA tracking, weekly reports, and notifications.",
    components: ["dashboard", "table", "form", "calendar", "analytics"],
  },
  {
    id: "marketplace",
    name: "Marketplace",
    prompt: "A marketplace app with vendors, listings, orders, payments status, reviews, and admin moderation workflows.",
    components: ["dashboard", "table", "form", "file-manager", "analytics"],
  },
];

const visualDirections = [
  { id: "surprise", label: "Surprise me", prompt: "Invent a distinct visual identity that does not resemble common admin dashboards." },
  { id: "glass", label: "Liquid glass", prompt: "Use fluid glassmorphism, layered translucent panels, and soft luminous motion." },
  { id: "editorial", label: "Editorial", prompt: "Use an editorial SaaS style with bold typography, asymmetry, and confident contrast." },
  { id: "console", label: "Console", prompt: "Use a high-density command center style with technical typography and kinetic motion." },
  { id: "playful", label: "Playful", prompt: "Use playful product UI styling with unexpected colors, rounded geometry, and lively transitions." },
];

const pageNamesByComponent: Record<string, string[]> = {
  dashboard: ["Command Center", "Overview", "Mission Control", "Pulse"],
  table: ["Records", "Directory", "Operations Grid", "Data Room"],
  form: ["Composer", "Intake", "Create", "Submission Flow"],
  kanban: ["Pipeline", "Workflow Board", "Stages", "Flow"],
  calendar: ["Schedule", "Timeline", "Planner", "Rhythm"],
  analytics: ["Insights", "Signals", "Analytics", "Forecast"],
  "file-manager": ["Assets", "Vault", "Media", "Files"],
  "ai-assistant": ["Copilot", "Assistant", "AI Desk", "Intelligence"],
};

const componentVariants: Record<string, string[]> = {
  stat: ["floating metric rail", "stacked KPI glass", "split signal cards", "compact pulse counters"],
  table: ["glass data grid", "row spotlight table", "dense command table", "soft grouped records"],
  form: ["two-column composer", "guided intake form", "compact inline editor", "glass form stack"],
  kanban: ["floating swimlanes", "compact stage board", "glass card pipeline", "priority stacked board"],
  calendar: ["timeline grid", "weekly glass planner", "compact schedule blocks", "floating event cells"],
  chart: ["luminous bar field", "gradient velocity chart", "soft signal graph", "compact analytics strip"],
  file: ["asset dropzone", "media vault grid", "glass file shelf", "upload command panel"],
  assistant: ["prompt console", "AI action desk", "glass prompt panel", "compact copilot"],
  custom: ["bespoke module", "workflow control", "custom command panel", "feature surface"],
  generatedModule: ["generated product surface", "custom interaction canvas", "feature-native cockpit", "bespoke runtime panel"],
};

const domainModuleCatalog: FunctionalModule[] = [
  {
    id: "analog-clock",
    type: "analogClock",
    label: "Analog Clock",
    description: "Live analog clock with hour, minute, and second hands driven by the current device time.",
    page: "Clock",
    path: "/clock",
    dataSource: { entity: "watch_preferences" },
    capabilities: ["live-time", "analog-hands", "face-aware-colors"],
    apiRoutes: ["GET /api/runtime/time", "PATCH /api/runtime/watch-preferences"],
    businessLogic: ["Recalculate hand positions every second using local time and selected watch face."],
    entities: [
      {
        name: "watch_preferences",
        label: "Watch Preferences",
        fields: [
          { name: "face", type: "string", required: true },
          { name: "timezone", type: "string", required: true },
          { name: "accentColor", type: "string" },
          { name: "updatedAt", type: "date" },
        ],
      },
    ],
  },
  {
    id: "digital-clock",
    type: "digitalClock",
    label: "Digital Clock",
    description: "Live digital time, date, timezone, and seconds display.",
    page: "Clock",
    path: "/clock",
    dataSource: { entity: "watch_preferences" },
    capabilities: ["live-time", "date-display", "timezone-label"],
    apiRoutes: ["GET /api/runtime/time"],
    businessLogic: ["Format local date and time consistently from one runtime clock source."],
  },
  {
    id: "watch-face-picker",
    type: "watchFacePicker",
    label: "Watch Faces",
    description: "Selectable watch faces with different colors, numerals, markers, and hand styling.",
    page: "Clock",
    path: "/clock",
    dataSource: { entity: "watch_preferences" },
    capabilities: ["select-face", "persist-preference", "preview-face"],
    apiRoutes: ["GET /api/runtime/watch-preferences", "PATCH /api/runtime/watch-preferences"],
    businessLogic: ["Apply selected face to both analog and digital clock surfaces."],
  },
  {
    id: "world-clock",
    type: "worldClock",
    label: "World Clock",
    description: "Multiple city clocks derived from the current time.",
    page: "Clock",
    path: "/clock",
    dataSource: { entity: "watch_preferences" },
    capabilities: ["multiple-timezones", "city-times"],
    apiRoutes: ["GET /api/runtime/world-clock"],
    businessLogic: ["Calculate city offsets from a single current timestamp."],
  },
  {
    id: "stopwatch",
    type: "stopwatch",
    label: "Stopwatch",
    description: "Start, pause, reset, and lap timing with millisecond precision.",
    page: "Stopwatch",
    path: "/stopwatch",
    dataSource: { entity: "stopwatch_sessions" },
    capabilities: ["start", "pause", "reset", "laps", "elapsed-time"],
    apiRoutes: ["POST /api/runtime/stopwatch/sessions", "PATCH /api/runtime/stopwatch/sessions/:id"],
    businessLogic: ["Accumulate elapsed time across pauses and store lap snapshots."],
    entities: [
      {
        name: "stopwatch_sessions",
        label: "Stopwatch Sessions",
        fields: [
          { name: "title", type: "string", required: true },
          { name: "durationMs", type: "number", required: true },
          { name: "laps", type: "number" },
          { name: "status", type: "string", required: true },
          { name: "createdAt", type: "date" },
        ],
      },
    ],
  },
  {
    id: "timer",
    type: "timer",
    label: "Timer",
    description: "Configurable countdown timer with start, pause, reset, and completion state.",
    page: "Timer",
    path: "/timer",
    dataSource: { entity: "timers" },
    capabilities: ["set-duration", "countdown", "pause", "reset", "complete"],
    apiRoutes: ["POST /api/runtime/timers", "PATCH /api/runtime/timers/:id"],
    businessLogic: ["Clamp countdown at zero and preserve configured duration for reset."],
    entities: [
      {
        name: "timers",
        label: "Timers",
        fields: [
          { name: "label", type: "string", required: true },
          { name: "durationSeconds", type: "number", required: true },
          { name: "remainingSeconds", type: "number", required: true },
          { name: "status", type: "string", required: true },
        ],
      },
    ],
  },
  {
    id: "alarm-manager",
    type: "alarmManager",
    label: "Alarms",
    description: "Create, enable, disable, and remove alarms with labels and repeat settings.",
    page: "Alarms",
    path: "/alarms",
    dataSource: { entity: "alarms" },
    capabilities: ["create-alarm", "toggle-alarm", "delete-alarm", "repeat-days"],
    apiRoutes: ["GET /api/runtime/alarms", "POST /api/runtime/alarms", "PATCH /api/runtime/alarms/:id", "DELETE /api/runtime/alarms/:id"],
    businessLogic: ["Validate time format, store enabled state, and evaluate due alarms on schedule."],
    entities: [
      {
        name: "alarms",
        label: "Alarms",
        fields: [
          { name: "time", type: "string", required: true },
          { name: "label", type: "string", required: true },
          { name: "enabled", type: "boolean", required: true },
          { name: "repeatDays", type: "string" },
        ],
      },
    ],
  },
  {
    id: "product-catalog",
    type: "productCatalog",
    label: "Product Catalog",
    description: "Browse, filter, and add products to a working cart.",
    page: "Shop",
    path: "/shop",
    dataSource: { entity: "products" },
    capabilities: ["browse-products", "filter-products", "add-to-cart"],
    apiRoutes: ["GET /api/products", "POST /api/cart/items"],
    businessLogic: ["Only active products can be added to cart and cart totals update immediately."],
    entities: [
      {
        name: "products",
        label: "Products",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "price", type: "number", required: true },
          { name: "category", type: "string" },
          { name: "inventory", type: "number" },
          { name: "status", type: "string", required: true, enumValues: ["Active", "Draft", "Archived"] },
        ],
      },
    ],
  },
  {
    id: "cart",
    type: "cart",
    label: "Cart",
    description: "Adjust quantities, remove items, and calculate subtotal, tax, and total.",
    page: "Shop",
    path: "/shop",
    dataSource: { entity: "cart_items" },
    capabilities: ["quantity-controls", "remove-items", "totals"],
    apiRoutes: ["GET /api/cart", "PATCH /api/cart/items/:id", "DELETE /api/cart/items/:id"],
    businessLogic: ["Cart total equals item subtotal plus estimated tax and updates after every quantity change."],
    entities: [
      {
        name: "cart_items",
        label: "Cart Items",
        fields: [
          { name: "productName", type: "string", required: true },
          { name: "quantity", type: "number", required: true },
          { name: "unitPrice", type: "number", required: true },
        ],
      },
    ],
  },
  {
    id: "checkout",
    type: "checkout",
    label: "Checkout",
    description: "Collect shipping, validate payment readiness, and submit orders.",
    page: "Checkout",
    path: "/checkout",
    dataSource: { entity: "orders" },
    capabilities: ["shipping-form", "payment-status", "place-order"],
    apiRoutes: ["POST /api/orders", "POST /api/payments/intent"],
    businessLogic: ["Orders require customer info, at least one cart item, and a valid payment state."],
    entities: [
      {
        name: "orders",
        label: "Orders",
        fields: [
          { name: "orderNumber", type: "string", required: true },
          { name: "customer", type: "string", required: true },
          { name: "total", type: "number", required: true },
          { name: "status", type: "string", required: true, enumValues: ["Pending", "Paid", "Fulfilled"] },
        ],
      },
    ],
  },
  {
    id: "order-tracker",
    type: "orderTracker",
    label: "Orders",
    description: "Track order status, fulfillment progress, and customer totals.",
    page: "Orders",
    path: "/orders",
    dataSource: { entity: "orders" },
    capabilities: ["status-updates", "fulfillment-progress", "order-search"],
    apiRoutes: ["GET /api/orders", "PATCH /api/orders/:id/status"],
    businessLogic: ["Order status progresses through pending, paid, fulfilled, and archived states."],
  },
  {
    id: "appointment-booking",
    type: "appointmentBooking",
    label: "Appointment Booking",
    description: "Pick a service, select an available time, and create an appointment.",
    page: "Bookings",
    path: "/bookings",
    dataSource: { entity: "appointments" },
    capabilities: ["slot-selection", "booking-form", "confirmation"],
    apiRoutes: ["GET /api/availability", "POST /api/appointments"],
    businessLogic: ["Prevent booking unavailable slots and reserve the selected time when confirmed."],
    entities: [
      {
        name: "appointments",
        label: "Appointments",
        fields: [
          { name: "customer", type: "string", required: true },
          { name: "service", type: "string", required: true },
          { name: "startTime", type: "date", required: true },
          { name: "status", type: "string", required: true, enumValues: ["Requested", "Confirmed", "Completed", "Canceled"] },
        ],
      },
    ],
  },
  {
    id: "availability-planner",
    type: "availabilityPlanner",
    label: "Availability",
    description: "Manage open slots, blocked time, and booking capacity.",
    page: "Bookings",
    path: "/bookings",
    dataSource: { entity: "availability_slots" },
    capabilities: ["slot-toggle", "capacity-control", "calendar-sync"],
    apiRoutes: ["GET /api/availability", "PATCH /api/availability/:id"],
    businessLogic: ["Available capacity decreases when an appointment is booked and returns when canceled."],
    entities: [
      {
        name: "availability_slots",
        label: "Availability Slots",
        fields: [
          { name: "label", type: "string", required: true },
          { name: "startTime", type: "date", required: true },
          { name: "capacity", type: "number", required: true },
          { name: "open", type: "boolean", required: true },
        ],
      },
    ],
  },
  {
    id: "contact-timeline",
    type: "contactTimeline",
    label: "Contact Timeline",
    description: "View contact history, notes, tasks, and next follow-up action.",
    page: "CRM",
    path: "/crm",
    dataSource: { entity: "contacts" },
    capabilities: ["activity-feed", "notes", "follow-up-task"],
    apiRoutes: ["GET /api/contacts/:id/timeline", "POST /api/contacts/:id/notes"],
    businessLogic: ["Every note and follow-up is appended to the contact timeline with an owner and date."],
    entities: [
      {
        name: "contacts",
        label: "Contacts",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "email", type: "email", required: true },
          { name: "stage", type: "string", required: true, enumValues: ["Lead", "Qualified", "Proposal", "Won"] },
          { name: "owner", type: "string" },
        ],
      },
    ],
  },
  {
    id: "email-composer",
    type: "emailComposer",
    label: "Email Composer",
    description: "Compose follow-up email drafts and attach them to a contact or deal.",
    page: "CRM",
    path: "/crm",
    dataSource: { entity: "email_drafts" },
    capabilities: ["compose-email", "save-draft", "template-insert"],
    apiRoutes: ["POST /api/email/drafts", "POST /api/email/send"],
    businessLogic: ["Email drafts require a recipient, subject, body, and linked contact before sending."],
    entities: [
      {
        name: "email_drafts",
        label: "Email Drafts",
        fields: [
          { name: "recipient", type: "email", required: true },
          { name: "subject", type: "string", required: true },
          { name: "body", type: "string", required: true },
          { name: "status", type: "string", required: true, enumValues: ["Draft", "Ready", "Sent"] },
        ],
      },
    ],
  },
  {
    id: "inventory-manager",
    type: "inventoryManager",
    label: "Inventory",
    description: "Track stock, low-stock alerts, SKU details, and restock actions.",
    page: "Inventory",
    path: "/inventory",
    dataSource: { entity: "inventory_items" },
    capabilities: ["stock-adjustment", "low-stock-alerts", "restock"],
    apiRoutes: ["GET /api/inventory", "PATCH /api/inventory/:id", "POST /api/inventory/:id/restock"],
    businessLogic: ["Stock cannot go below zero and low-stock items are flagged automatically."],
    entities: [
      {
        name: "inventory_items",
        label: "Inventory Items",
        fields: [
          { name: "sku", type: "string", required: true },
          { name: "name", type: "string", required: true },
          { name: "stock", type: "number", required: true },
          { name: "reorderPoint", type: "number", required: true },
          { name: "supplier", type: "string" },
        ],
      },
    ],
  },
  {
    id: "ticket-inbox",
    type: "ticketInbox",
    label: "Ticket Inbox",
    description: "Triage, assign, reply to, and close support requests.",
    page: "Support",
    path: "/support",
    dataSource: { entity: "tickets" },
    capabilities: ["triage", "assignment", "reply", "close-ticket"],
    apiRoutes: ["GET /api/tickets", "PATCH /api/tickets/:id", "POST /api/tickets/:id/replies"],
    businessLogic: ["Tickets require a status, priority, owner, and activity log for every reply."],
    entities: [
      {
        name: "tickets",
        label: "Tickets",
        fields: [
          { name: "subject", type: "string", required: true },
          { name: "priority", type: "string", required: true, enumValues: ["Low", "Medium", "High"] },
          { name: "status", type: "string", required: true, enumValues: ["Open", "Pending", "Resolved"] },
          { name: "owner", type: "string" },
        ],
      },
    ],
  },
  {
    id: "role-manager",
    type: "roleManager",
    label: "Roles",
    description: "Assign roles and permissions for authenticated users.",
    page: "Settings",
    path: "/settings",
    dataSource: { entity: "users" },
    capabilities: ["role-assignment", "permission-toggle", "auth-policy"],
    apiRoutes: ["GET /api/users", "PATCH /api/users/:id/roles"],
    businessLogic: ["Only admins can change roles and protected modules require signed-in users."],
    entities: [
      {
        name: "users",
        label: "Users",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "email", type: "email", required: true },
          { name: "role", type: "string", required: true, enumValues: ["Admin", "Editor", "Viewer"] },
          { name: "active", type: "boolean", required: true },
        ],
      },
    ],
  },
  {
    id: "settings-panel",
    type: "settingsPanel",
    label: "Settings",
    description: "Manage application preferences, feature toggles, and runtime options.",
    page: "Settings",
    path: "/settings",
    dataSource: { entity: "app_settings" },
    capabilities: ["feature-toggle", "preference-save", "runtime-config"],
    apiRoutes: ["GET /api/settings", "PATCH /api/settings"],
    businessLogic: ["Settings changes are validated, persisted, and applied across generated modules."],
    entities: [
      {
        name: "app_settings",
        label: "App Settings",
        fields: [
          { name: "key", type: "string", required: true },
          { name: "value", type: "string", required: true },
          { name: "enabled", type: "boolean", required: true },
        ],
      },
    ],
  },
];

const domainDetectors: Array<{ moduleIds: string[]; patterns: RegExp[] }> = [
  { moduleIds: ["analog-clock", "digital-clock"], patterns: [/\banalog\b/i, /\bclock\b/i, /\bwatch\b/i, /\btell(s)? time\b/i] },
  { moduleIds: ["watch-face-picker"], patterns: [/\bwatch face(s)?\b/i, /\bfaces?\b/i, /\bthemes?\b/i, /\bcustomi[sz]able watch\b/i] },
  { moduleIds: ["world-clock"], patterns: [/\bworld clock\b/i, /\btimezone(s)?\b/i, /\btime zone(s)?\b/i, /\bcity time(s)?\b/i] },
  { moduleIds: ["stopwatch"], patterns: [/\bstop ?watch\b/i, /\blap(s)?\b/i, /\belapsed\b/i] },
  { moduleIds: ["timer"], patterns: [/\btimer\b/i, /\bcountdown\b/i] },
  { moduleIds: ["alarm-manager"], patterns: [/\balarm(s)?\b/i, /\breminder(s)?\b/i] },
  { moduleIds: ["product-catalog", "cart", "checkout", "order-tracker"], patterns: [/\be-?commerce\b/i, /\bshop\b/i, /\bstore\b/i, /\bcart\b/i, /\bcheckout\b/i, /\border(s)?\b/i, /\bpayment(s)?\b/i] },
  { moduleIds: ["appointment-booking", "availability-planner"], patterns: [/\bbooking(s)?\b/i, /\bappointment(s)?\b/i, /\breservation(s)?\b/i, /\bslot(s)?\b/i, /\bavailability\b/i] },
  { moduleIds: ["contact-timeline", "email-composer"], patterns: [/\bcrm\b/i, /\blead(s)?\b/i, /\bcontact(s)?\b/i, /\bdeal(s)?\b/i, /\bfollow[- ]?up\b/i, /\bemail\b/i] },
  { moduleIds: ["inventory-manager"], patterns: [/\binventory\b/i, /\bstock\b/i, /\bwarehouse\b/i, /\bsku\b/i, /\bsupplier\b/i] },
  { moduleIds: ["ticket-inbox"], patterns: [/\bsupport\b/i, /\bticket(s)?\b/i, /\binbox\b/i, /\bhelp ?desk\b/i] },
  { moduleIds: ["role-manager"], patterns: [/\bauth\b/i, /\bauthentication\b/i, /\blog ?in\b/i, /\bsign ?in\b/i, /\bsign ?up\b/i, /\brole(s)?\b/i, /\bpermission(s)?\b/i, /\badmin\b/i] },
  { moduleIds: ["settings-panel"], patterns: [/\bsetting(s)?\b/i, /\bpreference(s)?\b/i, /\bfeature toggle(s)?\b/i] },
];

function seededPick(values: string[], seed: string, offset = 0) {
  const numericSeed = Number(seed) || seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return values[(numericSeed + offset) % values.length];
}

function pageNameFor(componentId: string, visualSeed: string, offset: number) {
  return seededPick(pageNamesByComponent[componentId] || ["Workspace", "Flow", "Console"], visualSeed, offset);
}

function variantFor(componentType: string, visualSeed: string, offset: number) {
  return seededPick(componentVariants[componentType] || componentVariants.custom, visualSeed, offset);
}

function isCoinTossPrompt(value: string) {
  return /\bcoin(s)?\b/i.test(value) && /\b(toss|flip|flipper|heads|tails|random)\b/i.test(value);
}

function buildCoinTossModule(prompt: string): FunctionalModule {
  return {
    id: "generated-coin-toss",
    type: "generatedModule",
    label: "Coin Toss",
    description: prompt || "Flip a coin with animated heads or tails results, stats, and history.",
    page: "Coin Toss",
    path: "/",
    dataSource: { entity: "coin_flips" },
    capabilities: ["flip-coin", "animated-result", "heads-tails-history", "stats", "reset-history"],
    apiRoutes: ["GET /api/coin-flips", "POST /api/coin-flips", "DELETE /api/coin-flips"],
    businessLogic: [
      "Generate heads or tails with an unbiased random choice.",
      "Record every flip with result and timestamp.",
      "Calculate total flips, heads count, tails count, and current streak from history.",
    ],
    runtimeSpec: {
      kind: "randomizer",
      primaryVisual: "coin",
      state: { result: "Ready", history: [], isAnimating: false },
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
    },
    entities: [
      {
        name: "coin_flips",
        label: "Coin Flips",
        fields: [
          { name: "result", type: "string", required: true, enumValues: ["Heads", "Tails"] },
          { name: "flippedAt", type: "date", required: true },
          { name: "mode", type: "string" },
        ],
      },
    ],
  };
}

function buildGenericGeneratedModule(prompt: string): FunctionalModule | null {
  const title = titleFromPrompt(prompt);
  if (!prompt.trim() || !title) return null;
  const entity = entityNameFromLabel(title);

  return {
    id: `generated-${slugify(title)}`,
    type: "generatedModule",
    label: title,
    description: prompt,
    page: title,
    path: "/",
    dataSource: { entity },
    capabilities: ["run", "save-result", "reset"],
    apiRoutes: [`GET /api/${slugify(entity)}`, `POST /api/${slugify(entity)}`],
    businessLogic: [`Implement the requested ${title.toLowerCase()} behavior from the prompt instead of using a generic CRUD surface.`],
    runtimeSpec: {
      kind: "custom",
      primaryVisual: "card",
      state: { result: "Ready", history: [] },
      controls: [
        { id: "run", label: "Run", action: "append" },
        { id: "reset", label: "Reset", action: "reset" },
      ],
      metrics: [{ id: "history", label: "Runs", source: "history.length" }],
    },
    entities: [
      {
        name: entity,
        label: title,
        fields: [
          { name: "result", type: "string", required: true },
          { name: "createdAt", type: "date", required: true },
        ],
      },
    ],
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "module";
}

function entityNameFromLabel(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return slug.endsWith("s") ? slug : `${slug || "items"}s`;
}

function uniqueBy<T>(values: T[], key: (value: T) => string) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const id = key(value);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function catalogModule(id: string) {
  const found = domainModuleCatalog.find((module) => module.id === id);
  if (!found) return null;
  return {
    ...found,
    capabilities: [...found.capabilities],
    apiRoutes: [...found.apiRoutes],
    businessLogic: [...found.businessLogic],
    runtimeSpec: found.runtimeSpec ? { ...found.runtimeSpec } : undefined,
    sourceFiles: found.sourceFiles ? [...found.sourceFiles] : undefined,
    entities: found.entities?.map((entity) => ({ ...entity, fields: entity.fields.map((field) => ({ ...field })) })),
  };
}

function normalizeFunctionalModule(value: any, offset = 0): FunctionalModule | null {
  if (!value) return null;
  if (typeof value === "string") return catalogModule(value) || null;

  const catalogMatch =
    catalogModule(value.id) ||
    domainModuleCatalog.find((module) => module.type === value.type || module.label.toLowerCase() === String(value.label || "").toLowerCase());

  if (catalogMatch) {
    return {
      ...catalogMatch,
      ...value,
      id: value.id || catalogMatch.id,
      type: value.type || catalogMatch.type,
      label: value.label || catalogMatch.label,
      description: value.description || catalogMatch.description,
      page: value.page || catalogMatch.page,
      path: value.path || catalogMatch.path,
      dataSource: value.dataSource || catalogMatch.dataSource,
      capabilities: uniqueBy([...(value.capabilities || []), ...catalogMatch.capabilities], String),
      apiRoutes: uniqueBy([...(value.apiRoutes || []), ...catalogMatch.apiRoutes], String),
      businessLogic: uniqueBy([...(value.businessLogic || []), ...catalogMatch.businessLogic], String),
      runtimeSpec: value.runtimeSpec || catalogMatch.runtimeSpec,
      sourceFiles: Array.isArray(value.sourceFiles) ? value.sourceFiles : catalogMatch.sourceFiles,
      entities: uniqueBy([...(value.entities || []), ...(catalogMatch.entities || [])], (entity: DomainEntity) => entity.name),
    };
  }

  const label = String(value.label || value.name || value.type || `Feature ${offset + 1}`);
  const entity = value.dataSource?.entity || entityNameFromLabel(label);
  const knownTypes = new Set(["domainModule", "generatedModule", ...domainModuleCatalog.map((module) => module.type)]);
  const requestedType = String(value.type || "");
  const type = value.runtimeSpec || (requestedType && !knownTypes.has(requestedType)) ? "generatedModule" : requestedType || "domainModule";

  return {
    id: value.id || `domain-${slugify(label)}`,
    type,
    label,
    description: value.description || "Interactive domain module generated from the app prompt.",
    page: value.page || label,
    path: value.path || `/${slugify(label)}`,
    dataSource: { entity },
    variant: value.variant,
    capabilities: Array.isArray(value.capabilities) && value.capabilities.length ? value.capabilities : ["create", "update", "run-action"],
    apiRoutes: Array.isArray(value.apiRoutes) && value.apiRoutes.length ? value.apiRoutes : [`GET /api/${slugify(entity)}`, `POST /api/${slugify(entity)}`],
    businessLogic:
      Array.isArray(value.businessLogic) && value.businessLogic.length
        ? value.businessLogic
        : [`Validate and persist ${label.toLowerCase()} interactions.`],
    runtimeSpec: value.runtimeSpec,
    sourceFiles: Array.isArray(value.sourceFiles) ? value.sourceFiles : undefined,
    entities:
      Array.isArray(value.entities) && value.entities.length
        ? value.entities
        : [
            {
              name: entity,
              label,
              fields: [
                { name: "title", type: "string", required: true },
                { name: "status", type: "string", required: true, enumValues: ["Draft", "Active", "Done"] },
                { name: "owner", type: "string" },
                { name: "updatedAt", type: "date" },
              ],
            },
          ],
  };
}

function detectFunctionalModules(config: any, prompt: string, features: CustomFeature[]) {
  const searchable = [
    prompt,
    config?.app?.name,
    config?.app?.description,
    ...(Array.isArray(config?.pages) ? config.pages.map((page: any) => `${page.name} ${page.components?.map((component: any) => `${component.type} ${component.label || ""} ${component.description || ""}`).join(" ")}`) : []),
    ...features.map((feature) => `${feature.name} ${feature.type} ${feature.description}`),
  ]
    .filter(Boolean)
    .join(" ");

  const detectedIds = new Set<string>();
  domainDetectors.forEach((detector) => {
    if (detector.patterns.some((pattern) => pattern.test(searchable))) {
      detector.moduleIds.forEach((id) => detectedIds.add(id));
    }
  });

  if (detectedIds.size > 0) {
    detectedIds.add("settings-panel");
  }

  const generatedPromptModules: FunctionalModule[] = [];
  if (isCoinTossPrompt(searchable)) {
    generatedPromptModules.push(buildCoinTossModule(prompt));
    ["analog-clock", "digital-clock", "watch-face-picker", "world-clock"].forEach((id) => detectedIds.delete(id));
  }

  const aiModules = [
    ...(Array.isArray(config?.functionalModules) ? config.functionalModules : []),
    ...(Array.isArray(config?.studio?.functionalModules) ? config.studio.functionalModules : []),
  ]
    .map((module, index) => normalizeFunctionalModule(module, index))
    .filter(Boolean) as FunctionalModule[];

  const hasSpecificRuntime = generatedPromptModules.length > 0 || aiModules.some((module) => module.type === "generatedModule" || module.runtimeSpec) || detectedIds.size > 0;
  const genericGeneratedModule = !hasSpecificRuntime ? buildGenericGeneratedModule(prompt) : null;

  const featureModules = features
    .filter((feature) => feature.type === "component" || feature.type === "page")
    .map((feature) =>
      normalizeFunctionalModule(
        {
          id: `feature-${slugify(feature.name)}`,
          type: "domainModule",
          label: feature.name,
          description: feature.description,
          page: feature.name,
          path: `/${slugify(feature.name)}`,
          capabilities: ["create", "update", "run-action"],
        },
        feature.name.length,
      ),
    )
    .filter(Boolean) as FunctionalModule[];

  const detectedModules = Array.from(detectedIds)
    .map((id) => catalogModule(id))
    .filter(Boolean) as FunctionalModule[];

  return uniqueBy(
    [...generatedPromptModules, ...(genericGeneratedModule ? [genericGeneratedModule] : []), ...aiModules, ...detectedModules, ...featureModules],
    (module) => module.id,
  );
}

function mergeEntities(baseEntities: DomainEntity[], functionalModules: FunctionalModule[]) {
  const moduleEntities = functionalModules.flatMap((module) => module.entities || []);
  return uniqueBy([...baseEntities, ...moduleEntities], (entity) => entity.name);
}

function modulePages(functionalModules: FunctionalModule[], visualSeed: string) {
  const grouped = functionalModules.reduce<Record<string, any>>((acc, module, index) => {
    const path = module.path || `/${slugify(module.page || module.label)}`;
    if (!acc[path]) {
      acc[path] = { name: module.page || module.label, path, components: [] };
    }
    acc[path].components.push({
      type: module.type,
      label: module.label,
      description: module.description,
      variant: module.variant || variantFor(module.type, visualSeed, index),
      dataSource: module.dataSource,
      moduleId: module.id,
      capabilities: module.capabilities,
      runtimeSpec: module.runtimeSpec,
      behavior: {
        stateful: true,
        actions: module.capabilities,
      },
    });
    return acc;
  }, {});

  return Object.values(grouped);
}

function mergePages(pages: any[]) {
  const byPath = new Map<string, any>();
  pages.forEach((page) => {
    const path = page?.path || `/${slugify(page?.name || "page")}`;
    const components = Array.isArray(page?.components) ? page.components : [];
    const existing = byPath.get(path);
    if (!existing) {
      byPath.set(path, { ...page, path, components: [...components] });
      return;
    }

    existing.components = uniqueBy([...existing.components, ...components], (component: any) => `${component.type}-${component.label || ""}-${component.moduleId || ""}`);
    if (!existing.name && page.name) existing.name = page.name;
  });
  return Array.from(byPath.values());
}

function sanitizeBasePages(pages: any[], prompt: string) {
  const clockTypes = new Set(["analogClock", "digitalClock", "watchFacePicker", "worldClock"]);
  const coinPrompt = isCoinTossPrompt(prompt);

  return pages
    .map((page) => ({
      ...page,
      components: Array.isArray(page.components)
        ? page.components.filter((component: any) => !(coinPrompt && clockTypes.has(component.type)))
        : [],
    }))
    .filter((page) => page.components.length > 0);
}

function sourceFilesForConfig(config: any, functionalModules: FunctionalModule[]) {
  return uniqueBy(
    [
      ...(Array.isArray(config?.sourceFiles) ? config.sourceFiles : []),
      ...(Array.isArray(config?.studio?.sourceFiles) ? config.studio.sourceFiles : []),
      ...(Array.isArray(config?.backendRuntime?.generatedCode) ? config.backendRuntime.generatedCode : []),
      ...functionalModules.flatMap((module) => module.sourceFiles || []),
    ],
    (file: SourceFile) => file.path,
  );
}

function backendSpec(base: any, functionalModules: FunctionalModule[], entities: DomainEntity[]) {
  const existingRoutes = Array.isArray(base.backend?.apiRoutes)
    ? base.backend.apiRoutes.map((route: any) => (typeof route === "string" ? route : `${route.method || "GET"} ${route.path || "/"}`))
    : [];
  const moduleRoutes = functionalModules.flatMap((module) => module.apiRoutes || []);
  const routeObjects = uniqueBy([...existingRoutes, ...moduleRoutes], String).map((route) => {
    const [method, ...pathParts] = String(route).split(" ");
    return {
      method: method || "GET",
      path: pathParts.join(" ") || "/api/runtime",
      purpose: "Runtime endpoint required by generated interactive modules.",
    };
  });

  return {
    ...base.backend,
    auth: {
      enabled: true,
      roles: ["admin", "member", "viewer"],
      policies: ["Generated apps require signed-in users for data mutation routes.", ...(base.backend?.auth?.policies || [])],
      ...(base.backend?.auth || {}),
    },
    apiRoutes: routeObjects,
    dataModels: uniqueBy(
      [
        ...(Array.isArray(base.backend?.dataModels) ? base.backend.dataModels : []),
        ...entities.map((entity) => ({ name: entity.name, purpose: `${entity.label || entity.name} persistence model.` })),
      ],
      (model: any) => model.name,
    ),
    businessLogic: uniqueBy(
      [
        ...(Array.isArray(base.backend?.businessLogic) ? base.backend.businessLogic : []),
        ...functionalModules.flatMap((module) => module.businessLogic || []),
      ],
      String,
    ),
  };
}

function titleFromPrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return "Untitled App";
  const firstSentence = trimmed.split(/[.!?]/)[0] || trimmed;
  return firstSentence
    .replace(/^(build|create|make|generate)\s+/i, "")
    .split(/\s+/)
    .slice(0, 5)
    .join(" ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function getPrimaryEntity(config: any) {
  const entity = Array.isArray(config.entities) && config.entities.length > 0 ? config.entities[0] : null;
  return entity?.name || "items";
}

function ensureBaseConfig(config: any, prompt: string) {
  const appName = config?.app?.name || titleFromPrompt(prompt);
  const entityName = appName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "items";

  return {
    version: "1.0",
    app: {
      name: appName,
      description: config?.app?.description || prompt || "Custom application built with MetaForge Studio",
    },
    entities:
      Array.isArray(config?.entities) && config.entities.length > 0
        ? config.entities
        : [
            {
              name: entityName.endsWith("s") ? entityName : `${entityName}s`,
              label: appName,
              fields: [
                { name: "title", type: "string", required: true },
                { name: "status", type: "string", required: true },
                { name: "owner", type: "string" },
                { name: "createdAt", type: "date" },
              ],
            },
          ],
    pages: Array.isArray(config?.pages) ? config.pages : [],
    workflows: Array.isArray(config?.workflows) ? config.workflows : [],
    functionalModules: Array.isArray(config?.functionalModules) ? config.functionalModules : [],
    sourceFiles: Array.isArray(config?.sourceFiles) ? config.sourceFiles : [],
    backend: config?.backend || {},
    databaseArchitecture: config?.databaseArchitecture || {
      provider: "postgresql",
      models: [],
      migrations: [],
    },
    backendRuntime: config?.backendRuntime || {
      services: [],
      apiRoutes: [],
      authz: ["Signed-in users can access their generated app data."],
      validation: [],
      jobs: [],
      generatedCode: [],
    },
    frontendRenderEngine: config?.frontendRenderEngine || {
      strategy: "Render domain-native interactive modules from generated page and runtime metadata.",
      routes: [],
      interactiveModules: [],
      states: ["loading", "empty", "error", "success"],
      motion: [],
    },
    workflowAutomation: config?.workflowAutomation || {
      triggers: [],
      actions: ["send_notification", "send_email", "update_record", "call_webhook"],
      retries: "Retry failed workflow actions with bounded backoff.",
      notifications: ["Notify users in-app and by email for deploys, exports, and workflow events."],
    },
    i18n: config?.i18n || {
      defaultLocale: "en",
      supportedLocales: ["en"],
      namespaces: ["common", "app"],
      messages: {
        en: {
          "app.title": appName,
          "app.description": config?.app?.description || prompt || "Custom application built with MetaForge Studio",
        },
      },
    },
    auth: config?.auth || { enabled: true, providers: [{ type: "email", enabled: true }] },
    theme: config?.theme || { primary: "#2563eb", colorMode: "dark" },
    studio: config?.studio || {},
  };
}

function enrichConfig(config: any, prompt: string, selectedComponents: string[], features: CustomFeature[], visualDirection: string) {
  const base = ensureBaseConfig(config, prompt);
  const functionalModules = detectFunctionalModules(base, prompt, features);
  const entities = mergeEntities(base.entities, functionalModules);
  const primaryEntity = getPrimaryEntity({ ...base, entities });
  const selectedDefinitions = componentCatalog.filter((item) => selectedComponents.includes(item.id));
  const featureComponentTypes = features.map((feature) => {
    if (feature.type === "component") return "custom";
    if (feature.type === "page") return "list";
    return feature.type;
  });
  const componentTypes = [
    ...selectedDefinitions.map((item) => item.type),
    ...featureComponentTypes,
    ...functionalModules.map((module) => module.type),
    ...base.pages.flatMap((page: any) => (Array.isArray(page.components) ? page.components.map((component: any) => component.type) : [])),
  ].filter(Boolean);
  const visualDesign = createVisualDesign({
    prompt: `${prompt}\n${visualDirection}`,
    appName: base.app.name,
    componentTypes,
    aiVisual: config?.visualDesign || config?.studio?.visualDesign || null,
  });

  const generatedPages = selectedDefinitions.map((item, index) => ({
    name: item.id === "dashboard" ? pageNameFor(item.id, visualDesign.seed, index) : pageNameFor(item.id, visualDesign.seed, index + 2),
    path: item.id === "dashboard" ? "/" : `/${item.id}`,
    components:
      item.id === "dashboard"
        ? [
            { type: "stat", label: "Live Signals", variant: variantFor("stat", visualDesign.seed, index), dataSource: { entity: primaryEntity } },
            { type: "chart", label: "Activity", variant: variantFor("chart", visualDesign.seed, index + 1), dataSource: { entity: primaryEntity } },
          ]
        : [{ type: item.type, label: item.label, variant: variantFor(item.type, visualDesign.seed, index), dataSource: { entity: primaryEntity } }],
  }));

  const functionalPages = modulePages(functionalModules, visualDesign.seed);
  const sanitizedBasePages = sanitizeBasePages(base.pages, prompt);

  const featureWorkflows = features
    .filter((feature) => feature.type === "workflow" || feature.type === "integration")
    .map((feature) => ({
      id: feature.id,
      name: feature.name,
      enabled: true,
      trigger: { type: "manual", entity: primaryEntity },
      conditions: [],
      actions: [
        {
          type: feature.type,
          name: feature.name,
          config: { description: feature.description },
        },
      ],
      errorHandling: { onFailure: "continue" },
    }));
  const backend = backendSpec(base, functionalModules, entities);
  const sourceFiles = sourceFilesForConfig(base, functionalModules);
  const databaseArchitecture = {
    ...base.databaseArchitecture,
    models: uniqueBy(
      [
        ...(Array.isArray(base.databaseArchitecture?.models) ? base.databaseArchitecture.models : []),
        ...entities.map((entity) => ({
          name: entity.name,
          purpose: `${entity.label || entity.name} persistence model.`,
          relations: [],
          indexes: ["id", "createdAt"],
          constraints: (entity.fields || []).filter((field) => field.required).map((field) => `${field.name} is required`),
        })),
      ],
      (model: any) => model.name,
    ),
  };
  const backendRuntime = {
    ...base.backendRuntime,
    apiRoutes: uniqueBy(
      [
        ...(Array.isArray(base.backendRuntime?.apiRoutes) ? base.backendRuntime.apiRoutes : []),
        ...backend.apiRoutes.map((route: any) => `${route.method} ${route.path}`),
      ],
      String,
    ),
    services: uniqueBy(
      [
        ...(Array.isArray(base.backendRuntime?.services) ? base.backendRuntime.services : []),
        ...functionalModules.map((module) => `${module.label} runtime service`),
      ],
      String,
    ),
    generatedCode: sourceFiles.filter((file) => file.path.includes("/api/") || file.path.includes("/server/")),
  };
  const frontendRenderEngine = {
    ...base.frontendRenderEngine,
    routes: uniqueBy(
      [
        ...(Array.isArray(base.frontendRenderEngine?.routes) ? base.frontendRenderEngine.routes : []),
        ...mergePages([...functionalPages, ...sanitizedBasePages, ...generatedPages]).map((page: any) => `${page.path} - ${page.name}`),
      ],
      String,
    ),
    interactiveModules: uniqueBy(
      [
        ...(Array.isArray(base.frontendRenderEngine?.interactiveModules) ? base.frontendRenderEngine.interactiveModules : []),
        ...functionalModules.map((module) => module.label),
      ],
      String,
    ),
    motion: uniqueBy([...(Array.isArray(base.frontendRenderEngine?.motion) ? base.frontendRenderEngine.motion : []), visualDesign.motion], String),
  };
  const workflowAutomation = {
    ...base.workflowAutomation,
    actions: uniqueBy(
      [
        ...(Array.isArray(base.workflowAutomation?.actions) ? base.workflowAutomation.actions : []),
        "send_notification",
        "send_email",
        ...featureWorkflows.flatMap((workflow) => workflow.actions.map((action) => action.type)),
      ],
      String,
    ),
    notifications: uniqueBy(
      [
        ...(Array.isArray(base.workflowAutomation?.notifications) ? base.workflowAutomation.notifications : []),
        "Send in-app and email notifications when apps are created, deployed, exported, or when workflows fire.",
      ],
      String,
    ),
  };
  return {
    ...base,
    entities,
    pages: mergePages([...functionalPages, ...sanitizedBasePages, ...generatedPages]),
    workflows: [...base.workflows, ...featureWorkflows],
    functionalModules,
    sourceFiles,
    backend,
    auth: {
      ...base.auth,
      enabled: true,
      roles: backend.auth.roles,
    },
    studio: {
      ...base.studio,
      prompt,
      visualDirection,
      selectedComponents,
      customFeatures: features,
      functionalModules,
      sourceFiles,
      visualDesign,
    },
    visualDesign,
    databaseArchitecture,
    backendRuntime,
    frontendRenderEngine,
    workflowAutomation,
    i18n: base.i18n,
  };
}

export default function NewAppWizard() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [selectedComponents, setSelectedComponents] = useState<string[]>(["dashboard", "table", "form"]);
  const [features, setFeatures] = useState<CustomFeature[]>([]);
  const [visualDirection, setVisualDirection] = useState(visualDirections[0].prompt);
  const [featureDraft, setFeatureDraft] = useState<CustomFeature>({
    id: "",
    name: "",
    type: "page",
    description: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSummary = useMemo(
    () => componentCatalog.filter((item) => selectedComponents.includes(item.id)).map((item) => item.label),
    [selectedComponents],
  );

  function toggleComponent(componentId: string) {
    setSelectedComponents((current) =>
      current.includes(componentId) ? current.filter((item) => item !== componentId) : [...current, componentId],
    );
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setPrompt(template.prompt);
    setSelectedComponents(template.components);
  }

  function addFeature() {
    if (!featureDraft.name.trim() || !featureDraft.description.trim()) return;
    setFeatures((current) => [
      ...current,
      {
        ...featureDraft,
        id: `feature-${Date.now()}`,
        name: featureDraft.name.trim(),
        description: featureDraft.description.trim(),
      },
    ]);
    setFeatureDraft({ id: "", name: "", type: "page", description: "" });
  }

  async function generateWithAI() {
    if (!prompt.trim()) return null;

    const enrichedPrompt = [
      prompt,
      "Generate domain-aware functional modules, backend/API/auth metadata, data models, runtime behaviors, and sourceFiles with real React/API code. Do not represent requested features as generic CRUD cards or unrelated known components.",
      "Include databaseArchitecture, backendRuntime, frontendRenderEngine, workflowAutomation, notifications/email expectations, and i18n with supported locales and translation messages.",
      visualDirection ? `Visual direction: ${visualDirection}` : "",
      selectedSummary.length ? `Use these UI/UX components: ${selectedSummary.join(", ")}.` : "",
      features.length
        ? `Include these custom no-code features: ${features.map((feature) => `${feature.name} (${feature.type}): ${feature.description}`).join("; ")}.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(apiUrl("/generate/app"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: enrichedPrompt }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.error || "AI generation failed.");
    }
    return json.data;
  }

  async function handleCreateApp() {
    if (!prompt.trim() && features.length === 0 && selectedComponents.length === 0) {
      setError("Describe the app, choose components, or add a custom feature.");
      return;
    }

    setIsGenerating(true);
    setWarning(null);
    setError(null);

    try {
      let generatedConfig = null;
      try {
        generatedConfig = await generateWithAI();
      } catch (err) {
        setWarning(err instanceof Error ? `AI was unavailable, so MetaForge created a structured draft instead: ${err.message}` : "AI was unavailable, so MetaForge created a structured draft instead.");
      }

      const config = enrichConfig(generatedConfig, prompt, selectedComponents, features, visualDirection);
      const createRes = await fetch(apiUrl("/apps"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ config }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        throw new Error(createJson.error?.message || "Failed to save app.");
      }

      router.push(`/studio/apps/${createJson.data.id}/config`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create app.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
            Build Application
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Create a no-code app</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Combine AI architecture, prebuilt UI/UX components, and custom features that are saved directly into the app config.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateApp}
          disabled={isGenerating}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {isGenerating ? "Creating App..." : "Generate and Save App"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#101827] p-6 shadow-lg shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Prompt</h2>
                <p className="mt-1 text-sm text-slate-500">Describe entities, pages, roles, automations, and business rules.</p>
              </div>
              <div className="hidden gap-2 sm:flex">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-blue-500 hover:text-white"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={8}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: A field service app with clients, technicians, jobs, schedules, invoices, role-based access, and automated reminders before appointments."
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={isGenerating}
            />
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#101827] p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-bold text-white">Prebuilt UI/UX Components</h2>
            <p className="mt-1 text-sm text-slate-500">These become real page components in the generated config.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {componentCatalog.map((component) => {
                const active = selectedComponents.includes(component.id);
                return (
                  <button
                    key={component.id}
                    type="button"
                    onClick={() => toggleComponent(component.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      active
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white">{component.label}</div>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{component.description}</p>
                      </div>
                      <span className={`mt-1 h-4 w-4 rounded border ${active ? "border-blue-400 bg-blue-500" : "border-slate-600"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#101827] p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-bold text-white">Visual Direction</h2>
            <p className="mt-1 text-sm text-slate-500">This steers the generated palette, typography, motion, layout, and component variants.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
              {visualDirections.map((direction) => {
                const active = visualDirection === direction.prompt;
                return (
                  <button
                    key={direction.id}
                    type="button"
                    onClick={() => setVisualDirection(direction.prompt)}
                    className={`rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-fuchsia-400/60 bg-fuchsia-500/10 text-white"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    <span className="text-sm font-bold">{direction.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#101827] p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-bold text-white">Custom Feature Builder</h2>
            <p className="mt-1 text-sm text-slate-500">Add pages, components, workflows, and integrations without writing code.</p>

            <div className="mt-5 space-y-3">
              <input
                value={featureDraft.name}
                onChange={(event) => setFeatureDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Feature name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
              <select
                value={featureDraft.type}
                onChange={(event) => setFeatureDraft((current) => ({ ...current, type: event.target.value as CustomFeature["type"] }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              >
                <option value="page">Page</option>
                <option value="component">UI component</option>
                <option value="workflow">Workflow</option>
                <option value="integration">Integration</option>
              </select>
              <textarea
                rows={4}
                value={featureDraft.description}
                onChange={(event) => setFeatureDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="What should this feature do?"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
              >
                Add Feature
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#101827] p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-bold text-white">Build Summary</h2>
            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Components</div>
                <div className="flex flex-wrap gap-2">
                  {selectedSummary.map((item) => (
                    <span key={item} className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Custom Features</div>
                {features.length === 0 ? (
                  <p className="text-sm text-slate-500">No custom features added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {features.map((feature) => (
                      <div key={feature.id} className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-white">{feature.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{feature.type}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFeatures((current) => current.filter((item) => item.id !== feature.id))}
                            className="text-xs font-bold text-slate-500 transition hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-slate-400">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(warning || error) && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-rose-900/70 bg-rose-950/30 text-rose-200" : "border-amber-900/70 bg-amber-950/30 text-amber-200"}`}>
              {error || warning}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
