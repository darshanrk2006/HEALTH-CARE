import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaCog, 
  FaPalette, 
  FaUserCog, 
  FaHeartbeat, 
  FaRobot, 
  FaBell, 
  FaShieldAlt, 
  FaSignOutAlt, 
  FaCheck, 
  FaUndo, 
  FaTrashAlt, 
  FaDownload, 
  FaSave,
  FaMoon,
  FaSun,
  FaArrowLeft,
  FaExclamationTriangle,
  FaIdCard,
  FaVolumeUp,
  FaGlobe,
  FaSlidersH,
  FaDatabase,
  FaCamera,
  FaUpload,
  FaImage,
  FaMagic,
  FaUserCheck,
  FaLock
} from 'react-icons/fa';
import { ANIMATED_AVATARS, DEFAULT_AVATAR } from '../../constants/avatarCharacters';
import toast from 'react-hot-toast';
import './Settings.css';

export const GLOBAL_COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', display: '🇮🇳 +91 (India)' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', display: '🇺🇸 +1 (USA / Canada)' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', display: '🇬🇧 +44 (UK)' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', display: '🇦🇪 +971 (UAE)' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', display: '🇸🇦 +966 (Saudi Arabia)' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', display: '🇸🇬 +65 (Singapore)' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', display: '🇦🇺 +61 (Australia)' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', display: '🇩🇪 +49 (Germany)' },
  { code: '+33', country: 'France', flag: '🇫🇷', display: '🇫🇷 +33 (France)' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', display: '🇯🇵 +81 (Japan)' },
  { code: '+86', country: 'China', flag: '🇨🇳', display: '🇨🇳 +86 (China)' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', display: '🇰🇷 +82 (South Korea)' },
  { code: '+7', country: 'Russia / Kazakhstan', flag: '🇷🇺', display: '🇷🇺 +7 (Russia)' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', display: '🇧🇷 +55 (Brazil)' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', display: '🇿🇦 +27 (South Africa)' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', display: '🇮🇹 +39 (Italy)' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', display: '🇪🇸 +34 (Spain)' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', display: '🇳🇱 +31 (Netherlands)' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', display: '🇨🇭 +41 (Switzerland)' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', display: '🇸🇪 +46 (Sweden)' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', display: '🇳🇴 +47 (Norway)' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', display: '🇩🇰 +45 (Denmark)' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', display: '🇫🇮 +358 (Finland)' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', display: '🇮🇪 +353 (Ireland)' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', display: '🇳🇿 +64 (New Zealand)' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', display: '🇲🇾 +60 (Malaysia)' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', display: '🇮🇩 +62 (Indonesia)' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', display: '🇵🇭 +63 (Philippines)' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', display: '🇹🇭 +66 (Thailand)' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', display: '🇻🇳 +84 (Vietnam)' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', display: '🇧🇩 +880 (Bangladesh)' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', display: '🇱🇰 +94 (Sri Lanka)' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', display: '🇳🇵 +977 (Nepal)' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', display: '🇵🇰 +92 (Pakistan)' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', display: '🇶🇦 +974 (Qatar)' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', display: '🇰🇼 +965 (Kuwait)' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', display: '🇴🇲 +968 (Oman)' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', display: '🇧🇭 +973 (Bahrain)' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', display: '🇪🇬 +20 (Egypt)' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', display: '🇳🇬 +234 (Nigeria)' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', display: '🇰🇪 +254 (Kenya)' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', display: '🇬🇭 +233 (Ghana)' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', display: '🇲🇽 +52 (Mexico)' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', display: '🇦🇷 +54 (Argentina)' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', display: '🇨🇱 +56 (Chile)' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', display: '🇨🇴 +57 (Colombia)' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', display: '🇵🇪 +51 (Peru)' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', display: '🇹🇷 +90 (Turkey)' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', display: '🇬🇷 +30 (Greece)' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', display: '🇵🇱 +48 (Poland)' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', display: '🇵🇹 +351 (Portugal)' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', display: '🇦🇹 +43 (Austria)' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', display: '🇧🇪 +32 (Belgium)' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', display: '🇨🇿 +420 (Czech Republic)' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', display: '🇭🇺 +36 (Hungary)' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', display: '🇷🇴 +40 (Romania)' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', display: '🇺🇦 +380 (Ukraine)' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', display: '🇮🇱 +972 (Israel)' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', display: '🇯🇴 +962 (Jordan)' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', display: '🇱🇧 +961 (Lebanon)' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', display: '🇭🇰 +852 (Hong Kong)' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', display: '🇹🇼 +886 (Taiwan)' }
];

function splitCountryCodeAndPhone(rawPhone, defaultCode = '+91') {
  if (!rawPhone) return { code: defaultCode, number: '' };
  const trimmed = String(rawPhone).trim();
  for (const item of GLOBAL_COUNTRY_CODES) {
    if (trimmed.startsWith(item.code)) {
      const remaining = trimmed.slice(item.code.length).trim();
      return { code: item.code, number: remaining };
    }
  }
  return { code: defaultCode, number: trimmed.replace(/^\+\d+\s*/, '') };
}

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, updateUserName, updateUserProfile, syncSettingsToMongoDB, mongoConnected } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { 
    settings, 
    updateSetting, 
    updateCategory, 
    resetSettings, 
    clearHealthCache, 
    exportHealthData 
  } = useSettings();

  const initialTab = searchParams.get('tab') || location.state?.tab || 'appearance';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSavingDB, setIsSavingDB] = useState(false);
  const fileInputRef = useRef(null);

  // Sync activeTab if search params or location state change
  useEffect(() => {
    const tabParam = searchParams.get('tab') || location.state?.tab;
    if (tabParam && ['appearance', 'profile', 'vitals', 'ai', 'notifications', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, location.state]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName }, { replace: true });
  };

  // Profile local form state & avatar studio
  const [profileAvatar, setProfileAvatar] = useState(() => user?.avatar || DEFAULT_AVATAR);
  const [avatarGenderFilter, setAvatarGenderFilter] = useState('all'); // 'all', 'boy', 'girl'
  const [profileName, setProfileName] = useState(() => user?.name ? user.name.replace(/^dr\.\s*/i, '').trim() : 'Alex Mercer');
  const [profileHealthId, setProfileHealthId] = useState(() => user?.healthId || 'TV-8942-AI');
  const [profileEmail, setProfileEmail] = useState(() => user?.email || 'alex.mercer@titanvitals.ai');
  const [profileBloodGroup, setProfileBloodGroup] = useState(() => user?.bloodGroup || 'O+');
  
  // Phone and Emergency Contact with International Country Calling Codes
  const initialProfilePhone = settings?.profile?.phone || user?.phone || '+91 98765 43210';
  const parsedProfilePhone = splitCountryCodeAndPhone(initialProfilePhone, '+91');
  const [profileCountryCode, setProfileCountryCode] = useState(parsedProfilePhone.code);
  const [profilePhoneNum, setProfilePhoneNum] = useState(parsedProfilePhone.number);

  const [profileAge, setProfileAge] = useState(() => settings?.profile?.age || user?.age || 32);
  const [emergencyName, setEmergencyName] = useState(() => settings?.profile?.emergencyContactName || user?.emergencyContactName || 'Dr. Evelyn Mercer');

  const initialEmergencyPhone = settings?.profile?.emergencyContactPhone || user?.emergencyContactPhone || '+91 98765 01234';
  const parsedEmergencyPhone = splitCountryCodeAndPhone(initialEmergencyPhone, '+91');
  const [emergencyCountryCode, setEmergencyCountryCode] = useState(parsedEmergencyPhone.code);
  const [emergencyPhoneNum, setEmergencyPhoneNum] = useState(parsedEmergencyPhone.number);

  const [hospitalPref, setHospitalPref] = useState(() => settings?.profile?.hospitalPreference || user?.hospitalPreference || 'Titan Memorial Hospital (Zone 4)');
  const [allergies, setAllergies] = useState(() => settings?.profile?.allergies || user?.allergies || 'Penicillin, Peanuts (Mild)');

  // Handle Photo Upload (Base64 file reader with validation)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setProfileAvatar(base64Url);
      toast.success('Custom photo loaded! Click Save to update profile.');
    };
    reader.readAsDataURL(file);
  };

  const selectAvatar = (char) => {
    setProfileAvatar(char.url);
    toast.success(`Selected character: ${char.name} (${char.genderLabel})`);
  };

  const handleResetAvatar = () => {
    setProfileAvatar(DEFAULT_AVATAR);
    toast('Reset to default avatar');
  };

  const accentColors = [
    { name: 'Cyan Glow', hex: '#00d4ff', label: 'Cyan' },
    { name: 'Hyper Purple', hex: '#7c3aed', label: 'Purple' },
    { name: 'Emerald Bio', hex: '#10b981', label: 'Green' },
    { name: 'Rose Pulse', hex: '#ec4899', label: 'Pink' },
    { name: 'Electric Amber', hex: '#f59e0b', label: 'Orange' },
    { name: 'Bio Blue', hex: '#3b82f6', label: 'Blue' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Please provide a valid name');
      return;
    }

    const fullProfilePhone = profilePhoneNum.trim() ? `${profileCountryCode} ${profilePhoneNum.trim()}` : '';
    const fullEmergencyPhone = emergencyPhoneNum.trim() ? `${emergencyCountryCode} ${emergencyPhoneNum.trim()}` : '';

    setIsSavingDB(true);
    toast.loading('Saving Patient Profile & Identity...', { id: 'db-save' });

    try {
      const updatedData = {
        name: profileName.trim(),
        email: profileEmail.trim(),
        healthId: profileHealthId.trim(),
        bloodGroup: profileBloodGroup,
        avatar: profileAvatar,
        phone: fullProfilePhone,
        age: profileAge,
        emergencyContactName: emergencyName,
        emergencyContactPhone: fullEmergencyPhone,
        hospitalPreference: hospitalPref,
        allergies: allergies,
        settings: settings
      };

      updateCategory('profile', {
        healthId: profileHealthId.trim(),
        phone: fullProfilePhone,
        age: profileAge,
        emergencyContactName: emergencyName,
        emergencyContactPhone: fullEmergencyPhone,
        hospitalPreference: hospitalPref,
        allergies: allergies
      });

      await updateUserProfile(updatedData);
      setIsSavingDB(false);
      toast.success('Patient Profile & Health ID saved successfully!', { id: 'db-save' });
    } catch (err) {
      setIsSavingDB(false);
      toast.error('Failed to save profile changes', { id: 'db-save' });
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success('Signed out of TitanVitals successfully');
    navigate('/login');
  };

  return (
    <div className="settings-page-container">
      {/* Top Header Row */}
      <div className="settings-header-banner">
        <div className="settings-header-left">
          <button 
            className="settings-back-btn" 
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="settings-title-row">
              <h1 className="settings-main-title">
                <FaCog className="settings-title-icon" /> Settings & Health Preferences
              </h1>
              <div className="db-live-badge">
                <FaShieldAlt className="db-icon text-cyan" />
                <span>Cloud Sync: <strong>Active & Encrypted</strong></span>
              </div>
            </div>
            <p className="settings-subtitle">Customize appearance, telemetry units, AI assistant, and patient health identity</p>
          </div>
        </div>

        <div className="settings-header-right">
          <button 
            className="header-signout-btn" 
            onClick={handleSignOut}
            title="Sign Out of Your Account"
          >
            <FaSignOutAlt className="signout-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Tabs + Content Area */}
      <div className="settings-layout-grid">
        {/* Navigation Sidebar */}
        <aside className="settings-sidebar glass-card">
          <nav className="settings-nav-list">
            <button 
              className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => handleTabChange('appearance')}
            >
              <FaPalette className="nav-item-icon" />
              <span>Appearance & Theme</span>
            </button>

            <button 
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <FaUserCog className="nav-item-icon" />
              <span>Patient Profile & ID</span>
            </button>

            <button 
              className={`settings-nav-item ${activeTab === 'vitals' ? 'active' : ''}`}
              onClick={() => handleTabChange('vitals')}
            >
              <FaHeartbeat className="nav-item-icon" />
              <span>Vitals & Units</span>
            </button>

            <button 
              className={`settings-nav-item ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => handleTabChange('ai')}
            >
              <FaRobot className="nav-item-icon" />
              <span>AI Health Assistant</span>
            </button>

            <button 
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <FaBell className="nav-item-icon" />
              <span>Alerts & Notifications</span>
            </button>

            <button 
              className={`settings-nav-item danger-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <FaShieldAlt className="nav-item-icon" />
              <span>Security & Sign Out</span>
            </button>
          </nav>

          {/* Quick User Badge at bottom of sidebar */}
          <div 
            className="sidebar-patient-card clickable-sidebar-card"
            onClick={() => handleTabChange('profile')}
            title="Click to edit profile picture and health identity"
          >
            <div className="sidebar-avatar-wrap">
              <img 
                src={profileAvatar || user?.avatar || DEFAULT_AVATAR} 
                alt="User" 
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
            </div>
            <div className="sidebar-patient-info">
              <span className="sidebar-patient-name">{user?.name || profileName}</span>
              <span className="sidebar-patient-id">{user?.healthId || 'TV-8942-AI'}</span>
            </div>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="settings-content-panel glass-card">
          
          {/* TAB 1: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h2><FaPalette /> Theme & Visual Customization</h2>
                <p>Changes apply instantly across all pages and charts</p>
              </div>

              {/* Theme Mode Selector */}
              <div className="setting-block">
                <label className="setting-label">Display Mode</label>
                <div className="theme-mode-grid">
                  <div 
                    className={`mode-card ${settings.appearance.themeMode === 'dark' ? 'active' : ''}`}
                    onClick={() => updateSetting('appearance', 'themeMode', 'dark')}
                  >
                    <div className="mode-preview dark-preview">
                      <FaMoon />
                    </div>
                    <span className="mode-title">Futuristic Dark</span>
                    <span className="mode-sub">Deep dark UI with glowing accents</span>
                  </div>

                  <div 
                    className={`mode-card ${settings.appearance.themeMode === 'light' ? 'active' : ''}`}
                    onClick={() => updateSetting('appearance', 'themeMode', 'light')}
                  >
                    <div className="mode-preview light-preview">
                      <FaSun />
                    </div>
                    <span className="mode-title">Clean Light</span>
                    <span className="mode-sub">High clarity crisp hospital white</span>
                  </div>

                  <div 
                    className={`mode-card ${settings.appearance.themeMode === 'oled' ? 'active' : ''}`}
                    onClick={() => updateSetting('appearance', 'themeMode', 'oled')}
                  >
                    <div className="mode-preview oled-preview">
                      <FaSlidersH />
                    </div>
                    <span className="mode-title">OLED Midnight</span>
                    <span className="mode-sub">Pure pitch black power-saving</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Accent Color Picker */}
              <div className="setting-block">
                <label className="setting-label">Primary Neon Accent Color</label>
                <p className="setting-hint">Updates header glows, icons, buttons, and telemetry borders in real-time</p>
                <div className="color-palette-grid">
                  {accentColors.map((color) => {
                    const isSelected = settings.appearance.accentColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        className={`color-swatch-btn ${isSelected ? 'selected' : ''}`}
                        style={{ '--swatch-color': color.hex }}
                        onClick={() => {
                          updateCategory('appearance', {
                            accentColor: color.hex,
                            accentName: color.name
                          });
                          toast.success(`Theme accent set to ${color.name}`);
                        }}
                      >
                        <span className="color-swatch-circle" style={{ backgroundColor: color.hex }}>
                          {isSelected && <FaCheck className="swatch-check" />}
                        </span>
                        <span className="swatch-name">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface Font Scaling */}
              <div className="setting-block">
                <label className="setting-label">Interface Font Scaling</label>
                <div className="pill-options-row">
                  {[
                    { id: 'compact', label: 'Compact (14px)', desc: 'High information density' },
                    { id: 'normal', label: 'Standard (16px)', desc: 'Balanced default readability' },
                    { id: 'large', label: 'Large (18px)', desc: 'Enhanced accessibility & size' },
                  ].map((size) => (
                    <button
                      key={size.id}
                      className={`pill-option-btn ${settings.appearance.fontSize === size.id ? 'active' : ''}`}
                      onClick={() => updateSetting('appearance', 'fontSize', size.id)}
                    >
                      <span className="pill-title">{size.label}</span>
                      <span className="pill-desc">{size.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion & Animations */}
              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Reduced Motion</span>
                  <p className="setting-hint">Disable smooth sliding and floating animations</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.appearance.reducedMotion}
                    onChange={(e) => updateSetting('appearance', 'reducedMotion', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT PROFILE & AVATAR STUDIO */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h2><FaUserCog /> Patient Health Identity & Profile Picture</h2>
                <p>Personal medical profile & animated avatar synced across TitanVitals diagnostics</p>
              </div>

              {/* PROFILE PICTURE & AVATAR CHARACTER STUDIO */}
              <div className="profile-pic-studio-card glass-panel">
                <div className="studio-header">
                  <div className="studio-title-block">
                    <h3><FaImage /> Profile Picture Studio</h3>
                    <p>Select an animated character (3 Boys & 3 Girls) or upload your own custom photo</p>
                  </div>
                </div>

                <div className="active-avatar-preview-row">
                  <div className="avatar-preview-main">
                    <div className="avatar-glow-ring">
                      <img 
                        src={profileAvatar} 
                        alt="Current Profile Avatar" 
                        className="active-avatar-img"
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                      />
                      <span className="avatar-active-badge" title="Active Avatar">
                        <FaCheck />
                      </span>
                    </div>
                    <div className="avatar-preview-meta">
                      <span className="active-avatar-title">Active Profile Picture</span>
                      <span className="active-avatar-subtitle">
                        {ANIMATED_AVATARS.find(a => a.url === profileAvatar)?.name 
                          ? `Animated Character: ${ANIMATED_AVATARS.find(a => a.url === profileAvatar).name} (${ANIMATED_AVATARS.find(a => a.url === profileAvatar).genderLabel})`
                          : 'Custom Photo / Profile Avatar'}
                      </span>
                    </div>
                  </div>

                  {/* Photo Upload & Reset Buttons */}
                  <div className="avatar-upload-actions">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      accept="image/png, image/jpeg, image/webp, image/gif" 
                      style={{ display: 'none' }} 
                    />
                    
                    <button 
                      type="button" 
                      className="upload-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaCamera /> Upload Custom Photo
                    </button>

                    <button 
                      type="button" 
                      className="reset-avatar-btn"
                      onClick={handleResetAvatar}
                      title="Reset to default character"
                    >
                      <FaUndo /> Reset
                    </button>
                  </div>
                </div>

                {/* ANIMATED CHARACTER AVATARS (3 BOYS & 3 GIRLS) */}
                <div className="animated-characters-wrapper">
                  <div className="characters-filter-bar">
                    <span className="characters-section-label">
                      <FaMagic /> Animated Character Avatars:
                    </span>
                    <div className="character-gender-filters">
                      <button 
                        type="button"
                        className={`filter-pill-btn ${avatarGenderFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setAvatarGenderFilter('all')}
                      >
                        All (6)
                      </button>
                      <button 
                        type="button"
                        className={`filter-pill-btn ${avatarGenderFilter === 'boy' ? 'active' : ''}`}
                        onClick={() => setAvatarGenderFilter('boy')}
                      >
                        Boys 👦 (3)
                      </button>
                      <button 
                        type="button"
                        className={`filter-pill-btn ${avatarGenderFilter === 'girl' ? 'active' : ''}`}
                        onClick={() => setAvatarGenderFilter('girl')}
                      >
                        Girls 👧 (3)
                      </button>
                    </div>
                  </div>

                  <div className="animated-avatars-grid">
                    {ANIMATED_AVATARS
                      .filter((char) => avatarGenderFilter === 'all' || char.gender === avatarGenderFilter)
                      .map((char) => {
                        const isSelected = profileAvatar === char.url;
                        return (
                          <div 
                            key={char.id}
                            className={`character-avatar-card ${isSelected ? 'selected' : ''} ${char.animationType}`}
                            style={{ '--char-glow': char.glowColor }}
                            onClick={() => selectAvatar(char)}
                          >
                            <div className="char-avatar-img-wrap" style={{ background: char.bgGradient }}>
                              <img src={char.url} alt={char.name} className="char-avatar-img" />
                              {isSelected && (
                                <div className="char-selected-check">
                                  <FaCheck />
                                </div>
                              )}
                            </div>
                            <div className="char-info-block">
                              <div className="char-name-gender">
                                <span className="char-name">{char.name}</span>
                                <span className={`char-gender-tag ${char.gender}`}>{char.genderLabel}</span>
                              </div>
                              <span className="char-tagline">{char.tagline}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* PATIENT PROFILE FORM */}
              <form onSubmit={handleSaveProfile} className="profile-settings-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Full Patient Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      required
                    />
                  </div>

                  <div className="form-field readonly-field-group">
                    <label className="label-with-badge">
                      <span>Patient Health ID / Medical ID</span>
                      <span className="immutable-pill-badge">
                        <FaLock className="lock-mini-ico" /> System Assigned
                      </span>
                    </label>
                    <div className="readonly-input-box">
                      <input 
                        type="text" 
                        value={user?.healthId || profileHealthId || 'TV-6035-AI'} 
                        readOnly
                        disabled
                        className="readonly-locked-input"
                        title="Permanent Unique Medical Health Identifier (Immutable)"
                      />
                      <FaShieldAlt className="readonly-shield-ico" />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="alex.mercer@titanvitals.ai"
                    />
                  </div>

                  <div className="form-field">
                    <label>Mobile / Phone Number</label>
                    <div className="phone-input-group">
                      <select 
                        className="country-code-select"
                        value={profileCountryCode}
                        onChange={(e) => setProfileCountryCode(e.target.value)}
                        aria-label="Country Calling Code"
                      >
                        {GLOBAL_COUNTRY_CODES.map((c, i) => (
                          <option key={`prof-cc-${c.code}-${i}`} value={c.code}>
                            {c.display}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="tel" 
                        className="phone-number-input"
                        value={profilePhoneNum} 
                        onChange={(e) => setProfilePhoneNum(e.target.value)}
                        placeholder="98765 43210"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Patient Age</label>
                    <input 
                      type="number" 
                      value={profileAge} 
                      onChange={(e) => setProfileAge(Number(e.target.value))}
                      min="1" 
                      max="125"
                    />
                  </div>
                </div>

                {/* Blood Group Quick Picker */}
                <div className="form-field">
                  <label>Blood Group</label>
                  <div className="blood-group-pills">
                    {bloodGroups.map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        className={`bg-pill ${profileBloodGroup === bg ? 'active' : ''}`}
                        onClick={() => setProfileBloodGroup(bg)}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact & Hospital */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Emergency Contact Person</label>
                    <input 
                      type="text" 
                      value={emergencyName} 
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Dr. Evelyn Mercer"
                    />
                  </div>

                  <div className="form-field">
                    <label>Emergency Contact Mobile</label>
                    <div className="phone-input-group">
                      <select 
                        className="country-code-select"
                        value={emergencyCountryCode}
                        onChange={(e) => setEmergencyCountryCode(e.target.value)}
                        aria-label="Emergency Country Calling Code"
                      >
                        {GLOBAL_COUNTRY_CODES.map((c, i) => (
                          <option key={`em-cc-${c.code}-${i}`} value={c.code}>
                            {c.display}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="tel" 
                        className="phone-number-input"
                        value={emergencyPhoneNum} 
                        onChange={(e) => setEmergencyPhoneNum(e.target.value)}
                        placeholder="98765 01234"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <label>Preferred Hospital / Clinical Center</label>
                  <input 
                    type="text" 
                    value={hospitalPref} 
                    onChange={(e) => setHospitalPref(e.target.value)}
                    placeholder="e.g. Titan Memorial Hospital (Zone 4)"
                  />
                </div>

                <div className="form-field">
                  <label>Known Allergies & Medical Flags</label>
                  <input 
                    type="text" 
                    value={allergies} 
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts (Mild)"
                  />
                </div>

                <div className="form-actions-row">
                  <button type="submit" className="save-settings-btn" disabled={isSavingDB}>
                    <FaSave /> {isSavingDB ? 'Saving Profile & Identity...' : 'Save Profile & Health ID'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: VITALS & TELEMETRY UNITS */}
          {activeTab === 'vitals' && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h2><FaHeartbeat /> Telemetry Units & Vital Thresholds</h2>
                <p>Configure physiological measurement standards and safety limits</p>
              </div>

              {/* Units Selection */}
              <div className="form-grid-2">
                <div className="setting-block">
                  <label className="setting-label">Blood Pressure Measurement Unit</label>
                  <div className="pill-options-row">
                    <button 
                      className={`pill-option-btn ${settings.vitals.bpUnit === 'mmHg' ? 'active' : ''}`}
                      onClick={() => updateSetting('vitals', 'bpUnit', 'mmHg')}
                    >
                      <span className="pill-title">mmHg</span>
                      <span className="pill-desc">Millimeters of mercury (Standard)</span>
                    </button>
                    <button 
                      className={`pill-option-btn ${settings.vitals.bpUnit === 'kPa' ? 'active' : ''}`}
                      onClick={() => updateSetting('vitals', 'bpUnit', 'kPa')}
                    >
                      <span className="pill-title">kPa</span>
                      <span className="pill-desc">Kilopascals (SI Metric)</span>
                    </button>
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Body Temperature Unit</label>
                  <div className="pill-options-row">
                    <button 
                      className={`pill-option-btn ${settings.vitals.tempUnit === 'C' ? 'active' : ''}`}
                      onClick={() => updateSetting('vitals', 'tempUnit', 'C')}
                    >
                      <span className="pill-title">°C (Celsius)</span>
                      <span className="pill-desc">Metric scale (37.0°C normal)</span>
                    </button>
                    <button 
                      className={`pill-option-btn ${settings.vitals.tempUnit === 'F' ? 'active' : ''}`}
                      onClick={() => updateSetting('vitals', 'tempUnit', 'F')}
                    >
                      <span className="pill-title">°F (Fahrenheit)</span>
                      <span className="pill-desc">Imperial scale (98.6°F normal)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wearable Auto-Sync Interval */}
              <div className="setting-block">
                <label className="setting-label">Wearable Telemetry Auto-Sync Rate</label>
                <div className="pill-options-row">
                  {[
                    { id: '10s', label: '10 Seconds', desc: 'Real-time live telemetry' },
                    { id: '30s', label: '30 Seconds', desc: 'Optimal battery & responsiveness' },
                    { id: '60s', label: '1 Minute', desc: 'Standard background refresh' },
                    { id: 'manual', label: 'Manual Only', desc: 'Sync on button click' },
                  ].map((rate) => (
                    <button
                      key={rate.id}
                      className={`pill-option-btn ${settings.vitals.autoSyncInterval === rate.id ? 'active' : ''}`}
                      onClick={() => {
                        updateSetting('vitals', 'autoSyncInterval', rate.id);
                        toast.success(`Sync interval set to ${rate.label}`);
                      }}
                    >
                      <span className="pill-title">{rate.label}</span>
                      <span className="pill-desc">{rate.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Heart Rate Safety Thresholds */}
              <div className="setting-block">
                <label className="setting-label">Heart Rate Emergency Alert Range</label>
                <p className="setting-hint">Trigger warnings if pulse goes outside this physiological window</p>
                <div className="thresholds-row">
                  <div className="threshold-item">
                    <span>Bradycardia Low Threshold (BPM):</span>
                    <input 
                      type="number" 
                      value={settings.vitals.hrAlertMin}
                      onChange={(e) => updateSetting('vitals', 'hrAlertMin', Number(e.target.value))}
                      min="40" 
                      max="70"
                    />
                  </div>
                  <div className="threshold-item">
                    <span>Tachycardia High Threshold (BPM):</span>
                    <input 
                      type="number" 
                      value={settings.vitals.hrAlertMax}
                      onChange={(e) => updateSetting('vitals', 'hrAlertMax', Number(e.target.value))}
                      min="90" 
                      max="160"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI HEALTH ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h2><FaRobot /> Gemini Health AI & Chatbot Engine</h2>
                <p>Control language comprehension, clinical terminology depth, and voice</p>
              </div>

              {/* Default AI Language */}
              <div className="setting-block">
                <label className="setting-label">Default Consultation Language</label>
                <div className="pill-options-row">
                  {[
                    { id: 'English', label: '🇬🇧 English', desc: 'Full medical terminology' },
                    { id: 'Tamil', label: '🇮🇳 தமிழ் (Tamil)', desc: 'தமிழ் மருத்துவ வழிகாட்டல்' },
                    { id: 'Hindi', label: '🇮🇳 हिन्दी (Hindi)', desc: 'हिन्दी स्वास्थ्य परामर्श' },
                    { id: 'Spanish', label: '🇪🇸 Español', desc: 'Consulta médica en español' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      className={`pill-option-btn ${settings.ai.defaultLanguage === lang.id ? 'active' : ''}`}
                      onClick={() => {
                        updateSetting('ai', 'defaultLanguage', lang.id);
                        toast.success(`Default AI language set to ${lang.id}`);
                      }}
                    >
                      <span className="pill-title">{lang.label}</span>
                      <span className="pill-desc">{lang.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Depth */}
              <div className="setting-block">
                <label className="setting-label">Diagnostic Explanation Depth</label>
                <div className="pill-options-row">
                  {[
                    { id: 'concise', label: 'Concise / Plain English', desc: 'Simple bullet points and quick steps' },
                    { id: 'standard', label: 'Standard Clinical', desc: 'Clear diagnosis with recommended action' },
                    { id: 'detailed', label: 'Comprehensive Medical', desc: 'Differential diagnoses & scientific rationale' },
                  ].map((depth) => (
                    <button
                      key={depth.id}
                      className={`pill-option-btn ${settings.ai.clinicalDepth === depth.id ? 'active' : ''}`}
                      onClick={() => updateSetting('ai', 'clinicalDepth', depth.id)}
                    >
                      <span className="pill-title">{depth.label}</span>
                      <span className="pill-desc">{depth.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Voice & OCR Toggles */}
              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Auto Voice Read-Aloud (Text-to-Speech)</span>
                  <p className="setting-hint">Automatically speak responses upon receiving clinical advice</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.ai.voiceAutoSpeak}
                    onChange={(e) => updateSetting('ai', 'voiceAutoSpeak', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Auto-Scan Uploaded Lab Reports</span>
                  <p className="setting-hint">Instantly start OCR & AI analysis on image drop</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.ai.autoScanReports}
                    onChange={(e) => updateSetting('ai', 'autoScanReports', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: ALERTS & NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h2><FaBell /> Health Alerts & Push Notifications</h2>
                <p>Stay informed regarding local outbreaks, critical vitals, and medications</p>
              </div>

              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Local Epidemic & Air Quality (AQI) Alerts</span>
                  <p className="setting-hint">Warn when local environmental and contagion risks escalate</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.localEpidemicAlerts}
                    onChange={(e) => updateSetting('notifications', 'localEpidemicAlerts', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Critical Vitals Audio Chime</span>
                  <p className="setting-hint">Play alert sound if blood pressure or heart rate exceeds safe bounds</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.criticalVitalSound}
                    onChange={(e) => updateSetting('notifications', 'criticalVitalSound', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Daily Medication Timers</span>
                  <p className="setting-hint">Receive reminder notifications for prescribed daily dosages</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.medicationReminders}
                    onChange={(e) => updateSetting('notifications', 'medicationReminders', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-block toggle-row">
                <div>
                  <span className="setting-label">Routine Health Checkup Prompts</span>
                  <p className="setting-hint">Weekly AI-generated wellness review notifications</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.dailyCheckupPrompt}
                    onChange={(e) => updateSetting('notifications', 'dailyCheckupPrompt', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & SIGN OUT */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h2><FaShieldAlt /> Account Security & Session Management</h2>
                <p>Manage active sessions, backup telemetry, and sign out</p>
              </div>

              {/* Highlighted Sign Out Box */}
              <div className="danger-zone-box glass-card">
                <div className="danger-zone-header">
                  <div className="danger-icon-circle">
                    <FaSignOutAlt />
                  </div>
                  <div>
                    <h3>Sign Out of TitanVitals</h3>
                    <p>Safely terminate active session and return to the login screen</p>
                  </div>
                </div>
                <button 
                  className="primary-signout-btn" 
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt /> Sign Out Now
                </button>
              </div>

              {/* Data & Privacy Actions */}
              <div className="data-management-block">
                <h4 className="sub-section-title">Data & Cache Management</h4>
                
                <div className="data-action-item">
                  <div>
                    <span className="action-title">Export Health Record & Settings</span>
                    <span className="action-desc">Download a complete JSON snapshot of your vitals and profile</span>
                  </div>
                  <button 
                    className="secondary-action-btn"
                    onClick={() => exportHealthData(user)}
                  >
                    <FaDownload /> Export Data
                  </button>
                </div>

                <div className="data-action-item">
                  <div>
                    <span className="action-title">Clear Local Telemetry & Chat Cache</span>
                    <span className="action-desc">Purge temporary offline chatbot storage and cached vitals</span>
                  </div>
                  <button 
                    className="secondary-action-btn warning"
                    onClick={clearHealthCache}
                  >
                    <FaTrashAlt /> Clear Cache
                  </button>
                </div>

                <div className="data-action-item">
                  <div>
                    <span className="action-title">Reset All Settings to Factory Defaults</span>
                    <span className="action-desc">Restore original appearance, units, and notifications</span>
                  </div>
                  <button 
                    className="secondary-action-btn warning"
                    onClick={resetSettings}
                  >
                    <FaUndo /> Reset Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Settings;
