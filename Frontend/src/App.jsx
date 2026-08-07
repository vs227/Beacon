import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import { Activity } from 'lucide-react'
import SceneCanvas from './components/SceneCanvas'
import AuthOverlay from './components/AuthOverlay'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// ─── Direct DOM text updater ──────────────────────────────────────────────────
// Called directly from GSAP onUpdate — zero React re-renders for text.
// Animates section text in-place:
// - Section i text enters as scroll goes from section (i-1) to section i.
// - It is fully visible (opacity 1, blur 0) when stabilized at section i.
// - It exits (fades out, blurs, slides right) as scroll goes from section i to section i+1.
function applyTextStyle(el, sectionIndex, currentScroll, vh) {
  if (!el) return
  
  // Exact scroll limits for each section
  // S1: 0.00vh to 0.25vh
  // S2: 0.25vh to 0.50vh
  // S3: 0.50vh to 0.75vh
  // S4: 0.75vh to 0.95vh
  const start = sectionIndex === 3 ? 0.75 * vh : sectionIndex * 0.25 * vh
  const end = sectionIndex === 3 ? 0.95 * vh : (sectionIndex + 1) * 0.25 * vh
  
  let opacity = 0
  let blurVal = 8
  let tx = 0

  if (currentScroll < start) {
    // Before section start
    opacity = 0
    blurVal = 8
    tx = 0
  } else if (currentScroll > end) {
    // Past section end
    opacity = 0
    blurVal = 8
    tx = 60
  } else {
    // Inside active section range:
    // It should fade/unblur in quickly (first 25% of the section), stay fully visible/stable, 
    // and then fade/blur/slide right at the end (last 25% of the section).
    const span = end - start
    const rel = currentScroll - start
    
    const enterZone = 0.25 * span
    const exitZone = 0.75 * span

    if (sectionIndex === 3) {
      // The final section (Beyond) stays visible and does not fade out at the end
      if (rel <= enterZone) {
        const t = rel / enterZone
        opacity = t
        blurVal = (1 - t) * 8
      } else {
        opacity = 1
        blurVal = 0
      }
      tx = 0
    } else {
      if (rel < enterZone) {
        // Entering
        const t = rel / enterZone
        opacity = t
        blurVal = (1 - t) * 8
        tx = 0
      } else if (rel > exitZone) {
        // Exiting
        const t = (rel - exitZone) / (span - exitZone)
        opacity = 1 - t
        blurVal = t * 8
        tx = t * 60
      } else {
        // Fully visible in middle
        opacity = 1
        blurVal = 0
        tx = 0
      }
    }
  }

  el.style.opacity = opacity
  el.style.filter  = blurVal > 0.1 ? `blur(${blurVal}px)` : 'none'
  el.style.transform = `translate3d(${tx}px, 0, 0)`
  el.style.pointerEvents = opacity > 0.15 ? 'auto' : 'none'
  el.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible'
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const wrapperRef         = useRef(null)
  const scrollContainerRef = useRef(null)

  // DOM refs for text — mutated directly, no React re-renders
  const heroColRef    = useRef(null)
  const portalColRef  = useRef(null)
  const cameraColRef  = useRef(null)
  const beyondColRef  = useRef(null)

  // React state for SceneCanvas props + nav (React 18 auto-batches multiple setStates)
  const [heroProgress,       setHeroProgress]       = useState(0)
  const [portalFormProgress, setPortalFormProgress] = useState(0)
  const [cameraProgress,     setCameraProgress]     = useState(0)
  const [blackProgress,      setBlackProgress]      = useState(0)
  const [activeSection,      setActiveSection]      = useState(0)

  // ─── Continuous Scroll Progress Tracking ─────────────────────────────────
  // Instead of individual pins that shift elements vertically, we stack the sections
  // absolutely and calculate their progress values directly from the scroller's scrollTop.
  useEffect(() => {
    const scroller = scrollContainerRef.current
    if (!scroller) return

    const onScroll = () => {
      const top = scroller.scrollTop
      const vh = scroller.clientHeight || 1

      // Total scroll range matches SECTION_FACTORS max = 0.95 * vh
      const maxScroll = 0.95 * vh

      // S1 progress: spans [0, 0.25 * vh]
      const s1Prog = Math.max(0, Math.min(1, top / (0.25 * vh)))
      // S2 progress: spans [0.25 * vh, 0.50 * vh]
      const s2Prog = Math.max(0, Math.min(1, (top - 0.25 * vh) / (0.25 * vh)))
      // S3 progress: spans [0.50 * vh, 0.75 * vh]
      const s3Prog = Math.max(0, Math.min(1, (top - 0.50 * vh) / (0.25 * vh)))
      // S4 progress: spans [0.75 * vh, maxScroll]
      const s4Prog = Math.max(0, Math.min(1, (top - 0.75 * vh) / (0.20 * vh || 1)))

      setHeroProgress(s1Prog)
      setPortalFormProgress(s2Prog)
      setCameraProgress(s3Prog)
      setBlackProgress(s4Prog)

      applyTextStyle(heroColRef.current, 0, top, vh)
      applyTextStyle(portalColRef.current, 1, top, vh)
      applyTextStyle(cameraColRef.current, 2, top, vh)
      applyTextStyle(beyondColRef.current, 3, top, vh)

      // Determine active section index
      if (top < 0.25 * vh) {
        setActiveSection(0)
      } else if (top < 0.50 * vh) {
        setActiveSection(1)
      } else if (top < 0.75 * vh) {
        setActiveSection(2)
      } else {
        setActiveSection(3)
      }
    }

    scroller.addEventListener('scroll', onScroll)
    // Initialize
    onScroll()
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  // ─── Mouse Wheel Interception ─────────────────────────────────────────────
  // The 3D canvas absorbs pointer events, so we intercept wheel on window
  // and forward them to the scroll container manually.
  // We scroll by exactly one full section segment (0.45 * clientHeight) on every wheel scroll
  // so that every single scroll input directly and cleanly transitions to the next/prev section.
  useEffect(() => {
    const scroller = scrollContainerRef.current
    if (!scroller) return

    let isScrolling = false

    const onWheel = (e) => {
      // Don't intercept if a native scrollable element (input, textarea) is the target
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      e.preventDefault()
      if (isScrolling) return

      const direction = Math.sign(e.deltaY)
      const vh = scroller.clientHeight || 1
      
      // Determine target scroll position
      let targetScroll = scroller.scrollTop + direction * (0.25 * vh)
      
      // Bound it
      const maxScroll = 0.95 * vh
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll))

      isScrolling = true
      gsap.to(scroller, {
        scrollTo: { y: targetScroll, autoKill: false },
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          isScrolling = false
        }
      })
    }

    // Use { passive: false } so we can call preventDefault
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  // ─── Navigation ──────────────────────────────────────────────────────────
  // Scroll positions (multiples of viewport height) that land at the VERY
  // START of each pinned section — before any progress accumulates.
  // S1 hero:    pinned for 25%  → spans [0, 0.25vh]
  // S2 portal:  pinned for 25%  → spans [0.25, 0.50vh]
  // S3 camera:  pinned for 25%  → spans [0.50, 0.75vh]
  // S4 black:   pinned for 20%  → spans [0.75, 0.95vh]
  const SECTION_FACTORS = [0, 0.25, 0.50, 0.75]

  const scrollToSection = useCallback((idx) => {
    const scroller = scrollContainerRef.current
    if (!scroller) return
    setActiveSection(idx)
    gsap.to(scroller, {
      scrollTo: { y: SECTION_FACTORS[idx] * scroller.clientHeight, autoKill: false },
      duration: 1.4, ease: 'power2.inOut',
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      // Skip if focus is inside a form field
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        if (activeSection < 3) scrollToSection(activeSection + 1)
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (activeSection > 0) scrollToSection(activeSection - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSection, scrollToSection])

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} className="app-frame">

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
                className={`nav-link${activeSection === i ? ' nav-link--active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {label}
                {activeSection === i && <span className="nav-active-dot" />}
              </button>
            </li>
          ))}
        </ul>
      </header>

      <div className="canvas-container">
        <SceneCanvas
          heroProgress={heroProgress}
          // Combined progress: Section 1 is [0, 0.25vh], Section 2 is [0.25vh, 0.50vh]. Total scroll is 0.50vh.
          // Section 1 represents 0.25 / 0.50 = 50% of the total scroll span.
          // Section 2 represents 0.25 / 0.50 = 50% of the total scroll span.
          portalFormProgress={
            activeSection === 0
              ? (heroProgress * 0.25) / 0.50
              : activeSection === 1
              ? 0.5 + (portalFormProgress * 0.25) / 0.50
              : 1
          }
          cameraProgress={cameraProgress}
          blackProgress={blackProgress}
        />
      </div>

      <AuthOverlay heroProgress={heroProgress} />

      <div ref={scrollContainerRef} className="scroll-container">

        {/* S1: Hero — starts fully visible */}
        <section id="section-hero" className="scroll-section">
          <div
            ref={heroColRef}
            className="info-column"
            style={{ opacity: 1, transform: 'translateX(0px)', willChange: 'opacity, transform' }}
          >
            <span className="tag-label">Beacon — 3D Experience</span>
            <h1 className="title-serif">Analog Intelligence for Modern RAG.</h1>
            <p className="description-text">
              High-performance, auditable infrastructure for enterprise AI. Designed to merge
              physical structure with distributed synapse memory.
            </p>
            <div className="interactive-content">
              <button className="btn-terracotta" onClick={() => scrollToSection(1)}>Enter</button>
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
          </div>
        </section>

        {/* S2: Portal — immediately visible on enter, fades out at end */}
        <section id="section-portal" className="scroll-section">
          <div
            ref={portalColRef}
            className="info-column"
            style={{ opacity: 1, transform: 'translateX(0px)', willChange: 'opacity, transform' }}
          >
            <span className="tag-label" style={{ color: '#52A88B' }}>01. Transformation</span>
            <h1 className="title-serif">Stone Becomes Gateway.</h1>
            <p className="description-text">
              Thirteen interlocking stone slabs intelligently realign into a monumental portal.
              Each block moves with architectural precision.
            </p>
          </div>
        </section>

        {/* S3: Camera — immediately visible on enter, fades out at end */}
        <section id="section-camera" className="scroll-section">
          <div
            ref={cameraColRef}
            className="info-column"
            style={{ opacity: 1, transform: 'translateX(0px)', willChange: 'opacity, transform' }}
          >
            <span className="tag-label" style={{ color: '#52A88B' }}>02. Portal Entry</span>
            <h1 className="title-serif">Walking Through.</h1>
            <p className="description-text">
              A cinematic approach into the emerald void. The portal remains fixed —
              only the camera moves forward.
            </p>
          </div>
        </section>

        {/* S4: Beyond — the void beyond the portal */}
        <section id="section-black" className="scroll-section">
          <div
            ref={beyondColRef}
            className="info-column beyond-column"
            style={{ opacity: 1, transform: 'translateX(0px)', willChange: 'opacity, transform' }}
          >
            <span className="tag-label beyond-label">03. Beyond</span>
            <h1 className="title-serif beyond-title">The Void Awaits.</h1>
            <p className="description-text beyond-text">
              Past the threshold, silence. Beacon's neural lattice expands into
              infinite, uncharted memory — ready to be shaped by your data.
            </p>
            <div className="interactive-content">
              <a
                href="https://github.com"
                className="btn-void"
                target="_blank"
                rel="noopener noreferrer"
              >
                Begin Your Journey
              </a>
            </div>
          </div>
        </section>

        {/* Spacer to simulate scrollable height for stacked elements: 
            S1 (0.25) + S2 (0.25) + S3 (0.25) + S4 (0.20) + 1.0 (initial viewport) = 1.95vh */}
        <div style={{ height: '195vh', pointerEvents: 'none' }} />

      </div>
    </div>
  )
}