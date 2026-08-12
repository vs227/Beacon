import React, { Suspense, Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import roadUrl from '../3dAssets/american_road.glb?url'
import bmwUrl from '../3dAssets/bmw_m5_cs_f90/scene.gltf?url'
import lighthouseUrl from '../3dAssets/lighthouse__village_-_lowpoly_scene/scene.gltf?url'
import cargoShipUrl from '../3dAssets/cargo_ship.glb?url'

useGLTF.preload(roadUrl)
useGLTF.preload(bmwUrl)
useGLTF.preload(lighthouseUrl)
useGLTF.preload(cargoShipUrl)

class ModelErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.warn('Model load issue:', err) }
  render() { return this.state.hasError ? (this.props.fallback || null) : this.props.children }
}

// ─── FIXED CLIFF MODEL ─────────────────────────────────────────────────────

function CliffRoadPerspectiveView({ isVisible = true, onReady }) {
  const { scene } = useGLTF(roadUrl)
  const groupRef = useRef()

  const processedModel = useMemo(() => {
    if (!scene) return null
    const cloned = scene.clone(true)

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.side = THREE.DoubleSide
          child.material.needsUpdate = true
        }
      }
    })

    const box = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const wrapper = new THREE.Group()
    cloned.position.set(-center.x, -center.y, -center.z)
    wrapper.add(cloned)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) {
      wrapper.scale.setScalar(21 / maxDim)
    }

    return wrapper
  }, [scene])

  useEffect(() => {
    if (onReady) onReady()
  }, [onReady])

  return processedModel ? (
    <group ref={groupRef} position={[0, 0.5, 0]} rotation={[0.08, -Math.PI * 0.45, 0]}>
      <primitive object={processedModel} />
    </group>
  ) : null
}

// ─── BMW M5 CS MODEL POSITIONED ON ROAD TARMAC ──────────────────────────────

function BMWCarOnRoad({ progress = 0, isVisible = true }) {
  const { scene } = useGLTF(bmwUrl)
  const groupRef = useRef()
  const leftLightRef = useRef()
  const rightLightRef = useRef()

  const processedCar = useMemo(() => {
    if (!scene) return null
    const cloned = scene.clone(true)

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.geometry) {
          child.geometry.computeVertexNormals()
        }

        if (child.material) {
          child.material = child.material.clone()

          const matName = (child.material.name || '').toLowerCase()
          const meshName = (child.name || '').toLowerCase()
          const c = child.material.color

          const isPaint =
            matName.includes('body') ||
            matName.includes('paint') ||
            matName.includes('car') ||
            matName.includes('primary') ||
            meshName.includes('body') ||
            (c && c.b > 0.4 && c.b > c.r)

          if (isPaint && !matName.includes('glass') && !matName.includes('window') && !matName.includes('wheel') && !matName.includes('tire') && !matName.includes('caliper')) {
            child.material.color.set('#F5F5F5')
            child.material.roughness = 0.05
            child.material.metalness = 0.90
            child.material.flatShading = false
          }
          child.material.needsUpdate = true
        }
      }
    })

    const box = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const wrapper = new THREE.Group()
    cloned.position.set(-center.x, -box.min.y, -center.z)
    wrapper.add(cloned)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) {
      wrapper.scale.setScalar(1.2 / maxDim)
    }

    return wrapper
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const p = Math.max(0, Math.min(1, progress))

    const destX = 0.70 - p * 0.5
    const destY = -1.25 - p * 0.20
    const destZ = 0.53 - p * 6.0

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, destX, 0.08)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, destY, 0.08)
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, destZ, 0.08)
  })

  const leftTarget = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(8.0, -0.88, -2.0)
    return obj
  }, [])

  const rightTarget = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(8.0, -0.88, -2.0)
    return obj
  }, [])

  return processedCar ? (
    <group ref={groupRef} position={[0.70, -1.25, 0.53]} rotation={[0.02, -Math.PI * 1.50, 0]}>
      <primitive object={processedCar} />
      <primitive object={leftTarget} />
      <primitive object={rightTarget} />

      {/* Headlights illuminating tarmac (Active only in Section 0) */}
      {isVisible && (
        <>
          <spotLight
            ref={leftLightRef}
            position={[-0.2, 0.25, 0.8]}
            target={leftTarget}
            intensity={80}
            color="#FFFFFF"
            angle={0.22}
            penumbra={0.3}
            distance={25}
          />
          <spotLight
            ref={rightLightRef}
            position={[0.2, 0.25, 0.8]}
            target={rightTarget}
            intensity={80}
            color="#FFFFFF"
            angle={0.22}
            penumbra={0.3}
            distance={25}
          />
        </>
      )}
    </group>
  ) : null
}

