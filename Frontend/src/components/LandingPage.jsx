import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { motion, AnimatePresence } from 'framer-motion'
import SceneCanvas from './SceneCanvas'
import AuthOverlay from './AuthOverlay'

gsap.registerPlugin(ScrollToPlugin)

const SECTIONS_DATA = [
  {
    id: 'genesis',
    tag: '',
    tagColor: '#C86F52',
    title: 'Analog Intelligence for Modern RAG.',
    desc: 'High-performance, auditable infrastructure for enterprise AI. Designed to merge physical structure with distributed synapse memory.',
  },
  {
    id: 'portal',
    tag: '01. Transformation',
    tagColor: '#52A88B',
    title: 'Stone Becomes Gateway.',
    desc: 'Thirteen interlocking stone slabs intelligently realign into a monumental portal. Each block moves with architectural precision.',
  },
  {
    id: 'entry',
    tag: '02. Portal Entry',
    tagColor: '#52A88B',
    title: 'Walking Through.',
    desc: 'A cinematic approach into the emerald void. The portal remains fixed — only the camera moves forward.',
  },
  {
    id: 'beyond',
    tag: '03. Beyond',
    tagColor: '#C86F52',
    title: 'The Void Awaits.',
    desc: "Past the threshold, silence. Beacon's neural lattice expands into infinite, uncharted memory — ready to be shaped by your data.",
    showCta: true,
  },
]

export default function LandingPage({ auth }) {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const scrollContainerRef = useRef(null)

  const [activeSection, setActiveSection] = useState(0)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [heroProgress, setHeroProgress] = useState(0)
  const [portalFormProgress, setPortalFormProgress] = useState(0)
  const [cameraProgress, setCameraProgress] = useState(0)
  const [blackProgress, setBlackProgress] = useState(0)

  useEffect(() => {
    const scroller = scrollContainerRef.current
    if (!scroller) return

    const handleScroll = () => {
      const top = scroller.scrollTop
      const vh = scroller.clientHeight || 1

      // Each section spans 0.9 * vh
      const sectionSpan = vh * 0.9
      const sectionIdx = Math.min(3, Math.floor(top / sectionSpan))
      setActiveSection(sectionIdx)

      // Calculate smooth progress for each section
      const hProg = Math.max(0, Math.min(1, top / sectionSpan))
      const pProg = Math.max(0, Math.min(1, (top - sectionSpan) / sectionSpan))
      const cProg = Math.max(0, Math.min(1, (top - 2 * sectionSpan) / sectionSpan))
      const bProg = Math.max(0, Math.min(1, (top - 3 * sectionSpan) / sectionSpan))

      setHeroProgress(hProg)
      setPortalFormProgress(pProg)
      setCameraProgress(cProg)
      setBlackProgress(bProg)
    }

    scroller.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => scroller.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = useCallback((idx) => {
    const scroller = scrollContainerRef.current
    if (!scroller) return
    const vh = scroller.clientHeight || 1
    const targetY = idx * (vh * 0.9)

    setActiveSection(idx)
    gsap.to(scroller, {
      scrollTo: { y: targetY, autoKill: false },
      duration: 1.2,
      ease: 'power2.inOut',
    })
  }, [])

  // After login (email/password OR GitHub OAuth redirect) →
  // ensure we're on the home / hero section (Genesis).
  useEffect(() => {
    if (auth.justLoggedIn) {
      scrollToSection(0)
      // Dismiss the flag so future auth state changes don't jump the user
      const t = setTimeout(() => auth.dismissJustLoggedIn(), 1200)
      return () => clearTimeout(t)
    }
  }, [auth, scrollToSection])

  const section = SECTIONS_DATA[activeSection]

  return (
    <div ref={wrapperRef} className="app-frame">
      {/* Navigation Header */}
      <header className="nav-header" style={{ zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo-text" onClick={() => auth?.isLoggedIn && navigate('/dashboard/organizations')} style={{ cursor: auth?.isLoggedIn ? 'pointer' : 'default' }}>
          <span>Beacon</span>
        </div>
        <ul className="nav-links">
          {['Genesis', 'Portal', 'Entry', 'Beyond'].map((label, i) => (
            <li key={i}>
              <button
                onClick={() => scrollToSection(i)}
                className={`nav-link${activeSection === i ? ' nav-link--active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeSection === i ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {auth?.isLoggedIn && (
          <div className="navbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button
              onClick={() => navigate('/dashboard/organizations')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Go to Dashboard</span>
              <span style={{ opacity: 0.7 }}>➔</span>
            </button>

            <button 
              className="user-avatar-btn" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {auth.user?.username?.[0]?.toUpperCase() || auth.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <>
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setShowProfileDropdown(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="profile-dropdown"
                    style={{ position: 'absolute', right: 0, top: '48px' }}
                  >
                    <div className="dropdown-header">
                      <span className="dropdown-username">{auth.user?.username || 'Explorer'}</span>
                      <span className="dropdown-email">{auth.user?.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowProfileDropdown(false)
                        navigate('/dashboard')
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                      <span>Console Dashboard</span>
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowProfileDropdown(false)
                        navigate('/dashboard/settings')
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      <span>Account Settings</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button 
                      className="dropdown-item logout" 
                      onClick={() => {
                        setShowProfileDropdown(false)
                        auth.logout()
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Fixed 3D Canvas */}
      <div className="canvas-container">
        <SceneCanvas
          heroProgress={heroProgress}
          portalFormProgress={portalFormProgress}
          cameraProgress={cameraProgress}
          blackProgress={blackProgress}
        />
      </div>

      {/* Fixed Left Information Panel */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '6%',
          transform: 'translateY(-50%)',
          width: '40%',
          maxWidth: '480px',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="info-column"
            style={{ width: '100%', height: 'auto', pointerEvents: 'auto' }}
          >
            {section.tag && (
              <span className="tag-label" style={{ color: section.tagColor }}>
                {section.tag}
              </span>
            )}
            <h1 className="title-serif">{section.title}</h1>
            <p className="description-text">{section.desc}</p>

            {section.id === 'genesis' && auth?.isLoggedIn && (
              <button
                onClick={() => navigate('/dashboard/organizations')}
                className="btn-terracotta"
                style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Get Started</span>
                <span style={{ opacity: 0.7 }}>➔</span>
              </button>
            )}

            {section.showCta && (
              <div className="interactive-content">
                <a
                  href="https://github.com"
                  className="btn-terracotta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Begin Your Journey
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Developer Auth Overlay (visible on landing section) */}
      <AuthOverlay heroProgress={heroProgress} auth={auth} />

      {/* Scrollable Container */}
      <div ref={scrollContainerRef} className="scroll-container">
        <div style={{ height: '360vh', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}
