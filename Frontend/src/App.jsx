import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import { useAuth } from './hooks/useAuth'

export default function App() {
<<<<<<< HEAD
  const wrapperRef = useRef(null)
  const scrollContainerRef = useRef(null)

  const [activeSection, setActiveSection] = useState(0)
  const [heroProgress, setHeroProgress] = useState(0)
  const [portalFormProgress, setPortalFormProgress] = useState(0)
  const [cameraProgress, setCameraProgress] = useState(0)
  const [blackProgress, setBlackProgress] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [canvasMounted, setCanvasMounted] = useState(false)
  const [isSceneReady, setIsSceneReady] = useState(false)

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

  useEffect(() => {
    // Mount the heavy canvas 100ms after the initial paint so the loader displays immediately
    const mountTimeout = setTimeout(() => {
      setCanvasMounted(true)
    }, 100)

    // Safety timeout fallback: if WebGL or ThreeJS fails to load, force hide loader after 4.5 seconds
    const fallbackTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 4500)

    return () => {
      clearTimeout(mountTimeout)
      clearTimeout(fallbackTimeout)
    }
  }, [])

  // Fade out loader 300ms after ThreeJS has successfully rendered its first frame
  useEffect(() => {
    if (isSceneReady) {
      const transitionTimeout = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(transitionTimeout)
    }
  }, [isSceneReady])

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
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            className="loader-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <span className="loader">
              <span className="loader-dot"></span>
              <span className="loader-dot"></span>
              <span className="loader-dot"></span>
              <span className="loader-dot"></span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
        {canvasMounted && (
          <SceneCanvas
            heroProgress={heroProgress}
            portalFormProgress={portalFormProgress}
            cameraProgress={cameraProgress}
            blackProgress={blackProgress}
            onReady={() => setIsSceneReady(true)}
          />
        )}
      </div>
=======
  const auth = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing route */}
        <Route path="/" element={<LandingPage auth={auth} />} />

        {/* Protected Dashboard console route with wildcard sub-routes */}
        <Route
          path="/dashboard/*"
          element={
            auth.isLoggedIn ? (
              <Dashboard auth={auth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
>>>>>>> c33ea35ac2b5caf87a7d7bbfe80408bac17eafb6

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}