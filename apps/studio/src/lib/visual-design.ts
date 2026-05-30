export type VisualPalette = {
  name: string;
  background: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
};

export type VisualDesign = {
  seed: string;
  style: string;
  layout: "sidebar" | "topbar" | "split";
  density: "compact" | "balanced" | "spacious";
  radius: number;
  glass: number;
  motion: "float" | "slide" | "bloom" | "drift";
  typography: {
    heading: string;
    body: string;
    scale: "editorial" | "product" | "technical";
  };
  palette: VisualPalette;
  componentSkins: Record<string, string>;
};

const palettes: VisualPalette[] = [
  {
    name: "aurora graphite",
    background: "#07111f",
    surface: "rgba(15, 23, 42, 0.62)",
    surfaceStrong: "rgba(15, 23, 42, 0.88)",
    text: "#f8fafc",
    muted: "#9fb1c7",
    primary: "#38bdf8",
    secondary: "#a78bfa",
    accent: "#34d399",
    glow: "rgba(56, 189, 248, 0.28)",
  },
  {
    name: "citrus ink",
    background: "#11130f",
    surface: "rgba(30, 41, 25, 0.58)",
    surfaceStrong: "rgba(25, 31, 22, 0.9)",
    text: "#fbf7ed",
    muted: "#beb8a6",
    primary: "#f7c948",
    secondary: "#5eead4",
    accent: "#fb7185",
    glow: "rgba(247, 201, 72, 0.28)",
  },
  {
    name: "studio noir",
    background: "#08070d",
    surface: "rgba(26, 22, 39, 0.64)",
    surfaceStrong: "rgba(19, 17, 28, 0.9)",
    text: "#f7f2ff",
    muted: "#b7acc9",
    primary: "#e879f9",
    secondary: "#60a5fa",
    accent: "#f97316",
    glow: "rgba(232, 121, 249, 0.25)",
  },
  {
    name: "mint steel",
    background: "#061716",
    surface: "rgba(10, 34, 34, 0.62)",
    surfaceStrong: "rgba(8, 29, 30, 0.9)",
    text: "#f3fffb",
    muted: "#98b8b5",
    primary: "#2dd4bf",
    secondary: "#f59e0b",
    accent: "#93c5fd",
    glow: "rgba(45, 212, 191, 0.25)",
  },
  {
    name: "ruby frost",
    background: "#130914",
    surface: "rgba(42, 20, 44, 0.6)",
    surfaceStrong: "rgba(35, 16, 38, 0.9)",
    text: "#fff6fb",
    muted: "#d9b8c9",
    primary: "#fb7185",
    secondary: "#c084fc",
    accent: "#22d3ee",
    glow: "rgba(251, 113, 133, 0.24)",
  },
  {
    name: "paper electric",
    background: "#f3f0e8",
    surface: "rgba(255, 255, 255, 0.68)",
    surfaceStrong: "rgba(255, 255, 255, 0.92)",
    text: "#171717",
    muted: "#5f665f",
    primary: "#2563eb",
    secondary: "#16a34a",
    accent: "#dc2626",
    glow: "rgba(37, 99, 235, 0.18)",
  },
];

const headingFonts = [
  '"Inter", "Geist", system-ui, sans-serif',
  '"Space Grotesk", "Inter", system-ui, sans-serif',
  'Georgia, "Times New Roman", serif',
  '"Trebuchet MS", "Inter", system-ui, sans-serif',
  '"Arial Black", "Inter", system-ui, sans-serif',
];

const bodyFonts = [
  '"Inter", "Geist", system-ui, sans-serif',
  '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  '"Aptos", "Segoe UI", system-ui, sans-serif',
  '"Courier New", ui-monospace, monospace',
];

const styles = ["liquid glass", "editorial prism", "kinetic ops", "soft brutal", "luminous console"];
const layouts: VisualDesign["layout"][] = ["sidebar", "topbar", "split"];
const densities: VisualDesign["density"][] = ["compact", "balanced", "spacious"];
const motions: VisualDesign["motion"][] = ["float", "slide", "bloom", "drift"];
const scales: VisualDesign["typography"]["scale"][] = ["editorial", "product", "technical"];
const skins = ["glass", "outline", "filled", "split", "stacked"];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

export function createVisualDesign(input: {
  prompt: string;
  appName: string;
  componentTypes: string[];
  aiVisual?: Partial<VisualDesign> | null;
}) {
  const randomSeed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const seed = hashString(`${input.prompt}-${input.appName}-${randomSeed}`);
  const componentSkins = input.componentTypes.reduce<Record<string, string>>((acc, type, index) => {
    acc[type] = pick(skins, seed, index * 3);
    return acc;
  }, {});

  return normalizeVisualDesign({
    seed: String(seed),
    style: input.aiVisual?.style || pick(styles, seed, 1),
    layout: input.aiVisual?.layout || pick(layouts, seed, 2),
    density: input.aiVisual?.density || pick(densities, seed, 3),
    radius: input.aiVisual?.radius || pick([10, 14, 18, 24, 30], seed, 4),
    glass: input.aiVisual?.glass || pick([0.42, 0.52, 0.62, 0.72], seed, 5),
    motion: input.aiVisual?.motion || pick(motions, seed, 6),
    typography: {
      heading: input.aiVisual?.typography?.heading || pick(headingFonts, seed, 7),
      body: input.aiVisual?.typography?.body || pick(bodyFonts, seed, 8),
      scale: input.aiVisual?.typography?.scale || pick(scales, seed, 9),
    },
    palette: input.aiVisual?.palette || pick(palettes, seed, 10),
    componentSkins: {
      ...componentSkins,
      ...(input.aiVisual?.componentSkins || {}),
    },
  });
}

export function normalizeVisualDesign(value: Partial<VisualDesign> | null | undefined, fallbackKey = "metaforge") {
  const seed = hashString(value?.seed || fallbackKey);
  const palette = value?.palette || pick(palettes, seed, 1);

  return {
    seed: value?.seed || String(seed),
    style: value?.style || pick(styles, seed, 2),
    layout: value?.layout || pick(layouts, seed, 3),
    density: value?.density || pick(densities, seed, 4),
    radius: value?.radius || pick([10, 14, 18, 24, 30], seed, 5),
    glass: value?.glass || pick([0.42, 0.52, 0.62, 0.72], seed, 6),
    motion: value?.motion || pick(motions, seed, 7),
    typography: {
      heading: value?.typography?.heading || pick(headingFonts, seed, 8),
      body: value?.typography?.body || pick(bodyFonts, seed, 9),
      scale: value?.typography?.scale || pick(scales, seed, 10),
    },
    palette,
    componentSkins: value?.componentSkins || {},
  } satisfies VisualDesign;
}
