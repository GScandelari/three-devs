"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

// Preserve the existing admin preference when sharing it with home and login.
export const THEME_STORAGE_KEY = "three-devs-admin-theme";
export const THEME_BOOT_STYLE_ID = "admin-theme-boot";

interface ThemeContextValue {
  /** `null` until the stored/system preference is resolved on the client. */
  theme: Theme | null;
  /** Falls back to "light" while the preference is still being resolved. */
  resolvedTheme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  resolvedTheme: "light",
  toggleTheme: () => {},
});

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Reads the manual choice. Returns `null` if absent, invalid or unreadable. */
function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    // Private mode / blocked storage: fall back to the system preference.
    return null;
  }
}

function readSystemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

// Keep a manual choice for this visit even when browser storage is blocked.
let sessionTheme: Theme | null = null;
const THEME_CHANGE_EVENT = "admin-theme-change";

function getThemeSnapshot(): Theme {
  return sessionTheme ?? readStoredTheme() ?? readSystemTheme();
}

function getServerThemeSnapshot(): null {
  return null;
}

function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  function handleStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    sessionTheme = null;
    onChange();
  }
  media?.addEventListener("change", onChange);
  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    media?.removeEventListener("change", onChange);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // A server snapshot also keeps the first hydration render identical.
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    if (theme === null) return;
    document.getElementById(THEME_BOOT_STYLE_ID)?.remove();
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = getThemeSnapshot() === "dark" ? "light" : "dark";
    sessionTheme = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The manual choice remains active for this visit.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme: theme ?? "light", toggleTheme }}
    >
      <div
        data-theme-shell=""
        data-theme={theme ?? undefined}
        className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
