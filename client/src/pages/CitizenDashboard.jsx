import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Camera, FileText, Activity, Bell, User as UserIcon, X, Search, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'TRACK', 'NOTIFICATIONS', 'PROFILE', 'REWARDS'
  const complaintsTableRef = useRef(null);

  // Track Complaint State
  const [trackSearchId, setTrackSearchId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my');
        const data = res.data;
        setRecentComplaints(data);
        
        const newStats = {
          total: data.length,
          pending: data.filter(c => ['SUBMITTED', 'ASSIGNED'].includes(c.status)).length,
          verified: data.filter(c => c.status === 'VERIFIED').length,
          rejected: data.filter(c => c.status === 'REJECTED').length
        };
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const scrollToComplaints = () => {
    if (complaintsTableRef.current) {
      complaintsTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrackSearch = (e) => {
    e.preventDefault();
    setTrackError('');
    if (!trackSearchId.trim()) return;

    // Search local complaints for speed
    const found = recentComplaints.find(c => c.complaintId.toLowerCase() === trackSearchId.toLowerCase());
    if (found) {
      setTrackResult(found);
    } else {
      setTrackError('Complaint ID not found in your records.');
      setTrackResult(null);
    }
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="dashboard-layout">
      {/* Navigation / Header */}
      <nav className="dashboard-nav">
        <div className="logo-container">
          <h2>ParkWatch</h2>
        </div>
        <div className="user-menu">
          <span>Welcome, {user?.name || 'Citizen'}</span>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/report" className="action-card primary-action">
              <Camera size={32} />
              <span>Report Illegal Parking</span>
            </Link>
            
            {/* Scroll Action instead of Link */}
            <div className="action-card" onClick={scrollToComplaints} style={{ cursor: 'pointer' }}>
              <FileText size={32} />
              <span>My Complaints</span>
            </div>
            
            {/* Modal Triggers */}
            <div className="action-card" onClick={() => setActiveModal('TRACK')} style={{ cursor: 'pointer' }}>
              <Activity size={32} />
              <span>Track Complaint</span>
            </div>
            
            <div className="action-card" onClick={() => setActiveModal('NOTIFICATIONS')} style={{ cursor: 'pointer' }}>
              <Bell size={32} />
              <span>Notifications</span>
            </div>
            
            <div className="action-card" onClick={() => setActiveModal('REWARDS')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '32px' }}>🎁</span>
              <span>Rewards</span>
            </div>
            
            <div className="action-card" onClick={() => setActiveModal('PROFILE')} style={{ cursor: 'pointer' }}>
              <UserIcon size={32} />
              <span>Profile</span>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="dashboard-stats">
          <h3>Your Impact</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Reports</h4>
              <p className="stat-value">{stats.total}</p>
            </div>
            <div className="stat-card">
              <h4>Pending Review</h4>
              <p className="stat-value text-warning">{stats.pending}</p>
            </div>
            <div className="stat-card">
              <h4>Verified</h4>
              <p className="stat-value text-success">{stats.verified}</p>
            </div>
            <div className="stat-card">
              <h4>Rejected</h4>
              <p className="stat-value text-danger">{stats.rejected}</p>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)', color: 'white', border: 'none' }}>
              <h4>Civic Points</h4>
              <p className="stat-value">{user?.civicPoints || 0}</p>
            </div>
          </div>
        </section>

        {/* Recent Complaints List */}
        <section className="recent-complaints" ref={complaintsTableRef}>
          <h3>Recent Reports</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Vehicle Number</th>
                  <th>Violation</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.length > 0 ? (
                  recentComplaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>{complaint.complaintId}</td>
                      <td>{complaint.vehicleNumber}</td>
                      <td>{complaint.violationType.replace('_', ' ')}</td>
                      <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${complaint.status.toLowerCase()}`}>{complaint.status}</span></td>
                      <td>{complaint.assignedPoliceName || 'Pending Assignment'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '20px' }}>You have not submitted any reports yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#1e1b4b', padding: '2rem', borderRadius: '12px',
            width: '90%', maxWidth: '500px', color: 'white', position: 'relative'
          }}>
            <button 
              onClick={() => { setActiveModal(null); setTrackResult(null); setTrackError(''); }} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            {/* TRACK COMPLAINT MODAL */}
            {activeModal === 'TRACK' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={24} color="#818CF8" /> Track Your Report
                </h2>
                <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter Complaint ID (e.g., PW-2026-101)" 
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #4f46e5', backgroundColor: '#312e81', color: 'white' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Search</button>
                </form>

                {trackError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{trackError}</p>}

                {trackResult && (
                  <div style={{ backgroundColor: '#312e81', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3 style={{ borderBottom: '1px solid #4f46e5', paddingBottom: '10px', marginBottom: '15px' }}>
                      Status: <span className={`status-badge status-${trackResult.status.toLowerCase()}`}>{trackResult.status}</span>
                    </h3>
                    <p><strong>Vehicle:</strong> {trackResult.vehicleNumber}</p>
                    <p><strong>Violation:</strong> {trackResult.violationType.replace('_', ' ')}</p>
                    <p><strong>Submitted On:</strong> {new Date(trackResult.createdAt).toLocaleString()}</p>
                    
                    <div style={{ marginTop: '20px' }}>
                      {['SUBMITTED', 'ASSIGNED', 'VERIFIED'].includes(trackResult.status) && (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           <p style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16}/> Report Received</p>
                           {['ASSIGNED', 'VERIFIED'].includes(trackResult.status) && (
                              <p style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16}/> Assigned to Station ({trackResult.assignedPoliceName || 'Officer'})
                              </p>
                           )}
                           {trackResult.status === 'VERIFIED' && (
                              <>
                                <p style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16}/> Fine Issued by Authority</p>
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
                                  <h4 style={{ color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🎉 Complaint Solved!
                                  </h4>
                                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    Thank you for making our roads safer! Your report was verified and action was taken by <strong>{trackResult.assignedPoliceName || 'the assigned officer'}</strong>. We appreciate your active citizenship! 🌟
                                  </p>
                                </div>
                              </>
                           )}
                           {trackResult.status !== 'VERIFIED' && trackResult.status !== 'REJECTED' && (
                              <p style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16}/> Pending Final Review</p>
                           )}
                         </div>
                      )}
                      {trackResult.status === 'REJECTED' && (
                         <p style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={16}/> Report was rejected due to lack of valid evidence.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS MODAL */}
            {activeModal === 'NOTIFICATIONS' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={24} color="#818CF8" /> Notifications
                </h2>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {recentComplaints.filter(c => c.status === 'VERIFIED' || c.status === 'REJECTED').length > 0 ? (
                    recentComplaints
                      .filter(c => c.status === 'VERIFIED' || c.status === 'REJECTED')
                      .map(c => (
                        <div key={c._id} style={{ 
                          backgroundColor: '#312e81', padding: '1rem', borderRadius: '8px', marginBottom: '10px',
                          borderLeft: `4px solid ${c.status === 'VERIFIED' ? '#10b981' : '#ef4444'}`
                        }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {c.status === 'VERIFIED' ? 'Report Verified!' : 'Report Rejected'}
                          </p>
                          <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                            Your report <strong>{c.complaintId}</strong> for vehicle {c.vehicleNumber} has been {c.status.toLowerCase()}.
                            {c.status === 'VERIFIED' && (
                              <span style={{ display: 'block', marginTop: '8px', color: '#10b981' }}>
                                🎉 Complaint Solved! Action taken by <strong>{c.assignedPoliceName || 'the assigned officer'}</strong>. Thank you for making our roads safer! 🌟
                              </span>
                            )}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No new notifications at this time.</p>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE MODAL */}
            {activeModal === 'PROFILE' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserIcon size={24} color="#818CF8" /> Citizen Profile
                </h2>
                <div style={{ backgroundColor: '#312e81', padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Full Name</label>
                    <p style={{ fontSize: '1.1rem' }}>{user?.name}</p>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Email Address</label>
                    <p style={{ fontSize: '1.1rem' }}>{user?.email}</p>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Account Type</label>
                    <p style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>{user?.role.toLowerCase()}</p>
                  </div>
                  
                  <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={() => alert('Password reset link sent to your email.')}>
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* REWARDS MODAL */}
            {activeModal === 'REWARDS' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎁 Civic Rewards Program
                </h2>
                <div style={{ backgroundColor: '#312e81', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '10px' }}>Your Balance</h3>
                  <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981', margin: '0' }}>{user?.civicPoints || 0}</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Earn 50 points for every verified report!</p>
                </div>
                
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid #4f46e5', paddingBottom: '8px' }}>Redeem Offers (Coimbatore)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1b4b', padding: '15px', borderRadius: '8px', border: '1px solid #3730a3' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>TNSTC Weekly Bus Pass</h4>
                      <p style={{ margin: '0', fontSize: '0.85rem', color: '#94a3b8' }}>Free travel on city routes</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={(user?.civicPoints || 0) < 500} onClick={() => alert('Code sent to email!')}>
                      500 pts
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1b4b', padding: '15px', borderRadius: '8px', border: '1px solid #3730a3' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Corporation Parking Pass</h4>
                      <p style={{ margin: '0', fontSize: '0.85rem', color: '#94a3b8' }}>1 Month free parking at DB Road</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={(user?.civicPoints || 0) < 1000} onClick={() => alert('Code sent to email!')}>
                      1000 pts
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1b4b', padding: '15px', borderRadius: '8px', border: '1px solid #3730a3' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Property Tax Discount</h4>
                      <p style={{ margin: '0', fontSize: '0.85rem', color: '#94a3b8' }}>5% off on next half-year cycle</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={(user?.civicPoints || 0) < 2500} onClick={() => alert('Code sent to email!')}>
                      2500 pts
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
