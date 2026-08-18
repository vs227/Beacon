import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import MuseumEnvironment from './MuseumEnvironment'
import ArtifactSculpture from './ArtifactSculpture'
import PortalInterior from './PortalInterior'

const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Camera keyframe positions
const P_HERO = new THREE.Vector3(-1.5, 0.85, 6.20)   // Section 1 hero view
const P_NEAR = new THREE.Vector3(3.5, 1.55, -0.20)   // Approach portal entrance
const P_INSIDE = new THREE.Vector3(3.5, 1.55, -4.50) // Pass completely through
const L_PORTAL = new THREE.Vector3(3.5, 1.55, -2.30) // Portal center target
const L_VOID = new THREE.Vector3(3.5, 1.55, -8.00)   // Void target
const LOOK_TEMP = new THREE.Vector3()                 // Preallocated for zero GC allocation in render loop

// ─── Camera Controller (dolly-zoom through portal)
function CameraController({ cameraProgress, onReady }) {
  const { camera } = useThree()
  const lookAtRef = useRef(new THREE.Vector3(3.5, 1.55, -2.3))
  const smoothCam = useRef(0)
  const hasCalledReady = useRef(false)

  useFrame((state) => {
    if (onReady && !hasCalledReady.current) {
      hasCalledReady.current = true
      onReady()
    }
    const mouse = state.mouse

    // Smooth cameraProgress (Section 2: 0 → 1)
    smoothCam.current = THREE.MathUtils.lerp(smoothCam.current, cameraProgress, 0.12)
    const cp = smoothCam.current

    if (cp < 0.001) {
      // ── Section 1 — Hero: Camera completely stationary with subtle mouse parallax ──
      camera.position.set(
        P_HERO.x + mouse.x * 0.28,
        P_HERO.y + mouse.y * 0.18,
        P_HERO.z
      )
      lookAtRef.current.lerp(L_PORTAL, 0.06)
    } else if (cp <= 0.80) {
      // ── Section 2 Phase A: Slow cinematic dolly toward portal (0 → 80%) ──
      const t = clamp01(cp / 0.80)
      const et = easeInOutCubic(t)
      camera.position.lerpVectors(P_HERO, P_NEAR, et)
      lookAtRef.current.lerp(L_PORTAL, 0.06)
    } else {
      // ── Section 2 Phase B: Pass through portal opening into void (80% → 100%) ──
      const t = clamp01((cp - 0.80) / 0.20)
      const et = easeInOutCubic(t)
      camera.position.lerpVectors(P_NEAR, P_INSIDE, et)
      LOOK_TEMP.lerpVectors(L_PORTAL, L_VOID, et)
      lookAtRef.current.lerp(LOOK_TEMP, 0.08)
    }

    camera.lookAt(lookAtRef.current)
  })

  return null
}

// ─── Scene Contents ───────────────────────────────────────────────────────
function SceneContents({ scrollProgress = 0, cameraProgress = 0, onReady }) {
  const lightRef = useRef()
  const smoothProgress = useRef(0)

  useFrame(() => {
    // Smooth scrollProgress with lerp (0.09 for tighter scroll sync)
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.18)
    // portalFade starts at 60% of morph and finishes at 80% (Phase 4)
    const portalFade = Math.max(0, Math.min(1, (smoothProgress.current - 0.60) / 0.20))
    if (lightRef.current) {
      lightRef.current.intensity = 18.0 * portalFade
    }
  })

  return (
    <>
      <color attach="background" args={['#0F0E0C']} />
      <fog attach="fog" args={['#0F0E0C', 16, 34]} />

      <Suspense fallback={null}>
        <MuseumEnvironment spotlightIntensity={180} spotlightColor="#FFF5E0" />

        <ContactShadows
          position={[3.5, 0.002, -2.3]}
          opacity={0.80} width={8} height={8} blur={2.2} far={2.8}
        />

        {/* Portal structure + interior */}
        <group
          position={[3.5, 1.55, -2.3]}
          rotation={[0, (18 * Math.PI) / 180, 0]}
        >
          <ArtifactSculpture scrollProgress={scrollProgress} />
          <PortalInterior scrollProgress={scrollProgress} position={[0, 0.70, 0]} />
        </group>

        {/* Soft emerald point light from portal void */}
        <pointLight
          ref={lightRef}
          position={[3.5, 1.55, -2.3]}
          intensity={0}
          color="#1E6F5C"
          distance={5}
          decay={2.0}
        />

        <CameraController
          cameraProgress={cameraProgress}
          onReady={onReady}
        />
      </Suspense>
    </>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────
export default function SceneCanvas({
  scrollProgress = 0,
  cameraProgress = 0,
  blackProgress = 0,
  onReady,
}) {
  const overlayFromCamera = clamp01((cameraProgress - 0.80) / 0.20)
  const blackOpacity = Math.max(overlayFromCamera, blackProgress)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [-1.5, 0.85, 6.2], fov: 34, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={Math.min(window.devicePixelRatio || 1, 2)}
      >
        <SceneContents
          scrollProgress={scrollProgress}
          cameraProgress={cameraProgress}
          onReady={onReady}
        />
      </Canvas>

      {/* Solid black transition overlay */}
      {blackOpacity > 0.001 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            opacity: blackOpacity,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      )}
    </div>
  )
}
