import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import SceneCanvas from './components/SceneCanvas'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// ─── Scroll Architecture ───────────────────────────────────────────────────
// 4 independent pinned sections, each with its own ScrollTrigger.
// Each section controls exactly one animation phase via a progress value (0→1).
//
// Section 1 (100vh pinned × 1.5):  Hero — sculpture rotates, camera fixed
// Section 2 (100vh pinned × 2.0):  Portal formation — sculpture → frame
// Section 3 (100vh pinned × 1.5):  Camera dolly — approaches + enters portal
// Section 4 (100vh pinned × 0.8):  Black transition — hold before next section
//
// The 3D canvas receives 4 independent progress values.
// Even if the user scrolls fast, ScrollTrigger scrubs each section's
// progress correctly — no animation phase is ever skipped.

export default function App() {
  const wrapperRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // Independent progress values for each section (0 → 1)
  const [heroProgress, setHeroProgress] = useState(0)   // S1
  const [portalFormProgress, setPortalFormProgress] = useState(0)   // S2
  const [cameraProgress, setCameraProgress] = useState(0)   // S3
  const [blackProgress, setBlackProgress] = useState(0)   // S4

  // Active section for UI labels (0-3)
  const [activeSection, setActiveSection] = useState(0)

  // ─── Build scroll triggers once DOM is mounted ─────────────────────────
  useEffect(() => {
    const scroller = scrollContainerRef.current
    if (!scroller) return

    const ctx = gsap.context(() => {

      // ── Section 1: Hero (sculpture rotates) ────────────────────────────
      ScrollTrigger.create({
        trigger: '#section-hero',
        scroller: scroller,
        start: 'top top',
        end: '+=150%',          // pin lasts 1.5× vh of scroll
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => setHeroProgress(self.progress),
        onEnter: () => setActiveSection(0),
        onEnterBack: () => setActiveSection(0),
      })

      // ── Section 2: Portal Formation (sculpture → frame) ────────────────
      ScrollTrigger.create({
        trigger: '#section-portal',
        scroller: scroller,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => setPortalFormProgress(self.progress),
        onEnter: () => setActiveSection(1),
        onEnterBack: () => setActiveSection(1),
      })

      // ── Section 3: Camera Dolly (approach + enter portal) ──────────────
      ScrollTrigger.create({
        trigger: '#section-camera',
        scroller: scroller,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => setCameraProgress(self.progress),
        onEnter: () => setActiveSection(2),
        onEnterBack: () => setActiveSection(2),
      })

      // ── Section 4: Black Transition ────────────────────────────────────
      ScrollTrigger.create({
        trigger: '#section-black',
        scroller: scroller,
        start: 'top top',
        end: '+=80%',
        pin: true,
        scrub: 0.4,
        onUpdate: (self) => setBlackProgress(self.progress),
        onEnter: () => setActiveSection(3),
        onEnterBack: () => setActiveSection(3),
      })

      ScrollTrigger.refresh()
    }, wrapperRef)

    return () => ctx.revert()
  }, [])

  // ─── Programmatic scroll to section ───────────────────────────────────
  const scrollToSection = useCallback((idx) => {
    const scroller = scrollContainerRef.current
    if (scroller) {
      const vh = scroller.clientHeight
      const factors = [0, 2.5, 5.5, 8.0]
      const targetY = factors[idx] * vh

      // Set active section immediately for instant navigation highlight
      setActiveSection(idx)

      // Stop any active ScrollTrigger/user scrolls during animation
      gsap.to(scroller, {
        scrollTo: { y: targetY, autoKill: false },
        duration: 1.4,
        ease: 'power2.inOut',
      })
    }
  }, [])

  // ─── Keyboard navigation ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (activeSection < 3) scrollToSection(activeSection + 1) }
      if (e.key === 'ArrowUp') { e.preventDefault(); if (activeSection > 0) scrollToSection(activeSection - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSection, scrollToSection])

  return (
    <div ref={wrapperRef} className="app-frame">

      {/* ── Navigation header (always visible) ─────────────────────────── */}
      <header className="nav-header" style={{ zIndex: 100 }}>
        <div className="logo-text">
          <Activity size={18} style={{ color: activeSection >= 2 ? '#52A88B' : '#B67A46' }} />
          <span>Beacon</span>
        </div>
        <ul className="nav-links">
          {['Genesis', 'Portal', 'Entry', 'Beyond'].map((label, i) => (
            <li key={i}>
              <button
                onClick={() => scrollToSection(i)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeSection === i ? '#fff' : '' }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </header>

      {/* ── Fixed 3D Canvas (behind all sections) ───────────────────────── */}
      <div className="canvas-container">
        <SceneCanvas
          heroProgress={heroProgress}
          portalFormProgress={portalFormProgress}
          cameraProgress={cameraProgress}
          blackProgress={blackProgress}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Scroll Sections — stacked vertically inside scroll-container.
          Each section is pinned by ScrollTrigger above.
          Content overlaid on the fixed 3D canvas.
      ══════════════════════════════════════════════════════════════════ */}
      <div ref={scrollContainerRef} className="scroll-container">
        {/* Section 1: Hero */}
        <section id="section-hero" className="scroll-section">
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="info-column"
              >
                <span className="tag-label">Beacon — 3D Experience</span>
                <h1 className="title-serif">Analog Intelligence for Modern RAG.</h1>
                <p className="description-text">
                  High-performance, auditable infrastructure for enterprise AI. Designed to merge
                  physical structure with distributed synapse memory.
                </p>
                <div className="interactive-content">
                  <button className="btn-terracotta" onClick={() => scrollToSection(1)}>
                    Enter
                  </button>
                </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 2: Portal Formation */}
        <section id="section-portal" className="scroll-section">
          <AnimatePresence mode="wait">
            {activeSection === 1 && (
              <motion.div
                key="portal"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="info-column"
              >
                <span className="tag-label" style={{ color: '#52A88B' }}>01. Transformation</span>
                <h1 className="title-serif">Stone Becomes Gateway.</h1>
                <p className="description-text">
                  Thirteen interlocking stone slabs intelligently realign into a monumental portal.
                  Each block moves with architectural precision.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 3: Camera Entry */}
        <section id="section-camera" className="scroll-section">
          <AnimatePresence mode="wait">
            {activeSection === 2 && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="info-column"
              >
                <span className="tag-label" style={{ color: '#52A88B' }}>02. Portal Entry</span>
                <h1 className="title-serif">Walking Through.</h1>
                <p className="description-text">
                  A cinematic approach into the emerald void. The portal remains fixed —
                  only the camera moves forward.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 4: Black Transition (no UI content — pure cinematic hold) */}
        <section id="section-black" className="scroll-section" />
      </div>

    </div>
  )
}
