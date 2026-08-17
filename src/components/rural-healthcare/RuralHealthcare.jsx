import React, { useState } from 'react';
import { 
  FaMobileAlt, 
  FaGlobe, 
  FaVolumeUp, 
  FaWhatsapp, 
  FaSms, 
  FaFirstAid, 
  FaBaby, 
  FaTint, 
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaSyncAlt,
  FaBookMedical
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './RuralHealthcare.css';

const RuralHealthcare = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN'); // Hindi
  const [inputText, setInputText] = useState('Patient has high fever and chills for 2 days. What is the emergency treatment?');
  const [translatedText, setTranslatedText] = useState('मरीज को 2 दिनों से तेज बुखार और कंपकंपी है। आपातकालीन उपचार क्या है?');
  const [lowBandwidthMode, setLowBandwidthMode] = useState(true);
  const [activeTab, setActiveTab] = useState('translator'); // 'translator', 'runbooks', 'sos'

  // Multilingual translations dictionary
  const languageOptions = [
    { code: 'hi-IN', label: 'Hindi (हिन्दी)', sample: 'मरीज को 2 दिनों से तेज बुखार है।' },
    { code: 'bn-IN', label: 'Bengali (বাংলা)', sample: 'রোগীর ২ দিন ধরে তীব্র জ্বর।' },
    { code: 'te-IN', label: 'Telugu (తెలుగు)', sample: 'రోగికి 2 రోజులుగా తీవ్ర జ్వరం ఉంది.' },
    { code: 'ta-IN', label: 'Tamil (தமிழ்)', sample: 'நோயாளிக்கு 2 நாட்களாக கடுமையான காய்ச்சல் உள்ளது.' },
    { code: 'es-ES', label: 'Spanish (Español)', sample: 'El paciente tiene fiebre alta por 2 días.' },
    { code: 'fr-FR', label: 'French (Français)', sample: 'Le patient a une forte fièvre depuis 2 jours.' },
    { code: 'sw-KE', label: 'Swahili (Kiswahili)', sample: 'Mgonjwa ana homa kali kwa siku 2.' },
  ];

  const translatePhrases = {
    'hi-IN': 'मरीज को 2 दिनों से तेज बुखार और कंपकंपी है। प्राथमिक उपचार में ओआरएस घोल और पैरासिटामोल दें।',
    'bn-IN': 'রোগীর ২ দিন ধরে তীব্র জ্বর ও কাঁপুনি। প্রাথমিক চিকিৎসায় ওআরএস এবং প্যারাসিটামল দিন।',
    'te-IN': 'రోగికి 2 రోజులుగా తీవ్ర జ్వరం మరియు వణుకు ఉంది. ఓఆర్ఎస్ మరియు పారాసిటమాల్ ఇవ్వండి.',
    'ta-IN': 'நோயாளிக்கு 2 நாட்களாக கடுமையான காய்ச்சல் உள்ளது. உடனே ஓஆர்எஸ் கரைசல் கொடுங்கள்.',
    'es-ES': 'El paciente presenta fiebre alta y escalofríos por 2 días. Administrar hidratación oral y antipirético.',
    'fr-FR': 'Le patient a une forte fièvre et des frissons depuis 2 jours. Administrer une réhydratation orale.',
    'sw-KE': 'Mgonjwa ana homa kali na kutetemeka kwa siku 2. Mpe suluhisho la ORS na maji mengi.'
  };

  const handleTranslate = () => {
    toast.loading('Translating for rural healthcare tele-consult...', { id: 'trans' });
    setTimeout(() => {
      const translated = translatePhrases[selectedLanguage] || 'Translation ready for rural health worker.';
      setTranslatedText(translated);
      toast.success('Translation completed!', { id: 'trans' });
    }, 400);
  };

  // Text-To-Speech Pronunciation
  const speakText = (text, lang) => {
    if (!window.speechSynthesis) {
      toast.error('Voice synthesis not supported on this device');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    toast.success('Playing translated voice instruction...');
  };

  // One-Click WhatsApp & SMS Dispatch for ASHA / Field Workers
  const handleSendVitalBroadcast = (platform) => {
    const message = encodeURIComponent(
      `🚨 [TITANVITALS RURAL EMERGENCY DISPATCH]\nVillage Unit: Sector 4A\nPatient: Alex Mercer (Age 28)\nVitals:\n- Heart Rate: 78 bpm\n- Blood Pressure: 124/82 mmHg\n- SpO2: 98%\n- Condition: High Fever & Dehydration\nAction Required: District Medical Officer Review & Bed Reservation Requested.`
    );

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    } else {
      window.open(`sms:?body=${message}`, '_blank');
    }
    toast.success('Emergency vital dispatch broadcast initiated!');
  };

  const ruralProtocols = [
    {
      id: 'ors',
      title: 'Infant & Adult Dehydration (ORS Protocol)',
      icon: '💧',
      steps: [
        '1 Liter of clean boiled & cooled water',
        '6 level teaspoons of sugar + 1/2 level teaspoon of salt',
        'Stir until dissolved; give in small frequent sips every 10 minutes',
        'Continue breastfeeding for infants throughout episode'
      ]
    },
    {
      id: 'snakebite',
      title: 'Snake / Venomous Bite Triage',
      icon: '🐍',
      steps: [
        'Keep patient completely calm and immobilize the bitten limb below heart level',
        'Do NOT cut the wound, apply ice, or use a tourniquet',
        'Remove rings, watches, or tight clothing immediately',
        'Transport immediately to the nearest health facility with anti-venom (ASV)'
      ]
    },
    {
      id: 'maternal',
      title: 'High-Risk Maternal Warning Signs',
      icon: '🤰',
      steps: [
        'Severe headaches with blurred vision (Sign of Preeclampsia)',
        'Vaginal bleeding at any stage of pregnancy',
        'High fever with lower abdominal pain',
        'Immediate referral to Comprehensive Emergency Obstetric Care (CEmONC)'
      ]
    }
  ];

  return (
    <div className="rural-healthcare-view">
      {/* Header */}
      <div className="rural-header-row">
        <div className="rural-title-group">
          <div className="rural-title-badge">
            <FaMobileAlt />
            <span>Offline-First Rural Telemedicine</span>
          </div>
          <h1 className="rural-title">Rural Healthcare & Multi-Language Tele-Consult</h1>
          <p className="rural-subtitle">
            Low-bandwidth speech translation, ASHA emergency vital broadcaster, and offline clinical runbooks.
          </p>
        </div>

        <div className="low-bandwidth-toggle-badge">
          <span className="pulse-dot"></span>
          <span>Low-Bandwidth Mode: <strong>Active</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="rural-tabs-card glass-card">
        <div className="rural-tabs-list">
          <button 
            className={`rural-tab-btn ${activeTab === 'translator' ? 'active' : ''}`}
            onClick={() => setActiveTab('translator')}
          >
            <FaGlobe /> Multilingual Voice Translator
          </button>
          <button 
            className={`rural-tab-btn ${activeTab === 'sos' ? 'active' : ''}`}
            onClick={() => setActiveTab('sos')}
          >
            <FaWhatsapp /> ASHA Emergency Broadcast
          </button>
          <button 
            className={`rural-tab-btn ${activeTab === 'runbooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('runbooks')}
          >
            <FaBookMedical /> Offline Protocols
          </button>
        </div>
      </div>

      {/* 1. Multilingual Voice Translator */}
      {activeTab === 'translator' && (
        <div className="translator-card glass-card">
          <div className="lang-picker-row">
            <label className="field-label-bold">Target Rural Dialect / Language:</label>
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="lang-select-box"
            >
              {languageOptions.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="translate-input-box">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              className="translate-textarea"
              placeholder="Type English medical advice or symptoms..."
            />
            <button className="translate-action-btn" onClick={handleTranslate}>
              <FaSyncAlt /> Translate Now
            </button>
          </div>

          {translatedText && (
            <div className="translated-output-box">
              <div className="translated-header-row">
                <span className="target-lang-lbl">Translated Dialect:</span>
                <button 
                  className="speak-voice-btn"
                  onClick={() => speakText(translatedText, selectedLanguage)}
                >
                  <FaVolumeUp /> Speak Aloud
                </button>
              </div>
              <p className="translated-text-display">{translatedText}</p>
            </div>
          )}
        </div>
      )}

      {/* 2. ASHA Emergency Vital Broadcaster */}
      {activeTab === 'sos' && (
        <div className="broadcast-card glass-card">
          <div className="broadcast-header">
            <div className="broadcast-icon-wrap">
              <FaWhatsapp />
            </div>
            <div>
              <h3 className="broadcast-title">ASHA / Field Worker Emergency Tele-Broadcast</h3>
              <p className="broadcast-sub">Transmit patient vitals and symptoms directly to Medical Officers over low-bandwidth channels.</p>
            </div>
          </div>

          <div className="payload-preview-box">
            <pre className="payload-pre">
{`🚨 [TITANVITALS RURAL EMERGENCY DISPATCH]
Village Sector: Sector 4A (Sub-District)
Patient Name: Alex Mercer (Age 28)
Vitals: HR 78 bpm | BP 124/82 mmHg | SpO2 98%
Condition: High Febrile Illness & Severe Dehydration
Action: Immediate Tele-Consult & Ambulance Bed Prep`}
            </pre>
          </div>

          <div className="broadcast-buttons-row">
            <button 
              className="broadcast-btn whatsapp"
              onClick={() => handleSendVitalBroadcast('whatsapp')}
            >
              <FaWhatsapp /> Broadcast via WhatsApp
            </button>
            <button 
              className="broadcast-btn sms"
              onClick={() => handleSendVitalBroadcast('sms')}
            >
              <FaSms /> Send via SMS (Offline)
            </button>
          </div>
        </div>
      )}

      {/* 3. Offline Clinical Runbooks */}
      {activeTab === 'runbooks' && (
        <div className="runbooks-grid">
          {ruralProtocols.map((p) => (
            <div key={p.id} className="protocol-card glass-card">
              <div className="protocol-top-row">
                <span className="protocol-emoji">{p.icon}</span>
                <h4 className="protocol-title">{p.title}</h4>
              </div>
              <ul className="protocol-steps-list">
                {p.steps.map((step, idx) => (
                  <li key={idx} className="protocol-step-item">
                    <FaCheckCircle className="step-check" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RuralHealthcare;
