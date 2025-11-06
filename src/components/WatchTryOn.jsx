import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const WatchTryOn = ({ modelPath = "/models/watch-v1.glb", onClose }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const handsRef = useRef(null);
  const cameraFeedRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    // Detect mobile device inside useEffect to ensure accuracy
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: false,
      powerPreference: "low-power"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Handle WebGL context loss
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      console.warn('WebGL context lost, preventing default behavior');
      event.preventDefault();
    });

    renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
    });

    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 2, 2);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // Store references
    rendererRef.current = renderer;
    cameraRef.current = camera;
    sceneRef.current = scene;

    camera.position.z = 1.5;

    // Setup DRACOLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

    // Load watch model with DRACOLoader
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
      
      loader.load(
      modelPath,
      (gltf) => {
        const watchModel = gltf.scene;
        watchModel.scale.set(0.001, 0.001, 0.001);
        watchModel.rotation.x = Math.PI / 30; // Face front instead of down
        scene.add(watchModel);
        modelRef.current = watchModel;
      },
      (progress) => {
        // Progress callback
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log("Model loading:", Math.round(percentComplete) + "%");
        }
      },
      (error) => {
        console.error("GLTF load error:", error);
      }
    );

    // Setup camera stream first
    const videoElement = videoRef.current;
    
    // Stop any existing tracks first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoElement.srcObject) {
      const existingTracks = videoElement.srcObject.getTracks();
      existingTracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }
    
    // Enterprise-grade camera request with deviceId locking
    async function getCameraStream() {
      try {
        // First, enumerate all devices to find the back camera
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error("No video devices found");
        }

        // Prioritize environment camera (rear) for mobile
        // Check label for common back camera indicators
        const rearCam = videoDevices.find(d => {
          const label = d.label.toLowerCase();
          return label.includes('back') || 
                 label.includes('rear') ||
                 label.includes('environment') ||
                 label.includes('facing back');
        });

        if (rearCam && rearCam.deviceId) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: rearCam.deviceId }, // Lock deviceId
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            });
            console.log("Using back camera (deviceId locked):", rearCam.label || rearCam.deviceId);
            return stream;
          } catch (err) {
            console.warn("Failed to access rear camera with deviceId, trying fallback:", err);
          }
        }

        // Fallback: try environment camera with facingMode first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          
          // Get the deviceId from the stream we just got
          const videoTrack = stream.getVideoTracks()[0];
          const settings = videoTrack.getSettings();
          
          if (settings.deviceId) {
            // Stop this stream and get a new one with locked deviceId
            stream.getTracks().forEach(track => track.stop());
            
            const lockedStream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: settings.deviceId }, // Lock deviceId
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            });
            console.log("Using back camera (deviceId locked from stream):", settings.deviceId);
            return lockedStream;
          }
          
          console.log("Using back camera (facingMode)");
          return stream;
        } catch (err) {
          console.warn("Failed to access environment camera:", err);
        }

        // Fallback to front camera
        const frontCam = videoDevices[0];
        if (frontCam && frontCam.deviceId) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: frontCam.deviceId }, // Lock deviceId
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            });
            console.log("Using front camera (deviceId locked):", frontCam.label || frontCam.deviceId);
            return stream;
          } catch (err) {
            console.warn("Failed to access front camera with deviceId:", err);
          }
        }

        // Ultimate fallback: try with facingMode user
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log("Using camera (facingMode user fallback)");
        return stream;
      } catch (err) {
        console.error("No camera available", err);
        throw err;
      }
    }
    
    getCameraStream().then((stream) => {
      if (!stream || stream.getVideoTracks().length === 0) {
        console.error("No video tracks in stream");
        return;
      }

      // Store stream reference
      streamRef.current = stream;
      
      // Verify we got the correct camera
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      console.log("Camera settings:", settings);

      videoElement.srcObject = stream;
      videoElement.setAttribute("playsinline", "true");
      videoElement.playsInline = true;
      videoElement.muted = true;

      videoElement.onloadedmetadata = () => {
        videoElement.play()
          .then(() => {
            console.log("Video playing successfully");

            // Initialize MediaPipe Hands after video is ready
            const hands = new Hands({
              locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });

            hands.setOptions({
              maxNumHands: 1,
              modelComplexity: 1,
              minDetectionConfidence: 0.7,
              minTrackingConfidence: 0.7,
            });

            hands.onResults((results) => {
              if (!modelRef.current || !results.multiHandLandmarks || !results.multiHandLandmarks[0]) return;

              const landmarks = results.multiHandLandmarks[0];
              const wrist = landmarks[0];
              const indexBase = landmarks[5];

              if (!wrist || !indexBase) return;

              // Map wrist position to screen coordinates
              const x = (wrist.x - 0.5) * 2;
              const y = -(wrist.y - 0.5) * 2;
              const z = -wrist.z * 2.0; // Depth scaling

              modelRef.current.position.set(x, y, z);

              // Rotate the model slightly depending on hand orientation
              const dx = indexBase.x - wrist.x;
              const dy = indexBase.y - wrist.y;
              modelRef.current.rotation.z = Math.atan2(dy, dx);
            });

            handsRef.current = hands;

            // Camera feed for MediaPipe (removed width/height to prevent camera re-request)
            const cameraFeed = new Camera(videoElement, {
              onFrame: async () => {
                if (videoElement.readyState >= 2) {
                  try {
                    await hands.send({ image: videoElement });
                  } catch (err) {
                    // Ignore occasional MediaPipe errors
                  }
                }
              }
            });

            cameraFeedRef.current = cameraFeed;
            cameraFeed.start();
          })
          .catch((err) => {
            console.error("Video play error:", err);
          });
      };
    })
    .catch((err) => {
      console.error("Camera access error:", err);
    });

    // Render loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Stop camera feed
      if (cameraFeedRef.current) {
        try {
          cameraFeedRef.current.stop();
        } catch (e) {}
      }

      // Close MediaPipe hands
      if (handsRef.current) {
        try {
        handsRef.current.close();
        } catch (e) {}
      }

      // Stop video tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoElement.srcObject = null;
      }

      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Dispose DRACO loader
      dracoLoader.dispose();

      // Remove resize listener
      window.removeEventListener("resize", handleResize);
    };
  }, [modelPath]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) 
                     ? "none" : "scaleX(-1)", // Mirror video for front camera only
          zIndex: 1,
          backgroundColor: "#000",
        }}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      {onClose && (
        <button
          onClick={onClose}
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
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default WatchTryOn;
