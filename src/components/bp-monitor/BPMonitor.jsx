import React, { useState, useEffect, useRef } from 'react';
import { 
  FaHeartbeat, 
  FaCamera, 
  FaTint, 
  FaRobot, 
  FaPaperPlane, 
  FaLightbulb,
  FaBolt,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaVideoSlash,
  FaWaveSquare,
  FaShieldAlt,
  FaChartLine,
  FaInfoCircle,
  FaVolumeUp,
  FaVolumeMute,
  FaGlobe,
  FaDownload,
  FaFlask,
  FaMicrochip,
  FaPlay,
  FaPause
} from 'react-icons/fa';
import { aiService } from '../../services/health-ai/aiService';
import { ppgEngine } from '../../services/health-ai/ppgBiomarkerEngine';
import { saveHealthRecord } from '../../services/recordsService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './BPMonitor.css';

const AURA_LANGUAGES = [
  { id: 'English', label: 'English', flag: '🇬🇧', code: 'en-US', speechCode: 'en' },
  { id: 'Hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳', code: 'hi-IN', speechCode: 'hi' },
  { id: 'Tamil', label: 'தமிழ் (Tamil)', flag: '🇮🇳', code: 'ta-IN', speechCode: 'ta' }
];

const getLocalizedInsight = (lang, bioData) => {
  const { bp, hr, spo2Val, mapVal, elasticity, categoryLabel, guidance } = bioData;
  if (lang === 'Hindi') {
    return `ऑप्टिकल पीपीजी विश्लेषण पूर्ण (क्लिनिकल टेलीमेट्री): आपका रक्तचाप ${bp} mmHg (${categoryLabel || 'सामान्य'}) है, हृदय गति ${hr} bpm है, SpO2 ${spo2Val}% है, और औसत धमनी दबाव ${mapVal} mmHg है। संवहनी लोच ${elasticity || 'सामान्य'} है। ${guidance || 'संतुलित आहार लें और नियमित रूप से पानी पिएं।'}`;
  }
  if (lang === 'Tamil') {
    return `ஒளியியல் PPG பகுப்பாய்வு முடிந்தது (மருத்துவ தொலை அளவீடு): இரத்த அழுத்தம் ${bp} mmHg (${categoryLabel || 'சீரானது'}), இதயத் துடிப்பு ${hr} bpm, SpO2 ${spo2Val}%, மற்றும் சராசரி தமனி அழுத்தம் ${mapVal} mmHg. இரத்த நாள நெகிழ்வுத்தன்மை ${elasticity || 'இயல்பானது'}. ${guidance || 'சீரான நீரேற்றத்தை பராமரிக்கவும் ஆரோக்கியமான உணவை உட்கொள்ளவும்.'}`;
  }
  return `Optical PPG Analysis Complete (MIMIC-III Calibrated): SBP/DBP is ${bp} mmHg (${categoryLabel || 'Normal BP'}), Resting Pulse is ${hr} bpm, SpO2 is ${spo2Val}%, and Mean Arterial Pressure is ${mapVal} mmHg. Arterial compliance is graded as ${elasticity || 'Optimal Elasticity'}. ${guidance || 'Maintain active lifestyle and balanced hydration.'}`;
};

