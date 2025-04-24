import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
  enableSystem?: boolean;
  attribute?: string;
  value?: Partial<Record<Theme, string>>;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
  systemTheme: "dark" | "light";
  forcedTheme?: Theme;
  themes: Theme[];
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  systemTheme: "light",
  themes: ["light", "dark", "system"]
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Custom event for theme changes
const THEME_CHANGE_EVENT = "theme-change";

// Animation frame for smooth transitions
const ANIMATION_FRAME = 10;

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  disableTransitionOnChange = false,
  enableSystem = true,
  attribute = "data-theme",
  value = { light: "light", dark: "dark" },
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get theme from localStorage
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        return storedTheme;
      }
    }
    return defaultTheme;
  });
  
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);
  const [forcedTheme, setForcedTheme] = useState<Theme | undefined>(undefined);
  
  // Refs for performance optimization
  const previousThemeRef = useRef<Theme>(theme);
  const animationFrameRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced system theme detection with debounce and throttling
  const updateSystemTheme = useCallback(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Schedule the update on the next animation frame
    animationFrameRef.current = requestAnimationFrame(() => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSystemTheme(isDark ? "dark" : "light");
      animationFrameRef.current = null;
    });
  }, []);

  // Memoized themes array
  const themes = useMemo<Theme[]>(() => {
    const baseThemes: Theme[] = ["light", "dark"];
    return enableSystem ? [...baseThemes, "system"] : baseThemes;
  }, [enableSystem]);

  // Update the resolvedTheme based on theme and systemTheme
  useEffect(() => {
    const newResolvedTheme = theme === "system" && enableSystem 
      ? systemTheme 
      : theme as "dark" | "light";
    
    setResolvedTheme(newResolvedTheme);
    
    // Only dispatch event if theme actually changed
    if (previousThemeRef.current !== theme) {
      // Dispatch theme change event with more details
      const event = new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { 
          theme: newResolvedTheme,
          previousTheme: previousThemeRef.current,
          systemTheme
        }
      });
      window.dispatchEvent(event);
      
      // Update previous theme ref
      previousThemeRef.current = theme;
    }
  }, [theme, systemTheme, enableSystem]);

  // Enhanced system theme detection with better event handling
  useEffect(() => {
    // Initial detection
    updateSystemTheme();
    
    // Create media query with all possible color scheme preferences
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateSystemTheme);
      return () => {
        mediaQuery.removeEventListener("change", updateSystemTheme);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } 
    // Legacy support
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(updateSystemTheme);
      return () => {
        mediaQuery.removeListener(updateSystemTheme);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [updateSystemTheme]);

  // Apply theme to document with enhanced transitions
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    const isDark = resolvedTheme === "dark";
    
    // Clear any existing timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Handle transitions
    if (!disableTransitionOnChange) {
      // Add transition classes
      root.classList.add("transition-all", "duration-300", "ease-in-out");
      
      // Remove transition classes after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        root.classList.remove("transition-all", "duration-300", "ease-in-out");
        transitionTimeoutRef.current = null;
      }, 300);
    }
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the appropriate class
    root.classList.add(isDark ? "dark" : "light");
    
    // Update color scheme meta tag
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    
    // Set data-theme attribute for custom styling
    if (attribute) {
      const themeValue = value[isDark ? "dark" : "light"];
      if (themeValue) {
        document.documentElement.setAttribute(attribute, themeValue);
      } else {
        document.documentElement.setAttribute(attribute, isDark ? "dark" : "light");
      }
    }
    
    // Fix for iOS dark mode issues
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [resolvedTheme, mounted, disableTransitionOnChange, attribute, value]);

  // Handle mounted state to prevent flash of wrong theme
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  // IMPORTANT: This needs to be called in every render to maintain hook order
  const contextValue = useMemo<ThemeProviderState>(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      if (newTheme === theme) return;
      
      // Validate theme
      if (!themes.includes(newTheme)) {
        console.warn(`Invalid theme: ${newTheme}. Using default theme instead.`);
        newTheme = defaultTheme;
      }
      
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    resolvedTheme,
    systemTheme,
    forcedTheme,
    themes
  }), [theme, resolvedTheme, systemTheme, forcedTheme, themes, defaultTheme, storageKey]);

  // Avoid hydration mismatch by rendering only after mounted
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider {...props} value={contextValue}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </ThemeProviderContext.Provider>
    );
  }

  return (
    <ThemeProviderContext.Provider {...props} value={contextValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};

// Export the theme change event name for external use
export { THEME_CHANGE_EVENT };
