import React, { useState, useRef } from 'react';
import {
  FaFileAlt,
  FaCamera,
  FaImage,
  FaCheckCircle,
  FaChartLine,
  FaLeaf,
  FaSyncAlt,
  FaTimes,
  FaUpload,
  FaFlask,
  FaExclamationTriangle,
  FaListAlt,
  FaCode,
  FaEdit,
  FaSave,
  FaSearch,
  FaVolumeUp,
  FaPause,
  FaPlay,
  FaStop,
  FaHourglassHalf
} from 'react-icons/fa';
import { ocrService } from '../../services/ocr/ocrService';
import { aiService } from '../../services/health-ai/aiService';
import { saveHealthRecord } from '../../services/recordsService';
import toast from 'react-hot-toast';
import './ReportAnalyzer.css';

const ReportAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('table'); // 'table', 'cards'
  const [searchFilter, setSearchFilter] = useState('');

  // Multilingual Speech Synthesis & Translation State
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [translatedReport, setTranslatedReport] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Metrics parsed directly from user's scanned document
  const [metrics, setMetrics] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);

  // Language Change & Translation Handler
  const handleLanguageChange = async (lang) => {
    setSelectedLanguage(lang);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    if (lang === 'English') {
      setTranslatedReport(aiReport);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await aiService.translateClinicalInterpretation(aiReport, lang, 'lab');
      setTranslatedReport(translated);
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
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FAFF}]/gu, '') // Extended-A
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{200D}]/gu, '')            // Zero-width joiner
      .replace(/[#*_`~>[\]()\-+|]/g, ' ')     // Markdown chars
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text-To-Speech Play / Pause / Resume
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
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

    const rawContent = sanitizeForSpeech(translatedReport || aiReport || '');
    if (!rawContent) return;

    // Small welcome greeting in selected language
    const welcomeGreetings = {
      English: 'Hello, welcome to TitanVitals. Here is the clinical summary of your lab test report.',
      Hindi: 'नमस्ते, टाइटनवाइटल्स में आपका स्वागत है। यह आपकी लैब टेस्ट रिपोर्ट का सारांश है।',
      Tamil: 'வணக்கம், டைட்டன்வைட்டல்ஸுக்கு உங்களை வரவேற்கிறோம். இதோ உங்கள் மருத்துவ பரிசோதனை அறிக்கையின் சுருக்கம்.'
    };
    const welcomeIntro = welcomeGreetings[selectedLanguage] || welcomeGreetings.English;
    const finalSpeechText = `${welcomeIntro} ${rawContent}`;

    const utterance = new SpeechSynthesisUtterance(finalSpeechText);

    // Set voice language code
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

  // Start Ultra-HD Live Document Camera Scanner
  const startCameraScanner = async () => {
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
      toast.success('Ultra-HD Scanner Active! Hold still over document.');
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

  const stopCameraScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Lossless High-Resolution Frame from Camera
  const captureDocumentPhoto = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 1920;
    canvas.height = v.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png'); // Lossless PNG for crystal-clear OCR
    setSelectedImage(dataUrl);
    stopCameraScanner();
    runOCRAnalysis(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      runOCRAnalysis(file);
    };
    reader.readAsDataURL(file);
  };

  // Run 5-to-10 Multi-Pass Neural OCR & Vision Consensus Engine
  const runOCRAnalysis = async (fileOrUrl) => {
    setAnalyzing(true);
    setOcrProgress(15);
    setOcrStatus('Multi-Pass Neural Vision scanning document...');
    setMetrics([]);
    setAiReport(null);
    setPatientInfo(null);
    toast.loading('Analyzing document with Multi-Pass Consensus...', { id: 'ocr-task' });

    try {
      // 1. Primary: Multimodal Deep Medical Vision directly on the document image
      const visionResult = await aiService.analyzeMedicalImageVision(fileOrUrl);

      if (visionResult && visionResult.biomarkers && visionResult.biomarkers.length > 0) {
        setOcrProgress(100);
        setOcrStatus('Multi-Pass Consensus Verified (100%)');
        setMetrics(visionResult.biomarkers);
        setPatientInfo(visionResult.patientInfo || null);
        setHasScanned(true);

        let fullReport = `### 🧪 ${visionResult.patientInfo?.labName || 'Laboratory Analysis'}\n`;
        if (visionResult.patientInfo?.name) {
          fullReport += `**Patient:** ${visionResult.patientInfo.name} | **Date:** ${visionResult.patientInfo.testDate || 'Current'}\n\n`;
        }
        fullReport += `${visionResult.clinicalSummary}\n\n`;
        if (visionResult.actionableRecommendations?.length > 0) {
          fullReport += `#### 📋 Actionable Clinical Recommendations:\n` + visionResult.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
        }
        setAiReport(fullReport);
        toast.success(`Extracted ${visionResult.biomarkers.length} verified values from scanned report!`, { id: 'ocr-task' });

        // Automatically persist to database (records --> report)
        saveHealthRecord({
          type: 'report',
          title: visionResult.patientInfo?.labName || 'Laboratory Pathology Report',
          data: {
            metrics: visionResult.biomarkers,
            patientInfo: visionResult.patientInfo || null,
            summary: fullReport
          },
          summary: fullReport
        }).catch(e => console.warn('Lab report auto-save:', e));

        return;
      }

      // 2. Secondary: 5-Pass Adaptive Filter Consensus OCR Engine
      const text = await ocrService.extractText(fileOrUrl, (prog, status) => {
        setOcrProgress(prog);
        setOcrStatus(status);
      });

      setOcrProgress(100);
      const parsedMetrics = ocrService.parseLabMetrics(text);
      setMetrics(parsedMetrics);
      setHasScanned(true);

      const aiSummary = await aiService.analyzeMedicalReport(text);
      setAiReport(aiSummary);

      // Automatically persist to database (records --> report)
      saveHealthRecord({
        type: 'report',
        title: 'Laboratory Pathology Report',
        data: {
          metrics: parsedMetrics,
          rawText: text,
          summary: aiSummary
        },
        summary: aiSummary
      }).catch(e => console.warn('Lab report auto-save:', e));

      toast.success(`Extracted ${parsedMetrics.length} biomarkers with 5-pass consensus!`, { id: 'ocr-task' });
    } catch (err) {
      console.warn('OCR error:', err);
      toast.error('Failed to parse document text.', { id: 'ocr-task' });
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredMetrics = metrics.filter(m =>
    m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.value.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="analyzer-view">
      {/* Title & Subtitle */}
      <div className="analyzer-header-block">
        <div className="analyzer-title-badge">
          <FaFlask />
          <span>Multi-Pass Medical OCR & Lab Intelligence</span>
        </div>
        <h1 className="analyzer-title">AI Lab Report Analyzer</h1>
        <p className="analyzer-subtitle">
          High-definition multi-pass scan to capture the exact actual values printed on your physical lab report.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,.pdf"
        onChange={handleFileUpload}
      />

      {/* 1. Document Scanner Viewfinder Card */}
      <div className="scanner-viewfinder-card glass-card">
        {isCameraActive ? (
          <div className="camera-live-feed-wrap">
            <video ref={videoRef} autoPlay playsInline className="document-video-preview" />
            <div className="camera-overlay-reticle">
              <div className="reticle-corner corner-tl"></div>
              <div className="reticle-corner corner-tr"></div>
              <div className="reticle-corner corner-bl"></div>
              <div className="reticle-corner corner-br"></div>
            </div>
            <div className="camera-controls-bar">
              <button className="snap-photo-btn" onClick={captureDocumentPhoto}>
                <FaCamera /> Snap Ultra-HD & Analyze
              </button>
              <button className="cancel-cam-btn" onClick={stopCameraScanner}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="viewfinder-frame">
            <div className="reticle-corner corner-tl"></div>
            <div className="reticle-corner corner-tr"></div>
            <div className="reticle-corner corner-bl"></div>
            <div className="reticle-corner corner-br"></div>

            {selectedImage ? (
              <div className="uploaded-preview-container">
                <img src={selectedImage} alt="Document Preview" className="document-preview-img" />
              </div>
            ) : (
              <>
                <div className="document-scan-icon-wrap">
                  <FaFileAlt />
                </div>
                <h3 className="scanner-main-prompt">Scan or Upload Physical Lab Report</h3>
                <p className="scanner-helper-text">
                  Multi-pass neural filtering reads tables, numbers, and reference ranges with high precision.
                </p>
              </>
            )}

            <div className="scanner-btn-row">
              <button className="capture-btn" onClick={startCameraScanner}>
                <FaCamera /> Live HD Camera
              </button>
              <button className="gallery-btn" onClick={() => fileInputRef.current?.click()}>
                <FaImage /> Upload File
              </button>
            </div>
          </div>
        )}

        {/* Multi-Pass OCR Progress Bar */}
        {analyzing && (
          <div className="ocr-progress-box">
            <div className="ocr-status-row">
              <span className="ocr-status-title">{ocrStatus}</span>
              <span className="ocr-status-pct">{ocrProgress}%</span>
            </div>
            <div className="ocr-progress-bar">
              <div className="ocr-progress-bar-fill" style={{ width: `${ocrProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Detected Actual Values Section */}
      <div className="metrics-section">
        <div className="metrics-header-row">
          <div className="metrics-title-group">
            <h3 className="metrics-section-title">
              Actual Scanned Report Values {metrics.length > 0 ? `(${metrics.length} Tests)` : ''}
            </h3>
            {patientInfo && (
              <span className="patient-meta-tag">
                {patientInfo.name ? `Patient: ${patientInfo.name}` : ''} {patientInfo.testDate ? `• Date: ${patientInfo.testDate}` : ''}
              </span>
            )}
          </div>

          <div className="view-toggle-pills">
            <button
              className={`view-pill ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
              title="Full Data Table View"
            >
              <FaListAlt /> Table View
            </button>
            <button
              className={`view-pill ${activeTab === 'cards' ? 'active' : ''}`}
              onClick={() => setActiveTab('cards')}
              title="Card Grid View"
            >
              <FaFlask /> Cards
            </button>
          </div>
        </div>

        {metrics.length === 0 && !analyzing && (
          <div className="empty-scan-state glass-card">
            <FaFlask className="empty-flask-icon" />
            <h4>No Document Scanned Yet</h4>
            <p>Upload or photograph your lab report above to see your exact test values displayed here.</p>
          </div>
        )}

        {/* Search Bar */}
        {metrics.length > 0 && (
          <div className="table-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search extracted tests (e.g. Hemoglobin, Glucose, Creatinine, SGPT)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="table-search-input"
            />
            {searchFilter && (
              <button className="clear-search-btn" onClick={() => setSearchFilter('')}>
                <FaTimes />
              </button>
            )}
          </div>
        )}

        {/* A. FULL CLINICAL DATA TABLE VIEW */}
        {metrics.length > 0 && activeTab === 'table' && (
          <div className="report-table-card glass-card">
            <div className="table-responsive-wrapper">
              <table className="clinical-data-table">
                <thead>
                  <tr>
                    <th>Test / Parameter Name</th>
                    <th>Actual Scanned Result</th>
                    <th>Biological Reference Interval</th>
                    <th>Clinical Status Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map((metric) => (
                    <tr key={metric.id} className={metric.isWarning ? 'row-warning' : 'row-normal'}>
                      <td className="cell-test-name">
                        <span className={`table-dot ${metric.dotClass || 'dot-green'}`}></span>
                        <strong>{metric.name}</strong>
                      </td>
                      <td className="cell-actual-value">
                        <span className={`actual-value-badge ${metric.isWarning ? 'val-warning' : 'val-optimal'}`}>
                          {metric.value}
                        </span>
                      </td>
                      <td className="cell-ref-range">
                        {metric.refRange || 'Standard Lab Interval'}
                      </td>
                      <td className="cell-status">
                        <span className={`metric-status-pill ${metric.status}`}>
                          {metric.statusLabel || (metric.status === 'warning' ? 'Abnormal' : 'Optimal')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* B. CARD GRID VIEW */}
        {metrics.length > 0 && activeTab === 'cards' && (
          <div className="metrics-grid-cards">
            {filteredMetrics.map((metric) => (
              <div key={metric.id} className="metric-row-card glass-card">
                <div className="metric-left-col">
                  <span className={`metric-dot ${metric.dotClass || 'dot-green'}`}></span>
                  <div>
                    <span className="metric-name">{metric.name}</span>
                    {metric.refRange && (
                      <span className="metric-ref-range">Ref: {metric.refRange}</span>
                    )}
                  </div>
                </div>
                <div className="metric-right-col">
                  <span className={`metric-value ${metric.isWarning ? 'coral' : ''}`}>
                    {metric.value}
                  </span>
                  <span className={`metric-status-pill ${metric.status}`}>
                    {metric.statusLabel || (metric.status === 'warning' ? 'Abnormal' : 'Optimal')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Multilingual AI Clinical Interpretation & Voice Readout */}
      {aiReport && (
        <div className="summary-card glass-card">
          <div className="summary-title-row">
            <div className="summary-title-left">
              <FaLeaf className="summary-icon-green" />
              <h3 className="summary-heading">AI Interpretation of Scanned Report</h3>
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

          <div className="summary-markdown-content">
            <div className="detailed-ai-report-box">
              {isTranslating ? (
                <div className="translating-indicator">
                  <FaHourglassHalf className="timer-spin-icon" />
                  <span>Translating clinical interpretation into {selectedLanguage}...</span>
                </div>
              ) : (
                <div className="report-markdown-text">{translatedReport || aiReport}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportAnalyzer;
