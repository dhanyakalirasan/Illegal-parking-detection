import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { detectVehicle, initYoloModel } from '../services/yoloService';
import { extractNumberPlate } from '../services/ocrService';
import './ReportViolation.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const ReportViolation = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    violationType: '',
    description: '',
    latitude: null,
    longitude: null,
    address: '',
    originalImageUrl: '' // Mocked Cloudinary URL for now
  });
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState(''); // New state for scanning feedback
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    initYoloModel();
  }, []);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Detected Location (Mock Address)'
          });
        },
        (err) => {
          setError('Unable to detect location. Please select manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real flow, image upload to Cloudinary happens here first
      const complaintData = {
        ...formData,
        originalImageUrl: formData.originalImageUrl || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      };

      await api.post('/complaints', complaintData);
      setLoading(false);
      navigate('/dashboard', { state: { message: 'Complaint submitted successfully!' } });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="report-container card">
      <h2>Report Illegal Parking</h2>
      
      {/* Progress Indicator */}
      <div className="progress-container">
        <p>Step {step} of 4</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        
        {/* Step 1: Evidence */}
        {step === 1 && (
          <div className="wizard-step">
            <h3>Step 1: Upload Evidence</h3>
            <div className="upload-area">
              <p>Click or drag to upload an image of the vehicle</p>
              <input 
                type="file" 
                id="fileUpload" 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  setLoading(true);
                  
                  // 1. Image Upload
                  const uploadData = new FormData();
                  uploadData.append('image', file);
                  
                  try {
                    const res = await api.post('/upload', uploadData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    const imageUrl = res.data.imageUrl;
                    
                    // Display image for AI processing
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = imageUrl;
                    
                    setScanStatus('Detecting vehicle with YOLOv8...');
                    
                    img.onload = async () => {
                      // 2. YOLO Vehicle Detection
                      const yoloResult = await detectVehicle(img);
                      let vehicleType = '';
                      if (yoloResult.success && yoloResult.detections.length > 0) {
                        vehicleType = yoloResult.detections[0].type;
                      }

                      setScanStatus('Extracting number plate with Tesseract OCR...');

                      // 3. Tesseract OCR with OpenCV.js preprocessing
                      const ocrResult = await extractNumberPlate(img);

                      setFormData(prev => ({
                        ...prev, 
                        originalImageUrl: imageUrl,
                        vehicleType: vehicleType || prev.vehicleType,
                        vehicleNumber: ocrResult.text || prev.vehicleNumber
                      }));
                      setScanStatus('');
                      setLoading(false);
                    };
                    img.onerror = () => {
                      setScanStatus('');
                      setLoading(false);
                    };

                  } catch (err) {
                    setError('Failed to process image. Please try again.');
                    setLoading(false);
                  }
                }} 
              />
              <button 
                type="button" 
                className="btn btn-secondary mt-16" 
                onClick={() => document.getElementById('fileUpload').click()}
                disabled={loading}
              >
                {loading ? (scanStatus || 'Uploading & Analyzing...') : formData.originalImageUrl ? 'Image Analyzed ✓' : 'Select Image'}
              </button>
            </div>
            {formData.originalImageUrl && !loading && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={formData.originalImageUrl} alt="Evidence preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '2px solid #10B981' }} />
                <div style={{ marginTop: '0.5rem', color: '#10B981', fontWeight: 'bold' }}>✓ Scan Complete</div>
              </div>
            )}
            {loading && scanStatus && (
              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div className="spinner" style={{ margin: '0 auto 10px', width: '30px', height: '30px', border: '3px solid rgba(59, 130, 246, 0.3)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{scanStatus}</div>
              </div>
            )}
            <div className="step-actions right">
              <button type="button" onClick={handleNext} disabled={!formData.originalImageUrl || loading} className="btn btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle & OCR */}
        {step === 2 && (
          <div className="wizard-step">
            <h3>Step 2: Vehicle Details</h3>
            <p className="helper-text">These details have been auto-extracted using AI. Please verify them.</p>
            
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Vehicle Number Plate
                {formData.vehicleNumber && <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '2px 6px', borderRadius: '4px' }}>AI Extracted</span>}
              </label>
              <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="input-field" placeholder="e.g. TN 38 AB 1234" required />
            </div>
            
            <div className="input-group">
              <label className="input-label">Vehicle Type</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="input-field" required>
                <option value="">Select Type</option>
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="BUS">Bus</option>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
              </select>
            </div>

            <div className="step-actions split">
              <button type="button" onClick={handlePrev} className="btn btn-secondary">Back</button>
              <button type="button" onClick={handleNext} disabled={!formData.vehicleNumber || !formData.vehicleType} className="btn btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="wizard-step">
            <h3>Step 3: Location</h3>
            <button type="button" onClick={handleLocationDetection} className="btn btn-secondary btn-full mb-16">
              Auto-Detect Current Location
            </button>
            
            <div className="map-container-wrapper" style={{ height: '300px', width: '100%', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              {/* Map implementation is simplified for now since window object access during SSR can be tricky, but this is a pure SPA */}
              <MapContainer 
                center={formData.latitude ? [formData.latitude, formData.longitude] : [20.5937, 78.9629]} 
                zoom={formData.latitude ? 15 : 5} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker 
                  position={formData.latitude ? [formData.latitude, formData.longitude] : null} 
                  setPosition={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })} 
                />
              </MapContainer>
            </div>

            {formData.latitude && (
              <div className="success-message mt-16">
                <p><strong>Location selected!</strong></p>
                <p>Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}</p>
              </div>
            )}
            
            <div className="input-group mt-16">
              <label className="input-label">Address / Landmark (Optional)</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Enter nearest landmark" />
            </div>

            <div className="step-actions split mt-16">
              <button type="button" onClick={handlePrev} className="btn btn-secondary">Back</button>
              <button type="button" onClick={handleNext} disabled={!formData.latitude} className="btn btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Violation & Submit */}
        {step === 4 && (
          <div className="wizard-step">
            <h3>Step 4: Violation Details</h3>
            
            <div className="input-group">
              <label className="input-label">Violation Type</label>
              <select name="violationType" value={formData.violationType} onChange={handleChange} className="input-field" required>
                <option value="">Select Violation</option>
                <option value="ILLEGAL_PARKING">Illegal Parking</option>
                <option value="BLOCKING_ENTRANCE">Blocking Entrance</option>
                <option value="NO_PARKING_ZONE">No Parking Zone</option>
                <option value="FOOTPATH">Parking on Footpath</option>
                <option value="EMERGENCY_ZONE">Parking in Emergency Zone</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Additional Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input-field" rows="4" placeholder="Any other details..."></textarea>
            </div>

            <div className="step-actions split mt-16">
              <button type="button" onClick={handlePrev} className="btn btn-secondary">Back</button>
              <button type="submit" disabled={loading || !formData.violationType} className="btn btn-primary">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default ReportViolation;
