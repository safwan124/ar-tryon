import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as mpHands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import * as THREE from "three";

function ARModel({ modelUrl, landmarks }) {
  const ref = useRef();

  useFrame(() => {
    if (landmarks && ref.current) {
      // Ring finger base landmark index (MediaPipe Hands: 13 = ring finger base joint)
      const ringBase = landmarks[13];

      if (ringBase) {
        const x = (ringBase.x - 0.5) * 2; // Normalize and center
        const y = -(ringBase.y - 0.5) * 2;
        const z = -ringBase.z;
        ref.current.position.set(x, y, z);
      }
    }
  });

  const [gltf, setGltf] = useState();
  useEffect(() => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    loader.load(
      modelUrl,
      (gltf) => {
        console.log('Model loaded successfully:', modelUrl);
        setGltf(gltf);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
        // Try loading without DRACO if it fails
        const fallbackLoader = new GLTFLoader();
        fallbackLoader.load(
          modelUrl,
          (gltf) => {
            console.log('Model loaded with fallback loader:', modelUrl);
            setGltf(gltf);
          },
          undefined,
          (fallbackError) => {
            console.error('Fallback loader also failed:', fallbackError);
          }
        );
      }
    );
    
    return () => {
      dracoLoader.dispose();
    };
  }, [modelUrl]);

  // Clone and optimize the model for AR
  const scene = gltf ? gltf.scene.clone() : null;
  
  if (scene) {
    // Scale the entire scene to make it more visible for AR
    scene.scale.setScalar(0.25); // Smaller size for better fit
    
    scene.traverse((child) => {
      if (child.isMesh) {
        // Optimize mesh for AR performance
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = true;
        
        // Ensure materials are visible
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.transparent) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        }
      }
    });
  }

  return gltf && scene ? (
    <primitive ref={ref} object={scene} />
  ) : (
    // Fallback ring model while loading
    <mesh ref={ref} scale={[0.1, 0.1, 0.1]}>
      <torusGeometry args={[0.3, 0.15, 16, 100]} />
      <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

export default function ARTryOn({ onClose }) {
  const videoRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    
    // Initialize camera with proper error handling
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    }).then((stream) => {
      video.srcObject = stream;
      
      // Wait for video to be ready before playing
      video.onloadedmetadata = () => {
        video.play().catch(err => {
          console.warn('Video play failed:', err);
        });
      };
    }).catch(err => {
      console.error('Camera access failed:', err);
    });

    const hands = new mpHands.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
        setLandmarks(results.multiHandLandmarks[0]);
      }
    });

    const camera = new cam.Camera(video, {
      onFrame: async () => {
        try {
          await hands.send({ image: video });
        } catch (err) {
          console.warn('Hand detection error:', err);
        }
      },
      width: 640,
      height: 480,
    });

    // Store references for cleanup
    handsRef.current = hands;
    cameraRef.current = camera;

    camera.start();

    // Cleanup function
    return () => {
      console.log('Cleaning up AR Try-On...');
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => {
          console.log('Stopping camera track:', track.label);
          track.stop();
        });
        video.srcObject = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, []);

  // Handle close button click
  const handleClose = () => {
    console.log('Close button clicked - cleaning up...');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          camera={{ position: [0, 0, 2] }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "low-power",
            failIfMajorPerformanceCaveat: false
          }}
          onCreated={({ gl }) => {
            // Handle WebGL context loss
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              console.warn('WebGL context lost, preventing default behavior');
              event.preventDefault();
            });
            
            gl.domElement.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored');
            });
          }}
        >
        <ambientLight intensity={2.5} />
        <directionalLight position={[3, 4, 2]} intensity={3.0} />
        <pointLight position={[0, 1.5, 3]} intensity={2.0} />
        <ARModel modelUrl="/models/ring-transformed.glb" landmarks={landmarks} />
      </Canvas>
      
      {/* Close Button */}
      <button 
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 10,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}
      >
        ✕
      </button>
    </div>
  );
}