const BPMonitor = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [fingerDetected, setFingerDetected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [bloodPressure, setBloodPressure] = useState('118/78');
  const [spo2, setSpo2] = useState(98);
  const [hrv, setHrv] = useState(45);
  const [map, setMap] = useState(91);
  const [pulsePressure, setPulsePressure] = useState(40);
  const [arterialStiffness, setArterialStiffness] = useState('2.4');
  const [vascularElasticity, setVascularElasticity] = useState('Optimal Elasticity');
  const [bpCategory, setBpCategory] = useState({
    label: 'Normal BP',
    tagClass: 'normal',
    color: '#10b981',
    guidance: 'Maintain balanced hydration and regular aerobic exercise.'
  });

  const [signalQuality, setSignalQuality] = useState('Ready for Optical rPPG Calibration');
  const [sqi, setSqi] = useState(94);
  const [snrDb, setSnrDb] = useState('15.2');
  const [pwvEst, setPwvEst] = useState(6.4);
  const [aixPercent, setAixPercent] = useState(22);
  const [signalStatus, setSignalStatus] = useState('High Clinical Integrity');
  const [auraInput, setAuraInput] = useState('');
  const [selectedAuraLanguage, setSelectedAuraLanguage] = useState('English');
  const [isSpeakingAura, setIsSpeakingAura] = useState(false);
  const [isPausedAura, setIsPausedAura] = useState(false);
  const [auraInsight, setAuraInsight] = useState(
    'Aura Telemetry AI standing by. Place finger gently over rear camera sensor with flash on, then start scan to compute clinical hemodynamic biomarkers.'
  );

  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const frameCountRef = useRef(0);
  const fingerDetectedRef = useRef(false);

  // 1-Click Research Dataset Exporter (.CSV)
  const exportResearchCSV = () => {
    try {
      const csvData = ppgEngine.exportResearchDatasetCSV({
        age: user?.age || 26,
        gender: user?.gender || 'male'
      });
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TitanVitals_rPPG_Research_Dataset_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('🔬 Research Time-Series Dataset (.CSV) Exported Successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export research dataset');
    }
  };

  // Setup camera stream with automatic Flash/Torch activation for PPG
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Automatically enable Flash/Torch for capillary transillumination
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        setTorchSupported(true);
        try {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          setTorchEnabled(true);
          toast.success('⚡ LED Flash activated for optical PPG measurement!', { id: 'torch' });
        } catch (torchErr) {
          console.warn('Torch auto-activation note:', torchErr.message);
        }
      } else {
        setTorchSupported(false);
      }

      setUseCamera(true);
      return true;
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err.message);
      setUseCamera(false);
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => {
        try {
          if (torchEnabled && t.applyConstraints) {
            t.applyConstraints({ advanced: [{ torch: false }] });
          }
          t.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setTorchEnabled(false);
    fingerDetectedRef.current = false;
    setFingerDetected(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchEnabled;
        await track.applyConstraints({ advanced: [{ torch: nextState }] });
        setTorchEnabled(nextState);
        toast.success(nextState ? '⚡ Flash/Torch ON' : 'Flash OFF');
      } catch (e) {
        toast.error('Flash control not supported on this camera');
      }
    }
  };

  const switchCameraMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isScanning) {
      setTimeout(() => startCamera(), 150);
    }
  };

  // Real-time Optical PPG Frame Processing with Trained Biomarker Model
  const processFrame = () => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    const waveCanvas = waveCanvasRef.current;

    let rAvg = 0, gAvg = 0, bAvg = 0;

    if (video && canvas && video.readyState >= 2) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 32, 32);
      const imgData = ctx.getImageData(0, 0, 32, 32).data;

      let rSum = 0, gSum = 0, bSum = 0;
      const count = imgData.length / 4;
      for (let i = 0; i < imgData.length; i += 4) {
        rSum += imgData[i];
        gSum += imgData[i + 1];
        bSum += imgData[i + 2];
      }
      rAvg = rSum / count;
      gAvg = gSum / count;
      bAvg = bSum / count;
    }

    // Ingest into trained PPG Biomarker Engine (CHROM + Butterworth Filter)
    const frameResult = ppgEngine.ingestFrame(rAvg, gAvg, bAvg, performance.now());
    fingerDetectedRef.current = frameResult.isContact;
    setFingerDetected(frameResult.isContact);
    setSqi(frameResult.sqi);
    setSnrDb(frameResult.snrDb);
    setSignalStatus(frameResult.signalStatus);

    frameCountRef.current += 1;

    // Periodically compute live dataset-trained biomarkers (ONLY when finger is actively detected)
    if (frameResult.isContact && frameCountRef.current % 8 === 0) {
      const bio = ppgEngine.computeBiomarkers({
        age: user?.age || 26,
        gender: user?.gender || 'male'
      });

      setHeartRate(bio.heartRate);
      setBloodPressure(bio.bpString);
      setSpo2(bio.spo2);
      setHrv(bio.hrvRmssd);
      setMap(bio.map);
      setPulsePressure(bio.pulsePressure);
      setArterialStiffness(bio.arterialStiffnessIndex);
      setVascularElasticity(bio.vascularElasticity);
      setPwvEst(bio.pwvEst);
      setAixPercent(bio.aixPercent);
      setBpCategory(bio.category);
    }

    // Draw Smooth Real-Time PPG Oscillogram on Canvas
    if (waveCanvas) {
      const wCtx = waveCanvas.getContext('2d');
      const w = waveCanvas.width;
      const h = waveCanvas.height;
      const smoothed = ppgEngine.getSmoothedSignal();

      wCtx.clearRect(0, 0, w, h);

      // 1. Oscillogram Grid lines
      wCtx.strokeStyle = 'rgba(0, 212, 255, 0.07)';
      wCtx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        wCtx.beginPath();
        wCtx.moveTo(x, 0);
        wCtx.lineTo(x, h);
        wCtx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        wCtx.beginPath();
        wCtx.moveTo(0, y);
        wCtx.lineTo(w, y);
        wCtx.stroke();
      }

      // 2. Baseline Zero-Axis
      wCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      wCtx.lineWidth = 1;
      wCtx.setLineDash([4, 4]);
      wCtx.beginPath();
      wCtx.moveTo(0, h / 2);
      wCtx.lineTo(w, h / 2);
      wCtx.stroke();
      wCtx.setLineDash([]);

      // 3. Draw Pulsatile Arterial Wave
      if (frameResult.isContact && smoothed.length > 2) {
        const minVal = Math.min(...smoothed);
        const maxVal = Math.max(...smoothed) || minVal + 1;
        const step = w / 300;

        const points = smoothed.map((val, idx) => {
          const normY = h - ((val - minVal) / (maxVal - minVal + 0.001)) * (h - 26) - 13;
          const posX = idx * step;
          return { x: posX, y: normY };
        });

        // Area Gradient under waveform
        const gradient = wCtx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.28)');
        gradient.addColorStop(0.7, 'rgba(0, 212, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

        wCtx.beginPath();
        wCtx.moveTo(points[0].x, h);
        points.forEach((pt) => wCtx.lineTo(pt.x, pt.y));
        wCtx.lineTo(points[points.length - 1].x, h);
        wCtx.closePath();
        wCtx.fillStyle = gradient;
        wCtx.fill();

        // Wave Stroke
        wCtx.beginPath();
        wCtx.strokeStyle = '#00d4ff';
        wCtx.lineWidth = 2.5;
        wCtx.shadowColor = '#00d4ff';
        wCtx.shadowBlur = 12;

        points.forEach((pt, idx) => {
          if (idx === 0) wCtx.moveTo(pt.x, pt.y);
          else wCtx.lineTo(pt.x, pt.y);
        });
        wCtx.stroke();
        wCtx.shadowBlur = 0;

        // Draw live pulse indicator head
        const lastPt = points[points.length - 1];
        if (lastPt) {
          wCtx.beginPath();
          wCtx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2);
          wCtx.fillStyle = '#00d4ff';
          wCtx.shadowColor = '#00d4ff';
          wCtx.shadowBlur = 14;
          wCtx.fill();
          wCtx.shadowBlur = 0;
        }
      } else {
        // Flatline / Prompt when no finger is placed
        wCtx.font = '13px Inter, sans-serif';
        wCtx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        wCtx.textAlign = 'center';
        wCtx.fillText('⚠️ Cover rear camera lens & flash with your fingertip', w / 2, h / 2 - 8);
        wCtx.font = '11px Inter, sans-serif';
        wCtx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        wCtx.fillText('Capillary pulse detection paused until contact is verified', w / 2, h / 2 + 12);
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Start/Stop Optical Scan
  const toggleScan = async () => {
    if (isScanning) {
      setIsScanning(false);
      stopCamera();
      setProgress(0);
      setSignalQuality('Stopped');
      toast('Optical PPG Scan Paused');
    } else {
      ppgEngine.reset();
      frameCountRef.current = 0;
      toast.loading('Activating camera sensor & LED flash for PPG telemetry...', { id: 'ppg' });
      const camOk = await startCamera();
      setIsScanning(true);
      setProgress(1);
      setSignalQuality('Place Fingertip Over Camera & Flash');

      if (camOk) {
        toast.success('Camera & Flash Active! Cover rear lens & flash with fingertip.', { id: 'ppg' });
      } else {
        toast.error('Camera permission required for PPG scanning', { id: 'ppg' });
      }
    }
  };

  // Progress and vital computation loop
  useEffect(() => {
    let interval;
    if (isScanning) {
      animFrameRef.current = requestAnimationFrame(processFrame);

      interval = setInterval(() => {
        // Strictly PAUSE progress if finger is not covering camera
        if (!fingerDetectedRef.current) {
          setSignalQuality('⚠️ Place Fingertip Over Rear Camera & Flash');
          return;
        }

        setProgress((prev) => {
          setSignalQuality('Acquiring Capillary Blood Flow (Calibrating...)');
          const next = prev + 1;
          if (next >= 100) {
            setIsScanning(false);
            stopCamera();

            // Final dataset biomarker computation
            const bio = ppgEngine.computeBiomarkers({
              age: user?.age || 26,
              gender: user?.gender || 'male'
            });

            setHeartRate(bio.heartRate);
            setBloodPressure(bio.bpString);
            setSpo2(bio.spo2);
            setHrv(bio.hrvRmssd);
            setMap(bio.map);
            setPulsePressure(bio.pulsePressure);
            setArterialStiffness(bio.arterialStiffnessIndex);
            setVascularElasticity(bio.vascularElasticity);
            setBpCategory(bio.category);
            setSignalQuality('100% Calibrated');

            const localizedInsight = getLocalizedInsight(selectedAuraLanguage, {
              bp: bio.bpString,
              hr: bio.heartRate,
              spo2Val: bio.spo2,
              mapVal: bio.map,
              elasticity: bio.vascularElasticity,
              categoryLabel: bio.category.label,
              guidance: bio.category.guidance
            });

            setAuraInsight(localizedInsight);
            toast.success(`Scan Complete: ${bio.bpString} mmHg (${bio.category.label})`);

            // Automatically persist reading into Records Database (records --> bp)
            saveHealthRecord({
              type: 'bp',
              title: `BP Telemetry: ${bio.bpString} mmHg`,
              data: {
                systolic: bio.systolic,
                diastolic: bio.diastolic,
                bpString: bio.bpString,
                heartRate: bio.heartRate,
                spo2: bio.spo2,
                map: bio.map,
                pulsePressure: bio.pulsePressure,
                category: bio.category.label,
                vascularElasticity: bio.vascularElasticity
              },
              summary: localizedInsight
            }).catch(e => console.warn('BP record auto-save:', e));

            setSignalQuality('Optimal Optical Pulse Tracking');
          }
          return next;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScanning, user, selectedAuraLanguage]);

  // Handle Changing Aura Language
  const handleLanguageChange = (newLang) => {
    setSelectedAuraLanguage(newLang);
    handleStopAuraSpeaking();

    const currentBio = {
      bp: bloodPressure,
      hr: heartRate,
      spo2Val: spo2,
      mapVal: map,
      elasticity: vascularElasticity,
      categoryLabel: bpCategory?.label,
      guidance: bpCategory?.guidance
    };

    const newInsight = getLocalizedInsight(newLang, currentBio);
    setAuraInsight(newInsight);
    toast.success(`Aura Telemetry AI Language: ${newLang}`);
  };

  // Text-To-Speech Synthesis in Selected Language
  const handleSpeakAura = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Voice synthesizer not supported on this browser/device');
      return;
    }

    if (isSpeakingAura && !isPausedAura) {
      window.speechSynthesis.pause();
      setIsPausedAura(true);
      return;
    }

    if (isPausedAura) {
      window.speechSynthesis.resume();
      setIsPausedAura(false);
      return;
    }

    window.speechSynthesis.cancel();

    if (!auraInsight) return;

    const currentLangObj = AURA_LANGUAGES.find(l => l.id === selectedAuraLanguage) || AURA_LANGUAGES[0];
    const utterance = new SpeechSynthesisUtterance(auraInsight);
    utterance.lang = currentLangObj.code;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(currentLangObj.speechCode) || v.lang === currentLangObj.code);
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => {
      setIsSpeakingAura(true);
      setIsPausedAura(false);
    };

    utterance.onend = () => {
      setIsSpeakingAura(false);
      setIsPausedAura(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsSpeakingAura(false);
      setIsPausedAura(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAuraSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingAura(false);
    setIsPausedAura(false);
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAskAura = async (e) => {
    e.preventDefault();
    if (!auraInput.trim()) return;

    const query = auraInput.trim();
    setAuraInput('');
    toast.loading('Aura Telemetry AI analyzing your optical hemodynamics...', { id: 'aura' });

    try {
      const liveTelemetryContext = {
        bloodPressure,
        heartRate,
        spo2,
        hrv,
        map,
        pulsePressure,
        arterialStiffness,
        vascularElasticity,
        category: bpCategory?.label,
        sqi,
        snrDb,
        pwvEst,
        aixPercent,
        language: selectedAuraLanguage
      };

      const aiResponse = await aiService.queryAuraAI(query, liveTelemetryContext);
      setAuraInsight(aiResponse);
      toast.success('Aura Telemetry AI responded!', { id: 'aura' });
    } catch (err) {
      console.error('Aura AI Query Error:', err);
      toast.error('Aura AI service busy. Providing hemodynamic baseline insight.', { id: 'aura' });
      const currentBio = {
        bp: bloodPressure,
        hr: heartRate,
        spo2Val: spo2,
        mapVal: map,
        elasticity: vascularElasticity,
        categoryLabel: bpCategory?.label,
        guidance: bpCategory?.guidance
      };
      setAuraInsight(getLocalizedInsight(selectedAuraLanguage, currentBio));
    }
  };

  return (
    <div className="bp-monitor-view">
      {/* Hidden Canvas for Optical Frame Capture */}
      <canvas ref={hiddenCanvasRef} width={32} height={32} style={{ display: 'none' }} />

      {/* 1. Pulse & BP Capture Section */}
      <div className="bp-card-group">
        <div className="section-title-row">
          <h2 className="bp-section-title">Optical Pulse & BP Capture</h2>
          <div className="sensor-controls">
            {torchSupported && (
              <button 
                className={`control-pill-btn ${torchEnabled ? 'active' : ''}`}
                onClick={toggleTorch}
                title="Toggle Camera Flash/Torch"
              >
                <FaBolt /> Flash {torchEnabled ? 'ON' : 'OFF'}
              </button>
            )}
            <button 
              className="control-pill-btn"
              onClick={switchCameraMode}
              title="Switch Camera (Front / Rear)"
            >
              <FaSyncAlt /> {facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
            </button>
          </div>
        </div>

        <div className="capture-card glass-card">
          {/* Animated Scanner Ring with Real Live Camera Viewfinder */}
          <div className="scanner-ring-container" onClick={toggleScan} title="Click to Start / Stop Camera PPG Scan">
            <div className={`outer-glow-ring ${isScanning ? 'is-active-pulse' : ''}`}></div>
            <div className={`optical-circle ${isScanning ? 'scanning' : ''}`}>
              {/* REAL LIVE CAMERA VIDEO ELEMENT */}
              <video 
                ref={videoRef} 
                className="live-camera-feed"
                autoPlay 
                playsInline 
                muted 
              />

              {!isScanning && (
                <div className="camera-standby-overlay">
                  <FaCamera className="aperture-icon" />
                  <span className="tap-to-scan-badge">Tap to Scan</span>
                </div>
              )}

              {isScanning && (
                <>
                  <div className="live-camera-pulse-ring"></div>
                  <div className="laser-scan-line"></div>
                </>
              )}
            </div>
          </div>

          <p className="scanner-hint-text">
            {isScanning 
              ? (fingerDetected ? '🔴 Fingertip detected on camera: Analyzing blood flow pulse...' : '📷 Place your index fingertip gently over the camera lens')
              : '📷 Place your index fingertip over the camera lens and tap to start'}
          </p>

          <div className="scanner-action-row">
            <button 
              className={`status-pill ${isScanning ? 'active' : 'ready'}`}
              onClick={toggleScan}
            >
              <span className="status-dot"></span>
              {isScanning ? `SCANNING (${progress}%)` : 'START REAL-TIME SCAN'}
            </button>
          </div>

          {/* Progress Bar & Quality Indicator */}
          {isScanning && (
            <div className="scan-telemetry-status">
              <div className="scan-progress-bar-container">
                <div 
                  className="scan-progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="signal-quality-text">
                <FaWaveSquare className="wave-icon" /> Signal: <strong>{signalQuality}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Real-Time Live Waveform & Current Readings */}
      <div className="bp-card-group">
        <div className="section-title-row">
          <h2 className="bp-section-title">Live Telemetry & Hemodynamic Biomarkers</h2>
          <div className="calibration-badge">
            <FaShieldAlt style={{ color: '#10b981' }} />
            <span>MIMIC-III Calibrated ({user?.age || 26}y, {user?.gender || 'Male'})</span>
          </div>
        </div>

        <div className="readings-card glass-card">
          {/* 4 Vital Metric Boxes */}
          <div className="readings-grid-four">
            <div className="reading-stat-box">
              <div className="reading-title-row">
                <FaHeartbeat className="heart-indicator" />
                <span>Heart Rate</span>
              </div>
              <div className="reading-value-wrap">
                <span className="reading-big-num">{heartRate}</span>
                <span className="reading-unit-txt">bpm</span>
              </div>
              <span className="vital-mini-tag normal">Resting Pulse</span>
            </div>

            <div className="reading-stat-box">
              <div className="reading-title-row">
                <FaTint className="bp-indicator" />
                <span>Blood Pressure</span>
              </div>
              <div className="reading-value-wrap">
                <span className="reading-big-num">{bloodPressure}</span>
                <span className="reading-unit-txt">mmHg</span>
              </div>
              <span 
                className={`vital-mini-tag ${bpCategory.tagClass}`}
                style={{ backgroundColor: `${bpCategory.color}22`, color: bpCategory.color, borderColor: `${bpCategory.color}55` }}
              >
                {bpCategory.label}
              </span>
            </div>

            <div className="reading-stat-box">
              <div className="reading-title-row">
                <FaTint style={{ color: '#00d4ff' }} />
                <span>SpO2 Oxygen</span>
              </div>
              <div className="reading-value-wrap">
                <span className="reading-big-num">{spo2}%</span>
              </div>
              <span className="vital-mini-tag normal">Blood Saturation</span>
            </div>

            <div className="reading-stat-box">
              <div className="reading-title-row">
                <FaWaveSquare style={{ color: '#ec4899' }} />
                <span>HRV (RMSSD)</span>
              </div>
              <div className="reading-value-wrap">
                <span className="reading-big-num">{hrv}</span>
                <span className="reading-unit-txt">ms</span>
              </div>
              <span className="vital-mini-tag normal">Autonomic Tone</span>
            </div>
          </div>

          {/* Secondary Cardiovascular Biomarkers Bar */}
          <div className="hemodynamic-secondary-row">
            <div className="hemo-stat-item">
              <span className="hemo-label">Mean Arterial (MAP):</span>
              <strong className="hemo-value">{map} mmHg</strong>
            </div>
            <div className="hemo-stat-item">
              <span className="hemo-label">Pulse Pressure:</span>
              <strong className="hemo-value">{pulsePressure} mmHg</strong>
            </div>
            <div className="hemo-stat-item">
              <span className="hemo-label">Arterial Stiffness:</span>
              <strong className="hemo-value">{arterialStiffness} ({vascularElasticity})</strong>
            </div>
          </div>

          {/* Real-time Canvas Pulse Wave Graph */}
          <div className="live-waveform-panel">
            <div className="waveform-header">
              <div className="waveform-title-wrap">
                <span className="waveform-title">Photoplethysmography (PPG) Arterial Oscillogram</span>
                <span className="waveform-sub-info">CHROM Color Vector • Butterworth Filter (0.75-3.5 Hz)</span>
              </div>
              <div className="waveform-pills-row">
                <span className="snr-live-pill" title="Signal-to-Noise Ratio in dB">
                  SNR: <strong>{snrDb} dB</strong>
                </span>
                <span className="live-pill"><span className="pulse-dot"></span> 60 FPS Telemetry</span>
              </div>
            </div>
            <canvas 
              ref={waveCanvasRef} 
              width={540} 
              height={110} 
              className="ppg-wave-canvas"
            />
          </div>

          {/* Scientific Research & Arterial PWA Telemetry Panel */}
          <div className="research-pwa-panel">
            <div className="research-panel-header">
              <div className="research-title-group">
                <div className="flask-badge-ico">
                  <FaFlask />
                </div>
                <div>
                  <span className="research-title">Optical rPPG Signal Quality & Arterial Decomposition (PWA)</span>
                  <span className="research-subtitle">De Haan & Jeanne CHROM Model • 2nd-Order Butterworth Bandpass (0.75–3.5 Hz)</span>
                </div>
              </div>
              <button 
                type="button" 
                className="export-research-csv-btn" 
                onClick={exportResearchCSV}
                title="Export full sample-by-sample timestamps, raw RGB, and filtered PPG time-series to CSV for research papers and statistical plotting"
              >
                <FaDownload className="btn-ico" />
                <span>Export Research Dataset (.CSV)</span>
              </button>
            </div>

            <div className="research-metrics-grid">
              <div className="research-metric-card">
                <span className="rm-label">Signal Quality Index (SQI)</span>
                <div className="rm-val-row">
                  <span className="rm-num">{sqi}%</span>
                  <span className={`rm-badge ${sqi >= 80 ? 'good' : (sqi >= 60 ? 'mid' : 'warn')}`}>
                    {signalStatus}
                  </span>
                </div>
                <div className="sqi-mini-progress">
                  <div 
                    className="sqi-mini-fill" 
                    style={{ 
                      width: `${sqi}%`, 
                      backgroundColor: sqi >= 80 ? '#10b981' : (sqi >= 60 ? '#f59e0b' : '#ef4444') 
                    }}
                  ></div>
                </div>
              </div>

              <div className="research-metric-card">
                <span className="rm-label">Signal-to-Noise Ratio (SNR)</span>
                <div className="rm-val-row">
                  <span className="rm-num">{snrDb}</span>
                  <span className="rm-unit">dB</span>
                </div>
                <span className="rm-sub-info">Spectral Cardiac vs. Noise Floor</span>
              </div>

              <div className="research-metric-card">
                <span className="rm-label">Estimated PWV (Velocity)</span>
                <div className="rm-val-row">
                  <span className="rm-num">{pwvEst}</span>
                  <span className="rm-unit">m/s</span>
                </div>
                <span className="rm-sub-info">Bramwell-Hill Arterial Compliance</span>
              </div>

              <div className="research-metric-card">
                <span className="rm-label">Augmentation Index (AIx)</span>
                <div className="rm-val-row">
                  <span className="rm-num">{aixPercent}%</span>
                  <span className="rm-unit">Reflectance</span>
                </div>
                <span className="rm-sub-info">Central Arterial Wave Reflection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Aura AI Real-Time Insights Card */}
      <div className="aura-card glass-card">
        <div className="aura-card-header">
          <div className="aura-identity">
            <div className="aura-avatar-icon">
              <FaRobot />
            </div>
            <div className="aura-title-block">
              <span className="aura-name">Aura AI Clinical Telemetry</span>
              <span className="aura-status">
                <span className="status-dot"></span> 3-Language Voice Enabled
              </span>
            </div>
          </div>

          {/* 3-Language Selector Tabs */}
          <div className="aura-lang-selector-group">
            <div className="aura-lang-pills">
              {AURA_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  className={`aura-lang-pill ${selectedAuraLanguage === lang.id ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.id)}
                  title={`Switch Aura Telemetry to ${lang.label}`}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.label}</span>
                </button>
              ))}
            </div>

            {/* Audio Read Aloud / Stop Button */}
            <button
              type="button"
              className={`aura-audio-speak-btn ${isSpeakingAura ? 'speaking' : ''}`}
              onClick={handleSpeakAura}
              title={isSpeakingAura ? (isPausedAura ? 'Resume Reading' : 'Pause Reading') : `Read Aloud in ${selectedAuraLanguage}`}
            >
              {isSpeakingAura ? (
                isPausedAura ? (
                  <>
                    <FaPlay className="audio-icon" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <span className="sound-wave-bars">
                      <span className="bar bar-1"></span>
                      <span className="bar bar-2"></span>
                      <span className="bar bar-3"></span>
                    </span>
                    <FaPause className="audio-icon" />
                    <span>Pause</span>
                  </>
                )
              ) : (
                <>
                  <FaVolumeUp className="audio-icon" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {isSpeakingAura && (
              <button
                type="button"
                className="aura-audio-stop-btn"
                onClick={handleStopAuraSpeaking}
                title="Stop Voice Output"
                aria-label="Stop Voice Output"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="aura-speech-bubble">
          <div className="insight-timestamp">
            <FaLightbulb style={{ color: '#00d4ff', marginRight: '6px' }} />
            Personalized Clinical Insight ({selectedAuraLanguage})
          </div>
          <p className="insight-text">{auraInsight}</p>
        </div>

        <form onSubmit={handleAskAura} className="aura-input-row">
          <input 
            type="text"
            className="aura-text-input"
            placeholder={`Ask Aura in ${selectedAuraLanguage} about your vitals...`}
            value={auraInput}
            onChange={(e) => setAuraInput(e.target.value)}
          />
          <button type="submit" className="aura-send-btn" aria-label="Send query">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BPMonitor;
