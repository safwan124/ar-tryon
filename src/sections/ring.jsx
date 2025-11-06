import { Canvas } from '@react-three/fiber'
import { useGLTF, PresentationControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { useState, Suspense, Component } from 'react'
import RingTryOn from '../components/RingTryon'
import './ring.css'

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

export default function Rings() {
  const [selectedring, setSelectedring] = useState(0)
  const [showTryOn, setShowTryOn] = useState(false)
  
  const ringModels = [
    { name: 'Luxury Premium ring', model: '/models/ring-transformed.glb', thumbnail: '/models/ring.jpg' },
    // { name: 'Classic Timepiece', model: '/models/ring.glb', thumbnail: '/models/ring-thumb.jpg' },
    { name: 'Modern Design', model: '/models/ring-transformed.glb', thumbnail: '/models/ring.jpg' },
    // { name: 'Sport Edition', model: '/models/ring.glb', thumbnail: '/models/ring-thumb.jpg' }  
  ]

  // If Try On is active, show the AR component
  if (showTryOn) {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <RingTryOn 
          modelPath={ringModels[selectedring].model} 
          onClose={() => setShowTryOn(false)}
        />
      </div>
    )
  }

  return (
    <div className="ring-container">
      <div className="ring-text">Stunning 3D ring</div>
      <div className="ring-canvas-wrapper">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 25 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}>
            <Ring 
              rotation={[-Math.PI / 2, 0, 0.6]} 
              position={[0, -0.5, 0.1]} 
              scale={0.65} 
              modelPath={ringModels[selectedring].model}
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
      
      {/* ring Label with Try On Button */}
      <div className="ring-label-container">
        <div className="ring-label">{ringModels[selectedring].name}</div>
        <button 
          className="try-on-button"
          onClick={() => setShowTryOn(true)}
        >
          Try On
        </button>
      </div>
      
      {/* Thumbnail Navigation */}
      <div className="ring-thumbnails">
        {ringModels.map((ring, index) => (
          <button
            key={index}
            className={`thumbnail-circle ${selectedring === index ? 'active' : ''}`}
            onClick={() => setSelectedring(index)}
            style={{
              backgroundImage: `url(${ring.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!ring.thumbnail && (
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

function Ring({ modelPath, ...props }) {
  const { nodes, materials, error } = useGLTF(modelPath)
  
  // Handle different model structures - render all available meshes
  const getRingMesh = () => {
    if (error) {
      console.error('GLTF loading error:', error);
      return null;
    }
    
    if (!nodes || Object.keys(nodes).length === 0) {
      console.warn('No nodes found in ring model');
      return null;
    }
    
    // Render all meshes from the model
    const meshes = Object.values(nodes).map((node, index) => {
      if (node.geometry) {
        return (
          <mesh 
            key={index} 
            castShadow 
            receiveShadow 
            geometry={node.geometry} 
            material={materials[node.material?.name] || materials.default || materials[node.name]} 
          />
        )
      }
      return null
    }).filter(Boolean)
    
    return meshes;
  }

  return (
    <group {...props} dispose={null}>
      {getRingMesh()}
    </group>
  )
}