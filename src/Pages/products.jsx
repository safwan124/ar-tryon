import React, { useState } from 'react';
import './products.css';
import ARTryOn from '../components/RingTryon';
import WatchTryOn from '../components/WatchTryOn';
import ProductDetail from './productDetail';

const Products = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'rings', 'watches'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'category'
  const [showTryOn, setShowTryOn] = useState(false); // Show AR try-on overlay
  const [tryOnProduct, setTryOnProduct] = useState(null); // Product to try on
  const [showProductDetail, setShowProductDetail] = useState(false); // Show product detail page
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for detail view

  // Sample product data
  const products = [
    {
      id: 1,
      name: "Classic Gold Ring",
      category: "rings",
      price: 299.99,
      image: "/images/ring1.jpg",
      description: "Elegant 18k gold ring with intricate design",
      inStock: true,
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: "Diamond Engagement Ring",
      category: "rings",
      price: 1299.99,
      image: "/images/ring2.jpg",
      description: "Stunning diamond engagement ring with platinum setting",
      inStock: true,
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: "Silver Wedding Band",
      category: "rings",
      price: 199.99,
      image: "/images/ring3.jpg",
      description: "Simple yet elegant silver wedding band",
      inStock: true,
      rating: 4.6,
      reviews: 156
    },
    {
      id: 4,
      name: "Luxury Smart Watch",
      category: "watches",
      price: 899.99,
      image: "/images/watch1.jpg",
      description: "Premium smartwatch with health monitoring features",
      inStock: true,
      rating: 4.7,
      reviews: 203
    },
    {
      id: 5,
      name: "Classic Analog Watch",
      category: "watches",
      price: 599.99,
      image: "/images/watch2.jpg",
      description: "Timeless analog watch with leather strap",
      inStock: false,
      rating: 4.5,
      reviews: 78
    },
    {
      id: 6,
      name: "Sport Digital Watch",
      category: "watches",
      price: 399.99,
      image: "/images/watch3.jpg",
      description: "Durable sports watch with GPS tracking",
      inStock: true,
      rating: 4.4,
      reviews: 92
    },
    {
      id: 7,
      name: "Vintage Ruby Ring",
      category: "rings",
      price: 799.99,
      image: "/images/ring4.jpg",
      description: "Beautiful vintage-style ruby ring",
      inStock: true,
      rating: 4.8,
      reviews: 67
    },
    {
      id: 8,
      name: "Premium Chronograph Watch",
      category: "watches",
      price: 1299.99,
      image: "/images/watch4.jpg",
      description: "High-end chronograph watch with Swiss movement",
      inStock: true,
      rating: 4.9,
      reviews: 145
    }
  ];

  // Filter products based on selected category
  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.category === filter;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleViewProduct = (product) => {
    console.log('View product clicked:', product);
    // Set the product to view and show detail page
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleTryOn = (product) => {
    console.log('Try-On clicked for product:', product);
    // Close product detail page and show AR overlay
    setShowProductDetail(false);
    setSelectedProduct(null);
    setTryOnProduct(product);
    setShowTryOn(true);
  };

  const closeTryOn = () => {
    setShowTryOn(false);
    setTryOnProduct(null);
    // Return to products page after closing AR
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const backToProducts = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  // If showing product detail, render only the detail page
  if (showProductDetail && selectedProduct) {
    console.log('Rendering ProductDetail for:', selectedProduct);
    return (
      <ProductDetail 
        product={selectedProduct}
        onBack={backToProducts}
        onTryOn={handleTryOn}
      />
    );
  }

  return (
    <div className="ecommerce-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Premium Jewelry Collection</h1>
          <p>Experience luxury rings and watches with our AR try-on technology</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filters-left">
            <h3>Shop by Category</h3>
            <div className="category-filters">
              <button 
                className={`category-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <span className="category-icon">🛍️</span>
                All Products
                <span className="product-count">({products.length})</span>
              </button>
              <button 
                className={`category-btn ${filter === 'rings' ? 'active' : ''}`}
                onClick={() => setFilter('rings')}
              >
                <span className="category-icon">💍</span>
                Rings
                <span className="product-count">({products.filter(p => p.category === 'rings').length})</span>
              </button>
              <button 
                className={`category-btn ${filter === 'watches' ? 'active' : ''}`}
                onClick={() => setFilter('watches')}
              >
                <span className="category-icon">⌚</span>
                Watches
                <span className="product-count">({products.filter(p => p.category === 'watches').length})</span>
              </button>
            </div>
          </div>
          
          <div className="filters-right">
            <div className="sort-controls">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="name">Name A-Z</option>
                <option value="price">Price: Low to High</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="results-summary">
              <span>{sortedProducts.length} products found</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="products-container">
          {sortedProducts.length > 0 ? (
            <div className="products-grid">
              {sortedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x400?text=${product.name}`;
                      }}
                    />
                    <div className="product-badges">
                      <span className="category-badge">
                        {product.category === 'rings' ? '💍 Ring' : '⌚ Watch'}
                      </span>
                      {!product.inStock && (
                        <span className="stock-badge out-of-stock">Out of Stock</span>
                      )}
                    </div>
                    <div className="product-overlay">
                      <button 
                        className="quick-view-btn"
                        onClick={() => handleViewProduct(product)}
                      >
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="product-details">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-rating">
                      <div className="stars">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </div>
                      <span className="rating-count">({product.reviews})</span>
                    </div>
                    
                    <div className="product-price-section">
                      <span className="current-price">${product.price.toFixed(2)}</span>
                      {product.price > 500 && (
                        <span className="original-price">${(product.price * 1.2).toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        className="primary-btn view-btn"
                        onClick={() => handleViewProduct(product)}
                      >
                        <span className="btn-icon">👁️</span>
                        View
                      </button>
                      <button 
                        className="secondary-btn add-to-cart-btn"
                        disabled={!product.inStock}
                      >
                        <span className="btn-icon">🛒</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-content">
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse all products</p>
                <button 
                  className="reset-filters-btn"
                  onClick={() => setFilter('all')}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick AR Access */}
      <div className="quick-ar-section">
        <div className="container">
          <h2>Try Before You Buy</h2>
          <p>Use our AR technology to see how our products look on you</p>
          <div className="quick-ar-buttons">
            <button 
              className="quick-ar-btn ring"
              onClick={() => {
                setTryOnProduct({ category: 'rings', name: 'Ring Collection' });
                setShowTryOn(true);
              }}
            >
              💍 Try Rings
            </button>
            <button 
              className="quick-ar-btn watch"
              onClick={() => {
                setTryOnProduct({ category: 'watches', name: 'Watch Collection' });
                setShowTryOn(true);
              }}
            >
              ⌚ Try Watches
            </button>
          </div>
        </div>
      </div>

      {/* AR Try-On Overlay */}
      {showTryOn && tryOnProduct && (
        <div className="try-on-overlay">
          <div className="try-on-header">
            <h3>Try On: {tryOnProduct.name}</h3>
            <button className="close-try-on-btn" onClick={closeTryOn}>
              ✕ Close
            </button>
          </div>
          <div className="try-on-content">
            {tryOnProduct.category === 'rings' ? (
              <ARTryOn />
            ) : (
              <WatchTryOn />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;