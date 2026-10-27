import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ReportViolation from './pages/ReportViolation';

import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import PoliceDirectory from './pages/PoliceDirectory';
import HowItWorks from './pages/HowItWorks';
import PayFine from './pages/PayFine';
import './App.css';

import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeToggle />
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/police-directory" element={<PoliceDirectory />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pay-fine" element={<PayFine />} />
          
          {/* Protected Routes for Citizen only */}
          <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/report" element={<ReportViolation />} />
          </Route>
          
          {/* Protected Routes for Citizen & Admin */}
          <Route element={<ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']} />}>
            <Route path="/" element={<Landing />} />
          </Route>
          
          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Additional admin routes will go here */}
          </Route>
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
