import { Suspense, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import MuseumEnvironment from './MuseumEnvironment'
import ArtifactSculpture from './ArtifactSculpture'
import PortalInterior from './PortalInterior'

const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
const clamp01 = (x) => Math.max(0, Math.min(1, x))

// ─── Camera Controller ────────────────────────────────────────────────────
// Driven entirely by cameraProgress (Section 3, 0→1).
// During Section 1 & 2: camera is COMPLETELY STILL at hero position.
// During Section 3: smooth cinematic dolly toward and through portal.

function CameraController({ heroProgress, cameraProgress }) {
  const { camera } = useThree()
  const lookAtRef = useRef(new THREE.Vector3(3.5, 1.55, -2.3))
  const smoothCam = useRef(0)
  const smoothHero = useRef(0)

  // Camera positions
  const P_HERO = new THREE.Vector3(-1.5, 0.85, 6.20)  // fixed during S1+S2
  const P_NEAR = new THREE.Vector3(3.5, 1.55, -0.20)  // at portal entrance
  const P_INSIDE = new THREE.Vector3(3.5, 1.55, -4.50)  // fully through
  const L_PORTAL = new THREE.Vector3(3.5, 1.55, -2.30)  // portal world center
  const L_VOID = new THREE.Vector3(3.5, 1.55, -8.00)  // looking into void

  useFrame((state) => {
    const mouse = state.mouse

    // Smooth the Section 3 progress for camera
    smoothCam.current = THREE.MathUtils.lerp(smoothCam.current, cameraProgress, 0.055)
    smoothHero.current = THREE.MathUtils.lerp(smoothHero.current, heroProgress, 0.08)

    const cp = smoothCam.current

    if (cp < 0.001) {
      // ── S1 + S2: Camera completely still, subtle mouse parallax ─────
      camera.position.set(
        P_HERO.x + mouse.x * 0.28,
        P_HERO.y + mouse.y * 0.18,
        P_HERO.z
      )
      lookAtRef.current.lerp(L_PORTAL, 0.06)
    } else if (cp <= 0.80) {
      // ── S3 Phase A: Cinematic dolly toward portal (0%→80%) ──────────
      const t = clamp01(cp / 0.80)
      const et = easeInOutCubic(t)
      camera.position.lerpVectors(P_HERO, P_NEAR, et)
      lookAtRef.current.lerp(L_PORTAL, 0.06)
    } else {
      // ── S3 Phase B: Pass through portal opening (80%→100%) ──────────
      const t = clamp01((cp - 0.80) / 0.20)
      const et = easeInOutCubic(t)
      camera.position.lerpVectors(P_NEAR, P_INSIDE, et)
      const lookTarget = new THREE.Vector3().lerpVectors(L_PORTAL, L_VOID, et)
      lookAtRef.current.lerp(lookTarget, 0.08)
    }

    camera.lookAt(lookAtRef.current)
  })

  return null
}

// ─── Scene Contents ───────────────────────────────────────────────────────
function SceneContents({ heroProgress, portalFormProgress, cameraProgress }) {
  // Emerald point light — appears once portal is ≥ 70% formed
  const emeraldIntensity = clamp01((portalFormProgress - 0.70) / 0.30) * 20

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

        {/* Sculpture + Portal share the same world group position */}
        <group
          position={[3.5, 1.55, -2.3]}
          rotation={[(-5 * Math.PI) / 180, (18 * Math.PI) / 180, 0]}
        >
          {/*
            ArtifactSculpture driven by TWO props:
            - heroProgress (0→1):       section 1 — slow rotation speed
            - portalFormProgress (0→1): section 2 — blocks slide to portal frame
          */}
          <ArtifactSculpture
            heroProgress={heroProgress}
            portalFormProgress={portalFormProgress}
            metalness={0.14}
            roughness={0.50}
          />

          {/*
            PortalInterior driven by portalFormProgress only.
            Visible once frame is ≥ 60% assembled, frozen thereafter.
          */}
          <PortalInterior portalFormProgress={portalFormProgress} />
        </group>

        {/* Soft emerald point light from portal void */}
        {emeraldIntensity > 0.01 && (
          <pointLight
            position={[3.5, 1.55, -2.3]}
            intensity={emeraldIntensity}
            color="#1E6F5C"
            distance={5}
            decay={2.0}
          />
        )}

        <CameraController
          heroProgress={heroProgress}
          cameraProgress={cameraProgress}
        />
      </Suspense>

      <EffectComposer frameBufferType={THREE.HalfFloatType} multisampling={8}>
        <Bloom luminanceThreshold={0.38} luminanceSmoothing={0.92} intensity={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.12} darkness={1.20} />
      </EffectComposer>
    </>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────
export default function SceneCanvas({
  heroProgress = 0,
  portalFormProgress = 0,
  cameraProgress = 0,
  blackProgress = 0,
}) {
  // Black overlay driven purely by Section 4 progress (0→1)
  // Starts fading at camera 85% through (cameraProgress > 0.85)
  // completes with blackProgress
  const overlayFromCamera = clamp01((cameraProgress - 0.85) / 0.15)
  const overlayFromBlack = blackProgress
  const blackOpacity = Math.max(overlayFromCamera, overlayFromBlack)

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
        dpr={Math.max(window.devicePixelRatio || 1, 2)}
      >
        <SceneContents
          heroProgress={heroProgress}
          portalFormProgress={portalFormProgress}
          cameraProgress={cameraProgress}
        />
      </Canvas>

      {/*
        Black transition overlay.
        Begins fading as camera passes through portal (cameraProgress 0.85→1.0).
        Reaches solid black during Section 4 (blackProgress 0→1).
        Hides all scene geometry during and after pass-through.
      */}
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
