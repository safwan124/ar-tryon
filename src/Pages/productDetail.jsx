import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import './productDetail.css';

// 3D Model Viewer Component
function ModelViewer({ modelUrl, product }) {
  const [gltf, setGltf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const meshRef = useRef();

  useEffect(() => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Model loading timeout, showing error state');
        setError(new Error('Model loading timeout'));
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    loader.load(
      modelUrl,
      (loadedGltf) => {
        clearTimeout(timeout);
        console.log('3D Model loaded:', loadedGltf);
        
        // Optimize the model for better performance
        loadedGltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = true;
            child.castShadow = false; // Disable shadows for better performance
            child.receiveShadow = false;
          }
        });
        
        setGltf(loadedGltf);
        setLoading(false);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log('Loading progress:', percent.toFixed(1) + '%');
      },
      (err) => {
        clearTimeout(timeout);
        console.error('Error loading 3D model:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [modelUrl]);

  // Auto-rotation disabled - user can manually rotate with OrbitControls

  if (loading) {
    return (
      <Html center>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading 3D Model...</p>
        </div>
      </Html>
    );
  }

  if (error || !gltf) {
    return (
      <Html center>
        <div className="model-error">
          <div className="error-icon">⚠️</div>
          <p>3D Model not available</p>
          <p className="error-subtitle">Showing placeholder</p>
        </div>
      </Html>
    );
  }

  // Clone and improve the model
  const scene = gltf.scene.clone();
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.needsUpdate = true;
      
      // Improve material for better appearance
      if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
        child.material.metalness = 0.8;
        child.material.roughness = 0.2;
        child.material.envMapIntensity = 1.0;
      }
      
      // Disable shadows for better performance
      child.castShadow = false;
      child.receiveShadow = false;
      child.frustumCulled = true;
    }
  });

  return (
    <primitive 
      ref={meshRef} 
      object={scene} 
      scale={product.category === 'rings' ? [2, 2, 2] : [2.5, 2.5, 2.5]}
    />
  );
}

const ProductDetail = ({ product, onBack, onTryOn }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');

  // Generate additional product images (placeholder)
  const productImages = [
    product.image,
    `https://via.placeholder.com/600x600?text=${product.name}+2`,
    `https://via.placeholder.com/600x600?text=${product.name}+3`,
    `https://via.placeholder.com/600x600?text=${product.name}+4`
  ];

  // Get 3D model URL based on product category
  const modelUrl = product.category === 'rings' 
    ? '/models/ring-transformed.glb' 
    : '/models/watch.glb';

  const handleTryOn = () => {
    console.log('Try-On clicked for product:', product);
    onTryOn(product);
  };

  return (
    <div className="product-detail-page">
      {/* Header */}
      <header className="detail-header">
        <div className="detail-nav">
          <button className="back-btn" onClick={onBack}>
            ← Back to Products
          </button>
          <div className="breadcrumb">
            <span>Home</span> / <span>Products</span> / <span>{product.name}</span>
          </div>
        </div>
      </header>

      <div className="detail-container">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={productImages[selectedImage]} 
              alt={product.name}
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/600x600?text=${product.name}`;
              }}
            />
          </div>
          <div className="thumbnail-images">
            {productImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={selectedImage === index ? 'active' : ''}
                onClick={() => setSelectedImage(index)}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/150x150?text=${product.name}+${index + 1}`;
                }}
              />
            ))}
          </div>
        </div>

        {/* 3D Model Viewer */}
        <div className="model-viewer">
          <div className="viewer-header">
            <h3>3D Model Viewer</h3>
            <p>Drag to rotate • Scroll to zoom</p>
          </div>
          <div className="canvas-container">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              gl={{ 
                antialias: false, // Disable antialiasing for better performance
                alpha: true,
                powerPreference: "high-performance"
              }}
              dpr={[1, 2]} // Limit pixel ratio for better performance
            >
              <ambientLight intensity={1} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <directionalLight position={[-5, 5, 5]} intensity={0.5} />
              <pointLight position={[0, 0, 5]} intensity={0.5} />
              
              <Environment preset="studio" />
              
              <ModelViewer modelUrl={modelUrl} product={product} />
              
              <OrbitControls 
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                autoRotate={false}
                minDistance={2}
                maxDistance={10}
                enableDamping={true}
                dampingFactor={0.05}
              />
            </Canvas>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>

          <div className="product-price">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.price > 500 && (
              <span className="original-price">${(product.price * 1.2).toFixed(2)}</span>
            )}
            {product.price > 500 && (
              <span className="discount-badge">Save ${((product.price * 1.2) - product.price).toFixed(2)}</span>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
            <p>Experience the perfect blend of style and sophistication with our premium {product.category === 'rings' ? 'ring' : 'watch'} collection. Crafted with attention to detail and designed for modern elegance.</p>
          </div>

          {/* Product Options */}
          <div className="product-options">
            {product.category === 'rings' && (
              <div className="option-group">
                <label>Ring Size:</label>
                <div className="size-options">
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="option-group">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="primary-action try-on-btn"
              onClick={handleTryOn}
              disabled={!product.inStock}
            >
              <span className="btn-icon">👁️</span>
              Try-On with AR
            </button>
            <button 
              className="secondary-action add-to-cart-btn"
              disabled={!product.inStock}
            >
              <span className="btn-icon">🛒</span>
              Add to Cart
            </button>
            <button className="tertiary-action wishlist-btn">
              <span className="btn-icon">❤️</span>
              Add to Wishlist
            </button>
          </div>

          {/* Product Features */}
          <div className="product-features">
            <h3>Features</h3>
            <ul>
              <li>✓ Premium quality materials</li>
              <li>✓ AR try-on technology</li>
              <li>✓ Free shipping worldwide</li>
              <li>✓ 30-day return policy</li>
              <li>✓ 2-year warranty</li>
            </ul>
          </div>

          {/* Stock Status */}
          <div className="stock-status">
            {product.inStock ? (
              <div className="in-stock">
                <span className="status-icon">✅</span>
                <span>In Stock - Ready to ship</span>
              </div>
            ) : (
              <div className="out-of-stock">
                <span className="status-icon">❌</span>
                <span>Out of Stock</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
