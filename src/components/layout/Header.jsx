import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FaMoon, 
  FaSun, 
  FaBell, 
  FaArrowLeft, 
  FaUserCircle, 
  FaUserShield,
  FaSignOutAlt, 
  FaShieldAlt,
  FaHeartbeat,
  FaFileMedical,
  FaPrescription,
  FaFolder,
  FaTimes,
  FaIdCard,
  FaEdit,
  FaCheck,
  FaCog,
  FaCamera,
  FaBrain,
  FaTrashAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHospital,
  FaSmog,
  FaLungs,
  FaRobot
} from 'react-icons/fa';
import { DEFAULT_AVATAR } from '../../constants/avatarCharacters';
import toast from 'react-hot-toast';
import './Header.css';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, updateUserName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAlertsCenterModal, setShowAlertsCenterModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Local Health Alert Active',
      message: 'Air Quality Index elevated in your zone. Recommended indoor rest.',
      time: '10m ago',
      type: 'warning',
      icon: <FaShieldAlt className="notif-icon-warn" />
    },
    {
      id: 2,
      title: 'BP Telemetry Sync Complete',
      message: 'Resting pulse recorded at optimal 72 BPM.',
      time: '1h ago',
      type: 'success',
      icon: <FaHeartbeat className="notif-icon-success" />
    },
    {
      id: 3,
      title: 'District Flu Advisory',
      message: 'Seasonal influenza cases up 14% in Metro Zone. Stay hydrated.',
      time: '3h ago',
      type: 'warning',
      icon: <FaExclamationTriangle className="notif-icon-warn" />
    }
  ]);

  const handleDismissNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    toast.success('Notification cleared', { id: 'notif-clear' });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    toast.success('All notifications cleared', { id: 'notif-clear-all' });
  };

  // Clean patient name (no 'Doctor' or 'Dr.' prefix)
  const cleanPatientName = user?.name 
    ? user.name.replace(/^dr\.\s*/i, '').trim() 
    : 'Alex Mercer';

  useEffect(() => {
    if (user?.name) {
      setTempName(user.name.replace(/^dr\.\s*/i, '').trim());
    }
  }, [user]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!tempName.trim()) {
      toast.error('Please enter a valid patient name');
      return;
    }
    updateUserName(tempName.trim());
    setIsEditingName(false);
    toast.success(`Name updated to "${tempName.trim()}"`);
  };

  const isHome = location.pathname === '/' || location.pathname === '/dashboard';

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHeartbeat /> },
    { path: '/analyzer', label: 'AI Analyzer', icon: <FaFileMedical /> },
    { path: '/bp-monitor', label: 'BP Monitor', icon: <FaHeartbeat /> },
    { path: '/records', label: 'Records', icon: <FaFolder /> },
    { path: '/mental-health', label: 'Mental Wellness', icon: <FaBrain /> },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="titan-header">
      <div className="header-container">
        {/* Left Side: Back Button, Avatar, and Patient Name Greeting */}
        <div className="header-left">
          {!isHome && (
            <button 
              className="back-btn" 
              onClick={() => navigate('/dashboard')}
              title="Go back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <FaArrowLeft />
            </button>
          )}

          <div 
            className="user-profile-badge"
            title="User Profile • Click avatar to change profile picture"
          >
            <div 
              className="avatar-wrapper clickable-avatar-badge"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/settings?tab=profile');
              }}
              title="Click to customize profile picture & avatar"
            >
              <img 
                src={user?.avatar || DEFAULT_AVATAR} 
                alt="User Avatar" 
                className="user-avatar"
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
              <span className="online-indicator"></span>
            </div>
            <div className="branding-text" onClick={() => setShowUserMenu(!showUserMenu)}>
              <span className="greeting-text">Hello, {cleanPatientName}</span>
              <div className="brand-title-wrap" onClick={(e) => { e.stopPropagation(); navigate('/dashboard'); }}>
                <span className="brand-name glow-text">TitanVitals</span>
                <span className="brand-sub-pill">nxt Gen AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="header-nav-desktop">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path === '/records' && (location.pathname === '/records' || location.pathname === '/health-monitor')) ||
              (link.path === '/analyzer' && (location.pathname === '/analyzer' || location.pathname === '/report' || location.pathname === '/prescription'));
            return (
              <button
                key={link.path}
                className={`desktop-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                <span className="nav-icon">{link.icon}</span>
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Theme Switcher, Notifications, Settings, User Dropdown */}
        <div className="header-right">
          {/* THEME TOGGLE BUTTON */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle-icon-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="theme-icon-container">
              {isDark ? (
                <FaMoon className="theme-icon moon-icon" />
              ) : (
                <FaSun className="theme-icon sun-icon" />
              )}
            </div>
            <span className="theme-toggle-tooltip">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* NOTIFICATION BELL BUTTON */}
          <div className="notification-wrapper">
            <button
              id="notif-btn"
              className={`notification-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                if (!showNotifications && unreadCount > 0) {
                  setUnreadCount(0);
                }
              }}
              title="Notifications & Health Alerts"
              aria-label="Notifications"
            >
              <FaBell className="bell-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="notifications-dropdown glass-panel">
                <div className="dropdown-header">
                  <div className="flex-center gap-2">
                    <FaBell className="text-cyan" />
                    <h4>Health Alerts & Telemetry</h4>
                  </div>
                  <div className="dropdown-header-actions">
                    {notifications.length > 0 && (
                      <button 
                        type="button" 
                        className="notif-clear-all-link"
                        onClick={handleClearAllNotifications}
                        title="Clear all active notifications"
                      >
                        <FaTrashAlt className="ico-xs" /> Clear All
                      </button>
                    )}
                    <button 
                      className="close-dropdown-btn"
                      onClick={() => setShowNotifications(false)}
                      title="Close"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>

                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty-state">
                      <FaCheckCircle className="empty-notif-ico text-green" />
                      <p>All caught up! No active alerts.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`notification-item ${n.type}`}>
                        <div className="notif-item-icon">{n.icon}</div>
                        <div className="notif-item-content">
                          <div className="notif-item-title-row">
                            <span className="notif-item-title">{n.title}</span>
                            <span className="notif-item-time">{n.time}</span>
                          </div>
                          <p className="notif-item-msg">{n.message}</p>
                        </div>
                        <button 
                          type="button" 
                          className="notif-item-dismiss-btn"
                          onClick={(e) => handleDismissNotification(n.id, e)}
                          title="Dismiss notification"
                          aria-label="Dismiss notification"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="dropdown-footer">
                  <button 
                    type="button"
                    className="footer-action-btn"
                    onClick={() => {
                      setShowNotifications(false);
                      setShowAlertsCenterModal(true);
                    }}
                  >
                    Open Health Alerts Center
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DEDICATED SETTINGS GEAR BUTTON */}
          <button
            id="header-settings-btn"
            className={`header-settings-btn ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
            title="System Settings & Preferences"
            aria-label="Settings"
          >
            <FaCog className="settings-gear-icon" />
          </button>

          {/* User Account Popover */}
          {showUserMenu && (
            <div className="user-menu-dropdown glass-panel">
              <div className="user-menu-header">
                <div 
                  className="user-menu-avatar-wrap clickable-menu-avatar"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings?tab=profile');
                  }}
                  title="Click to customize profile picture & avatar"
                >
                  <img 
                    src={user?.avatar || DEFAULT_AVATAR} 
                    alt="User" 
                    className="user-menu-avatar"
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  />
                  <span className="avatar-edit-overlay-icon" title="Change Profile Picture">
                    <FaCamera />
                  </span>
                </div>
                <div className="user-menu-details">
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="name-edit-form">
                      <input 
                        type="text" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)}
                        className="name-edit-input"
                        autoFocus
                        placeholder="Enter your name"
                      />
                      <button type="submit" className="save-name-btn" title="Save name">
                        <FaCheck />
                      </button>
                      <button type="button" className="cancel-name-btn" onClick={() => setIsEditingName(false)}>
                        <FaTimes />
                      </button>
                    </form>
                  ) : (
                    <div className="name-display-row">
                      <h4 className="user-menu-name">{cleanPatientName}</h4>
                      <button 
                        className="edit-name-icon-btn" 
                        onClick={() => setIsEditingName(true)}
                        title="Edit Your Patient Name"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                  <span className="user-menu-role">Patient Member • {user?.bloodGroup || 'O+'}</span>
                  <span className="user-menu-email">{user?.email || 'patient@titanvitals.ai'}</span>
                  <span className="user-health-id-badge">
                    <FaIdCard /> {user?.healthId || 'TV-8942-AI'}
                  </span>
                </div>
              </div>

              <div className="user-menu-links">
                <button 
                  className="user-menu-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings?tab=profile');
                  }}
                >
                  <FaUserCircle /> Patient Profile & Avatar Studio
                </button>
                <button 
                  className="user-menu-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                >
                  <FaCog /> Settings & Preferences
                </button>
                <button 
                  className="user-menu-item logout-item"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Sign Out / Switch Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          HEALTH ALERTS & TELEMETRY CENTER MODAL
          ======================================================== */}
      {showAlertsCenterModal && (
        <div className="health-alerts-modal-overlay" onClick={() => setShowAlertsCenterModal(false)}>
          <div className="health-alerts-modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="alerts-modal-header">
              <div className="alerts-modal-title-group">
                <div className="alerts-modal-icon-ring">
                  <FaShieldAlt className="text-cyan" />
                </div>
                <div>
                  <h3 className="alerts-modal-title">Regional Health Alerts & Telemetry Center</h3>
                  <p className="alerts-modal-sub">Live biometric surveillance, environmental hazards & emergency readiness</p>
                </div>
              </div>
              <button 
                type="button" 
                className="alerts-modal-close-btn"
                onClick={() => setShowAlertsCenterModal(false)}
                title="Close"
                aria-label="Close Health Alerts Modal"
              >
                <FaTimes className="alerts-modal-close-icon" />
              </button>
            </div>

            <div className="alerts-modal-body">
              {/* SECTION 1: ACTIVE REGIONAL ADVISORIES */}
              <div className="alert-section-card">
                <h4 className="alert-sec-heading">
                  <FaSmog className="text-amber" /> Active Regional & Environmental Advisories
                </h4>
                <div className="alerts-cards-grid">
                  <div className="hazard-pill-card warning">
                    <div className="hazard-card-head">
                      <span className="hazard-badge aqi-badge">AQI 168 • Moderate/Unhealthy</span>
                      <span className="hazard-zone-tag">Metro Health Zone</span>
                    </div>
                    <strong className="hazard-title">Particulate Matter (PM2.5) Surge</strong>
                    <p className="hazard-desc">
                      Atmospheric particle levels elevated. Sensitive groups and cardiovascular/asthma patients should limit intense outdoor exertion and use HEPA filtration indoors.
                    </p>
                  </div>

                  <div className="hazard-pill-card danger">
                    <div className="hazard-card-head">
                      <span className="hazard-badge flu-badge">+14% Seasonal Flu Spike</span>
                      <span className="hazard-zone-tag">District Hospital Network</span>
                    </div>
                    <strong className="hazard-title">Viral Influenza Advisory</strong>
                    <p className="hazard-desc">
                      Increased influenza transmission recorded in local municipal sector. Maintain optimal hydration, vitamin intake, and consult TitanVitals AI upon experiencing early symptoms.
                    </p>
                  </div>

                  <div className="hazard-pill-card info">
                    <div className="hazard-card-head">
                      <span className="hazard-badge uv-badge">UV Index 8 • Very High</span>
                      <span className="hazard-zone-tag">Midday Forecast</span>
                    </div>
                    <strong className="hazard-title">Solar Radiation Warning</strong>
                    <p className="hazard-desc">
                      Intense solar irradiance between 11:00 AM - 04:00 PM. Apply broad-spectrum SPF 50+ protection and seek shaded rest when outdoors.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BIOMETRIC TELEMETRY STATUS */}
              <div className="alert-section-card">
                <h4 className="alert-sec-heading">
                  <FaHeartbeat className="text-cyan" /> Patient Vitals & Clinical Telemetry Baseline
                </h4>
                <div className="telemetry-stat-row">
                  <div className="telemetry-stat-item">
                    <span className="stat-label">Resting Pulse</span>
                    <strong className="stat-val text-cyan">79 <small>bpm</small></strong>
                    <span className="stat-badge optimal">Optimal Rhythm</span>
                  </div>
                  <div className="telemetry-stat-item">
                    <span className="stat-label">Blood Pressure</span>
                    <strong className="stat-val text-green">102/72 <small>mmHg</small></strong>
                    <span className="stat-badge optimal">Normal Range</span>
                  </div>
                  <div className="telemetry-stat-item">
                    <span className="stat-label">Pulse Oximetry</span>
                    <strong className="stat-val text-cyan">98% <small>SpO₂</small></strong>
                    <span className="stat-badge optimal">Normal Oxygenation</span>
                  </div>
                  <div className="telemetry-stat-item">
                    <span className="stat-label">Health ID</span>
                    <strong className="stat-val text-purple">{user?.healthId || 'TV-8942-AI'}</strong>
                    <span className="stat-badge secure">Encrypted & Active</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: NEARBY EMERGENCY READINESS */}
              <div className="alert-section-card">
                <h4 className="alert-sec-heading">
                  <FaHospital className="text-rose" /> Nearby Emergency & Trauma Facilities Standby
                </h4>
                <div className="emergency-facilities-list">
                  <div className="emergency-facility-pill">
                    <div className="facility-pill-left">
                      <strong>Central Apex Multi-Specialty Hospital</strong>
                      <span>2.5 km away • 8 min Ambulance ETA</span>
                    </div>
                    <span className="facility-bed-avail">5 ICU Beds Ready</span>
                  </div>
                  <div className="emergency-facility-pill">
                    <div className="facility-pill-left">
                      <strong>St. Jude University Trauma & Heart Center</strong>
                      <span>4.1 km away • 12 min Ambulance ETA</span>
                    </div>
                    <span className="facility-bed-avail">8 ICU Beds Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alerts-modal-footer">
              <button 
                type="button" 
                className="modal-action-btn btn-ai-triage"
                onClick={() => {
                  setShowAlertsCenterModal(false);
                  navigate('/analyzer');
                }}
              >
                <FaRobot /> Launch AI Symptom & Report Triage
              </button>
              <button 
                type="button" 
                className="modal-action-btn btn-close-alerts"
                onClick={() => setShowAlertsCenterModal(false)}
              >
                Close Center
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
