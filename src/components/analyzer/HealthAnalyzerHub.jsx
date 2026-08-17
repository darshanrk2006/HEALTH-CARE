import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaFileMedical,
  FaPrescription,
  FaFlask,
  FaPills,
  FaCamera,
  FaArrowRight,
  FaShieldAlt,
  FaMicrochip,
  FaVolumeUp,
  FaCheckCircle,
  FaExchangeAlt
} from 'react-icons/fa';
import ReportAnalyzer from '../report/ReportAnalyzer';
import PrescriptionAnalyzer from '../prescription/PrescriptionAnalyzer';
import './HealthAnalyzerHub.css';

const HealthAnalyzerHub = ({ defaultMode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active mode from props, URL query params, or pathname
  const getInitialMode = () => {
    if (defaultMode) return defaultMode;
    if (location.pathname === '/report') return 'report';
    if (location.pathname === '/prescription') return 'prescription';
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam === 'report' || typeParam === 'prescription') return typeParam;
    return null; // Show choice screen by default on /analyzer
  };

  const [activeMode, setActiveMode] = useState(getInitialMode);

  useEffect(() => {
    const mode = getInitialMode();
    setActiveMode(mode);
  }, [location.pathname, location.search, defaultMode]);

  const selectMode = (mode) => {
    setActiveMode(mode);
    if (mode === 'report') {
      navigate('/analyzer?type=report', { replace: true });
    } else if (mode === 'prescription') {
      navigate('/analyzer?type=prescription', { replace: true });
    } else {
      navigate('/analyzer', { replace: true });
    }
  };

  return (
    <div className="analyzer-hub-container">
      {/* Top Mode Selector Tabs */}
      <div className="hub-top-navigation glass-card">
        <div className="hub-brand-badge">
          <FaFileMedical className="hub-icon-cyan" />
          <span>AI Health Document Intelligence Hub</span>
        </div>

        <div className="hub-mode-tabs">
          <button
            className={`hub-tab-btn ${activeMode === 'report' ? 'active-tab' : ''}`}
            onClick={() => selectMode('report')}
          >
            <FaFlask className="tab-icon" />
            <span>Lab Report Analyzer</span>
          </button>

          <button
            className={`hub-tab-btn ${activeMode === 'prescription' ? 'active-tab' : ''}`}
            onClick={() => selectMode('prescription')}
          >
            <FaPrescription className="tab-icon" />
            <span>Prescription OCR</span>
          </button>
        </div>
      </div>

      {/* 1. Selection Screen when no specific document mode is chosen */}
      {!activeMode && (
        <div className="analyzer-choice-view">
          <div className="choice-header-block">
            <h1 className="choice-title">What would you like to analyze today?</h1>
            <p className="choice-subtitle">
              Choose your document type below. Our Neural Vision Engine extracts biomarkers, medicine schedules, and multilingual voice explanations in ~2–4 seconds.
            </p>
          </div>

          <div className="choice-cards-grid">
            {/* Card 1: Lab Report Analyzer */}
            <div className="choice-action-card glass-card card-lab" onClick={() => selectMode('report')}>
              <div className="card-top-icon-row">
                <div className="card-icon-bubble bubble-purple">
                  <FaFlask />
                </div>
                <span className="card-speed-badge">📊 Report Analyzer</span>
              </div>

              <div className="card-content-block">
                <h3 className="card-main-title">Lab Report Analyzer</h3>
                <p className="card-desc">
                  Scan blood tests, pathology reports, lipid profiles, and metabolic panels. Extracts actual values, biological intervals, and clinical status flags.
                </p>

                <ul className="card-features-list">
                  <li><FaCheckCircle className="feat-check" /> Full Pathology Biomarker Table</li>
                  <li><FaCheckCircle className="feat-check" /> 4K Ultra-HD Camera & PDF Scan</li>
                  <li><FaCheckCircle className="feat-check" /> Multilingual Voice Readout (EN, HI, TA)</li>
                </ul>
              </div>

              <button className="launch-choice-btn btn-purple">
                <span>Scan Lab Report</span>
                <FaArrowRight />
              </button>
            </div>

            {/* Card 2: Prescription OCR */}
            <div className="choice-action-card glass-card card-rx" onClick={() => selectMode('prescription')}>
              <div className="card-top-icon-row">
                <div className="card-icon-bubble bubble-cyan">
                  <FaPrescription />
                </div>
                <span className="card-speed-badge">💊 Dosage Explainer</span>
              </div>

              <div className="card-content-block">
                <h3 className="card-main-title">Prescription OCR</h3>
                <p className="card-desc">
                  Digitize handwritten or typed doctor prescriptions. Extracts prescribed medicines, dosages, food timings, and daily alarm schedules.
                </p>

                <ul className="card-features-list">
                  <li><FaCheckCircle className="feat-check" /> Reads Tablets, Syrups, Drops & ORS</li>
                  <li><FaCheckCircle className="feat-check" /> Plain-Language Dosage Explainer</li>
                  <li><FaCheckCircle className="feat-check" /> 1-Tap Daily Dosing Alarm Reminders</li>
                </ul>
              </div>

              <button className="launch-choice-btn btn-cyan">
                <span>Scan Prescription</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Mode Renderer */}
      {activeMode === 'report' && (
        <div className="active-analyzer-wrapper">
          <ReportAnalyzer />
        </div>
      )}

      {activeMode === 'prescription' && (
        <div className="active-analyzer-wrapper">
          <PrescriptionAnalyzer />
        </div>
      )}
    </div>
  );
};

export default HealthAnalyzerHub;
