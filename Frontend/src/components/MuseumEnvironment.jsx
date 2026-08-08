import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function MuseumEnvironment({ spotlightIntensity = 180, spotlightColor = '#FFF5E0' }) {
  const spotlightRef = useRef()
  const particlesRef = useRef()

  // ─── DUST PARTICLES (inside spotlight cone) ──────────────────────────────────
  const particleCount = 900
  const [positions, velocities, noiseSeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const vels = new Float32Array(particleCount * 3)
    const seeds = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const t = Math.random()
      const coneRadius = 1.8 * (1 - t * 0.55)
      const theta = Math.random() * Math.PI * 2
      pos[i3] = 3.5 + Math.cos(theta) * coneRadius * (Math.random() * 0.9 + 0.1)
      pos[i3 + 1] = t * 5.0
      pos[i3 + 2] = -2.3 + Math.sin(theta) * coneRadius * (Math.random() * 0.9 + 0.1)
      vels[i3] = (Math.random() - 0.5) * 0.002
      vels[i3 + 1] = 0.008 + Math.random() * 0.012
      vels[i3 + 2] = (Math.random() - 0.5) * 0.002
      seeds[i] = Math.random() * 100
    }
    return [pos, vels, seeds]
  }, [])

  // ─── FLOOR BUMP MAP ───────────────────────────────────────────────────────────
  const floorBumpMap = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#181615'
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const l = (Math.random() - 0.5) * 6
      ctx.fillStyle = `rgba(${24 + l | 0},${22 + l | 0},${21 + l | 0},0.18)`
      ctx.fillRect(x, y, Math.random() * 1.2 + 0.4, Math.random() * 1.2 + 0.4)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 4)
    return tex
  }, [])

  // ─── WALL TEXTURE: Hand-troweled microcement / architectural plaster ──────────
  // Key: bake in large soft lighter patches that simulate grazing spotlight on
  // textured plaster — those "cloudy" areas are NOT painted, they are the result
  // of light interacting with the irregular troweled surface.
  const [wallColorMap, wallBumpMap] = useMemo(() => {
    const W = 1024, H = 1024
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    // ── Base: warm dark charcoal plaster (#2A2725) ──────────────────────
    ctx.fillStyle = '#2A2725'
    ctx.fillRect(0, 0, W, H)

    // ── Layer 1: Large soft highlighted plaster patches ─────────────────
    // These are the "cloudy white" areas — light tones on a dark wall.
    // Concentrated in the center (where spotlight spills) and sparse at edges.
    const lightPatches = [
      // Center-area highlight cluster (behind sculpture — most illuminated)
      { x: 0.50, y: 0.45, r: 0.38, v: 105, a: 0.28 },
      { x: 0.48, y: 0.55, r: 0.30, v: 118, a: 0.22 },
      { x: 0.55, y: 0.38, r: 0.25, v: 95, a: 0.20 },
      { x: 0.42, y: 0.60, r: 0.22, v: 108, a: 0.18 },
      // Secondary patches — slightly off-center
      { x: 0.35, y: 0.42, r: 0.20, v: 82, a: 0.14 },
      { x: 0.62, y: 0.50, r: 0.18, v: 78, a: 0.12 },
      { x: 0.58, y: 0.65, r: 0.15, v: 72, a: 0.10 },
      { x: 0.30, y: 0.55, r: 0.14, v: 68, a: 0.09 },
      // Edge patches — very faint (in shadow)
      { x: 0.20, y: 0.40, r: 0.16, v: 48, a: 0.07 },
      { x: 0.78, y: 0.45, r: 0.14, v: 42, a: 0.06 },
      { x: 0.45, y: 0.20, r: 0.18, v: 40, a: 0.06 },
      { x: 0.52, y: 0.78, r: 0.16, v: 38, a: 0.05 },
    ]
    lightPatches.forEach(({ x, y, r, v, a }) => {
      const cx = x * W, cy = y * H, rad = r * W
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
      // Warm highlight tones: #6A625C → #8A8078 at peak
      grd.addColorStop(0.0, `rgba(${v},${v - 8},${v - 14},${a})`)
      grd.addColorStop(0.4, `rgba(${v - 18},${v - 24},${v - 28},${a * 0.55})`)
      grd.addColorStop(1.0, `rgba(42,39,37,0)`)
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill()
    })

    // ── Layer 2: Irregular small tonal clouds (trowel mass variation) ───
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const r = Math.random() * 80 + 15
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r)
      const dark = Math.random() > 0.35
      const g = dark ? (6 + Math.random() * 10 | 0) : (44 + Math.random() * 28 | 0)
      const a = Math.random() * 0.20 + 0.03
      grd.addColorStop(0, `rgba(${g},${g - 2},${g - 3},${a})`)
      grd.addColorStop(1, `rgba(42,39,37,0)`)
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    // ── Layer 3: Trowel drag marks (directional strokes) ────────────────
    for (let i = 0; i < 35; i++) {
      const x0 = Math.random() * W, y0 = Math.random() * H
      const angle = Math.random() * Math.PI
      const len = Math.random() * 140 + 40
      const x1 = x0 + Math.cos(angle) * len, y1 = y0 + Math.sin(angle) * len
      const v = 50 + (Math.random() * 30 | 0)
      const a = Math.random() * 0.10 + 0.03
      ctx.strokeStyle = `rgba(${v},${v - 3},${v - 5},${a})`
      ctx.lineWidth = Math.random() * 3 + 0.8
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
    }

    // ── Layer 4: Fine micro-plaster stipple ─────────────────────────────
    for (let i = 0; i < 70000; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const g = 22 + (Math.random() * 24 | 0)
      ctx.fillStyle = `rgba(${g},${g - 2},${g - 3},0.06)`
      ctx.fillRect(x, y, Math.random() * 0.9 + 0.3, Math.random() * 0.9 + 0.3)
    }

    const colorTex = new THREE.CanvasTexture(canvas)
    colorTex.wrapS = colorTex.wrapT = THREE.RepeatWrapping
    colorTex.repeat.set(1.0, 1.0)  // less repeat — patches scale naturally

    // Bump map — strong bumpScale for grazing light micro-relief
    const bCanvas = document.createElement('canvas')
    bCanvas.width = W; bCanvas.height = H
    const bCtx = bCanvas.getContext('2d')
    bCtx.fillStyle = '#808080'; bCtx.fillRect(0, 0, W, H)
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const r = Math.random() * 80 + 20
      const grd = bCtx.createRadialGradient(x, y, 0, x, y, r)
      const v = 98 + (Math.random() * 52 | 0)
      grd.addColorStop(0, `rgba(${v},${v},${v},0.30)`)
      grd.addColorStop(1, 'rgba(128,128,128,0)')
      bCtx.fillStyle = grd; bCtx.beginPath(); bCtx.arc(x, y, r, 0, Math.PI * 2); bCtx.fill()
    }
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const v = 92 + (Math.random() * 72 | 0)
      bCtx.fillStyle = `rgba(${v},${v},${v},0.10)`
      bCtx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5)
    }
    const bumpTex = new THREE.CanvasTexture(bCanvas)
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping
    bumpTex.repeat.set(1.0, 1.0)

    return [colorTex, bumpTex]
  }, [])

  // ─── CEILING TEXTURE (dark rough plaster) ────────────────────────────────────
  const ceilingTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#141210'
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 512; const y = Math.random() * 512
      const r = Math.random() * 60 + 10
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r)
      const g = 8 + (Math.random() * 10 | 0)
      grd.addColorStop(0, `rgba(${g},${g},${g},0.25)`)
      grd.addColorStop(1, 'rgba(20,18,16,0)')
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    return tex
  }, [])

  // ─── FRAME UPDATE ─────────────────────────────────────────────────────────────
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (spotlightRef.current) {
      spotlightRef.current.target.position.set(3.5, 0.0, -2.3)
      spotlightRef.current.target.updateMatrixWorld()
    }
    if (particlesRef.current) {
      const attr = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        attr.array[i3 + 1] += velocities[i3 + 1] * 0.1
        attr.array[i3] += Math.sin(time * 0.7 + noiseSeeds[i]) * 0.0012
        attr.array[i3 + 2] += Math.cos(time * 0.7 + noiseSeeds[i]) * 0.0012
        if (attr.array[i3 + 1] > 5.0) {
          attr.array[i3 + 1] = 0.05
          const t = Math.random(); const cr = 1.8 * (1 - t * 0.55); const th = Math.random() * Math.PI * 2
          attr.array[i3] = 3.5 + Math.cos(th) * cr * (Math.random() * 0.9 + 0.1)
          attr.array[i3 + 2] = -2.3 + Math.sin(th) * cr * (Math.random() * 0.9 + 0.1)
        }
      }
      attr.needsUpdate = true
    }
  })

  return (
    <group>

      {/* ─── ROOM WALLS ─────────────────────────────────────────── */}

      {/* Back Wall — lower roughness + strong bumpScale for grazing light effect */}
      <mesh position={[0, 4, -4.8]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial
          map={wallColorMap}
          bumpMap={wallBumpMap}
          bumpScale={0.055}
          roughness={0.48}
          metalness={0.04}
        />
      </mesh>

      {/* Left Wall — slightly more matte (receives less light) */}
      <mesh position={[-4.8, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial
          map={wallColorMap}
          bumpMap={wallBumpMap}
          bumpScale={0.042}
          roughness={0.55}
          metalness={0.03}
        />
      </mesh>

      {/* Right Wall — mostly in shadow */}
      <mesh position={[9.2, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#1A1816" roughness={0.96} metalness={0.0} />
      </mesh>

      {/* ─── FLOOR ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#17150F" roughness={0.94} metalness={0.0} bumpMap={floorBumpMap} bumpScale={0.006} />
      </mesh>

      {/* Perspective grid */}
      <gridHelper args={[18, 22, '#1a3030', '#1a3030']} position={[0, 0.002, 0]}>
        <lineBasicMaterial attach="material" transparent opacity={0.10} depthWrite={false} />
      </gridHelper>

      {/* ─── CEILING ────────────────────────────────────────────── */}
      {/*
        Full architectural ceiling at Y=8 (dark, mostly invisible but prevents sky bleed)
      */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8.0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#0F0E0C" roughness={0.98} metalness={0.0} />
      </mesh>

      {/* Dropped ceiling soffit — extended to cover above the sculpture */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[3.5, 5.0, -1.2]} receiveShadow>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial map={ceilingTex} roughness={0.92} metalness={0.0} />
      </mesh>

      {/* Soffit edge trims */}
      <mesh position={[3.5, 4.85, 1.8]}>
        <boxGeometry args={[7.0, 0.30, 0.06]} />
        <meshStandardMaterial color="#111010" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0.0, 4.85, -1.2]}>
        <boxGeometry args={[0.06, 0.30, 6.0]} />
        <meshStandardMaterial color="#111010" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[7.0, 4.85, -1.2]}>
        <boxGeometry args={[0.06, 0.30, 6.0]} />
        <meshStandardMaterial color="#111010" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* ─── SPOTLIGHT FIXTURE on the soffit ────────────────────── */}
      {/*
        Realistic track/recessed spotlight:
        - Track rail (horizontal bar mounted on ceiling)
        - Cylindrical housing (PAR can body)
        - Inner reflector cone
        - Glowing lens at bottom
        - Bloom will add the real glow effect via post-processing
      */}

      {/* Track rail — runs along Z axis above the sculpture */}
      <mesh position={[3.5, 4.96, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 4.8, 8]} />
        <meshStandardMaterial color="#2C2A28" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Track connector clip — directly above sculpture */}
      <mesh position={[3.5, 4.88, -2.3]}>
        <boxGeometry args={[0.08, 0.16, 0.08]} />
        <meshStandardMaterial color="#252321" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Main spotlight housing body */}
      <mesh position={[3.5, 4.60, -2.3]}>
        <cylinderGeometry args={[0.22, 0.18, 0.56, 24]} />
        <meshStandardMaterial color="#1E1D1B" roughness={0.28} metalness={0.82} />
      </mesh>

      {/* Housing top cap */}
      <mesh position={[3.5, 4.89, -2.3]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#252321" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Inner reflector cone — brushed aluminum */}
      <mesh position={[3.5, 4.60, -2.3]}>
        <coneGeometry args={[0.17, 0.48, 24, 1, true]} />
        <meshStandardMaterial color="#B8A890" roughness={0.12} metalness={0.92} side={THREE.BackSide} />
      </mesh>

      {/* Glowing lens disc — pure white so bloom captures it */}
      <mesh position={[3.5, 4.325, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>

      {/* Warm halo ring around lens */}
      <mesh position={[3.5, 4.32, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color="#7A5A2A" toneMapped={false} transparent opacity={0.65} />
      </mesh>

      {/* Tiny emissive point at lens — makes the bulb glow into nearby soffit */}
      <pointLight position={[3.5, 4.32, -2.3]} intensity={18} color="#FFF3CC" distance={1.8} decay={2.5} />


      {/* PEDESTAL — Dark charcoal concrete, matte, minimal reflection */}
      <mesh position={[3.5, 0.38, -2.3]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.76, 2.8]} />
        <meshStandardMaterial color="#1C1A18" roughness={0.92} metalness={0.01} />
      </mesh>


      {/* ─── LIGHTING SYSTEM ─────────────────────────────────────── */}

      {/* All auxiliary lights OFF */}
      <ambientLight intensity={0.0} />

      {/*
        PRIMARY SPOTLIGHT
        - Position moved to match fixture body at [3.2, 4.32, -0.6]
        - Wide 55° cone, penumbra=1.0 (fully feathered)
        - Warm 5200K white
        - decay=1.8 → bright center pool, natural fade to dark corners
      */}
      <spotLight
        ref={spotlightRef}
        position={[3.5, 4.32, -2.3]}
        angle={(55 * Math.PI) / 180}
        penumbra={1.0}
        intensity={spotlightIntensity}
        color={spotlightColor}
        distance={24}
        decay={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-radius={4}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
        shadow-camera-fov={60}
      />

      {/* Very dim warm floor bounce (indirect fill) */}
      {/* No indirect fill — light comes from bulb only */}


      {/* ─── VOLUMETRIC DUST (inside spotlight cone) ─────────────── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028} color="#FFE8C8" transparent opacity={0.18}
          sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ─── INDIRECT BOUNCE LIGHT ──────────────────────────────────────
          Simulates indirect spill from the ceiling spotlight reflecting
          off the floor and pedestal back toward the walls.
          This creates the characteristic soft warm glow behind the sculpture
          and the "cloudy patch" appearance on the back wall plaster.
      */}
      {/* Warm ceiling bounce — diffuse spill from fixture area onto back wall */}
      <pointLight
        position={[3.5, 6.0, -2.8]}
        intensity={55}
        color="#C8A870"
        distance={12}
        decay={1.8}
      />
      {/* Secondary floor bounce — warm reflected light rising from pedestal */}
      <pointLight
        position={[3.5, 1.0, -2.3]}
        intensity={22}
        color="#B8955A"
        distance={7}
        decay={2.2}
      />
    </group>
  )
}
