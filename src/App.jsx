import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './Pages/home';
import Products from './Pages/products';
import ARTryOn from './components/RingTryon';
import WatchTryOn from './components/WatchTryOn';

function App() {
  const [mode, setMode] = useState('home'); // 'home', 'products', 'ring-ar', 'watch-ar'
  const [currentPage, setCurrentPage] = useState('home');

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const arMode = urlParams.get('ar');
    
    if (page === 'home') {
      setCurrentPage('home');
      setMode('home');
    } else if (page === 'products') {
      setCurrentPage('products');
      setMode('products');
    } else if (arMode === 'ring') {
      setMode('ring-ar');
      setCurrentPage('ar');
    } else if (arMode === 'watch') {
      setMode('watch-ar');
      setCurrentPage('ar');
    }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'home') {
      setCurrentPage('home');
    } else if (newMode === 'products') {
      setCurrentPage('products');
    } else {
      setCurrentPage('ar');
    }
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav 
        className="app-nav"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="nav-container">
          <div className="nav-brand">
            <h1>AR Store</h1>
          </div>
          {/* <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handleModeChange('home')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
              onClick={() => handleModeChange('products')}
            >
              Products
            </button>
            <button 
              className={`nav-link ${currentPage === 'ar' ? 'active' : ''}`}
              onClick={() => handleModeChange('ring-ar')}
            >
              AR Try-On
            </button>
          </div> */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {mode === 'home' && <Home />}
        {mode === 'products' && <Products />}
        {mode === 'ring-ar' && <ARTryOn />}
        {mode === 'watch-ar' && <WatchTryOn />}
      </main>
    </div>
  );
}

export default App;
