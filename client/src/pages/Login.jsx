import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, ArrowRight } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-compact">
        <div className="auth-right auth-right-centered">
          <div className="auth-logo-center">
            <Shield size={28} color="#818CF8" />
            ParkWatch
          </div>
          <h1>Sign in</h1>
          <p className="auth-subtitle">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
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

            <button type="submit" className="btn-auth-submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
