export type ThemeName = "dark" | "light" | "midnight";

export interface ColorSet {
  // Accent (sabit)
  accent:       string;
  indigo:       string;
  gold:         string;
  goldBg:       string;
  goldBorder:   string;
  success:      string;
  error:        string;
  warning:      string;

  // Arxa fon
  bg:           string;
  bgGrad:       [string, string];
  bgCard:       string;

  // Mətn
  text:         string;
  muted:        string;
  dimmed:       string;

  // Sərhəd
  border:       string;
  borderAccent: string;

  // Tab bar
  tabBg:        string;
  tabBorder:    string;
}

const ACCENT = {
  accent:      "#4b8eef",
  indigo:      "#818cf8",
  gold:        "#fbbf24",
  goldBg:      "rgba(251,191,36,0.10)",
  goldBorder:  "rgba(251,191,36,0.22)",
  success:     "#34d399",
  error:       "rgba(252,165,165,0.90)",
  warning:     "#fbbf24",
};

export const THEMES: Record<ThemeName, ColorSet> = {
  dark: {
    ...ACCENT,
    bg:           "#080d22",
    bgGrad:       ["#0a0f28", "#080d22"],
    bgCard:       "rgba(13,21,53,0.85)",
    text:         "rgba(238,242,255,0.92)",
    muted:        "rgba(255,255,255,0.50)",
    dimmed:       "rgba(255,255,255,0.28)",
    border:       "rgba(255,255,255,0.09)",
    borderAccent: "rgba(75,142,239,0.22)",
    tabBg:        "rgba(8,13,34,0.97)",
    tabBorder:    "rgba(75,142,239,0.18)",
  },
  midnight: {
    ...ACCENT,
    bg:           "#000000",
    bgGrad:       ["#0a0a0a", "#000000"],
    bgCard:       "rgba(14,14,14,0.95)",
    text:         "rgba(238,242,255,0.95)",
    muted:        "rgba(255,255,255,0.45)",
    dimmed:       "rgba(255,255,255,0.22)",
    border:       "rgba(255,255,255,0.07)",
    borderAccent: "rgba(75,142,239,0.20)",
    tabBg:        "rgba(0,0,0,0.98)",
    tabBorder:    "rgba(75,142,239,0.15)",
  },
  light: {
    ...ACCENT,
    bg:           "#eef2ff",
    bgGrad:       ["#dce7ff", "#eef2ff"],
    bgCard:       "rgba(255,255,255,0.88)",
    text:         "#0a0f28",
    muted:        "rgba(10,15,40,0.55)",
    dimmed:       "rgba(10,15,40,0.35)",
    border:       "rgba(10,15,40,0.10)",
    borderAccent: "rgba(75,142,239,0.30)",
    tabBg:        "rgba(238,242,255,0.97)",
    tabBorder:    "rgba(75,142,239,0.22)",
  },
};

// Default export — geriyə uyğunluq üçün (static Colors istifadəsi olan yerlər üçün)
export const Colors = THEMES.dark;

export const Glass = {
  background: "rgba(8,13,34,0.88)",
  border:     "rgba(75,142,239,0.16)",
  shadow:     "rgba(0,0,0,0.5)",
} as const;
