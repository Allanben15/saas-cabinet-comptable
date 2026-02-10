'use client'

/**
 * Composant Avatar3D
 * Affiche un avatar 3D Ready Player Me avec React Three Fiber
 */

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

interface Avatar3DProps {
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  enableControls?: boolean
  autoRotate?: boolean
  showEnvironment?: boolean
}

// Tailles en pixels
const sizeMap = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 200,
}

// Composant pour charger et afficher le modèle GLB
function AvatarModel({ url, autoRotate }: { url: string; autoRotate?: boolean }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (scene) {
      // Centrer le modèle
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      scene.position.sub(center)
      scene.position.y = -box.min.y - center.y // Placer les pieds au sol
    }
  }, [scene])

  useFrame((state) => {
    if (autoRotate && modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
    }
  })

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1} />
    </group>
  )
}

// Composant de fallback pendant le chargement
function LoadingAvatar() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  )
}

// Composant avatar par défaut (quand pas d'URL)
function DefaultAvatar({ color = '#6366f1' }: { color?: string }) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Corps */}
      <mesh position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.25, 0.5, 4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tête */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Yeux */}
      <mesh position={[-0.08, 0.9, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.08, 0.9, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Pupilles */}
      <mesh position={[-0.08, 0.9, 0.21]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.08, 0.9, 0.21]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  )
}

// Ajuster la caméra selon le modèle
function CameraController({ hasAvatar }: { hasAvatar: boolean }) {
  const { camera } = useThree()

  useEffect(() => {
    if (hasAvatar) {
      camera.position.set(0, 1, 2.5)
    } else {
      camera.position.set(0, 0.5, 2)
    }
    camera.lookAt(0, hasAvatar ? 0.8 : 0.4, 0)
  }, [camera, hasAvatar])

  return null
}

export function Avatar3D({
  avatarUrl,
  size = 'md',
  className = '',
  enableControls = false,
  autoRotate = true,
  showEnvironment = true,
}: Avatar3DProps) {
  const [isClient, setIsClient] = useState(false)
  const pixelSize = sizeMap[size]
  const hasValidUrl = avatarUrl && avatarUrl.endsWith('.glb')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // SSR: afficher un placeholder
  if (!isClient) {
    return (
      <div
        className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <span className="text-white font-bold" style={{ fontSize: pixelSize * 0.4 }}>
          ?
        </span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Canvas
        camera={{ position: [0, 1, 2.5], fov: 35 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <CameraController hasAvatar={!!hasValidUrl} />

        {/* Éclairage */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        {/* Environnement */}
        {showEnvironment && <Environment preset="studio" />}

        {/* Avatar */}
        <Suspense fallback={<LoadingAvatar />}>
          {hasValidUrl ? (
            <AvatarModel url={avatarUrl} autoRotate={autoRotate} />
          ) : (
            <DefaultAvatar />
          )}
        </Suspense>

        {/* Ombre au sol */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={2}
          blur={2}
          far={1}
        />

        {/* Contrôles optionnels */}
        {enableControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={size === 'xl'}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            target={[0, hasValidUrl ? 0.8 : 0.4, 0]}
          />
        )}
      </Canvas>
    </div>
  )
}

// Précharger un avatar
export function preloadAvatar(url: string) {
  if (url && url.endsWith('.glb')) {
    useGLTF.preload(url)
  }
}
