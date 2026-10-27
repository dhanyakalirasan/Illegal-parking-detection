import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, User, ArrowLeft } from 'lucide-react';
import './PoliceDirectory.css';

const PoliceDirectory = () => {
  const [policeList, setPoliceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoliceList = async () => {
      try {
        const response = await fetch('/api/police');
        const data = await response.json();
        
        if (data.success) {
          setPoliceList(data.data);
        } else {
          setError(data.message || 'Failed to fetch directory');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliceList();
  }, []);

  return (
    <div className="police-directory-container">
      <nav className="directory-nav">
        <Link to="/" className="directory-logo">
          <Shield size={32} color="var(--primary)" />
          <span>ParkWatch Coimbatore</span>
        </Link>
        <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      <div className="directory-content">
        <div className="directory-header">
          <h1>Coimbatore Traffic Police Directory</h1>
          <p>Find the contact information for the traffic police officer in charge of your area.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading directory...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : (
          <div className="police-grid">
            {policeList.length > 0 ? (
              policeList.map((police) => (
                <div key={police._id} className="police-card">
                  <div className="police-card-header">
                    <div className="police-avatar">
                      <User size={24} />
                    </div>
                    <div className="police-info">
                      <h3>{police.name}</h3>
                      <span>Traffic Officer</span>
                    </div>
                  </div>
                  
                  <div className="police-details">
                    <div className="detail-item">
                      <MapPin size={18} color="var(--text-muted)" />
                      <div>
                        <strong>Area In-Charge:</strong> {police.area}
                      </div>
                    </div>
                    <div className="detail-item">
                      <Phone size={18} color="var(--text-muted)" />
                      <div>
                        <strong>Phone Number:</strong> {police.phone}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="loading-state" style={{ gridColumn: '1 / -1' }}>
                <p>No traffic police records found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDirectory;
