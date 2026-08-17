import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPrescription, 
  FaCamera, 
  FaImage, 
  FaBell, 
  FaClock, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaPills,
  FaTimes,
  FaShieldAlt,
  FaArrowRight,
  FaHourglassHalf,
  FaMicrochip,
  FaLightbulb,
  FaCalendarAlt,
  FaUserMd,
  FaVolumeUp,
  FaPause,
  FaPlay,
  FaStop
} from 'react-icons/fa';
import { ocrService } from '../../services/ocr/ocrService';
import { aiService } from '../../services/health-ai/aiService';
import { saveHealthRecord } from '../../services/recordsService';
import toast from 'react-hot-toast';
import './PrescriptionAnalyzer.css';

const RX_TRIVIA = [
  "💡 Did you know? Always complete the entire prescribed antibiotic course to prevent bacterial resistance.",
  "💡 Taking medications 'after food' protects your stomach lining and helps optimal drug absorption.",
  "💡 Avoid consuming grapefruit juice with statins or blood pressure medications due to liver enzyme inhibition.",
  "💡 Storing medications in a cool, dry place away from bathroom humidity preserves their chemical potency.",
  "💡 Space out antacids or calcium supplements by 2 hours from thyroid and iron tablets for proper absorption.",
  "💡 Our Neural Vision Engine reads both handwritten doctor scripts and clinic printouts with multi-pass verification."
];

const PrescriptionAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [drugInteractions, setDrugInteractions] = useState([]);

  // Engaging Scan Timer & Trivia States
  const [scanSeconds, setScanSeconds] = useState(0.0);
  const [triviaIndex, setTriviaIndex] = useState(0);

  // Multilingual Speech Synthesis & Translation State
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [translatedAnalysis, setTranslatedAnalysis] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const triviaIntervalRef = useRef(null);

  // Medications extracted from user's scanned document
  const [medications, setMedications] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);

  // Language Change & Translation Handler
  const handleLanguageChange = async (lang) => {
    setSelectedLanguage(lang);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    if (lang === 'English') {
      setTranslatedAnalysis(aiAnalysis);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await aiService.translateClinicalInterpretation(aiAnalysis, lang, 'prescription');
      setTranslatedAnalysis(translated);
    } catch (e) {
      console.warn('Translation error:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Helper to remove all emojis, pictographs, and markdown symbols before TTS
  const sanitizeForSpeech = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols (💊, 🩺, etc.)
      .replace(/[\u{1FA00}-\u{1FAFF}]/gu, '') // Extended-A
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{200D}]/gu, '')            // Zero-width joiner
      .replace(/[#*_`~>[\]()\-+|]/g, ' ')     // Markdown formatting
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text-To-Speech Play / Pause / Resume
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Voice synthesizer not supported on this browser');
      return;
    }

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare voice readout text without any emojis
    const cleanGuidance = sanitizeForSpeech(translatedAnalysis || aiAnalysis || '');
    
    let voiceText = cleanGuidance;
    if (medications.length > 0) {
      const medSummary = medications.map(m => {
        const cleanName = sanitizeForSpeech(m.name);
        const cleanDose = sanitizeForSpeech(m.dose);
        const cleanTiming = sanitizeForSpeech(m.timing);
        const cleanFreq = sanitizeForSpeech(m.frequency);
        return `${cleanName}, dose ${cleanDose}, ${cleanTiming}, ${cleanFreq}`;
      }).join('. ');
      voiceText = `Prescribed medicines: ${medSummary}. Instructions: ${cleanGuidance}`;
    }

    if (!voiceText) return;

    // Small welcome greeting in selected language
    const welcomeGreetings = {
      English: 'Hello, welcome to TitanVitals. Here is your prescription and medication dosage guide.',
      Hindi: 'नमस्ते, टाइटनवाइटल्स में आपका स्वागत है। यह आपकी दवाओं और खुराक का विवरण है।',
      Tamil: 'வணக்கம், டைட்டன்வைட்டல்ஸுக்கு உங்களை வரவேற்கிறோம். இதோ உங்கள் மருந்து மற்றும் உட்கொள்ளும் அளவு விவரங்கள்.'
    };
    const welcomeIntro = welcomeGreetings[selectedLanguage] || welcomeGreetings.English;
    const finalVoiceSpeech = `${welcomeIntro} ${voiceText}`;

    const utterance = new SpeechSynthesisUtterance(finalVoiceSpeech);

    if (selectedLanguage === 'Hindi') {
      utterance.lang = 'hi-IN';
    } else if (selectedLanguage === 'Tamil') {
      utterance.lang = 'ta-IN';
    } else {
      utterance.lang = 'en-US';
    }

    const voices = window.speechSynthesis.getVoices();
    const langCode = selectedLanguage === 'Hindi' ? 'hi' : selectedLanguage === 'Tamil' ? 'ta' : 'en';
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Timer & Trivia Effect during Active Analysis
  useEffect(() => {
    if (analyzing) {
      setScanSeconds(0.0);
      setTriviaIndex(Math.floor(Math.random() * RX_TRIVIA.length));

      timerIntervalRef.current = setInterval(() => {
        setScanSeconds(prev => +(prev + 0.1).toFixed(1));
      }, 100);

      triviaIntervalRef.current = setInterval(() => {
        setTriviaIndex(prev => (prev + 1) % RX_TRIVIA.length);
      }, 3000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (triviaIntervalRef.current) clearInterval(triviaIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (triviaIntervalRef.current) clearInterval(triviaIntervalRef.current);
    };
  }, [analyzing]);

  // Start Ultra-HD Live Prescription Camera Scanner
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 3840, min: 1920 }, 
          height: { ideal: 2160, min: 1080 } 
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success('Ultra-HD Prescription Scanner Active! Hold still over prescription.');
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) videoRef.current.srcObject = fallbackStream;
      } catch (e) {
        setIsCameraActive(false);
        toast.error('Camera permission required for live scanner');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Lossless High-Resolution Frame from Camera
  const snapPrescription = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 1920;
    canvas.height = v.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png'); // Lossless PNG for crystal-clear handwriting OCR
    setSelectedImage(dataUrl);
    stopCamera();
    processPrescriptionOCR(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      processPrescriptionOCR(file);
    };
    reader.readAsDataURL(file);
  };

  // Run 5-to-10 Multi-Pass Neural OCR & Prescription AI Breakdown
  const processPrescriptionOCR = async (fileOrData) => {
    setAnalyzing(true);
    setOcrProgress(15);
    setOcrStatus('Multi-Pass Neural Vision scanning prescription handwriting...');
    setMedications([]);
    setAiAnalysis(null);
    setDoctorInfo(null);
    setDrugInteractions([]);
    toast.loading('Analyzing prescription with Multi-Pass Vision AI...', { id: 'rx-ocr' });

    try {
      // 1. Primary: Multimodal Deep Medical Vision directly on the prescription image
      const visionResult = await aiService.analyzePrescriptionVision(fileOrData);

      if (visionResult && visionResult.medications && visionResult.medications.length > 0) {
        setOcrProgress(100);
        setOcrStatus('Multi-Pass Consensus Verified (100%)');
        setMedications(visionResult.medications);
        setDoctorInfo(visionResult.doctorInfo || null);
        setDrugInteractions(visionResult.drugInteractions || []);
        setAiAnalysis(visionResult.dosageExplainer || null);
        setHasScanned(true);
        toast.success(`Extracted ${visionResult.medications.length} prescribed medications with dosage schedule!`, { id: 'rx-ocr' });

        // Automatically persist to database (records --> prescription)
        saveHealthRecord({
          type: 'prescription',
          title: visionResult.doctorInfo?.clinicName || (visionResult.doctorInfo?.name ? `${visionResult.doctorInfo.name}'s Prescription` : 'Doctor Prescription'),
          data: {
            medications: visionResult.medications,
            doctorInfo: visionResult.doctorInfo || null,
            drugInteractions: visionResult.drugInteractions || [],
            summary: visionResult.dosageExplainer || ''
          },
          summary: visionResult.dosageExplainer || ''
        }).catch(e => console.warn('Rx auto-save:', e));

        return;
      }

      // 2. Secondary Fallback: Multi-Pass Adaptive OCR
      setOcrStatus('Processing document image contrast...');
      const text = await ocrService.extractText(fileOrData, (prog, status) => {
        setOcrProgress(prog);
        setOcrStatus(status);
      });

      setOcrProgress(100);
      const parsedMeds = ocrService.parsePrescription(text);
      setMedications(parsedMeds);
      setHasScanned(true);

      const analysis = await aiService.analyzePrescription(text);
      setAiAnalysis(analysis);

      // Automatically persist to database (records --> prescription)
      saveHealthRecord({
        type: 'prescription',
        title: 'Doctor Prescription',
        data: {
          medications: parsedMeds,
          rawText: text,
          summary: analysis
        },
        summary: analysis
      }).catch(e => console.warn('Rx auto-save:', e));

      toast.success('Prescription parsed & digitized successfully!', { id: 'rx-ocr' });
    } catch (err) {
      console.warn('Prescription OCR error:', err);
      toast.error('Could not parse prescription text.', { id: 'rx-ocr' });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAlarm = (id) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.alarmSet;
        if (next) {
          toast.success(`Dosing reminder enabled for ${m.name}`);
        } else {
          toast(`Dosing reminder paused for ${m.name}`);
        }
        return { ...m, alarmSet: next };
      }
      return m;
    }));
  };

  return (
    <div className="prescription-view">
      {/* Header */}
      <div className="rx-header-block">
        <div className="rx-title-badge">
          <FaPrescription />
          <span>Multi-Pass Rx Digitization & Safety</span>
        </div>
        <h1 className="rx-title">Prescription OCR & Dosage Explainer</h1>
        <p className="rx-subtitle">
          High-definition multi-pass scan to digitize doctor prescriptions, extract dosage schedules, and avoid drug interactions.
        </p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*,.pdf"
        onChange={handleFileUpload}
      />

      {/* Scanner Card */}
      <div className="rx-scanner-card glass-card">
        {isCameraActive ? (
          <div className="camera-rx-feed-wrap">
            <video ref={videoRef} autoPlay playsInline className="rx-video-preview" />
            <div className="camera-overlay-reticle">
              <div className="reticle-corner corner-tl"></div>
              <div className="reticle-corner corner-tr"></div>
              <div className="reticle-corner corner-bl"></div>
              <div className="reticle-corner corner-br"></div>
            </div>
            <div className="camera-controls-bar">
              <button className="snap-photo-btn" onClick={snapPrescription}>
                <FaCamera /> Snap Ultra-HD & Analyze
              </button>
              <button className="cancel-cam-btn" onClick={stopCamera}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="rx-upload-area">
            {selectedImage ? (
              <div className="rx-preview-container">
                <img src={selectedImage} alt="Prescription" className="rx-preview-img" />
                {analyzing && <div className="scanner-laser-beam"></div>}
              </div>
            ) : (
              <div className="rx-placeholder-content">
                <div className="rx-icon-box">
                  <FaPrescription />
                </div>
                <h3>Scan or Upload Doctor's Prescription</h3>
                <p>Multi-pass neural filtering reads handwritten scripts, medicine names, and dosages with precision.</p>
              </div>
            )}

            <div className="rx-btn-row">
              <button className="capture-btn" onClick={startCamera} disabled={analyzing}>
                <FaCamera /> Live HD Camera
              </button>
              <button className="gallery-btn" onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
                <FaImage /> Upload Photo
              </button>
            </div>
          </div>
        )}

        {/* Engaging Interactive Multi-Pass OCR Progress & Live Timer Box */}
        {analyzing && (
          <div className="ocr-progress-box interactive-timer-box">
            <div className="timer-status-header">
              <div className="timer-badge">
                <FaHourglassHalf className="timer-spin-icon" />
                <span>Elapsed: <strong>{scanSeconds.toFixed(1)}s</strong></span>
                <span className="est-badge">
                  {scanSeconds < 5.0 ? `~${Math.max(1, Math.round(6 - scanSeconds))}s left` : 'Finalizing...'}
                </span>
              </div>
              <span className="ocr-status-pct">{ocrProgress}%</span>
            </div>

            <div className="ocr-progress-bar">
              <div className="ocr-progress-bar-fill animated-glow" style={{ width: `${ocrProgress}%` }}></div>
            </div>

            <div className="ocr-stage-row">
              <span className="ocr-stage-text">
                <FaMicrochip className="microchip-pulse" /> {ocrStatus}
              </span>
            </div>

            {/* Rotating Mindful Rx Trivia */}
            <div className="trivia-card-bubble">
              <p className="trivia-text-fade">{RX_TRIVIA[triviaIndex]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Drug Interactions Safety Alert Banner */}
      {drugInteractions.length > 0 && (
        <div className="drug-interaction-banner glass-card">
          <div className="banner-title-row">
            <FaExclamationTriangle className="alert-triangle-icon" />
            <h4>Pharmacology Interaction & Safety Review</h4>
          </div>
          <ul className="interaction-list">
            {drugInteractions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Active Medications List */}
      <div className="medications-section">
        <div className="meds-header-row">
          <h3 className="meds-title">
            Actual Prescribed Regimen {medications.length > 0 ? `(${medications.length} Medications)` : ''}
          </h3>
          {medications.length > 0 && (
            <span className="live-rx-tag">⚡ Multi-Pass Verified</span>
          )}
        </div>

        {medications.length === 0 && !analyzing && (
          <div className="empty-rx-state glass-card">
            <FaPills className="empty-pills-icon" />
            <h4>No Prescription Scanned Yet</h4>
            <p>Photograph or upload your physical prescription above to see your exact digitized medications, dosage explainer, and schedule alarms.</p>
          </div>
        )}

        <div className="meds-list">
          {medications.map((med) => (
            <div key={med.id || med.name} className="med-card glass-card">
              <div className="med-card-top">
                <div className="med-title-group">
                  <div className="med-icon-pill">
                    <FaPills />
                  </div>
                  <div>
                    <h4 className="med-name">{med.name}</h4>
                    <span className="med-dose">{med.dose} • {med.duration || 'As directed'}</span>
                  </div>
                </div>

                <button 
                  className={`alarm-toggle-btn ${med.alarmSet ? 'alarm-on' : ''}`}
                  onClick={() => toggleAlarm(med.id)}
                  title={med.alarmSet ? 'Disable Reminder' : 'Enable Reminder'}
                >
                  <FaBell /> {med.alarmSet ? 'Reminder ON' : 'Set Alarm'}
                </button>
              </div>

              <div className="med-card-body">
                <div className="med-detail-grid">
                  <div className="med-detail-item">
                    <span className="detail-lbl">Frequency:</span>
                    <span className="detail-val">{med.frequency}</span>
                  </div>
                  <div className="med-detail-item">
                    <span className="detail-lbl">Meal Timing:</span>
                    <span className="detail-val">{med.timing}</span>
                  </div>
                  {med.purpose && (
                    <div className="med-detail-item">
                      <span className="detail-lbl">Indication / Purpose:</span>
                      <span className="detail-val highlight-green">{med.purpose}</span>
                    </div>
                  )}
                  {med.alarmTime && (
                    <div className="med-detail-item">
                      <span className="detail-lbl">Alert Times:</span>
                      <span className="detail-val highlight-cyan">{med.alarmTime}</span>
                    </div>
                  )}
                </div>

                {med.precautions && (
                  <div className="med-precaution-box">
                    <FaExclamationTriangle className="warn-icon" />
                    <span>{med.precautions}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Clinical Breakdown & Multilingual Dosage Explainer */}
      {aiAnalysis && (
        <div className="rx-ai-analysis-card glass-card">
          <div className="rx-ai-header-row">
            <div className="rx-ai-header-left">
              <FaShieldAlt className="shield-icon" />
              <h3>Plain-Language Dosage Explainer</h3>
            </div>

            {/* 3 Language Selector Pills */}
            <div className="language-selector-pills">
              <button 
                className={`lang-pill ${selectedLanguage === 'English' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('English')}
                disabled={isTranslating}
              >
                🇬🇧 English
              </button>
              <button 
                className={`lang-pill ${selectedLanguage === 'Hindi' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('Hindi')}
                disabled={isTranslating}
              >
                🇮🇳 हिन्दी (Hindi)
              </button>
              <button 
                className={`lang-pill ${selectedLanguage === 'Tamil' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('Tamil')}
                disabled={isTranslating}
              >
                🇮🇳 தமிழ் (Tamil)
              </button>
            </div>
          </div>

          {/* Voice Player & Readout Bar */}
          <div className="voice-readout-bar">
            <div className="voice-controls-group">
              <button 
                className={`voice-play-btn ${isSpeaking ? 'is-speaking' : ''}`}
                onClick={handleSpeak}
                title={isSpeaking ? (isPaused ? 'Resume Readout' : 'Pause Readout') : `Read Aloud in ${selectedLanguage}`}
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <FaPause className="btn-icon" /> Pause Voice
                  </>
                ) : isPaused ? (
                  <>
                    <FaPlay className="btn-icon" /> Resume Voice
                  </>
                ) : (
                  <>
                    <FaVolumeUp className="btn-icon" /> Read Aloud in {selectedLanguage}
                  </>
                )}
              </button>

              {isSpeaking && (
                <button className="voice-stop-btn" onClick={handleStopSpeaking} title="Stop Voice">
                  <FaStop className="btn-icon" /> Stop
                </button>
              )}
            </div>

            {/* Speaking Waveform Animation */}
            {isSpeaking && !isPaused && (
              <div className="speaking-wave-box">
                <span className="wave-bar bar-1"></span>
                <span className="wave-bar bar-2"></span>
                <span className="wave-bar bar-3"></span>
                <span className="wave-bar bar-4"></span>
                <span className="wave-bar bar-5"></span>
                <span className="speaking-label">Reading in {selectedLanguage}...</span>
              </div>
            )}
          </div>

          <div className="rx-ai-body">
            {isTranslating ? (
              <div className="translating-indicator">
                <FaHourglassHalf className="timer-spin-icon" />
                <span>Translating dosage guidance into {selectedLanguage}...</span>
              </div>
            ) : (
              <div className="dosage-explainer-text">{translatedAnalysis || aiAnalysis}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionAnalyzer;
