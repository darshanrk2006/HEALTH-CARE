import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBrain, 
  FaPaperPlane, 
  FaRobot, 
  FaSmile, 
  FaMeh, 
  FaFrown, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaPhoneAlt, 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaSpa,
  FaLightbulb
} from 'react-icons/fa';
import { aiService } from '../../services/health-ai/aiService';
import toast from 'react-hot-toast';
import './MentalHealthSupport.css';

const MentalHealthSupport = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm Aura, your TitanVitals Mental Wellness & Mindfulness companion. How are your energy levels and headspace feeling today?",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Guided Breathing States
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathCount, setBreathCount] = useState(0);

  // Web Audio Ambient Generator
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [soundType, setSoundType] = useState('binaural'); // 'binaural', 'rain'
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to top of page on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Clean text of emojis & markdown before voice synthesis
  const cleanForSpeech = (raw) => {
    if (!raw) return '';
    return raw
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[*#_`~>•-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text-To-Speech Read Aloud Function with mindful cadence
  const handleSpeak = (text, messageId) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Voice synthesis not supported on this device');
      return;
    }

    if (speakingMsgId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92; // Calm, soothing, mindful cadence
    utterance.pitch = 1.05; // Gentle, supportive tone
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const mindfulVoice = voices.find(v => 
      (v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female')) && v.lang.startsWith('en')
    );
    if (mindfulVoice) utterance.voice = mindfulVoice;

    utterance.onstart = () => setSpeakingMsgId(messageId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Only scroll the internal chat container when user has sent messages (not on initial mount)
  useEffect(() => {
    if (messages.length > 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Guided Breathing Timer (4-7-8 Breathing Technique)
  useEffect(() => {
    let timer;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              setBreathCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  // Ambient Audio Generator using Web Audio API
  const toggleAmbientSound = () => {
    if (isSoundPlaying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      setIsSoundPlaying(false);
      toast('Ambient Soundscape Paused');
    } else {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // 432 Hz Calm Sine Wave Generator with Gentle Pink-Modulated Gain
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz deep meditative frequency
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setIsSoundPlaying(true);
        toast.success('432 Hz Meditative Frequency Active');
      } catch (e) {
        toast.error('Audio synthesizer not supported on this browser');
      }
    }
  };

  const handleSendMessage = async (e, textToSend = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const userText = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!userText || loading) return;

    setInputText('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userText, time: now }
    ]);
    setLoading(true);

    try {
      const response = await aiService.chatbotResponse(
        userText,
        `Role: Empathetic AI Mental Health Counselor & Mindfulness Guide. Current User Mood: ${selectedMood}. Provide supportive, actionable CBT and mindfulness guidance.`,
        'English',
        messages
      );

      const botMsgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: 'bot', text: response, time: now }
      ]);

      if (autoSpeak) {
        setTimeout(() => handleSpeak(response, botMsgId), 300);
      }
    } catch (err) {
      const botMsgId = Date.now() + 1;
      const fallbackMsg = "I hear you. Remember that taking slow, deep breaths and acknowledging how you feel without self-judgment can create mental space. I'm right here with you.";
      setMessages((prev) => [
        ...prev,
        { 
          id: botMsgId, 
          sender: 'bot', 
          text: fallbackMsg, 
          time: now 
        }
      ]);
      if (autoSpeak) {
        setTimeout(() => handleSpeak(fallbackMsg, botMsgId), 300);
      }
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { name: 'Joyful', icon: '😄', color: '#10b981' },
    { name: 'Calm', icon: '😌', color: '#00d4ff' },
    { name: 'Anxious', icon: '😰', color: '#f59e0b' },
    { name: 'Stressed', icon: '😫', color: '#ec4899' },
    { name: 'Exhausted', icon: '😴', color: '#8b5cf6' },
  ];

  return (
    <div className="mental-wellness-view">
      {/* Header */}
      <div className="mental-header-row">
        <div className="mental-title-group">
          <div className="mental-title-badge">
            <FaSpa />
            <span>Real-Time Mindfulness & AI Therapy</span>
          </div>
          <h1 className="mental-title">Mental Wellness & Guided Therapy</h1>
        </div>

        <button 
          className={`ambient-sound-btn ${isSoundPlaying ? 'playing' : ''}`}
          onClick={toggleAmbientSound}
          title="Toggle 432 Hz Meditative Frequency"
        >
          {isSoundPlaying ? <><FaVolumeUp /> 432 Hz Sound Active</> : <><FaVolumeMute /> Play Ambient Tone</>}
        </button>
      </div>

      {/* Mood Selector Row */}
      <div className="mood-selector-card glass-card">
        <span className="mood-heading-label">How are you feeling right now?</span>
        <div className="mood-pill-group">
          {moods.map((m) => (
            <button
              key={m.name}
              className={`mood-pill-btn ${selectedMood === m.name ? 'active' : ''}`}
              onClick={() => setSelectedMood(m.name)}
            >
              <span className="mood-emoji">{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4-7-8 Interactive Guided Breathing Module */}
      <div className="breathing-card glass-card">
        <div className="breathing-card-header">
          <div>
            <h3 className="breathing-title">4-7-8 Relaxing Breath Exercise</h3>
            <span className="breathing-subtitle">Regulates parasympathetic nervous system & lowers blood pressure</span>
          </div>
          <button 
            className="breathing-toggle-btn"
            onClick={() => {
              setIsBreathingActive(!isBreathingActive);
              if (!isBreathingActive) {
                setBreathPhase('Inhale');
                setBreathSeconds(4);
              }
            }}
          >
            {isBreathingActive ? <><FaPause /> Pause</> : <><FaPlay /> Start Breathwork</>}
          </button>
        </div>

        <div className="breathing-visualizer-container">
          <div className={`breath-circle-outer ${isBreathingActive ? breathPhase.toLowerCase() : ''}`}>
            <div className="breath-circle-inner">
              <span className="breath-phase-text">{isBreathingActive ? breathPhase : 'Ready'}</span>
              <span className="breath-timer-num">{isBreathingActive ? breathSeconds : '4'}s</span>
            </div>
          </div>
          <span className="breath-cycle-counter">Cycles Completed: <strong>{breathCount}</strong></span>
        </div>
      </div>

      {/* Interactive AI Counselor Chat */}
      <div className="counselor-chat-card glass-card">
        <div className="chat-card-top-bar">
          <div className="counselor-identity">
            <div className="counselor-avatar">
              <FaRobot />
            </div>
            <div>
              <h4 className="counselor-name">Aura • Mindful AI Companion</h4>
              <span className="counselor-status"><span className="pulse-dot"></span> Active & Listening</span>
            </div>
          </div>

          <div className="counselor-top-controls">
            <button 
              className={`auto-speak-toggle-btn ${autoSpeak ? 'active' : ''}`}
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                toast.success(next ? 'Auto-Voice Readout Activated 🔊' : 'Auto-Voice Deactivated', { id: 'voice' });
              }}
              title="Automatically read aloud Aura's therapy responses"
            >
              <FaVolumeUp /> {autoSpeak ? 'Auto-Voice ON' : 'Auto-Voice OFF'}
            </button>
          </div>
        </div>

        <div className="chat-messages-container" ref={chatContainerRef}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-message-row ${m.sender}`}>
              <div className="message-bubble">
                <p className="message-text">{m.text}</p>
                <div className="message-bubble-footer">
                  <span className="message-time">{m.time}</span>
                  {m.sender === 'bot' && (
                    <button 
                      className={`message-speak-btn ${speakingMsgId === m.id ? 'is-speaking' : ''}`}
                      onClick={() => handleSpeak(m.text, m.id)}
                      title={speakingMsgId === m.id ? "Stop voice reading" : "Read aloud with Aura voice"}
                    >
                      {speakingMsgId === m.id ? <><FaVolumeMute /> Stop</> : <><FaVolumeUp /> Listen</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message-row bot">
              <div className="message-bubble typing-bubble">
                <span>Aura is reflecting...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Mindful Starters */}
        <div className="mental-chat-starters">
          {["Feeling Anxious 😰", "Need Quick Breathing 🧘", "Can't Sleep 😴", "Overwhelmed 😫", "Daily Affirmation ✨"].map(chip => (
            <button 
              key={chip} 
              type="button" 
              className="mental-starter-chip" 
              onClick={() => handleSendMessage(null, chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input 
            type="text"
            className="chat-text-input"
            placeholder="Share your thoughts, feelings, or stress factors..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={`chat-submit-btn ${inputText.trim() ? 'is-active' : ''}`} 
            aria-label="Send message"
            title="Send message"
            disabled={loading || !inputText.trim()}
          >
            <FaPaperPlane className="plane-send-icon" />
          </button>
        </form>
      </div>

      {/* 24/7 Crisis Hotline Directory */}
      <div className="crisis-hotline-card glass-card">
        <div className="crisis-title-row">
          <FaPhoneAlt className="crisis-phone-icon" />
          <h4>24/7 Confidential Crisis & Mental Health Helplines</h4>
        </div>
        <div className="crisis-numbers-grid">
          <div className="crisis-item">
            <span className="crisis-country">Global / US Lifeline</span>
            <a href="tel:988" className="crisis-tel-btn">Dial 988 (Free & 24/7)</a>
          </div>
          <div className="crisis-item">
            <span className="crisis-country">Crisis Text Line</span>
            <span className="crisis-text-pill">Text HOME to 741741</span>
          </div>
          <div className="crisis-item">
            <span className="crisis-country">India Tele-MANAS</span>
            <a href="tel:14416" className="crisis-tel-btn">Dial 14416 (Toll-Free)</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthSupport;
