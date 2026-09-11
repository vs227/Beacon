import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const THEME_KEY = 'beacon_theme'
const DARK = 'dark'
const LIGHT = 'light'

/**
 * Read the persisted theme. Beacon ships dark, so anything unrecognised
 * (missing key, blocked localStorage, stale value) falls back to dark.
 */
function readInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === LIGHT || saved === DARK) return saved
  } catch {
    // localStorage unavailable (private mode / blocked site data)
  }
  return DARK
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  // Every stylesheet keys its light overrides off :root[data-theme="light"]
  document.documentElement.dataset.theme = theme
}

const ThemeContext = createContext(null)

/**
 * Holds the app-wide theme. Wraps <App/> in main.jsx.
 *
 * Most theming happens in CSS off the data-theme attribute; the JS value is
 * only read by the navbar toggle and the 3D scene (which needs real colour
 * values for its background, fog and materials).
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Non-fatal — the theme still applies for this session
    }
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next === LIGHT ? LIGHT : DARK)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === DARK ? LIGHT : DARK))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === LIGHT,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Consume the current theme. Falls back to a dark, inert value when used
 * outside the provider so a stray consumer never crashes the tree.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return { theme: DARK, isLight: false, setTheme: () => {}, toggleTheme: () => {} }
  }
  return ctx
}

export { THEME_KEY, DARK, LIGHT }
