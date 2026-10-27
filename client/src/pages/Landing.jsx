import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Camera, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { user, logout } = useAuth();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Shield size={32} color="var(--primary)" />
          <span>ParkWatch</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <Link to="/police-directory">Police Directory</Link>
          <Link to="/how-it-works">How it Works</Link>
          {user ? (
            <>
              <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="btn btn-secondary">Dashboard</Link>
              <button onClick={logout} className="btn btn-primary" style={{ background: '#ef4444' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-pill">Coimbatore Smart City Initiative 2026</div>
          <h1>Make Coimbatore Roads <span className="text-gradient">Safer</span>.</h1>
          <p className="hero-subtitle">
            ParkWatch uses intelligent vehicle detection, number-plate recognition, and location intelligence to help communities report illegal parking instantly across Coimbatore.
          </p>
          <div className="hero-cta">
            {(!user || user.role === 'CITIZEN') && (
              <Link to={user ? '/report' : '/register'} className="btn btn-primary btn-lg">Report Illegal Parking</Link>
            )}
            <Link to="/pay-fine" className="btn btn-outline btn-lg" style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>Pay Traffic Fine</Link>
            <Link to="/police-directory" className="btn btn-outline btn-lg">Traffic Police Directory</Link>
          </div>
          
          <div className="stats-row mt-16">
            <div className="stat">
              <h4>10k+</h4>
              <p>Reports</p>
            </div>
            <div className="stat">
              <h4>94%</h4>
              <p>AI Accuracy</p>
            </div>
            <div className="stat">
              <h4>50+</h4>
              <p>Stations</p>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src="/hero.jpg" alt="ParkWatch Smart City Platform" className="hero-image" />
          <div className="floating-card ai-card">
            <Camera size={20} color="var(--primary)" />
            <div>
              <strong>Vehicle Detected</strong>
              <p className="text-sm text-muted">Car (98.2%)</p>
            </div>
          </div>
          <div className="floating-card loc-card">
            <MapPin size={20} color="#10B981" />
            <div>
              <strong>Violation Logged</strong>
              <p className="text-sm text-muted">Central Ave, Sec 4</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header text-center">
          <h2>Next-Generation Traffic Management</h2>
          <p className="text-muted">Empowering citizens and authorities with state-of-the-art AI infrastructure.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper"><Camera size={28} /></div>
            <h3>YOLOv8 & OpenCV.js</h3>
            <p>Our edge AI validates evidence instantly, drawing accurate bounding boxes and extracting license plates with Tesseract OCR.</p>
          </div>
          <div className="feature-card">
            <div className="icon-wrapper"><MapPin size={28} /></div>
            <h3>Location Intelligence</h3>
            <p>Integrated with OpenStreetMap, automatically routing complaints to the nearest jurisdiction securely.</p>
          </div>
          <div className="feature-card">
            <div className="icon-wrapper"><Shield size={28} /></div>
            <h3>Authority Dashboard</h3>
            <p>A priority-scoring system that automatically detects repeat offenders and highlights high-risk violations.</p>
          </div>
          <div className="feature-card">
            <div className="icon-wrapper"><Bell size={28} /></div>
            <h3>Automated Updates</h3>
            <p>Citizens receive real-time email notifications as their reports transition from submitted to verified.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Shield size={24} color="var(--primary)" />
            <span>ParkWatch</span>
          </div>
          <p>© 2026 ParkWatch Smart City Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
