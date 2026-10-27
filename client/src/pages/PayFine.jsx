import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './Auth.css'; 

const PayFine = () => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;
    
    setLoading(true);
    setError('');
    setSearched(false);
    
    try {
      const formattedNumber = vehicleNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const res = await api.get(`/fines/public/${formattedNumber}`);
      setFines(res.data);
      setSearched(true);
    } catch (err) {
      setError('Unable to fetch fines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (fineId) => {
    try {
      // Simulate payment gateway delay
      alert('Redirecting to payment gateway...');
      
      const res = await api.post(`/fines/${fineId}/pay`);
      
      // Update local state
      setFines(fines.map(f => f._id === fineId ? { ...f, status: 'PAID' } : f));
      
      alert('Payment Successful! Your fine has been cleared.');
    } catch (err) {
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="auth-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
      <div style={{ width: '100%', maxWidth: '800px', padding: '0 20px' }}>
        <Link to="/" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', textDecoration: 'none' }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div style={{ backgroundColor: '#1e1b4b', padding: '30px', borderRadius: '12px', border: '1px solid #3730a3' }}>
          <h1 style={{ color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={32} color="#818CF8" /> e-Challan Payment Portal
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Enter your Vehicle Registration Number to view and pay pending traffic fines.</p>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input 
              type="text" 
              placeholder="e.g. TN38AB1234" 
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #4f46e5', backgroundColor: '#312e81', color: 'white', fontSize: '1.1rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 30px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Searching...' : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Search size={20} /> Search</span>}
            </button>
          </form>

          {error && (
            <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {searched && (
            <div>
              <h2 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px', borderBottom: '1px solid #3730a3', paddingBottom: '10px' }}>
                Search Results for {vehicleNumber.toUpperCase()}
              </h2>
              
              {fines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#10b981', backgroundColor: '#312e81', borderRadius: '8px' }}>
                  <CheckCircle size={48} style={{ margin: '0 auto 15px auto' }} />
                  <h3>No Pending Fines</h3>
                  <p style={{ color: '#94a3b8' }}>Great job following traffic rules!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {fines.map(fine => (
                    <div key={fine._id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      backgroundColor: '#312e81', 
                      padding: '20px', 
                      borderRadius: '8px',
                      borderLeft: `4px solid ${fine.status === 'PAID' ? '#10b981' : '#f59e0b'}`,
                      flexWrap: 'wrap',
                      gap: '15px'
                    }}>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Challan No: {fine.fineId}</p>
                        <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1.1rem' }}>{fine.violationType.replace('_', ' ')}</h4>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0' }}>Issued: {new Date(fine.issuedAt || fine.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 2px 0' }}>Amount</p>
                          <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', margin: '0' }}>₹{fine.amount}</p>
                        </div>
                        
                        {fine.status === 'PAID' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontWeight: 'bold' }}>
                            <CheckCircle size={18} /> PAID
                          </span>
                        ) : (
                          <button onClick={() => handlePay(fine._id)} className="btn btn-primary" style={{ backgroundColor: '#f59e0b', color: '#1e1b4b', border: 'none' }}>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayFine;
