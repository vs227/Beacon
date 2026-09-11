import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'

/* Inline SVG icons matching the convention used elsewhere in the app
   (see ProjectPage.jsx and LandingHeader.jsx) — stroke="currentColor" so the
   icon picks up the button's themed text colour. */

function IconSun({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>
  )
}

function IconMoon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
  )
}

/**
 * Navbar light/dark switch. Shows the mode it will switch *to*, so the icon and
 * the accessible label always agree.
 */
export default function ThemeToggle({ size = 16 }) {
  const { isLight, toggleTheme } = useTheme()
  const label = isLight ? 'Switch to dark mode' : 'Switch to light mode'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isLight}
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? 'moon' : 'sun'}
          className="theme-toggle-icon"
          initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {isLight ? <IconMoon size={size} /> : <IconSun size={size} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
