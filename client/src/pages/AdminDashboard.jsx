import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Shield, AlertTriangle, CheckCircle, XCircle, Users, Activity, X, Map as MapIcon } from 'lucide-react';
import api from '../services/api';
import './AdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    newReports: 0,
    verified: 0,
    rejected: 0,
    totalFines: 0,
    paidFines: 0,
    repeatOffenders: 0
  });
  
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [chartData, setChartData] = useState({ violationsByType: [], reportsByDay: [] });
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeView, setActiveView] = useState('DASHBOARD'); // 'DASHBOARD', 'REPEAT_OFFENDERS', 'VERIFIED_VIOLATIONS', 'INCIDENT_HEATMAP'

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [flaggedVehicles, setFlaggedVehicles] = useState([]);

  const toggleFlagVehicle = (vehicleNumber) => {
    setFlaggedVehicles(prev => {
      if (prev.includes(vehicleNumber)) {
        return prev.filter(v => v !== vehicleNumber);
      } else {
        alert(`Vehicle ${vehicleNumber} has been officially flagged in the national registry.`);
        return [...prev, vehicleNumber];
      }
    });
  };

  const fetchAdminData = async () => {
    try {
      const [dashRes, complaintsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/complaints')
      ]);
      
      setStats(dashRes.data.stats);
      setChartData(dashRes.data.charts);
      setRecentComplaints(complaintsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status: newStatus });
      
      if (newStatus === 'VERIFIED') {
        alert(`📱 SIMULATED SMS SENT TO VEHICLE OWNER:\n\n"Dear Owner, a challan of ₹500 has been issued against your vehicle for a parking violation. Please pay at the ParkWatch portal."`);
      }
      
      setSelectedComplaint(null);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Derived Data
  const repeatOffendersList = React.useMemo(() => {
    const counts = {};
    recentComplaints.forEach(c => {
      counts[c.vehicleNumber] = counts[c.vehicleNumber] ? counts[c.vehicleNumber] + 1 : 1;
    });
    
    return Object.keys(counts)
      .filter(v => counts[v] > 1)
      .map(v => {
        // Get all complaints for this vehicle
        const vehicleComplaints = recentComplaints.filter(c => c.vehicleNumber === v);
        // Calculate total fines if verified
        const totalEstimatedFines = vehicleComplaints
          .filter(c => c.status === 'VERIFIED')
          .reduce((sum, c) => sum + 500, 0); // Simplified estimate for UI

        return {
          vehicleNumber: v,
          offenseCount: counts[v],
          lastOffenseDate: new Date(Math.max(...vehicleComplaints.map(c => new Date(c.createdAt)))).toLocaleDateString(),
          totalEstimatedFines
        };
      })
      .sort((a, b) => b.offenseCount - a.offenseCount);
  }, [recentComplaints]);

  const verifiedViolationsList = recentComplaints.filter(c => c.status === 'VERIFIED');

  if (loading) return <div className="p-4">Loading Admin Dashboard...</div>;

  return (
    <div className="admin-layout">
      {/* Sidebar / Navbar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Shield size={32} color="var(--primary)" />
          <h2>ParkWatch Admin</h2>
        </div>
        <nav className="admin-nav-links">
          <a href="#" className={activeView === 'DASHBOARD' ? 'active' : ''} onClick={() => setActiveView('DASHBOARD')}>
            <Activity size={20} /> Dashboard
          </a>
          <a href="#" onClick={() => setActiveView('DASHBOARD')}>
            <AlertTriangle size={20} /> Priority Queue
          </a>
          <a href="#" className={activeView === 'VERIFIED_VIOLATIONS' ? 'active' : ''} onClick={() => setActiveView('VERIFIED_VIOLATIONS')}>
            <CheckCircle size={20} /> Verified Violations
          </a>
          <a href="#" className={activeView === 'INCIDENT_HEATMAP' ? 'active' : ''} onClick={() => setActiveView('INCIDENT_HEATMAP')}>
            <MapIcon size={20} /> Incident Heatmap
          </a>
          <a href="#" className={activeView === 'REPEAT_OFFENDERS' ? 'active' : ''} onClick={() => setActiveView('REPEAT_OFFENDERS')}>
            <Users size={20} /> Repeat Offenders
          </a>
          <button onClick={logout} className="logout-btn">Logout</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeView === 'DASHBOARD' && 'Authority Dashboard'}
            {activeView === 'REPEAT_OFFENDERS' && 'Repeat Offenders Database'}
            {activeView === 'VERIFIED_VIOLATIONS' && 'Verified Violations'}
            {activeView === 'INCIDENT_HEATMAP' && 'Incident Heatmap Analytics'}
          </h1>
          <div className="admin-profile">
            <span>Officer: {user?.name || 'Admin'}</span>
          </div>
        </header>

        {activeView === 'DASHBOARD' && (
          <>
            {/* Top KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <p>Total Reports</p>
                <h3>{stats.totalReports}</h3>
              </div>
              <div className="kpi-card highlight-danger">
                <p>New Reports (Pending)</p>
                <h3>{stats.newReports}</h3>
              </div>
              <div className="kpi-card highlight-success">
                <p>Verified Violations</p>
                <h3>{stats.verified}</h3>
              </div>
              <div className="kpi-card">
                <p>Repeat Offenders</p>
                <h3>{stats.repeatOffenders}</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Reports this Week</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.reportsByDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                      <Bar dataKey="reports" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Violations by Type</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.violationsByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.violationsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Priority Queue Table */}
            <div className="admin-table-section">
              <div className="table-header">
                <h3>Priority Queue</h3>
                <button className="btn btn-primary btn-sm">View All</button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vehicle</th>
                      <th>Violation Type</th>
                      <th>Status</th>
                      <th>Priority Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c._id}>
                        <td>{c.complaintId}</td>
                        <td className="font-bold">{c.vehicleNumber}</td>
                        <td>{c.violationType.replace('_', ' ')}</td>
                        <td><span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span></td>
                        <td>
                          <span className={`priority-indicator ${c.priorityLevel === 'HIGH' ? 'text-danger' : 'text-warning'}`}>
                            {c.priorityScore} ({c.priorityLevel})
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedComplaint(c)}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recentComplaints.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center" style={{ padding: '20px' }}>No reports found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* INCIDENT HEATMAP VIEW */}
        {activeView === 'INCIDENT_HEATMAP' && (
          <div className="admin-table-section" style={{ marginTop: '0', padding: '0', overflow: 'hidden' }}>
            <div className="table-header" style={{ padding: '20px' }}>
              <h3>High-Risk Zones Heatmap</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Visualizing the density of verified parking violations across Coimbatore.</p>
            </div>
            <div style={{ height: '600px', width: '100%', position: 'relative', zIndex: 0 }}>
              <MapContainer 
                center={[11.0168, 76.9558]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', borderRadius: '0 0 12px 12px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {recentComplaints.map(c => {
                  // Fallback to random nearby coords if lat/lng missing for demo
                  const lat = c.latitude || 11.0168 + (Math.random() - 0.5) * 0.05;
                  const lng = c.longitude || 76.9558 + (Math.random() - 0.5) * 0.05;
                  
                  const isVerified = c.status === 'VERIFIED';
                  
                  return (
                    <CircleMarker 
                      key={c._id} 
                      center={[lat, lng]} 
                      radius={isVerified ? 12 : 6}
                      fillOpacity={isVerified ? 0.6 : 0.4}
                      color={isVerified ? '#ef4444' : '#f59e0b'}
                      fillColor={isVerified ? '#ef4444' : '#f59e0b'}
                    >
                      <Popup>
                        <div style={{ color: '#1e1b4b' }}>
                          <strong>ID:</strong> {c.complaintId} <br/>
                          <strong>Status:</strong> {c.status} <br/>
                          <strong>Vehicle:</strong> {c.vehicleNumber} <br/>
                          <strong>Violation:</strong> {c.violationType}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* REPEAT OFFENDERS VIEW */}
        {activeView === 'REPEAT_OFFENDERS' && (
          <div className="admin-table-section" style={{ marginTop: '0' }}>
            <div className="table-header">
              <h3>Vehicles with Multiple Infractions</h3>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>License Plate</th>
                    <th>Total Offenses</th>
                    <th>Last Offense Date</th>
                    <th>Estimated Fines (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {repeatOffendersList.length > 0 ? (
                    repeatOffendersList.map(v => (
                      <tr key={v.vehicleNumber}>
                        <td className="font-bold" style={{ color: '#ef4444', fontSize: '1.1rem' }}>{v.vehicleNumber}</td>
                        <td><span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{v.offenseCount}</span></td>
                        <td>{v.lastOffenseDate}</td>
                        <td>₹{v.totalEstimatedFines}</td>
                        <td>
                          <button 
                            className={`btn btn-sm ${flaggedVehicles.includes(v.vehicleNumber) ? 'btn-primary' : 'btn-secondary'}`}
                            style={flaggedVehicles.includes(v.vehicleNumber) ? { backgroundColor: '#ef4444', border: 'none' } : {}}
                            onClick={() => toggleFlagVehicle(v.vehicleNumber)}
                          >
                            {flaggedVehicles.includes(v.vehicleNumber) ? 'Flagged (High Risk)' : 'Flag Vehicle'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center" style={{ padding: '40px' }}>
                        No repeat offenders found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VERIFIED VIOLATIONS VIEW */}
        {activeView === 'VERIFIED_VIOLATIONS' && (
          <div className="admin-table-section" style={{ marginTop: '0' }}>
            <div className="table-header">
              <h3>Officially Verified Reports</h3>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Vehicle</th>
                    <th>Violation Type</th>
                    <th>Verified Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedViolationsList.length > 0 ? (
                    verifiedViolationsList.map(c => (
                      <tr key={c._id}>
                        <td>{c.complaintId}</td>
                        <td className="font-bold">{c.vehicleNumber}</td>
                        <td>{c.violationType.replace('_', ' ')}</td>
                        <td>{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedComplaint(c)}
                          >
                            View Evidence
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center" style={{ padding: '40px' }}>
                        No verified violations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Complaint Review Modal (Requirement 24) */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', padding: '24px', backgroundColor: '#1e1b4b', color: 'white', borderRadius: '12px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedComplaint(null)} 
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid #3730a3', paddingBottom: '10px' }}>
              Complaint Details: {selectedComplaint.complaintId}
            </h2>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <img 
                  src={selectedComplaint.originalImageUrl || 'https://via.placeholder.com/400x300?text=No+Evidence+Uploaded'} 
                  alt="Evidence" 
                  style={{ width: '100%', borderRadius: '8px', border: '2px solid #3730a3' }}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ background: '#312e81', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#818cf8' }}>AI Extraction Results</h3>
                  <p><strong>Plate Number:</strong> {selectedComplaint.vehicleNumber}</p>
                  <p><strong>Vehicle Type:</strong> {selectedComplaint.vehicleType}</p>
                  <p><strong>Violation:</strong> {selectedComplaint.violationType.replace('_', ' ')}</p>
                  <p><strong>Priority Score:</strong> {selectedComplaint.priorityScore} ({selectedComplaint.priorityLevel})</p>
                </div>
                
                <div style={{ background: '#312e81', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#818cf8' }}>Location & Meta</h3>
                  <p><strong>Address:</strong> {selectedComplaint.address || 'Mocked Geolocation'}</p>
                  <p><strong>Lat/Lng:</strong> {selectedComplaint.latitude}, {selectedComplaint.longitude}</p>
                  <p><strong>Submitted By:</strong> {selectedComplaint.citizenId?.name || 'Citizen'}</p>
                  <p><strong>Description:</strong> {selectedComplaint.description || 'N/A'}</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedComplaint.status !== 'VERIFIED' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, backgroundColor: '#10b981' }}
                      disabled={actionLoading}
                      onClick={() => handleStatusUpdate(selectedComplaint._id, 'VERIFIED')}
                    >
                      {actionLoading ? '...' : 'Verify & Issue Fine'}
                    </button>
                  )}
                  {selectedComplaint.status !== 'REJECTED' && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }}
                      disabled={actionLoading}
                      onClick={() => handleStatusUpdate(selectedComplaint._id, 'REJECTED')}
                    >
                      {actionLoading ? '...' : 'Reject Invalid'}
                    </button>
                  )}
                  {selectedComplaint.status === 'VERIFIED' && selectedComplaint.status === 'REJECTED' && (
                    <div style={{ width: '100%', textAlign: 'center', padding: '10px', color: '#94a3b8' }}>
                      Status already finalized.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
