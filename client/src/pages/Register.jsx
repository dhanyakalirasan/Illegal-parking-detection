import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, ArrowRight } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // FIX: Pass as a single object which AuthContext expects
      await register({ name, email, password, phone });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Side */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <Shield size={24} color="#818CF8" />
              ParkWatch
            </div>
          </div>
          <div className="auth-left-content">
            <h2>Empowering Citizens,<br/>Keeping Streets Clear</h2>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-right">
          <h1>Create an account</h1>
          <p className="auth-subtitle">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <input 
                type="text" 
                placeholder="Full name"
                className="auth-input"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Phone (optional)"
                className="auth-input"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            
            <input 
              type="email" 
              placeholder="Email"
              className="auth-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                className="auth-input"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <Eye 
                size={18} 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="auth-checkbox-wrapper">
              <input type="checkbox" required id="terms" />
              <label htmlFor="terms">I agree to the <a href="#">Terms & Conditions</a></label>
            </div>

            <button type="submit" className="btn-auth-submit">Create account</button>
            
            <div className="auth-divider">
              <span>Or register with</span>
            </div>
            
            <div className="social-buttons">
              <button type="button" className="btn-social">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="18" alt="Google" />
                Google
              </button>
              <button type="button" className="btn-social">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" width="16" alt="Apple" style={{ opacity: 0.8 }} />
                Apple
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
