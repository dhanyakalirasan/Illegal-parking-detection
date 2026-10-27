import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Camera, Cpu, Server, CheckCircle, ArrowRight } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-container">
      {/* Navigation */}
      <nav className="hiw-nav">
        <Link to="/" className="hiw-logo">
          <Shield size={32} color="var(--primary)" />
          <span>ParkWatch</span>
        </Link>
        <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Back to Home
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="hiw-hero">
        <h1>How ParkWatch Works</h1>
        <p>A seamless process that combines community reporting with cutting-edge Edge AI and automated OCR to validate and penalize illegal parking instantly.</p>
      </header>

      {/* Process Timeline */}
      <div className="process-timeline">
        
        {/* Step 1: Capture */}
        <div className="process-step">
          <div className="step-content">
            <div className="step-number">1</div>
            <h3>Capture & Upload</h3>
            <p>Citizens capture a photo of the illegally parked vehicle and upload it via the ParkWatch app. Our system instantly accesses the device's location to tag the exact coordinates of the violation.</p>
          </div>
          <div className="step-visual">
            <div className="mock-image-container">
              {/* Fallback image if sample is not present, in a real scenario we'd use a real asset */}
              <img src="https://images.unsplash.com/photo-1543465077-db45d34b88a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Car illegally parked" />
            </div>
          </div>
        </div>

        {/* Step 2: Edge AI Detection */}
        <div className="process-step">
          <div className="step-content">
            <div className="step-number">2</div>
            <h3>Edge AI Vehicle Detection</h3>
            <p>Before the image is even uploaded to our servers, the ParkWatch platform uses YOLOv8 running in your browser via WebAssembly. It instantly detects the vehicle type and draws a bounding box to verify evidence validity.</p>
          </div>
          <div className="step-visual">
            <div className="mock-image-container">
              <img src="https://images.unsplash.com/photo-1543465077-db45d34b88a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Car detected" />
              <div className="bounding-box">
                <div className="box-label">CAR - 98%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: OCR Number Plate Extraction */}
        <div className="process-step">
          <div className="step-content">
            <div className="step-number">3</div>
            <h3>Number Plate Extraction</h3>
            <p>Once the vehicle is detected, we preprocess the image using OpenCV.js to enhance contrast and reduce noise. Then, Tesseract OCR scans the highlighted area and extracts the number plate text automatically.</p>
          </div>
          <div className="step-visual">
            <div className="ocr-scanner">
              <div className="plate-mock">
                TN 38 AB 1234
                <div className="scanner-line"></div>
              </div>
              <div className="extraction-result">
                <span>Extracted:</span>
                <span className="result-text">TN 38 AB 1234</span>
                <CheckCircle size={18} color="#10B981" />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Verification & Action */}
        <div className="process-step">
          <div className="step-content">
            <div className="step-number">4</div>
            <h3>Authority Verification & Action</h3>
            <p>The validated report is encrypted and sent to the Coimbatore Traffic Police dashboard. Authorities review the pre-processed evidence and the AI's confidence score, then instantly issue an automated fine to the vehicle owner.</p>
          </div>
          <div className="step-visual" style={{ flexDirection: 'column', gap: '1rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1E293B', padding: '1rem', borderRadius: '8px', width: '100%', maxWidth: '300px' }}>
              <Server size={24} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontWeight: 'bold' }}>Verified by Admin</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', width: '100%', maxWidth: '300px' }}>
              <Shield size={24} color="#EF4444" />
              <div>
                <div style={{ fontSize: '0.9rem', color: '#EF4444' }}>Action Taken</div>
                <div style={{ fontWeight: 'bold', color: '#EF4444' }}>Fine Issued: ₹500</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <section className="hiw-cta">
        <h2>Ready to make a difference?</h2>
        <p className="text-muted" style={{ margin: '1rem auto 2rem', maxWidth: '600px' }}>Join thousands of citizens in keeping Coimbatore's roads clear and safe.</p>
        <Link to="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Get Started <ArrowRight size={18} />
        </Link>
      </section>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
        <p>© 2026 ParkWatch Smart City Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HowItWorks;
