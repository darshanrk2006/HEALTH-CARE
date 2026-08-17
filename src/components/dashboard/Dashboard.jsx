import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaPrescription,
  FaFileMedical,
  FaHeartbeat,
  FaBrain,
  FaHospital,
  FaChartLine,
  FaVirus,
  FaMobileAlt,
  FaExclamationTriangle,
  FaSyncAlt,
  FaTint,
  FaArrowRight,
  FaCheckCircle,
  FaFlask,
  FaCog,
  FaSignOutAlt,
  FaFolder
} from 'react-icons/fa';
import { getHealthRecords } from '../../services/recordsService';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [bloodPressure, setBloodPressure] = useState('118/72');
  const [lastScanTime, setLastScanTime] = useState('Recently');

  // Load real latest BP scan from database records
  const loadLatestVitals = async () => {
    try {
      const bpRecords = await getHealthRecords('bp');
      if (bpRecords && bpRecords.length > 0) {
        const latest = bpRecords[0];
        if (latest.data) {
          if (latest.data.heartRate) setHeartRate(latest.data.heartRate);
          if (latest.data.bpString) setBloodPressure(latest.data.bpString);
          else if (latest.data.systolic && latest.data.diastolic) {
            setBloodPressure(`${latest.data.systolic}/${latest.data.diastolic}`);
          }
          if (latest.createdAt) {
            setLastScanTime(new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      }
    } catch (e) {
      console.warn('Could not load latest vitals from records:', e);
    }
  };

  useEffect(() => {
    loadLatestVitals();
  }, []);

  const handleRefreshVitals = async () => {
    setIsSyncing(true);
    await loadLatestVitals();
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Health records refreshed from database');
    }, 600);
  };

  const features = [
    {
      id: 'bp-monitor',
      icon: <FaHeartbeat />,
      title: 'BP Monitoring',
      desc: 'Real-time pulse & blood pressure capture',
      color: '#00d4ff'
    },
    {
      id: 'analyzer',
      icon: <FaFileMedical />,
      title: 'AI Document Analyzer',
      desc: 'Select & analyze Lab Reports or Prescriptions',
      color: '#7c3aed'
    },
    {
      id: 'prescription',
      icon: <FaPrescription />,
      title: 'Prescription OCR',
      desc: 'Digitize and understand medication dosages',
      color: '#06b6d4'
    },
    {
      id: 'disease-detection',
      icon: <FaVirus />,
      title: 'Disease Detection',
      desc: 'AI-assisted symptom risk triage',
      color: '#f59e0b'
    },
    {
      id: 'records',
      icon: <FaFolder />,
      title: 'Health Records & History',
      desc: 'Categorized BP, Lab Reports & Prescriptions',
      color: '#10b981'
    },
    {
      id: 'mental-health',
      icon: <FaBrain />,
      title: 'Mental Wellness',
      desc: 'Guided AI wellness & mood check-ins',
      color: '#ec4899'
    },
    {
      id: 'hospital-coordination',
      icon: <FaHospital />,
      title: 'Hospital & Beds',
      desc: 'Live emergency bed tracking and booking',
      color: '#3b82f6'
    },
    {
      id: 'rural-healthcare',
      icon: <FaMobileAlt />,
      title: 'Rural Healthcare',
      desc: 'Low-bandwidth tele-consult access',
      color: '#14b8a6'
    },
    {
      id: 'settings',
      icon: <FaCog />,
      title: 'System Settings',
      desc: 'Theme, AI models, vitals units & profile',
      color: '#00d4ff'
    },
  ];

  const patientDisplayName = user?.name ? user.name.replace(/^dr\.\s*/i, '').trim() : 'Alex Mercer';

  return (
    <div className="dashboard-content">
      {/* Patient Welcome Header */}
      <div className="patient-welcome-row">
        <div className="patient-welcome-text">
          <span className="patient-greeting-sub">Welcome back to your health hub,</span>
          <h1 className="patient-welcome-name">{patientDisplayName}</h1>
        </div>
        <div className="patient-header-actions">
          <div className="patient-id-tag">
            <span>Health ID: <strong>{user?.healthId || 'TV-8942-AI'}</strong></span>
          </div>
        </div>
      </div>

      {/* 1. Local Health Alert (From UI Screenshot) */}
      <div className="local-alert-card glass-card">
        <div className="alert-badge-wrapper">
          <div className="alert-icon-ring">
            <FaExclamationTriangle className="alert-triangle-icon" />
          </div>
        </div>
        <div className="alert-text-content">
          <h3 className="alert-title">Local Health Alert</h3>
          <p className="alert-description">
            Flu spike detected in your area. Consider scheduling a preventative checkup or updating your vaccination.
          </p>
        </div>
      </div>

      {/* 2. Vitals Overview Section (From UI Screenshot) */}
      <div className="section-container">
        <div className="section-header-row">
          <h2 className="section-heading">Vitals Overview</h2>
          <button
            className="sync-btn"
            onClick={handleRefreshVitals}
            disabled={isSyncing}
          >
            <FaSyncAlt className={`sync-icon ${isSyncing ? 'spinning' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>

        <div className="vitals-grid">
          {/* Heart Rate Card */}
          <div
            className="vital-card glass-card"
            onClick={() => navigate('/bp-monitor')}
          >
            <div className="vital-card-top">
              <div className="vital-icon-box heart-box">
                <FaHeartbeat />
              </div>
              <span className="vital-badge normal-badge">
                Recorded {lastScanTime}
              </span>
            </div>
            <div className="vital-value-row">
              <span className="vital-number">{heartRate}</span>
              <span className="vital-unit">bpm</span>
            </div>
            <span className="vital-label">Measured Heart Rate</span>
          </div>

          {/* Blood Pressure Card */}
          <div
            className="vital-card glass-card"
            onClick={() => navigate('/bp-monitor')}
          >
            <div className="vital-card-top">
              <div className="vital-icon-box bp-box">
                <FaTint />
              </div>
              <span className="vital-badge normal-badge">Optimal</span>
            </div>
            <div className="vital-value-row">
              <span className="vital-number">{bloodPressure}</span>
              <span className="vital-unit">mmHg</span>
            </div>
            <span className="vital-label">Blood Pressure</span>
          </div>
        </div>
      </div>

      {/* 3. Recent Scans Section (From UI Screenshot) */}
      <div className="section-container">
        <div className="section-header-row">
          <h2 className="section-heading">Recent Scans</h2>
          <button
            className="view-all-link"
            onClick={() => navigate('/records')}
          >
            View All →
          </button>
        </div>

        <div className="recent-scans-list">
          {/* Scan Item 1 */}
          <div
            className="scan-item-card glass-card"
            onClick={() => navigate('/prescription')}
          >
            <div className="scan-item-icon-wrapper prescription-icon-bg">
              <FaPrescription />
            </div>
            <div className="scan-item-info">
              <h4 className="scan-title">Dr. Chen's Prescription</h4>
              <span className="scan-subtitle">Processed: Today, 09:42 AM</span>
            </div>
            <div className="scan-item-action">
              <span className="analyzed-tag">
                <FaCheckCircle className="tag-check" /> Analyzed
              </span>
              <span className="details-link">
                View Details <FaArrowRight className="arrow-icon" />
              </span>
            </div>
          </div>

          {/* Scan Item 2 */}
          <div
            className="scan-item-card glass-card"
            onClick={() => navigate('/report')}
          >
            <div className="scan-item-icon-wrapper lab-icon-bg">
              <FaFlask />
            </div>
            <div className="scan-item-info">
              <h4 className="scan-title">Q3 Comprehensive Panel</h4>
              <span className="scan-subtitle">Processed: Oct 12, 2023</span>
            </div>
            <div className="scan-item-action">
              <span className="analyzed-tag">
                <FaCheckCircle className="tag-check" /> Analyzed
              </span>
              <span className="details-link">
                View Details <FaArrowRight className="arrow-icon" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Core Features Grid */}
      <div className="section-container">
        <div className="section-header-row">
          <h2 className="section-heading">All Health Services</h2>
        </div>

        <div className="services-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="service-card glass-card"
              onClick={() => navigate(`/${feature.id}`)}
              style={{ '--accent-color': feature.color }}
            >
              <div className="service-icon-box" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="service-title">{feature.title}</h3>
              <p className="service-desc">{feature.desc}</p>
              <div className="service-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;