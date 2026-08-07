import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function NeuralNetwork({ scrollProgress }) {
  const linesRef = useRef()
  const pulsesRef = useRef([])

  // Nodes target positions based on index (Must match ArtifactSculpture coordinates exactly!)
  const getNetTar = (index) => {
    const netTar = new THREE.Vector3()
    if (index < 4) {
      // Layer 1 (Input)
      const yVal = -1.2 + index * 0.8
      netTar.set(-2.8, yVal, 0)
    } else if (index < 12) {
      // Layer 2 (Hidden 1)
      const subIdx = index - 4
      const yVal = -1.75 + subIdx * 0.5
      const zVal = (subIdx % 2 === 0) ? -0.4 : 0.4
      netTar.set(-1.0, yVal, zVal)
    } else if (index < 20) {
      // Layer 3 (Hidden 2)
      const subIdx = index - 12
      const yVal = -1.75 + subIdx * 0.5
      const zVal = (subIdx % 2 === 0) ? 0.4 : -0.4
      netTar.set(1.0, yVal, zVal)
    } else {
      // Layer 4 (Output)
      const subIdx = index - 20
      const yVal = -1.2 + subIdx * 0.8
      netTar.set(2.8, yVal, 0)
    }
    return netTar
  }

  // Generate list of all connection lines between adjacent layers
  const connections = useMemo(() => {
    const list = []
    
    // Connect Layer 1 (0..3) to Layer 2 (4..11)
    for (let i = 0; i < 4; i++) {
      for (let j = 4; j < 12; j++) {
        list.push({ start: getNetTar(i), end: getNetTar(j) })
      }
    }

    // Connect Layer 2 (4..11) to Layer 3 (12..19)
    for (let i = 4; i < 12; i++) {
      for (let j = 12; j < 20; j++) {
        list.push({ start: getNetTar(i), end: getNetTar(j) })
      }
    }

    // Connect Layer 3 (12..19) to Layer 4 (20..23)
    for (let i = 12; i < 20; i++) {
      for (let j = 20; j < 24; j++) {
        list.push({ start: getNetTar(i), end: getNetTar(j) })
      }
    }

    return list
  }, [])

  // Create Float32Array of vertices for lineSegments rendering
  const lineVertices = useMemo(() => {
    const arr = []
    connections.forEach((conn) => {
      arr.push(conn.start.x, conn.start.y, conn.start.z)
      arr.push(conn.end.x, conn.end.y, conn.end.z)
    })
    return new Float32Array(arr)
  }, [connections])

  // Setup 14 data stream pulses
  const pulseCount = 14
  const pulses = useMemo(() => {
    const list = []
    for (let i = 0; i < pulseCount; i++) {
      const n1 = Math.floor(Math.random() * 4)
      const n2 = 4 + Math.floor(Math.random() * 8)
      const n3 = 12 + Math.floor(Math.random() * 8)
      const n4 = 20 + Math.floor(Math.random() * 4)

      list.push({
        id: i,
        path: [getNetTar(n1), getNetTar(n2), getNetTar(n3), getNetTar(n4)],
        progress: Math.random() * 3.0,
        speed: 0.5 + Math.random() * 0.4
      })
    }
    return list
  }, [])

  // Animate connection lines and pulses
  useFrame((state, delta) => {
    // Synapse network starts at scrollOffset 180vh (progress = 180 / 260 = 0.692)
    let netAlpha = 0
    if (scrollProgress > 0.692) {
      const factor = Math.min((scrollProgress - 0.692) / 0.15, 1.0)
      netAlpha = factor
    }

    // Update lines opacity
    if (linesRef.current) {
      linesRef.current.material.opacity = netAlpha * 0.22
      linesRef.current.material.needsUpdate = true
    }

    // Update pulses
    pulses.forEach((pulse) => {
      const mesh = pulsesRef.current[pulse.id]
      if (!mesh) return

      pulse.progress += delta * pulse.speed
      if (pulse.progress >= 3.0) {
        pulse.progress = 0
        const n1 = Math.floor(Math.random() * 4)
        const n2 = 4 + Math.floor(Math.random() * 8)
        const n3 = 12 + Math.floor(Math.random() * 8)
        const n4 = 20 + Math.floor(Math.random() * 4)
        pulse.path = [getNetTar(n1), getNetTar(n2), getNetTar(n3), getNetTar(n4)]
      }

      const segment = Math.floor(pulse.progress)
      const segmentProgress = pulse.progress - segment
      const startPoint = pulse.path[segment]
      const endPoint = pulse.path[segment + 1]

      if (startPoint && endPoint) {
        mesh.position.lerpVectors(startPoint, endPoint, segmentProgress)
      }

      let pulseOpacity = netAlpha * 0.95
      if (pulse.progress < 0.2) {
        pulseOpacity *= (pulse.progress / 0.2)
      } else if (pulse.progress > 2.8) {
        pulseOpacity *= ((3.0 - pulse.progress) / 0.2)
      }
      
      mesh.material.opacity = pulseOpacity
      mesh.material.needsUpdate = true
      
      mesh.visible = scrollProgress > 0.692
    })
  })

  return (
    <group>
      {/* Golden connection synapses */}
      {scrollProgress > 0.692 && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[lineVertices, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#F4D1A6" /* Warm Golden highlighting spec */
            transparent
            opacity={0}
            linewidth={1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* Traveling Golden Data Pulses */}
      {pulses.map((pulse) => (
        <mesh
          key={pulse.id}
          ref={(el) => (pulsesRef.current[pulse.id] = el)}
        >
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshBasicMaterial
            color="#FFF6EA" /* Warm white glowing pulses */
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
