import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { aiService } from '../../services/health-ai/aiService';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaHeartbeat,
  FaGlobe,
  FaVolumeUp,
  FaVolumeMute,
  FaMicrophone,
  FaTrashAlt,
  FaCheck,
  FaArrowsAlt,
  FaCopy,
  FaThumbsUp,
  FaThumbsDown,
  FaRedo,
  FaDownload,
  FaStop,
  FaLightbulb,
  FaMagic
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Chatbot.css';

// 100% Comprehensive Emoji & Symbol Stripper for Voice Readout
const cleanSpeechText = (rawText, lang) => {
  if (!rawText) return '';
  let text = rawText
    // Remove all Unicode Emojis & Pictographs
    .replace(/[\u{1F000}-\u{1FAFF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2300}-\u{23FF}]/gu, '')
    // Remove markdown formatting
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\*\-\•]\s+/gm, ', ');

  // When speaking in Tamil or Hindi, remove English/Latin words so it never stumbles over English
  if (lang !== 'English') {
    text = text.replace(/\([a-zA-Z0-9\s.,-]+\)/g, '');
    text = text.replace(/\[[a-zA-Z0-9\s.,-]+\]/g, '');
    text = text.replace(/\b[a-zA-Z]+\b/g, '');
  }

  return text.replace(/\s+/g, ' ').replace(/\s*,\s*,+/g, ',').trim();
};

