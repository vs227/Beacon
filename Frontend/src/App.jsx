import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { motion, AnimatePresence } from 'framer-motion'
import SceneCanvas from './components/SceneCanvas'
import AuthOverlay from './components/AuthOverlay'

gsap.registerPlugin(ScrollToPlugin)

const SECTIONS_DATA = [
  {
    id: 'genesis',
    tag: 'Beacon — 3D Experience',
    tagColor: '#C86F52',
    title: 'Analog Intelligence for Modern RAG.',
    desc: 'High-performance, auditable infrastructure for enterprise AI. Designed to merge physical structure with distributed synapse memory.',
    showStats: true,
    showEnterBtn: true,
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

export default function App() {
  const wrapperRef = useRef(null)
  const scrollContainerRef = useRef(null)

  const [activeSection, setActiveSection] = useState(0)
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

  const section = SECTIONS_DATA[activeSection]

  return (
    <div ref={wrapperRef} className="app-frame">
      {/* Navigation Header */}
      <header className="nav-header" style={{ zIndex: 100 }}>
        <div className="logo-text">
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
            <span className="tag-label" style={{ color: section.tagColor }}>
              {section.tag}
            </span>
            <h1 className="title-serif">{section.title}</h1>
            <p className="description-text">{section.desc}</p>

            {section.showEnterBtn && (
              <div className="interactive-content">
                <button className="btn-terracotta" onClick={() => scrollToSection(1)}>
                  Enter
                </button>
              </div>
            )}

            {section.showStats && (
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-label">Nodes Active</span>
                  <span className="stat-value">1,245</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Uptime</span>
                  <span className="stat-value">99.99%</span>
                </div>
              </div>
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
      <AuthOverlay heroProgress={heroProgress} />

      {/* Scrollable Container */}
      <div ref={scrollContainerRef} className="scroll-container">
        <div style={{ height: '360vh', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}