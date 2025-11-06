import { Canvas } from '@react-three/fiber'
import { useGLTF, PresentationControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { useState, Suspense, Component } from 'react'
import WatchTryOn from '../components/WatchTryOn'
import './watches.css'

// Error Boundary for Environment loading errors
class EnvironmentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Environment loading error (using fallback lighting):', error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Fallback to ambient/spot lights only
    }
    return this.props.children;
  }
}

export default function Watches() {
  const [selectedWatch, setSelectedWatch] = useState(0)
  const [showTryOn, setShowTryOn] = useState(false)
  
  const watchModels = [
    { name: 'Luxury Premium Watch', model: '/models/watch-v1.glb', thumbnail: '/models/watch.jpg' },
    // { name: 'Classic Timepiece', model: '/models/watch.glb', thumbnail: '/models/watch-thumb.jpg' },
    { name: 'Modern Design', model: '/models/watch-v1.glb', thumbnail: '/models/watch.jpg' },
    // { name: 'Sport Edition', model: '/models/watch.glb', thumbnail: '/models/watch-thumb.jpg' }  
  ]

  // If Try On is active, show the AR component
  if (showTryOn) {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <WatchTryOn 
          modelPath={watchModels[selectedWatch].model} 
          onClose={() => setShowTryOn(false)}
        />
      </div>
    )
  }

  return (
    <div className="watches-container">
      <div className="watch-text">Stunning 3D watch</div>
      <div className="watch-canvas-wrapper">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 25 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}>
            <Watch 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, 0.1, 1]} 
              scale={0.002} 
              modelPath={watchModels[selectedWatch].model}
            />
          </PresentationControls>
          <ContactShadows position={[0, -1.4, 0]} opacity={0.75} scale={10} blur={3} far={4} />
          <Suspense fallback={null}>
            <EnvironmentErrorBoundary>
              <SafeEnvironment />
            </EnvironmentErrorBoundary>
          </Suspense>
        </Canvas>
      </div>
      
      {/* Watch Label with Try On Button */}
      <div className="watch-label-container">
        <div className="watch-label">{watchModels[selectedWatch].name}</div>
        <button 
          className="try-on-button"
          onClick={() => setShowTryOn(true)}
        >
          Try On
        </button>
      </div>
      
      {/* Thumbnail Navigation */}
      <div className="watch-thumbnails">
        {watchModels.map((watch, index) => (
          <button
            key={index}
            className={`thumbnail-circle ${selectedWatch === index ? 'active' : ''}`}
            onClick={() => setSelectedWatch(index)}
            style={{
              backgroundImage: `url(${watch.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!watch.thumbnail && (
              <div className="thumbnail-placeholder">
                {index + 1}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Safe Environment component that handles offline/loading errors
function SafeEnvironment() {
  // Check if we're online
  const isOnline = navigator.onLine;
  
  // Don't load Environment if offline to prevent HDR loading errors
  if (!isOnline) {
    return null;
  }
  
  // Use a simpler preset that's less likely to fail
  return <Environment preset="sunset" />;
}

function Watch({ modelPath, ...props }) {
  const { nodes, materials } = useGLTF(modelPath)
  
  // Handle different model structures
  const getWatchMesh = () => {
    if (nodes.Object005_glass_0 && nodes.Object006_watch_0) {
      // watch-v1.glb structure
      return (
        <>
          <mesh geometry={nodes.Object005_glass_0.geometry} material={materials.glass}>
            <Html scale={100} rotation={[Math.PI / 2, 0, 0]} position={[180, -350, 50]} transform occlude>
              <div className="annotation">
                6.550 $ <span style={{ fontSize: '1.5em' }}></span>
              </div>
            </Html>
          </mesh>
          <mesh castShadow receiveShadow geometry={nodes.Object006_watch_0.geometry} material={materials.watch} />
        </>
      )
    } else {
      // watch.glb structure - render all meshes
      return Object.values(nodes).map((node, index) => {
        if (node.geometry) {
          return (
            <mesh key={index} castShadow receiveShadow geometry={node.geometry} material={materials[node.material?.name] || materials.default} />
          )
        }
        return null
      }).filter(Boolean)
    }
  }

  return (
    <group {...props} dispose={null}>
      {getWatchMesh()}
    </group>
  )
}