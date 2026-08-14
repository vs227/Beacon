import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── PLASTER TEXTURE GENERATOR ───────────────────────────────────────────────
// Generates high-fidelity organic dark charcoal microcement plaster textures.
// The rough plaster bump relief catches the spreading light beam naturally.
function createPlasterTexturePair() {
  const W = 1024, H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // 1. Color Map: Dark Warm Charcoal Base (#1E1B19)
  ctx.fillStyle = '#1E1B19'
  ctx.fillRect(0, 0, W, H)

  // Subtle plaster mass tonal variations (#252220, #2D2926, #35302C)
  const tones = ['37,34,32', '45,41,38', '53,48,44']
  for (let i = 0; i < 35; i++) {
    const cx = Math.random() * W
    const cy = Math.random() * H
    const r = 180 + Math.random() * 280
    const rgb = tones[Math.floor(Math.random() * tones.length)]
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grd.addColorStop(0, `rgba(${rgb},0.35)`)
    grd.addColorStop(0.6, `rgba(${rgb},0.12)`)
    grd.addColorStop(1, 'rgba(30,27,25,0)')
    ctx.fillStyle = grd
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
  }

  // Directional hand-trowel sweeps (subtle albedo modulation)
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = 0.18
  for (let i = 0; i < 90; i++) {
    const x0 = Math.random() * W
    const y0 = Math.random() * H
    const angle = (Math.random() - 0.5) * 0.35
    const len = 160 + Math.random() * 280
    const x1 = x0 + Math.cos(angle) * len
    const y1 = y0 + Math.sin(angle) * len
    const strokeWidth = 12 + Math.random() * 28

    const val = 128 + Math.floor((Math.random() - 0.5) * 45)
    ctx.strokeStyle = `rgb(${val},${val},${val})`
    ctx.lineWidth = strokeWidth
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  }
  ctx.restore()

  // Fine micro-plaster stipple grain
  ctx.save()
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 45000; i++) {
    const x = Math.random() * W, y = Math.random() * H
    const g = 28 + Math.floor(Math.random() * 32)
    ctx.fillStyle = `rgb(${g},${g - 2},${g - 4})`
    ctx.fillRect(x, y, Math.random() * 1.5 + 0.4, Math.random() * 1.4 + 0.4)
  }
  ctx.restore()

  const colorTex = new THREE.CanvasTexture(canvas)
  colorTex.wrapS = colorTex.wrapT = THREE.RepeatWrapping
  colorTex.repeat.set(1.0, 1.0)

  // 2. Bump Map: High-contrast plaster height relief & trowel ridges
  const bCanvas = document.createElement('canvas')
  bCanvas.width = W; bCanvas.height = H
  const bCtx = bCanvas.getContext('2d')
  bCtx.fillStyle = '#808080'
  bCtx.fillRect(0, 0, W, H)

  // Plaster height mass variations
  for (let i = 0; i < 180; i++) {
    const cx = Math.random() * W
    const cy = Math.random() * H
    const r = Math.random() * 100 + 28
    const isRaised = Math.random() > 0.42
    const v = isRaised ? (150 + (Math.random() * 60 | 0)) : (50 + (Math.random() * 45 | 0))
    const grd = bCtx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grd.addColorStop(0, `rgba(${v},${v},${v},0.45)`)
    grd.addColorStop(1, 'rgba(128,128,128,0)')
    bCtx.fillStyle = grd
    bCtx.beginPath(); bCtx.arc(cx, cy, r, 0, Math.PI * 2); bCtx.fill()
  }

  // Trowel drag mark ridges & valleys
  for (let i = 0; i < 130; i++) {
    const x0 = Math.random() * W
    const y0 = Math.random() * H
    const angle = (Math.random() - 0.5) * 0.40
    const len = 140 + Math.random() * 300
    const x1 = x0 + Math.cos(angle) * len
    const y1 = y0 + Math.sin(angle) * len
    const strokeWidth = 14 + Math.random() * 32
    const offset = strokeWidth * 0.22

    bCtx.save()
    bCtx.globalAlpha = 0.40
    bCtx.strokeStyle = 'rgb(55,55,55)'; bCtx.lineWidth = strokeWidth
    bCtx.beginPath(); bCtx.moveTo(x0 - offset, y0 - offset); bCtx.lineTo(x1 - offset, y1 - offset); bCtx.stroke()
    bCtx.strokeStyle = 'rgb(200,200,200)'; bCtx.lineWidth = strokeWidth
    bCtx.beginPath(); bCtx.moveTo(x0 + offset, y0 + offset); bCtx.lineTo(x1 + offset, y1 + offset); bCtx.stroke()
    bCtx.restore()
  }

  // Micro surface bump noise
  for (let i = 0; i < 65000; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const v = 60 + (Math.random() * 135 | 0)
    bCtx.fillStyle = `rgba(${v},${v},${v},0.18)`
    bCtx.fillRect(x, y, Math.random() * 2.2 + 0.5, Math.random() * 2.2 + 0.5)
  }

  const bumpTex = new THREE.CanvasTexture(bCanvas)
  bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping
  bumpTex.repeat.set(1.0, 1.0)

  return [colorTex, bumpTex]
}

