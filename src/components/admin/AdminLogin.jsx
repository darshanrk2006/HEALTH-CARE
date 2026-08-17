import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserShield, 
  FaLock, 
  FaHospital, 
  FaKey, 
  FaArrowRight, 
  FaShieldAlt, 
  FaEye, 
  FaEyeSlash,
  FaCheckCircle,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      toast.error('Please enter both Admin ID and Password');
      return;
    }

    setIsLoading(true);
    toast.loading('Authenticating Administrative Access...', { id: 'admin-auth' });

    try {
      await adminLogin(adminId.trim(), password);
      setIsLoading(false);
      toast.success('Admin Authorization Confirmed! Opening Command Center...', { id: 'admin-auth' });
      navigate('/admin/dashboard');
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Ambient background glows */}
      <div className="admin-bg-glow glow-cyan"></div>
      <div className="admin-bg-glow glow-crimson"></div>

      {/* Top Header */}
      <div className="admin-login-top-bar">
        <div className="admin-security-pill">
          <FaShieldAlt className="shield-icon" />
          <span>Restricted Admin Portal</span>
        </div>

        <button 
          type="button"
          className="login-theme-toggle-btn" 
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <FaMoon className="theme-icon moon-icon" /> : <FaSun className="theme-icon sun-icon" />}
        </button>
      </div>

      {/* Admin Login Glass Card */}
      <div className="admin-login-card glass-card">
        <div className="admin-card-header">
          <div className="admin-icon-shield">
            <FaUserShield />
          </div>
          <div className="admin-brand-title">
            <h2>TitanVitals <span className="admin-badge-text">NEXT GEN AI</span></h2>
            <p>Hospital & Emergency Bed Administration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {/* Admin ID Field */}
          <div className="admin-field-group">
            <label className="admin-label">
              <FaHospital className="label-icon" />
              <span>Admin Identification / ID</span>
            </label>
            <div className="admin-input-wrapper">
              <FaUserShield className="input-prefix-icon" />
              <input
                type="text"
                className="admin-text-input"
                placeholder="e.g. 2319"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="admin-field-group">
            <label className="admin-label">
              <FaLock className="label-icon" />
              <span>Admin Secure Passcode</span>
            </label>
            <div className="admin-input-wrapper">
              <FaKey className="input-prefix-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-text-input"
                placeholder="Enter master passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="admin-submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authorizing Admin Access...</span>
            ) : (
              <>
                <span>Enter Hospital Admin Center</span>
                <FaArrowRight className="arrow-btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="admin-card-footer">
          <p className="admin-disclaimer">
            🔒 Dedicated database isolation. Regular patient logins are strictly prohibited from this portal.
          </p>
          <button 
            type="button" 
            className="back-patient-link"
            onClick={() => navigate('/dashboard')}
          >
            ← Return to Patient Care Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