const Chatbot = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // 'English', 'Tamil', 'Hindi'
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [feedback, setFeedback] = useState({}); // { [msgId]: 'up' | 'down' }
  const [copiedId, setCopiedId] = useState(null);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef(false);

  // Moveable Draggable Floating Bubble Position
  const getInitialPosition = () => {
    try {
      const saved = localStorage.getItem('titan_bot_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          x: Math.min(Math.max(16, parsed.x), window.innerWidth - 74),
          y: Math.min(Math.max(16, parsed.y), window.innerHeight - 74)
        };
      }
    } catch (e) {
      // Fallback
    }
    return {
      x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300,
      y: typeof window !== 'undefined' ? window.innerHeight - 95 : 500
    };
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ isDown: false, startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false });
  const bubbleRef = useRef(null);

  // Resize listener to keep bubble within bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(16, prev.x), window.innerWidth - 74),
        y: Math.min(Math.max(16, prev.y), window.innerHeight - 74)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    dragRef.current = {
      isDown: true,
      startX: e.clientX || (e.touches && e.touches[0].clientX),
      startY: e.clientY || (e.touches && e.touches[0].clientY),
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragRef.current.isDown) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        dragRef.current.hasMoved = true;
      }

      if (dragRef.current.hasMoved) {
        const nextX = Math.min(Math.max(16, dragRef.current.initialX + deltaX), window.innerWidth - 74);
        const nextY = Math.min(Math.max(16, dragRef.current.initialY + deltaY), window.innerHeight - 74);
        setPosition({ x: nextX, y: nextY });
      }
    };

    const handlePointerUp = () => {
      if (!dragRef.current.isDown) return;
      setIsDragging(false);

      if (!dragRef.current.hasMoved) {
        setIsOpen((prev) => !prev);
      } else {
        try {
          localStorage.setItem('titan_bot_position', JSON.stringify(position));
        } catch (e) {}
      }

      dragRef.current.isDown = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [position]);

  const greetings = {
    English: "Hi! I am TitanVitals AI, your interactive clinical & wellness assistant. Ask me anything about your symptoms, vitals, diet, or medications!",
    Tamil: "வணக்கம்! நான் டைட்டன்வைட்டல்ஸ் AI, உங்கள் மருத்துவ உதவியாளர். உங்கள் உடல்நலம், அறிகுறிகள் அல்லது மருந்துகள் குறித்து என்னிடம் கேட்கலாம்.",
    Hindi: "नमस्ते! मैं टाइटनवाइटल्स AI हूँ, आपका स्वास्थ्य सहायक। लक्षणों, दवाइयों या वाइटल्स के बारे में बेझिझक पूछें।"
  };

  const placeholders = {
    English: "Message TitanVitals AI (e.g. 'What causes high BP?')...",
    Tamil: "கேள்வி கேட்கவும் (எ.கா: 'இரத்த அழுத்தம் குறைய வழி?')...",
    Hindi: "प्रश्न पूछें (उदा: 'बीपी नियंत्रित कैसे करें?')..."
  };

  // Interactive Quick Starter Chips (Prompt Suggestions like ChatGPT)
  const starterPrompts = {
    English: [
      { id: 'bp', text: '🩺 What is normal BP range?', prompt: 'What is a normal blood pressure range and how to keep it stable?' },
      { id: 'diet', text: '🥗 Heart-Healthy Diet Plan', prompt: 'Give me a 3-step actionable heart-healthy nutrition guide.' },
      { id: 'headache', text: '💊 Fast Headache Relief', prompt: 'What are safe immediate home remedies for tension headaches?' },
      { id: 'anxiety', text: '🧠 Calm Stress & Anxiety', prompt: 'Give me a 2-minute clinical breathing exercise to reduce anxiety.' },
      { id: 'water', text: '💧 Daily Hydration Goals', prompt: 'How much water should I drink daily for optimal health?' },
      { id: 'sleep', text: '😴 Improve Sleep Quality', prompt: 'What are clinical tips to fall asleep faster and sleep deeply?' }
    ],
    Tamil: [
      { id: 'bp', text: '🩺 BP அளவுகள் என்ன?', prompt: 'சாதாரண இரத்த அழுத்த அளவு என்ன? அதை கட்டுக்குள் வைப்பது எப்படி?' },
      { id: 'diet', text: '🥗 இதய நல உணவு முறை', prompt: 'இதய ஆரோக்கியத்திற்கு சிறந்த 3 உணவு முறைகளை கூறவும்.' },
      { id: 'headache', text: '💊 தலைவலி உடனடி தீர்வு', prompt: 'தலைவலி குறைய எளிய வீட்டு வைத்தியங்களை கூறவும்.' },
      { id: 'stress', text: '🧠 மன அழுத்தம் குறைக்க', prompt: 'மன அழுத்தம் மற்றும் பதட்டம் குறைய எளிய பயிற்சிகள் என்ன?' }
    ],
    Hindi: [
      { id: 'bp', text: '🩺 सामान्य बीपी स्तर क्या है?', prompt: 'सामान्य रक्तचाप क्या है और इसे नियंत्रित कैसे रखें?' },
      { id: 'diet', text: '🥗 हृदय स्वस्थ आहार', prompt: 'दिल को स्वस्थ रखने के लिए सर्वोत्तम आहार क्या है?' },
      { id: 'headache', text: '💊 सिरदर्द का उपाय', prompt: 'सिरदर्द से तुरंत राहत पाने के सुरक्षित घरेलू उपाय क्या हैं?' },
      { id: 'stress', text: '🧠 तनाव कैसे कम करें?', prompt: 'मानसिक तनाव और चिंता दूर करने के आसान तरीके बताएं।' }
    ]
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: greetings.English,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: ['How to check my BP?', 'Tips for better immunity', 'When should I visit a doctor?']
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streamingMsgId]);

  // Handle user changing language
  const selectLanguage = (lang) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }

    setSelectedLanguage(lang);
    setHasChosenLanguage(true);
    setShowLangMenu(false);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const switchTexts = {
      English: "Language changed to English. How can I help you today?",
      Tamil: "மொழி தமிழாக மாற்றப்பட்டது. உங்கள் உடல்நலம் பற்றி என்ன தெரிந்து கொள்ள வேண்டும்?",
      Hindi: "भाषा हिन्दी में बदल दी गई है। मैं आपकी क्या सहायता कर सकता हूँ?"
    };

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: switchTexts[lang] || greetings[lang],
        sender: 'bot',
        timestamp: now,
        followUps: lang === 'Tamil' ? ['BP கட்டுப்பாடு', 'உணவு முறை', 'மருத்துவ ஆலோசனை'] : (lang === 'Hindi' ? ['बीपी नियंत्रण', 'संतुलित आहार', 'डॉक्टर परामर्श'] : ['How to check vitals?', 'Nutritional advice', 'Emergency help'])
      }
    ]);

    toast.success(`Language set to ${lang}`);
  };

  // Text-To-Speech Pronunciation (Cleaned of all Emojis & English in regional modes)
  const speakMessage = (text, messageId = null) => {
    if (!window.speechSynthesis) {
      toast.error('Voice playback not supported on this browser');
      return;
    }

    if (speakingMsgId === messageId && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanSpeechText(text, selectedLanguage);
    if (!cleanText) return;

    const langCodes = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN'
    };

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCodes[selectedLanguage] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeakingMsgId(messageId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech when closing chatbot
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  }, [isOpen]);

  // Voice speech recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported on this browser');
      return;
    }

    const langCodes = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN'
    };

    const recognition = new SpeechRecognition();
    recognition.lang = langCodes[selectedLanguage] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success(`Listening in ${selectedLanguage}...`);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice capture error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Interactive Real-Time Typewriter Streaming Effect
  const streamBotResponse = (targetId, fullText, followUps = []) => {
    setIsStreaming(true);
    setStreamingMsgId(targetId);
    streamAbortRef.current = false;

    let index = 0;
    const words = fullText.split(' ');

    const interval = setInterval(() => {
      if (streamAbortRef.current || index >= words.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) => (m.id === targetId ? { ...m, text: fullText, followUps } : m))
        );
        setIsStreaming(false);
        setStreamingMsgId(null);
        return;
      }

      const partialText = words.slice(0, index + 1).join(' ');
      setMessages((prev) =>
        prev.map((m) => (m.id === targetId ? { ...m, text: partialText } : m))
      );
      index += 1;
    }, 28);
  };

  const handleStopStreaming = () => {
    streamAbortRef.current = true;
    setIsStreaming(false);
    setStreamingMsgId(null);
  };

  // Send Message with Multi-Turn Memory & Interactive Streaming
  const executeSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: now,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setLoading(true);

    const botMsgId = Date.now() + 1;

    try {
      const response = await aiService.chatbotResponse(
        userText,
        `User is asking interactive medical & health queries. Selected Language: ${selectedLanguage}.`,
        selectedLanguage,
        newHistory
      );

      // Create placeholder bot message
      const botMessage = {
        id: botMsgId,
        text: '',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: selectedLanguage === 'Tamil' ? ['மேலும் விவரம் தேவை', 'முன்னெச்சரிக்கைகள் என்ன?'] : (selectedLanguage === 'Hindi' ? ['अधिक जानकारी', 'सावधानियां क्या हैं?'] : ['Tell me more', 'What are the precautions?'])
      };

      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);

      // Stream words with ChatGPT-style typewriter
      streamBotResponse(botMsgId, response, botMessage.followUps);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMsg = {
        id: botMsgId,
        text: selectedLanguage === 'Tamil' ? 'உடல்நல ஆலோசனை தயாராக உள்ளது. போதுமான ஓய்வும் நீரேற்றமும் பராமரிக்கவும்.' : (selectedLanguage === 'Hindi' ? 'स्वास्थ्य परामर्श: पर्याप्त पानी पिएं और विश्राम करें।' : 'Maintaining balanced hydration, routine vitals monitoring, and regular sleep supports overall health.'),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    executeSendMessage(inputValue);
  };

  // Copy Message Text
  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feedback Up / Down
  const handleFeedback = (id, type) => {
    setFeedback((prev) => ({ ...prev, [id]: type }));
    toast.success(type === 'up' ? 'Thanks for the positive feedback! 👍' : 'Feedback recorded. Improving responses 💡');
  };

  // Regenerate Response
  const handleRegenerate = (msgIndex) => {
    const lastUserMsg = [...messages.slice(0, msgIndex)].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      executeSendMessage(`Please provide an alternate, deeper explanation for: ${lastUserMsg.text}`);
    } else {
      executeSendMessage('Can you elaborate on this medical guidance?');
    }
  };

  // Export & Download Chat Log
  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'USER' : 'TITANVITALS AI'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TitanVitals_Chat_Summary_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Chat transcript exported successfully!');
  };

  const clearChat = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: Date.now(),
        text: greetings[selectedLanguage],
        sender: 'bot',
        timestamp: now,
        followUps: ['How to check my BP?', 'Tips for better immunity', 'When should I visit a doctor?']
      }
    ]);
    setHasChosenLanguage(false);
    toast('Chat reset. Started new session');
  };

  const languages = [
    { id: 'English', label: 'English', flag: '🇬🇧', script: 'English' },
    { id: 'Tamil', label: 'தமிழ் (Tamil)', flag: '🇮🇳', script: 'தமிழ்' },
    { id: 'Hindi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', script: 'हिन्दी' },
  ];

  // Calculate intelligent responsive placement for chat window relative to bubble
  const getChatWindowStyle = () => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const chatWidth = Math.min(420, windowWidth - 32);
    const chatHeight = Math.min(620, windowHeight - 110);

    let left = position.x - chatWidth + 58;
    if (left < 16) left = 16;
    if (left + chatWidth > windowWidth - 16) left = windowWidth - chatWidth - 16;

    let top = position.y - chatHeight - 12;
    if (top < 16) {
      top = position.y + 68;
    }
    if (top + chatHeight > windowHeight - 16) {
      top = windowHeight - chatHeight - 16;
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${chatWidth}px`,
      height: `${chatHeight}px`
    };
  };

  return (
    <>
      {/* Draggable Moveable Floating Action Bubble */}
      <div
        ref={bubbleRef}
        className={`chatbot-moveable-container ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        title="Hold & Drag anywhere on screen • Tap to open"
      >
        <button
          className={`chatbot-floating-btn ${isOpen ? 'open' : ''} ${isDragging ? 'dragged' : ''}`}
          aria-label="Moveable AI Health Assistant"
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <FaHeartbeat />
          )}
          <span className="drag-move-indicator">
            <FaArrowsAlt />
          </span>
        </button>
      </div>

      {/* Main Interactive ChatGPT/Gemini Chat Window */}
      {isOpen && (
        <div className="chatbot-window glass-card" style={getChatWindowStyle()}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="bot-header-info">
              <div className="bot-avatar-ring">
                <FaRobot />
              </div>
              <div className="bot-header-titles">
                <h4 className="bot-name">TitanVitals AI</h4>
                <span className="bot-sub-lang">
                  <span className="pulse-dot"></span> Active in <strong>{selectedLanguage}</strong>
                </span>
              </div>
            </div>

            <div className="bot-header-actions">
              {/* Language Selector Dropdown Button */}
              <div className="lang-menu-wrapper">
                <button
                  className="lang-header-pill"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  title="Switch Chatbot Language"
                >
                  <FaGlobe /> {selectedLanguage === 'Tamil' ? 'தமிழ்' : (selectedLanguage === 'Hindi' ? 'हिन्दी' : 'EN')}
                </button>

                {showLangMenu && (
                  <div className="lang-dropdown-menu glass-card">
                    <span className="lang-menu-title">Select Chat Language:</span>
                    {languages.map((l) => (
                      <button
                        key={l.id}
                        className={`lang-option-btn ${selectedLanguage === l.id ? 'active' : ''}`}
                        onClick={() => selectLanguage(l.id)}
                      >
                        <span>{l.flag} {l.label}</span>
                        {selectedLanguage === l.id && <FaCheck className="check-cyan" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Chat Log */}
              <button
                className="header-action-btn custom-tooltip-btn"
                onClick={handleExportChat}
                data-tooltip="Export Chat"
                title="Export Chat"
                aria-label="Export Chat"
              >
                <FaDownload />
              </button>

              {/* New / Reset Conversation */}
              <button
                className="header-action-btn custom-tooltip-btn"
                onClick={clearChat}
                data-tooltip="Clear Chat"
                title="Clear Chat"
                aria-label="Clear Chat"
              >
                <FaTrashAlt />
              </button>

              {/* Close Window */}
              <button
                className="header-action-btn bot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                aria-label="Close Chat"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Initial Language Picker Banner (Shown at the beginning) */}
          {!hasChosenLanguage && (
            <div className="language-onboarding-banner">
              <span className="onboarding-prompt">
                🌐 Choose your preferred language:
              </span>
              <div className="onboarding-lang-buttons">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    className={`onboard-btn ${selectedLanguage === l.id ? 'active' : ''}`}
                    onClick={() => selectLanguage(l.id)}
                  >
                    <span>{l.flag} {l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="chatbot-messages-area">
            {messages.map((m, idx) => (
              <div key={m.id} className={`chat-bubble-row ${m.sender}`}>
                <div className="chat-bubble">
                  <p className="bubble-text">
                    {m.text}
                    {streamingMsgId === m.id && <span className="streaming-cursor">▋</span>}
                  </p>

                  <div className="bubble-footer-row">
                    <span className="bubble-time">{m.timestamp}</span>

                    {/* Interactive Message Actions Toolbar (like ChatGPT & Gemini) */}
                    {m.sender === 'bot' && m.text && (
                      <div className="msg-actions-toolbar">
                        {/* Emoji-Free Voice Playback Button */}
                        <button
                          className={`msg-tool-btn ${speakingMsgId === m.id ? 'speaking-active' : ''}`}
                          onClick={() => speakMessage(m.text, m.id)}
                          title={speakingMsgId === m.id ? 'Stop reading' : 'Read aloud (clean voice)'}
                        >
                          {speakingMsgId === m.id ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>

                        {/* Copy Button */}
                        <button
                          className="msg-tool-btn"
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          title="Copy response"
                        >
                          {copiedId === m.id ? <FaCheck className="copied-check" /> : <FaCopy />}
                        </button>

                        {/* Thumbs Up Feedback */}
                        <button
                          className={`msg-tool-btn ${feedback[m.id] === 'up' ? 'active-up' : ''}`}
                          onClick={() => handleFeedback(m.id, 'up')}
                          title="Helpful response"
                        >
                          <FaThumbsUp />
                        </button>

                        {/* Thumbs Down Feedback */}
                        <button
                          className={`msg-tool-btn ${feedback[m.id] === 'down' ? 'active-down' : ''}`}
                          onClick={() => handleFeedback(m.id, 'down')}
                          title="Needs improvement"
                        >
                          <FaThumbsDown />
                        </button>

                        {/* Regenerate Response */}
                        <button
                          className="msg-tool-btn"
                          onClick={() => handleRegenerate(idx)}
                          title="Regenerate response"
                        >
                          <FaRedo />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interactive Dynamic Follow-Up Quick Reply Chips */}
                  {m.sender === 'bot' && m.followUps && m.followUps.length > 0 && !isStreaming && (
                    <div className="msg-follow-ups">
                      <span className="follow-up-label"><FaLightbulb /> Suggested follow-ups:</span>
                      <div className="follow-up-chips-wrap">
                        {m.followUps.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            className="follow-up-chip"
                            onClick={() => executeSendMessage(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row bot">
                <div className="chat-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span className="typing-label">
                    {selectedLanguage === 'Tamil' ? 'டைட்டன்வைட்டல்ஸ் சிந்திக்கிறது...' : (selectedLanguage === 'Hindi' ? 'उत्तर तैयार हो रहा है...' : 'TitanVitals AI is thinking...')}
                  </span>
                </div>
              </div>
            )}

            {/* Interactive Starter Prompt Chips (Shown when chat has only greeting) */}
            {messages.length <= 2 && !loading && (
              <div className="starter-prompts-section">
                <span className="starter-prompts-title">
                  <FaLightbulb /> Quick interactive health topics:
                </span>
                <div className="starter-prompts-grid">
                  {(starterPrompts[selectedLanguage] || starterPrompts.English).map((chip) => (
                    <button
                      key={chip.id}
                      className="starter-chip-btn"
                      onClick={() => executeSendMessage(chip.prompt)}
                    >
                      <span className="starter-chip-text">{chip.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Stop Streaming Banner */}
          {isStreaming && (
            <div className="stop-streaming-bar">
              <button className="stop-streaming-btn" onClick={handleStopStreaming}>
                <FaStop /> Stop Generating
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="chatbot-input-bar">
            <button
              type="button"
              className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceInput}
              title={`Speak in ${selectedLanguage}`}
            >
              <FaMicrophone />
            </button>

            <input
              type="text"
              className="chat-text-field"
              placeholder={placeholders[selectedLanguage] || placeholders.English}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="chat-send-btn"
              disabled={loading || !inputValue.trim()}
              title="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