export default function MuseumEnvironment({ spotlightIntensity = 200, spotlightColor = '#F5F0EA' }) {
  const spotlightRef = useRef()
  const particlesRef = useRef()

  // Target for the single spotlight
  const spotlightTarget = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(3.5, 0.4, -2.3)
    return obj
  }, [])

  // ─── DUST PARTICLES ────────────────────────────────────────────────────────
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

  // ─── FLOOR BUMP MAP ─────────────────────────────────────────────────────────
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

  // ─── WALL TEXTURES ─────────────────────────────────────────────────────────
  const textureVer = useMemo(() => Date.now(), [])
  const [wallColorMap, wallBumpMap] = useMemo(() => createPlasterTexturePair(), [textureVer])

  // ─── CEILING TEXTURE ────────────────────────────────────────────────────────
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

  // ─── FRAME UPDATE ───────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const dt = Math.min(delta || 0.016, 0.05)

    // keep spotlight target aligned with fixture
    if (spotlightRef.current) {
      spotlightRef.current.target.position.set(3.5, 1.25, -2.3)
      spotlightRef.current.target.updateMatrixWorld()
    }

    // Particle physics: gravity, wind/turbulence, drag, floor & wall collisions
    if (particlesRef.current) {
      const attr = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        // read current state
        let px = attr.array[i3]
        let py = attr.array[i3 + 1]
        let pz = attr.array[i3 + 2]
        let vx = velocities[i3]
        let vy = velocities[i3 + 1]
        let vz = velocities[i3 + 2]

        // forces
        const gravity = -0.018 // gentle downward pull
        const windX = Math.sin(time * 0.9 + noiseSeeds[i]) * 0.0012
        const windZ = Math.cos(time * 0.95 + noiseSeeds[i]) * 0.0010

        // integrate velocity
        vx += windX * dt
        vy += gravity * dt
        vz += windZ * dt

        // apply simple drag
        const drag = 0.85
        vx *= Math.pow(drag, dt * 60)
        vy *= Math.pow(drag, dt * 60)
        vz *= Math.pow(drag, dt * 60)

        // integrate position
        px += vx * (1.0 + 0.2 * Math.random())
        py += vy * (1.0 + 0.2 * Math.random())
        pz += vz * (1.0 + 0.2 * Math.random())

        // floor collision and slight bounce
        const floorY = 0.05
        if (py <= floorY) {
          py = floorY + Math.random() * 0.01
          vy = Math.abs(vy) * 0.32 // bounce up
          vx *= 0.6; vz *= 0.6      // damping on impact
        }

        // ceiling clamp (reset if it drifts too high)
        if (py > 6.2) {
          // respawn near source cone
          const t = Math.random()
          const coneRadius = 1.8 * (1 - t * 0.55)
          const theta = Math.random() * Math.PI * 2
          px = 3.5 + Math.cos(theta) * coneRadius * (Math.random() * 0.9 + 0.1)
          py = Math.random() * 0.6 + 0.08
          pz = -2.3 + Math.sin(theta) * coneRadius * (Math.random() * 0.9 + 0.1)
          vx = (Math.random() - 0.5) * 0.002
          vy = 0.008 + Math.random() * 0.012
          vz = (Math.random() - 0.5) * 0.002
        }

        // Back wall collision (soft reflect)
        const backWallZ = -4.8 + 0.18
        if (pz < backWallZ) {
          pz = backWallZ + (backWallZ - pz) * 0.15
          vz = Math.abs(vz) * 0.35
          vx *= 0.7
        }

        // Side wall soft limits (keeps beam inside the room)
        const leftLimit = -8.0
        const rightLimit = 12.0
        if (px < leftLimit) { px = leftLimit + 0.02; vx = Math.abs(vx) * 0.45 }
        if (px > rightLimit) { px = rightLimit - 0.02; vx = -Math.abs(vx) * 0.45 }

        // write back
        attr.array[i3] = px
        attr.array[i3 + 1] = py
        attr.array[i3 + 2] = pz
        velocities[i3] = vx
        velocities[i3 + 1] = vy
        velocities[i3 + 2] = vz

        // gentle drift to keep particles aligned with the spotlight cone
        const coneCenterX = 3.5
        const coneCenterZ = -2.3
        const toCenterX = coneCenterX - px
        const toCenterZ = coneCenterZ - pz
        // apply a tiny restoring acceleration toward the cone axis
        velocities[i3] += toCenterX * 0.00006 * dt
        velocities[i3 + 2] += toCenterZ * 0.00006 * dt
      }

      attr.needsUpdate = true
    }
  })

  return (
    <group>
      <primitive object={spotlightTarget} />

      {/* ─── ROOM WALLS ─────────────────────────────────────────── */}
      {/* Back Wall — dark charcoal plaster with strong bump relief catching spreading light */}
      <mesh position={[0, 4, -4.8]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial
          key={`back-mat-${textureVer}`}
          map={wallColorMap}
          bumpMap={wallBumpMap}
          bumpScale={0.65}
          roughness={0.88}
          metalness={0.0}
        />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-4.8, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial
          key={`left-mat-${textureVer}`}
          map={wallColorMap}
          bumpMap={wallBumpMap}
          bumpScale={0.60}
          roughness={0.88}
          metalness={0.0}
        />
      </mesh>

      {/* Right Wall */}
      <mesh position={[9.2, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial
          key={`right-mat-${textureVer}`}
          map={wallColorMap}
          bumpMap={wallBumpMap}
          bumpScale={0.60}
          roughness={0.88}
          metalness={0.0}
        />
      </mesh>

      {/* ─── FLOOR ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#17150F" roughness={0.94} metalness={0.0} bumpMap={floorBumpMap} bumpScale={0.006} />
      </mesh>

      <gridHelper args={[18, 22, '#1a3030', '#1a3030']} position={[0, 0.002, 0]}>
        <lineBasicMaterial attach="material" transparent opacity={0.10} depthWrite={false} />
      </gridHelper>

      {/* ─── CEILING ────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8.0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#0F0E0C" roughness={0.98} metalness={0.0} />
      </mesh>

      {/* Dropped ceiling soffit */}
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

      {/* ─── SPOTLIGHT FIXTURE on soffit ─────────────────────────── */}
      <mesh position={[3.5, 4.96, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 4.8, 8]} />
        <meshStandardMaterial color="#2C2A28" roughness={0.35} metalness={0.75} />
      </mesh>

      <mesh position={[3.5, 4.88, -2.3]}>
        <boxGeometry args={[0.08, 0.16, 0.08]} />
        <meshStandardMaterial color="#252321" roughness={0.4} metalness={0.7} />
      </mesh>

      <mesh position={[3.5, 4.60, -2.3]}>
        <cylinderGeometry args={[0.22, 0.18, 0.56, 24]} />
        <meshStandardMaterial color="#1E1D1B" roughness={0.28} metalness={0.82} />
      </mesh>

      <mesh position={[3.5, 4.89, -2.3]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#252321" roughness={0.3} metalness={0.8} />
      </mesh>

      <mesh position={[3.5, 4.60, -2.3]}>
        <coneGeometry args={[0.17, 0.48, 24, 1, true]} />
        <meshStandardMaterial color="#B8A890" roughness={0.12} metalness={0.92} side={THREE.BackSide} />
      </mesh>

      {/* Glowing lens disc */}
      <mesh position={[3.5, 4.325, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>

      <mesh position={[3.5, 4.32, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color="#7A5A2A" toneMapped={false} transparent opacity={0.65} />
      </mesh>

      <pointLight position={[3.5, 4.32, -2.3]} intensity={14} color="#FFF3CC" distance={1.8} decay={2.0} />

      {/* PEDESTAL — Dark charcoal concrete */}
      <mesh position={[3.5, 0.38, -2.3]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.76, 2.8]} />
        <meshStandardMaterial color="#1C1A18" roughness={0.92} metalness={0.01} />
      </mesh>

      {/* ─── SINGLE SPOTLIGHT ILLUMINATING THE ROOM ALONE ─────────── */}

      {/* Minimal ambient ground fill for realistic deep shadow detail */}
      <hemisphereLight skyColor="#1A1816" groundColor="#050404" intensity={0.06} />

      {/*
        THE SINGLE SPOTLIGHT
        - Positioned inside the ceiling track fixture body at [3.5, 4.4, -1.8]
        - Wide 68° beam angle spreading light across sculpture, floor, & plaster walls
        - Soft 1.0 penumbra falloff
        - Physical decay=1.4 so spreading light reveals wall plaster roughness clearly
      */}
      <spotLight
        ref={spotlightRef}
        position={[3.5, 4.4, -1.8]}
        target={spotlightTarget}
        angle={(68 * Math.PI) / 180}
        penumbra={1.0}
        intensity={spotlightIntensity}
        color={spotlightColor}
        distance={28}
        decay={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-radius={3.5}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-fov={72}
      />

      {/* ─── VOLUMETRIC DUST (inside spotlight cone) ─────────────── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028} color="#FFE8C8" transparent opacity={0.16}
          sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>

    </group>
  )
}
