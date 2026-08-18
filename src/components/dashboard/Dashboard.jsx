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
  const [spo2, setSpo2] = useState(98);
  const [hrv, setHrv] = useState(45);
  const [bpCategory, setBpCategory] = useState({ label: 'Optimal', tagClass: 'normal', color: '#10b981' });
  const [vascularElasticity, setVascularElasticity] = useState('Optimal Elasticity');
  const [lastScanTime, setLastScanTime] = useState('Recently');
  const [recentScans, setRecentScans] = useState([]);

  // Load real latest vitals and recent scan documents from database
  const loadLatestVitalsAndScans = async () => {
    try {
      // 1. Fetch latest BP scan
      const bpRecords = await getHealthRecords('bp');
      if (bpRecords && bpRecords.length > 0) {
        const latest = bpRecords[0];
        if (latest.data) {
          if (latest.data.heartRate) setHeartRate(latest.data.heartRate);
          if (latest.data.bpString) setBloodPressure(latest.data.bpString);
          else if (latest.data.systolic && latest.data.diastolic) {
            setBloodPressure(`${latest.data.systolic}/${latest.data.diastolic}`);
          }
          if (latest.data.spo2) setSpo2(latest.data.spo2);
          if (latest.data.hrvRmssd) setHrv(latest.data.hrvRmssd);
          if (latest.data.vascularElasticity) setVascularElasticity(latest.data.vascularElasticity);
          if (latest.data.category) {
            const cat = latest.data.category;
            const label = typeof cat === 'object' ? cat.label : cat;
            setBpCategory({
              label: label || 'Normal BP',
              tagClass: label?.toLowerCase().includes('stage') ? 'stage1' : 'normal',
              color: label?.toLowerCase().includes('stage') ? '#f97316' : '#10b981'
            });
          }
          if (latest.createdAt) {
            const date = new Date(latest.createdAt);
            const isToday = new Date().toDateString() === date.toDateString();
            setLastScanTime(isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
          }
        }
      }

      // 2. Fetch all recent scans
      const allRecords = await getHealthRecords('all');
      if (allRecords && allRecords.length > 0) {
        setRecentScans(allRecords.slice(0, 4));
      }
    } catch (e) {
      console.warn('Could not load latest vitals from records:', e);
    }
  };

  useEffect(() => {
    loadLatestVitalsAndScans();

    // Instant cross-component event listeners
    const handleVitalsUpdate = (e) => {
      if (e.detail) {
        if (e.detail.heartRate) setHeartRate(e.detail.heartRate);
        if (e.detail.bpString) setBloodPressure(e.detail.bpString);
        if (e.detail.spo2) setSpo2(e.detail.spo2);
        if (e.detail.hrvRmssd) setHrv(e.detail.hrvRmssd);
        if (e.detail.vascularElasticity) setVascularElasticity(e.detail.vascularElasticity);
        setLastScanTime('Just Now');
      }
      loadLatestVitalsAndScans();
    };

    const handleRecordsUpdate = () => {
      loadLatestVitalsAndScans();
    };

    window.addEventListener('titanvitals_vitals_updated', handleVitalsUpdate);
    window.addEventListener('titanvitals_records_updated', handleRecordsUpdate);
    window.addEventListener('storage', handleRecordsUpdate);
    window.addEventListener('focus', handleRecordsUpdate);

    return () => {
      window.removeEventListener('titanvitals_vitals_updated', handleVitalsUpdate);
      window.removeEventListener('titanvitals_records_updated', handleRecordsUpdate);
      window.removeEventListener('storage', handleRecordsUpdate);
      window.removeEventListener('focus', handleRecordsUpdate);
    };
  }, []);

  const handleRefreshVitals = async () => {
    setIsSyncing(true);
    await loadLatestVitalsAndScans();
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
          {/* 1. Heart Rate Card */}
          <div
            className="vital-card glass-card"
            onClick={() => navigate('/bp-monitor')}
          >
            <div className="vital-card-top">
              <div className="vital-icon-box heart-box">
                <FaHeartbeat />
              </div>
              <span className="vital-badge normal-badge">
                {lastScanTime.includes('Recorded') ? lastScanTime : `Recorded ${lastScanTime}`}
              </span>
            </div>
            <div className="vital-value-row">
              <span className="vital-number">{heartRate}</span>
              <span className="vital-unit">bpm</span>
            </div>
            <span className="vital-label">Measured Heart Rate</span>
          </div>

          {/* 2. Blood Pressure Card */}
          <div
            className="vital-card glass-card"
            onClick={() => navigate('/bp-monitor')}
          >
            <div className="vital-card-top">
              <div className="vital-icon-box bp-box">
                <FaTint />
              </div>
              <span 
                className={`vital-badge ${bpCategory.tagClass || 'normal'}-badge`}
                style={{ color: bpCategory.color, borderColor: `${bpCategory.color}40`, background: `${bpCategory.color}15` }}
              >
                {bpCategory.label || 'Optimal'}
              </span>
            </div>
            <div className="vital-value-row">
              <span className="vital-number">{bloodPressure}</span>
              <span className="vital-unit">mmHg</span>
            </div>
            <span className="vital-label">Blood Pressure</span>
          </div>

          {/* 3. Blood Oxygen (SpO2) Card */}
          <div
            className="vital-card glass-card"
            onClick={() => navigate('/bp-monitor')}
          >
            <div className="vital-card-top">
              <div className="vital-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <FaChartLine />
              </div>
              <span className="vital-badge normal-badge" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)' }}>
                {spo2 >= 95 ? 'Normal Saturation' : 'Low Saturation'}
              </span>
            </div>
            <div className="vital-value-row">
              <span className="vital-number">{spo2}</span>
              <span className="vital-unit">%</span>
            </div>
            <span className="vital-label">Blood Oxygen (SpO2)</span>
          </div>

          {/* 4. Arterial Compliance / HRV Card */}
          <div
            className="vital-card glass-card"
            onClick={() => navigate('/bp-monitor')}
          >
            <div className="vital-card-top">
              <div className="vital-icon-box" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#a855f7' }}>
                <FaBrain />
              </div>
              <span className="vital-badge normal-badge" style={{ color: '#a855f7', background: 'rgba(124, 58, 237, 0.12)' }}>
                {vascularElasticity || 'Optimal Elasticity'}
              </span>
            </div>
            <div className="vital-value-row">
              <span className="vital-number">{hrv}</span>
              <span className="vital-unit">ms</span>
            </div>
            <span className="vital-label">Heart Rate Variability (HRV)</span>
          </div>
        </div>
      </div>

      {/* 3. Recent Scans Section (From Database Records) */}
      <div className="section-container">
        <div className="section-header-row">
          <h2 className="section-heading">Recent Scans & Database Telemetry</h2>
          <button
            className="view-all-link"
            onClick={() => navigate('/records')}
          >
            View All ({recentScans.length}) →
          </button>
        </div>

        <div className="recent-scans-list">
          {recentScans && recentScans.length > 0 ? (
            recentScans.map((scan) => {
              const isBp = scan.type === 'bp';
              const isRx = scan.type === 'prescription';
              const isReport = scan.type === 'report';

              const icon = isBp ? <FaHeartbeat /> : isRx ? <FaPrescription /> : isReport ? <FaFlask /> : <FaFileMedical />;
              const iconClass = isBp ? 'heart-icon-bg' : isRx ? 'prescription-icon-bg' : isReport ? 'lab-icon-bg' : 'prescription-icon-bg';
              const dest = isBp ? '/bp-monitor' : isRx ? '/prescription' : isReport ? '/report' : '/records';
              
              const formattedDate = scan.createdAt ? new Date(scan.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Recently';

              return (
                <div
                  key={scan._id || scan.id}
                  className="scan-item-card glass-card"
                  onClick={() => navigate(dest)}
                >
                  <div className={`scan-item-icon-wrapper ${iconClass}`}>
                    {icon}
                  </div>
                  <div className="scan-item-info">
                    <h4 className="scan-title">{scan.title}</h4>
                    <span className="scan-subtitle">
                      Processed: {formattedDate} {scan.data?.bpString ? `• ${scan.data.bpString} mmHg` : ''}
                    </span>
                  </div>
                  <div className="scan-item-action">
                    <span className="analyzed-tag">
                      <FaCheckCircle className="tag-check" /> Verified
                    </span>
                    <span className="details-link">
                      View Details <FaArrowRight className="arrow-icon" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="scan-item-card glass-card" onClick={() => navigate('/bp-monitor')}>
              <div className="scan-item-icon-wrapper heart-icon-bg">
                <FaHeartbeat />
              </div>
              <div className="scan-item-info">
                <h4 className="scan-title">No Scan Records Yet</h4>
                <span className="scan-subtitle">Tap to take your first optical BP & vital scan</span>
              </div>
              <div className="scan-item-action">
                <span className="details-link">
                  Start Scan <FaArrowRight className="arrow-icon" />
                </span>
              </div>
            </div>
          )}
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