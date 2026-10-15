import type { CSSProperties } from "react";

// Professional SaaS color presets. Applied via `data-color-theme`
// (see globals.css). "aether" is the default and needs no attribute.
export type ColorThemeId = "aether" | "emerald" | "violet";

export const COLOR_THEMES: Array<{
  id: ColorThemeId;
  name: string;
  swatch: string;
}> = [
  { id: "aether", name: "Aether Blue", swatch: "#377ff6" },
  { id: "emerald", name: "Emerald", swatch: "#10b981" },
  { id: "violet", name: "Violet", swatch: "#7c5cf6" },
];

export const DEFAULT_COLOR_THEME: ColorThemeId = "aether";

// Chat background patterns for the widget (inline styles — no assets needed).
export type ChatBackgroundId =
  | "default"
  | "dots"
  | "grid"
  | "lines"
  | "aurora"
  | "sunset";

export const CHAT_BACKGROUNDS: Array<{
  id: ChatBackgroundId;
  name: string;
  style: CSSProperties;
}> = [
  { id: "default", name: "Default", style: {} },
  {
    id: "dots",
    name: "Dots",
    style: {
      backgroundImage: "radial-gradient(rgba(120,120,150,0.25) 1px, transparent 1px)",
      backgroundSize: "16px 16px",
    },
  },
  {
    id: "grid",
    name: "Grid",
    style: {
      backgroundImage:
        "linear-gradient(rgba(120,120,150,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(120,120,150,0.18) 1px, transparent 1px)",
      backgroundSize: "22px 22px",
    },
  },
  {
    id: "lines",
    name: "Diagonal",
    style: {
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(120,120,150,0.12) 0, rgba(120,120,150,0.12) 1px, transparent 1px, transparent 10px)",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    style: {
      backgroundImage:
        "radial-gradient(at 15% 20%, rgba(55,127,246,0.14), transparent 55%), radial-gradient(at 85% 80%, rgba(124,92,246,0.14), transparent 55%)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    style: {
      backgroundImage:
        "linear-gradient(180deg, rgba(249,115,22,0.08), transparent 60%), radial-gradient(at 50% 0%, rgba(236,72,153,0.12), transparent 55%)",
    },
  },
];

export const DEFAULT_CHAT_BACKGROUND: ChatBackgroundId = "default";

export function getChatBackgroundStyle(id: string | undefined): CSSProperties {
  return CHAT_BACKGROUNDS.find((b) => b.id === id)?.style ?? {};
}
