"use client";

import { DEFAULT_COLOR_THEME, type ColorThemeId } from "@workspace/ui/lib/appearance";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "aetherlive-color-theme";

function applyTheme(theme: ColorThemeId) {
  const root = document.documentElement;
  if (theme === DEFAULT_COLOR_THEME) {
    delete root.dataset.colorTheme;
  } else {
    root.dataset.colorTheme = theme;
  }
}

// Dashboard accent theme (next-themes handles light/dark mode;
// this handles the professional color presets). Persisted per user.
export function useColorTheme() {
  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(DEFAULT_COLOR_THEME);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ColorThemeId | null;
    if (stored) {
      setColorThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const setColorTheme = useCallback((theme: ColorThemeId) => {
    setColorThemeState(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, []);

  return { colorTheme, setColorTheme };
}
