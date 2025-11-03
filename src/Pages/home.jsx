import React, { useState } from 'react';
import './home.css';
import { Canvas } from '@react-three/fiber';
import Watches from '../sections/watches';
import { useGLTF, PresentationControls, Environment, ContactShadows, Html } from '@react-three/drei';
import Rings from '../sections/ring';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "Fashion Retailer",
      rating: 5,
      text: "The AR try-on feature increased our conversion rate by 15%. Customers can now see exactly how jewelry looks before buying.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      metric: "15%",
      metricLabel: "increase in conversion"
    },
    {
      id: 2,
      name: "Michael Chen",
      company: "Luxury Watch Store",
      rating: 5,
      text: "Our customers are 50% more likely to purchase after using AR try-on. The technology is seamless and engaging.",
      image: "https://media.istockphoto.com/id/1359180038/photo/wristwatch.jpg?s=612x612&w=0&k=20&c=AWkZ-gaLo601vG5eiQcsjYRjCjDxZdGL7v-jWvvAjEM=",
      metric: "50%",
      metricLabel: "more likely to purchase"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      company: "Jewelry Boutique",
      rating: 5,
      text: "AR try-on reduced our return rate by 22%. Customers know exactly what they're getting before purchase.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      metric: "22%",
      metricLabel: "reduction in returns"
    }
  ];

  const categories = [
    {
      name: "Rings",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop",
      description: "Try on rings virtually"
    },
    {
      name: "Watches", 
      image: "https://media.istockphoto.com/id/1359180038/photo/wristwatch.jpg?s=612x612&w=0&k=20&c=AWkZ-gaLo601vG5eiQcsjYRjCjDxZdGL7v-jWvvAjEM=",
      description: "See watches on your wrist"
    },
    {
      name: "Necklaces",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop", 
      description: "Preview necklaces perfectly"
    }
  ];

  const features = [
    {
      icon: "📱",
      title: "AR Try-On",
      description: "Try on jewelry virtually with your camera"
    },
    {
      icon: "🎯", 
      title: "3D Preview",
      description: "Interactive 3D models for every product"
    },
    {
      icon: "🌐",
      title: "Any Website",
      description: "Integrate AR into any e-commerce platform"
    }
  ];

  const stats = [
    { number: "300%", label: "increase in engagement" },
    { number: "80%", label: "increase in conversions" },
    { number: "22%", label: "reduction in returns" },
    { number: "1000+", label: "products available" }
  ];

  const steps = [
    {
      number: "1",
      title: "Models",
      description: "Check our library of 1000+ ultra-realistic jewelry models, or create new ones quickly and affordably.",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop"
    },
    {
      number: "2", 
      title: "Integrate",
      description: "Add AR functionality to your website with just 6 lines of code. Works on any platform.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
    },
    {
      number: "3",
      title: "Insights", 
      description: "Track engagement, conversions, and ROI through our comprehensive analytics dashboard.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
    }
  ];


  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className='watches-section'>
        <Watches />
      </section>

      <section className='ring-section'>
        <Rings />
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <button className="category-btn">
                  Try it
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="testimonial-metric">
                <span className="metric-number">{testimonials[currentTestimonial].metric}</span>
                <span className="metric-label">{testimonials[currentTestimonial].metricLabel}</span>
              </div>
              <div className="stars">
                {'★'.repeat(testimonials[currentTestimonial].rating)}
              </div>
              <p className="testimonial-text">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="testimonial-author">
                <img 
                  src={testimonials[currentTestimonial].image} 
                  alt={testimonials[currentTestimonial].name}
                  className="author-image"
                />
                <div className="author-info">
                  <h4 className="author-name">{testimonials[currentTestimonial].name}</h4>
                  <p className="author-company">{testimonials[currentTestimonial].company}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-nav">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`nav-dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get set up in just 3 steps</h2>
          </div>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="step-visual">
                  <img src={step.image} alt={step.title} className="step-image" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Bring your products to life on the web and in-app</h2>
            <p className="cta-description">
              Delight customers, reduce returns and increase conversions with AR and 3D technology
            </p>
            <div className="cta-actions">
              <button className="btn-primary btn-large">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Stay Updated</h3>
              <p>Receive company updates and news.</p>
              <p className="privacy-text">
                To learn how we process your data, visit our Privacy Policy. You can unsubscribe at any time.
              </p>
            </div>
            <div className="newsletter-form">
              <div className="checkbox-container">
                <input type="checkbox" id="privacy-agreement" />
                <label htmlFor="privacy-agreement">
                  I agree to receive updates and accept the privacy policy.
                </label>
              </div>
              <div className="form-row">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="email-input"
                />
                <button className="btn-primary">
                  Keep Me Posted
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;