// ─── ANIMATED OCEAN WATER PLANE ───────────────────────────────────────────

function Ocean() {
  const meshRef = useRef()
  const materialRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#020a18') },
    uColor2: { value: new THREE.Color('#0a1628') },
    uHighlight: { value: new THREE.Color('#1a3a5c') },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Gentle wave motion
      float wave1 = sin(pos.x * 0.8 + uTime * 0.4) * 0.15;
      float wave2 = sin(pos.z * 0.6 + uTime * 0.3) * 0.12;
      float wave3 = sin((pos.x + pos.z) * 0.5 + uTime * 0.5) * 0.08;
      
      pos.y += wave1 + wave2 + wave3;
      vElevation = wave1 + wave2 + wave3;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uHighlight;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      // Blend between deep and mid ocean colors
      vec3 color = mix(uColor1, uColor2, vUv.y * 0.5 + 0.5);
      
      // Add subtle moonlit highlights on wave peaks
      float highlight = smoothstep(0.08, 0.35, vElevation);
      color = mix(color, uHighlight, highlight * 0.25);
      
      // Subtle shimmer
      float shimmer = sin(vUv.x * 40.0 + uTime * 0.8) * sin(vUv.y * 40.0 + uTime * 0.6);
      color += uHighlight * shimmer * 0.03;
      
      // Fade edges to background color for seamless blending
      float edgeFade = 1.0 - smoothstep(0.3, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
      float alpha = edgeFade * 0.92;
      
      gl_FragColor = vec4(color, alpha);
    }
  `

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]}>
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── 3D LIGHTHOUSE SIGNAL TOWER SCENE ─────────────────────────────────────

function LighthouseSceneView({ isVisible = false, activeSection = 1 }) {
  const { scene } = useGLTF(lighthouseUrl)
  const groupRef = useRef()

  const processedLighthouse = useMemo(() => {
    if (!scene) return null
    const cloned = scene.clone(true)
    cloned.traverse((child) => {
      // Disable any internal GLTF lights that cause unusual glare/beams on water
      if (child.isLight) {
        child.visible = false
        child.intensity = 0
      }
      if (child.isMesh) {
        const name = (child.name || '').toLowerCase()
        const matName = (child.material?.name || '').toLowerCase()

        // Hide stars, sky dots, particles, or floating glint meshes
        if (
          name.includes('star') ||
          name.includes('particle') ||
          name.includes('dot') ||
          name.includes('dust') ||
          name.includes('sky') ||
          name.includes('spark') ||
          name.includes('sphere') ||
          name.includes('circle') ||
          matName.includes('star') ||
          matName.includes('particle') ||
          matName.includes('dot') ||
          matName.includes('sky') ||
          matName.includes('spark')
        ) {
          child.visible = false
          return
        }

        // Hide tiny unattached floating meshes elevated high above the ground
        if (child.geometry) {
          child.geometry.computeBoundingBox()
          const bbox = child.geometry.boundingBox
          if (bbox) {
            const sizeY = bbox.max.y - bbox.min.y
            const sizeX = bbox.max.x - bbox.min.x
            if (sizeY < 1.5 && sizeX < 1.5 && bbox.min.y > 12) {
              child.visible = false
              return
            }
          }
        }

        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          // Tone down excessive specularity & shininess causing bright light streaks
          if (child.material.specular) {
            child.material.specular.set('#050505')
          }
          child.material.shininess = 5
          child.material.roughness = 0.85
          child.material.needsUpdate = true
        }
      }
    })
    return cloned
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    let targetX = 100 // Off-screen right when inactive (activeSection === 0)
    if (activeSection === 1 || activeSection === 2) {
      targetX = 10.5 // Maintains steady position without flipping or jumping
    }
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 5.0, delta)
  })

  return processedLighthouse ? (
    <group ref={groupRef} position={[10.5, -1.85, -4]} scale={0.24}>
      <primitive object={processedLighthouse} />
      {/* Animated ocean water surrounding the lighthouse island */}
      <Ocean />
    </group>
  ) : null
}

// ─── CARGO SHIP MODEL (SAILS INTO VIEW IN SECTION 02) ─────────────────────

function CargoShipView({ activeSection = 0, shipPosition = [8.0, -1.35, 2.0], shipRotation = [0, -Math.PI * 0.3, 0], shipScale = 3.0, bobOffset = 0 }) {
  const { scene } = useGLTF(cargoShipUrl)
  const groupRef = useRef()
  const opacityRef = useRef(0)

  const processedShip = useMemo(() => {
    if (!scene) return null
    const cloned = scene.clone(true)

    cloned.traverse((child) => {
      if (child.isLight) {
        child.visible = false
        child.intensity = 0
      }
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.material.opacity = 0
          child.material.roughness = 0.7
          child.material.needsUpdate = true
        }
      }
    })

    // Center and normalize scale
    const box = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const wrapper = new THREE.Group()
    cloned.position.set(-center.x, -box.min.y, -center.z)
    wrapper.add(cloned)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) {
      wrapper.scale.setScalar(shipScale / maxDim)
    }

    return wrapper
  }, [scene, shipScale])

  // Smooth fade-in/fade-out & gentle glide transition when entering/exiting Section 02
  useFrame((state, delta) => {
    if (!groupRef.current) return

    const isTargetSection = activeSection === 2
    const targetOpacity = isTargetSection ? 1.0 : 0.0

    // Smoothly damp opacity
    opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 3.5, delta)

    // Toggle visibility based on opacity threshold to optimize rendering
    groupRef.current.visible = opacityRef.current > 0.01

    // Apply smooth opacity to all materials
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = opacityRef.current
      }
    })

    // Gentle ocean bob with offset + subtle glide offset during entrance from mist
    const time = state.clock.elapsedTime + bobOffset
    const zGlideOffset = (1 - opacityRef.current) * -8.0
    groupRef.current.position.x = shipPosition[0]
    groupRef.current.position.y = shipPosition[1] + Math.sin(time * 0.5) * 0.06
    groupRef.current.position.z = shipPosition[2] + zGlideOffset
    groupRef.current.rotation.z = Math.sin(time * 0.4) * 0.015
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.01
  })

  return processedShip ? (
    <group ref={groupRef} position={shipPosition} rotation={shipRotation} visible={false}>
      <primitive object={processedShip} />
    </group>
  ) : null
}

// ─── ROTATING LIGHTHOUSE BEAM SPOTLIGHT & SLEEK VOLUMETRIC BEAM ───────────

function LighthouseSpotlight({ activeSection }) {
  return null
}

// ─── SECTION 0 GROUP (CLIFF + CAR SLIDES FAR OFF TO THE LEFT) ──────────────

function Section0Group({ isVisible, progress, onReady }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Target X: 0 when active, slides completely off-screen to -100 on the left when inactive
    const targetX = isVisible ? 0 : -100
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 6.5, delta)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CliffRoadPerspectiveView isVisible={isVisible} onReady={onReady} />
      <BMWCarOnRoad progress={progress} isVisible={isVisible} />
    </group>
  )
}

// ─── DYNAMIC CAMERA RIG (360° ROUND LIGHTHOUSE ORBIT & 4TH SCROLL TRANSITION)

function CameraRig({ activeSection, cameraProgress = 0 }) {
  const { camera } = useThree()
  const controlsRef = useRef()

  useFrame((_, delta) => {
    let basePos = [4, -0.2, 7]
    let baseLook = [0, 0.4, 0]
    let baseFov = 44

    if (activeSection === 1) {
      // Partial gentle orbit (117°) around the far right lighthouse with camera angle shifted to the LEFT
      const cp = Math.max(0, Math.min(1, cameraProgress))
      const lx = 10.5
      const lz = -4.0
      const radius = 11.029
      const angle0 = Math.atan2(7.0 - lz, 4.0 - lx)
      const angle = angle0 + cp * Math.PI * 0.65

      basePos = [
        lx + radius * Math.cos(angle) - 3.5,
        -0.2 + Math.sin(cp * Math.PI) * 0.8,
        lz + radius * Math.sin(angle),
      ]
      baseLook = [6.5, 0.4, -4.0]
      baseFov = 44
    } else if (activeSection === 2) {
      // Seamlessly maintains the exact camera angle & lighthouse position reached at the end of 01 rotation
      const lx = 10.5
      const lz = -4.0
      const radius = 11.029
      const angle0 = Math.atan2(7.0 - lz, 4.0 - lx)
      const endAngle = angle0 + Math.PI * 0.65

      basePos = [
        lx + radius * Math.cos(endAngle) - 3.5,
        -0.2,
        lz + radius * Math.sin(endAngle),
      ]
      baseLook = [6.5, 0.4, -4.0]
      baseFov = 44
    }

    // Direct smooth camera movement — no up-to-down arc
    camera.position.x = THREE.MathUtils.damp(camera.position.x, basePos[0], 3.8, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, basePos[1], 3.8, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, basePos[2], 3.8, delta)

    camera.fov = THREE.MathUtils.damp(camera.fov, baseFov, 3.8, delta)
    camera.updateProjectionMatrix()

    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, baseLook[0], 3.8, delta)
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, baseLook[1], 3.8, delta)
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, baseLook[2], 3.8, delta)
    }
  })

  return <OrbitControls ref={controlsRef} makeDefault enableZoom enablePan enableRotate />
}

export default function SceneCanvas({ activeSection = 0, heroProgress = 0, cameraProgress = 0, onReady }) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const scroller = document.querySelector('.scroll-container')
    const handleScroll = () => {
      if (scroller && scroller.scrollHeight > scroller.clientHeight) {
        setScrollProgress(scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight))
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight
        if (total > 0) setScrollProgress(window.scrollY / total)
      }
    }

    if (scroller) scroller.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      if (scroller) scroller.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Car progress reaches 1.0 at the end of Section 0
  const carDriveProgress = useMemo(() => {
    if (activeSection > 0) return 1.0
    if (heroProgress > 0) return heroProgress
    return Math.min(1.0, scrollProgress * 2.0)
  }, [activeSection, heroProgress, scrollProgress])

  const isCliffActive = activeSection === 0
  const isLighthouseActive = activeSection === 1 || activeSection === 2

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas
        camera={{ position: [4, -0.2, 7], fov: 44, near: 0.1, far: 500 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: activeSection === 0 ? 1.02 : 1.1 }}
      >
        <color attach="background" args={['#000000']} />
        {/* Dynamic Pure Pitch Black Fog */}
        <fog attach="fog" args={['#000000', activeSection === 0 ? 3.5 : 8, activeSection === 0 ? 16.5 : 80]} />

        {/* Dynamic Clear Atmospheric Nighttime Lighting */}
        <ambientLight intensity={activeSection === 0 ? 0.08 : 0.18} color="#18181B" />
        {/* Soft Moonlight */}
        <directionalLight position={[-15, 25, 15]} intensity={activeSection === 0 ? 0.60 : 0.85} color="#E2E8F0" castShadow />
        {/* Soft Atmospheric Rim Light */}
        <directionalLight position={[-10, 30, -20]} intensity={0.12} color="#94A3B8" />

        {/* Section 0 Scene (Cliff + BMW Car): Glides off smoothly to the LEFT (-100) */}
        <ModelErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Section0Group isVisible={isCliffActive} progress={carDriveProgress} onReady={onReady} />
          </Suspense>
        </ModelErrorBoundary>

        {/* Section 1 & 2 Scene (3D Lighthouse): Glides in smoothly from RIGHT, moves left in Section 02 */}
        <ModelErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <LighthouseSceneView isVisible={isLighthouseActive} activeSection={activeSection} />
          </Suspense>
        </ModelErrorBoundary>

        {/* Dynamic Rotating Beacon Light Beam */}
        <LighthouseSpotlight activeSection={activeSection} />

        {/* Cargo Ship: Flanking left side of lighthouse island */}
        <ModelErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <CargoShipView activeSection={activeSection} shipPosition={[4.0, -1.35, -0.5]} shipRotation={[0, -Math.PI * 0.25, 0]} shipScale={4.2} bobOffset={0} />
          </Suspense>
        </ModelErrorBoundary>

        {/* Dynamic 360° Lighthouse Orbit & 4th Scroll Transition Camera Rig */}
        <CameraRig activeSection={activeSection} cameraProgress={cameraProgress} />
      </Canvas>
    </div>
  )
}
