import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaThLarge, 
  FaFileMedical, 
  FaHeartbeat, 
  FaFolder,
  FaCog
} from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <FaThLarge />
    },
    {
      id: 'analyzer',
      label: 'Analyzer',
      path: '/analyzer',
      icon: <FaFileMedical />
    },
    {
      id: 'bp-monitor',
      label: 'BP Monitor',
      path: '/bp-monitor',
      icon: <FaHeartbeat />
    },
    {
      id: 'records',
      label: 'Records',
      path: '/records',
      icon: <FaFolder />
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: <FaCog />
    }
  ];

  const isTabActive = (path) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    if (path === '/analyzer' && (location.pathname === '/report' || location.pathname === '/prescription' || location.pathname.startsWith('/analyzer'))) {
      return true;
    }
    if (path === '/records' && (location.pathname === '/records' || location.pathname === '/health-monitor')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {tabs.map((tab) => {
          const active = isTabActive(tab.path);
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
            >
              <div className="bottom-nav-icon-wrapper">
                <span className="bottom-nav-icon">{tab.icon}</span>
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
