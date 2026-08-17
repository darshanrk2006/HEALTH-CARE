import React, { useState, useEffect } from 'react';
import { 
  FaVirus, 
  FaMicrophone, 
  FaSearch, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaHospital, 
  FaProcedures, 
  FaStethoscope,
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/health-ai/aiService';
import toast from 'react-hot-toast';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const navigate = useNavigate();
  const [symptomsInput, setSymptomsInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Fever', 'Cough']);
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState('2-3 Days');
  const [patientAge, setPatientAge] = useState(28);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const symptomCategories = [
    { name: 'Respiratory', items: ['Cough', 'Shortness of Breath', 'Sore Throat', 'Nasal Congestion', 'Wheezing'] },
    { name: 'Systemic', items: ['Fever', 'Chills', 'Fatigue', 'Body Aches', 'Night Sweats'] },
    { name: 'Cardiovascular', items: ['Chest Pain', 'Palpitations', 'Dizziness', 'Ankle Swelling'] },
    { name: 'Gastrointestinal', items: ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal Cramps', 'Acid Reflux'] },
    { name: 'Neurological', items: ['Headache', 'Migraine', 'Lightheadedness', 'Brain Fog'] },
    { name: 'Dermatological', items: ['Skin Rash', 'Itching', 'Hives', 'Flushed Skin'] },
  ];

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // Real-time Voice Speech Recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported on this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak your symptoms clearly.', { id: 'voice-rec' });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptomsInput((prev) => (prev ? `${prev}, ${transcript}` : transcript));
      setIsListening(false);
      toast.success(`Heard: "${transcript}"`, { id: 'voice-rec' });
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error('Voice input error: ' + event.error, { id: 'voice-rec' });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleAnalyze = async () => {
    const combined = [
      ...selectedSymptoms,
      symptomsInput
    ].filter((s) => s && s.trim()).join(', ');

    if (!combined.trim()) {
      toast.error('Please select or describe at least one symptom');
      return;
    }

    setLoading(true);
    toast.loading('Analyzing symptoms across medical clinical database...', { id: 'disease-diag' });

    try {
      const prompt = `Patient Profile: Age ${patientAge}, Symptom Duration: ${duration}, Pain/Severity: ${severity}/10. Symptoms: ${combined}.`;
      const result = await aiService.checkSymptoms(prompt);
      setAnalysisResult(result);
      toast.success('Diagnostic clinical assessment ready!', { id: 'disease-diag' });
    } catch (err) {
      toast.error('Diagnostic triage failed. Please check network.', { id: 'disease-diag' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disease-detection-view">
      {/* Header */}
      <div className="disease-header-block">
        <div className="disease-title-badge">
          <FaShieldAlt className="shield-icon-cyan" />
          <span>Real-Time Clinical Diagnostic Triage</span>
        </div>
        <h1 className="disease-title">AI Disease & Symptom Checker</h1>
        <p className="disease-subtitle">
          Multi-symptom differential diagnostic engine powered by next-gen clinical intelligence.
        </p>
      </div>

      {/* Symptom Input & Voice Capture Card */}
      <div className="symptom-input-card glass-card">
        <div className="input-card-top-row">
          <label className="field-label-bold">Describe Your Symptoms or Speak:</label>
          <button 
            type="button" 
            className={`voice-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            title="Speak symptoms using microphone"
          >
            <FaMicrophone /> {isListening ? 'Listening...' : 'Voice Input'}
          </button>
        </div>

        <textarea 
          className="symptom-textarea"
          placeholder="e.g. Sharp pain in chest on deep breath for past 2 days, accompanied by mild fever and dry cough..."
          value={symptomsInput}
          onChange={(e) => setSymptomsInput(e.target.value)}
          rows={3}
        />

        {/* Severity Slider & Duration */}
        <div className="triage-controls-grid">
          <div className="triage-control-item">
            <div className="control-label-row">
              <span>Severity Rating:</span>
              <strong className="severity-badge">{severity} / 10</strong>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="severity-slider"
            />
          </div>

          <div className="triage-control-item">
            <label className="control-label-row">Duration:</label>
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="triage-select"
            >
              <option value="Few Hours">Few Hours (Acute)</option>
              <option value="1-2 Days">1-2 Days</option>
              <option value="2-3 Days">2-3 Days</option>
              <option value="1-2 Weeks">1-2 Weeks (Subacute)</option>
              <option value="Over 1 Month">Over 1 Month (Chronic)</option>
            </select>
          </div>

          <div className="triage-control-item">
            <label className="control-label-row">Patient Age:</label>
            <input 
              type="number" 
              value={patientAge} 
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="triage-number-input"
              min="1"
              max="120"
            />
          </div>
        </div>
      </div>

      {/* Interactive Symptom Category Tags */}
      <div className="symptom-category-card glass-card">
        <h3 className="category-card-title">Quick Symptom Multi-Select</h3>
        <div className="categories-list">
          {symptomCategories.map((cat) => (
            <div key={cat.name} className="category-group">
              <span className="cat-group-name">{cat.name}:</span>
              <div className="symptom-chips-row">
                {cat.items.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button 
          className="run-diagnosis-btn"
          onClick={handleAnalyze}
          disabled={loading}
        >
          <FaStethoscope />
          <span>{loading ? 'Analyzing Clinical Telemetry...' : 'Run Real-Time AI Diagnosis'}</span>
        </button>
      </div>

      {/* Diagnostic Analysis Result Card */}
      {analysisResult && (
        <div className="diagnostic-result-card glass-card">
          <div className="result-header">
            <div className="result-title-row">
              <FaCheckCircle className="check-icon-cyan" />
              <h3>Clinical AI Triage Report</h3>
            </div>
            <button 
              className="emergency-hospital-action-btn"
              onClick={() => navigate('/hospital-coordination')}
            >
              <FaHospital /> Find Beds & Doctors
            </button>
          </div>

          <div className="result-markdown-body">
            <pre className="markdown-pre">{analysisResult}</pre>
          </div>

          <div className="result-footer-actions">
            <button 
              className="result-nav-btn"
              onClick={() => navigate('/bp-monitor')}
            >
              Check Blood Pressure Now →
            </button>
            <button 
              className="result-nav-btn"
              onClick={() => navigate('/report')}
            >
              Scan Lab Report →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
