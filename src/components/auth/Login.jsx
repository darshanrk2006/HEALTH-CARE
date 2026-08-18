import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaMoon,
  FaSun,
  FaKey,
  FaRedo,
  FaDatabase,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserShield,
  FaCheckCircle,
  FaPaste,
  FaClipboardCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Login.css';

// ========================================================
// SECURE 6-BOX OTP INPUT WITH NATIVE & CLIPBOARD AUTO-FILL
// ========================================================
const OtpSixBoxInput = ({ value, onChange, onComplete, disabled }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, char) => {
    const clean = char.replace(/\D/g, '');
    if (!clean) return;
    
    // Handle multi-character paste or fast typing
    if (clean.length > 1) {
      const full = clean.slice(0, 6);
      onChange(full);
      if (full.length === 6 && onComplete) onComplete(full);
      const nextIdx = Math.min(full.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const valArr = (value || '').split('');
    valArr[index] = clean;
    const newOtp = valArr.join('').slice(0, 6);
    onChange(newOtp);

    if (newOtp.length === 6 && onComplete) {
      onComplete(newOtp);
    } else if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!value[index]) {
        if (index > 0 && inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        const valArr = (value || '').split('');
        valArr[index] = '';
        onChange(valArr.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted);
      }
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
    }
  };

  const handleClipboardPasteBtn = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const clean = text.replace(/\D/g, '').slice(0, 6);
        if (clean) {
          onChange(clean);
          if (clean.length === 6 && onComplete) {
            onComplete(clean);
          }
          toast.success('Pasted code from clipboard!', { id: 'paste', duration: 2500 });
        } else {
          toast.error('No numeric code found on clipboard', { id: 'paste' });
        }
      }
    } catch (err) {
      toast.error('Clipboard access not granted. Please paste directly into the boxes.', { id: 'paste' });
    }
  };

  return (
    <div className="secure-otp-container">
      <div className="otp-boxes-wrapper" onPaste={handlePaste}>
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            className={`otp-digit-box ${value && value[idx] ? 'filled' : ''}`}
            value={value && value[idx] ? value[idx] : ''}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            maxLength={6}
            disabled={disabled}
            autoFocus={idx === 0}
          />
        ))}
      </div>
      <div className="otp-helper-actions">
        <button
          type="button"
          className="otp-clipboard-btn"
          onClick={handleClipboardPasteBtn}
          title="Paste 6-digit code copied from your email"
        >
          <FaClipboardCheck className="clipboard-icon" /> Paste from Clipboard
        </button>
      </div>
    </div>
  );
};

const COUNTRIES = [
  { code: '+91', label: 'India (+91)', flag: '🇮🇳', name: 'India' },
  { code: '+1', label: 'USA / Canada (+1)', flag: '🇺🇸', name: 'USA' },
  { code: '+44', label: 'UK (+44)', flag: '🇬🇧', name: 'UK' },
  { code: '+971', label: 'UAE (+971)', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', label: 'Singapore (+65)', flag: '🇸🇬', name: 'Singapore' },
  { code: '+61', label: 'Australia (+61)', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', label: 'Germany (+49)', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', label: 'France (+33)', flag: '🇫🇷', name: 'France' },
  { code: '+81', label: 'Japan (+81)', flag: '🇯🇵', name: 'Japan' },
  { code: '+966', label: 'Saudi Arabia (+966)', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+60', label: 'Malaysia (+60)', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+880', label: 'Bangladesh (+880)', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', label: 'Sri Lanka (+94)', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', label: 'Nepal (+977)', flag: '🇳🇵', name: 'Nepal' },
  { code: '+234', label: 'Nigeria (+234)', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+27', label: 'South Africa (+27)', flag: '🇿🇦', name: 'South Africa' },
  { code: '+55', label: 'Brazil (+55)', flag: '🇧🇷', name: 'Brazil' }
];

const Login = () => {
  const navigate = useNavigate();
  const {
    login,
    loginWithGoogle,
    signup,
    sendSignupOtp,
    verifySignupOtp,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    mongoConnected
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Forgot Password Flow States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'new_password'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotResendTimer, setForgotResendTimer] = useState(60);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Countdown timer for Resend OTP (for both Signup & Forgot Password)
  useEffect(() => {
    let interval = null;
    if (isOtpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (isForgotMode && forgotStep === 'otp' && forgotResendTimer > 0) {
      interval = setInterval(() => {
        setForgotResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, resendTimer, isForgotMode, forgotStep, forgotResendTimer]);

  // Handle Login & Send OTP on Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      // Step 1: Send OTP to email
      toast.loading('Generating verification code...', { id: 'auth' });
      try {
        const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';
        const res = await sendSignupOtp({
          name: name.trim() || 'Alex Mercer',
          email: email.trim(),
          password,
          bloodGroup,
          phone: fullPhone
        });
        setIsOtpStep(true);
        setResendTimer(60);
        toast.success(`Verification code sent to ${email.trim()}! Please check your email inbox.`, { id: 'auth', duration: 6000 });
      } catch (err) {
        // error already toasted in AuthContext
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standard strict database login
      toast.loading('Verifying credentials...', { id: 'auth' });
      try {
        await login(email.trim(), password);
        toast.success('Login Successful! Welcome to TitanVitals.', { id: 'auth' });
        navigate('/dashboard');
      } catch (err) {
        // error already toasted
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle OTP Verification Step for Signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      toast.error('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    toast.loading('Verifying code & activating patient account...', { id: 'auth' });

    try {
      await verifySignupOtp(email.trim(), otp.trim());
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
    }
  };

  // Resend OTP for Signup
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    toast.loading('Resending verification code...', { id: 'auth' });
    try {
      const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';
      await sendSignupOtp({
        name: name.trim() || 'Alex Mercer',
        email: email.trim(),
        password,
        bloodGroup,
        phone: fullPhone
      });
      setIsLoading(false);
      setResendTimer(60);
    } catch (err) {
      setIsLoading(false);
    }
  };

  // ============================================
  // FORGOT PASSWORD HANDLERS
  // ============================================

  // Open Forgot Password Dialog
  const handleOpenForgotPassword = () => {
    setIsForgotMode(true);
    setForgotStep('email');
    setForgotEmail(email.trim());
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Step 1: Send Forgot Password OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your registered email address');
      return;
    }

    setIsLoading(true);
    toast.loading('Checking account and sending reset code...', { id: 'auth' });
    try {
      await sendForgotPasswordOtp(forgotEmail.trim());
      setIsLoading(false);
      setForgotStep('otp');
      setForgotResendTimer(60);
    } catch (err) {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Forgot Password OTP
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    toast.loading('Verifying code...', { id: 'auth' });
    try {
      await verifyForgotPasswordOtp(forgotEmail.trim(), forgotOtp.trim());
      setIsLoading(false);
      setForgotStep('new_password');
    } catch (err) {
      setIsLoading(false);
    }
  };

  // Resend OTP for Forgot Password
  const handleForgotResendOtp = async () => {
    if (forgotResendTimer > 0) return;
    setIsLoading(true);
    toast.loading('Resending password reset code...', { id: 'auth' });
    try {
      await sendForgotPasswordOtp(forgotEmail.trim());
      setIsLoading(false);
      setForgotResendTimer(60);
    } catch (err) {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password & Auto-login
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter and confirm your new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setIsLoading(true);
    toast.loading('Updating password in database...', { id: 'auth' });
    try {
      await resetPassword(forgotEmail.trim(), forgotOtp.trim(), newPassword);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
    }
  };

  // Reset all forgot password state and return to login
  const handleCancelForgotPassword = () => {
    setIsForgotMode(false);
    setForgotStep('email');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Real Google OAuth Popup
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      toast.loading('Authenticating with Google...', { id: 'auth' });
      try {
        await loginWithGoogle(tokenResponse);
        setIsLoading(false);
        navigate('/dashboard');
      } catch (e) {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.warn('Google OAuth prompt error:', error);
      setIsLoading(false);
      toast.error('Google sign-in was cancelled');
    }
  });

  return (
    <div className="login-page-container">
      {/* Ambient background glows */}
      <div className="login-bg-glow glow-cyan"></div>
      <div className="login-bg-glow glow-purple"></div>

      {/* Top Floating Bar */}
      <div className="login-top-bar">
        <div className="db-live-badge">
          <FaShieldAlt className="db-icon" />
          <span>Secure Encrypted Health Portal</span>
        </div>

        <div className="login-top-right-actions">
          <button
            type="button"
            className="login-admin-portal-btn"
            onClick={() => navigate('/admin/login')}
            title="Hospital & Beds Administration Command Portal"
          >
            <FaUser className="admin-btn-icon" />
            <span>Admin Portal</span>
          </button>

          <button
            className="login-theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <FaMoon className="theme-icon moon-icon" /> : <FaSun className="theme-icon sun-icon" />}
          </button>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className={`login-card glass-card ${isSignUp ? 'signup-card' : ''}`}>
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="shield-icon-wrapper">
            <FaShieldAlt className="shield-brand-icon" />
            <span className="shield-inner-dot"></span>
          </div>
          <div className="brand-text-block">
            <h1 className="brand-title-text">TitanVitals</h1>
            <span className="nxt-gen-pill">nxt Gen AI</span>
          </div>
        </div>

        {/* SCREENS: FORGOT PASSWORD FLOW / SIGNUP OTP / MAIN AUTH */}
        {isForgotMode ? (
          /* ============================================
             FORGOT PASSWORD 3-STEP FLOW
             ============================================ */
          <div className="forgot-password-section">
            {forgotStep === 'email' && (
              <>
                <div className="login-subheading-group">
                  <h2 className="welcome-heading">Reset Password</h2>
                  <p className="welcome-caption">
                    Enter your registered email address.<br />
                    We'll verify your account and send a 6-digit code.
                  </p>
                </div>

                <form onSubmit={handleForgotSendOtp} className="login-form">
                  <div className="form-field-group">
                    <label className="field-label label-email">
                      <FaEnvelope className="field-label-icon icon-cyan" />
                      <span className="field-label-text label-email-text">Registered Email Address</span>
                    </label>
                    <div className="pill-input-wrapper input-wrapper-email">
                      <FaEnvelope className="field-prefix-icon icon-cyan" />
                      <input
                        type="email"
                        className="pill-input has-prefix-icon input-email"
                        placeholder="user@titanvitals.ai"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="primary-login-btn"
                    disabled={isLoading || !forgotEmail.trim()}
                  >
                    <span>Send Verification Code</span>
                    <FaArrowRight className="login-arrow-icon" />
                  </button>

                  <button
                    type="button"
                    className="back-to-signup-btn"
                    onClick={handleCancelForgotPassword}
                  >
                    ← Back to Login
                  </button>
                </form>
              </>
            )}

            {forgotStep === 'otp' && (
              <>
                <div className="login-subheading-group">
                  <h2 className="welcome-heading">Verify Reset Code</h2>
                  <p className="welcome-caption">
                    Enter the 6-digit verification code sent to<br />
                    <strong className="otp-email-badge">{forgotEmail}</strong>
                  </p>
                </div>

                <form onSubmit={handleForgotVerifyOtp} className="login-form">
                  <div className="form-field-group">
                    <label className="field-label">6-Digit Reset Code</label>
                    <OtpSixBoxInput 
                      value={forgotOtp}
                      onChange={setForgotOtp}
                      onComplete={(fullCode) => {
                        handleForgotVerifyOtp({ preventDefault: () => {} });
                      }}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-login-btn"
                    disabled={isLoading || forgotOtp.length < 6}
                  >
                    <span>Verify Code</span>
                    <FaArrowRight className="login-arrow-icon" />
                  </button>

                  <div className="otp-resend-row">
                    {forgotResendTimer > 0 ? (
                      <span className="resend-timer-text">Resend code in <strong>{forgotResendTimer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        className="resend-code-btn"
                        onClick={handleForgotResendOtp}
                        disabled={isLoading}
                      >
                        <FaRedo className="resend-icon" /> Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="back-to-signup-btn"
                    onClick={() => setForgotStep('email')}
                  >
                    ← Back to Edit Email
                  </button>
                </form>
              </>
            )}

            {forgotStep === 'new_password' && (
              <>
                <div className="login-subheading-group">
                  <h2 className="welcome-heading">Set New Password</h2>
                  <p className="welcome-caption">
                    Create a new secure password for<br />
                    <strong className="text-cyan">{forgotEmail}</strong>
                  </p>
                </div>

                <form onSubmit={handleForgotResetPassword} className="login-form">
                  <div className="form-field-group">
                    <label className="field-label label-password">
                      <FaLock className="field-label-icon icon-purple" />
                      <span className="field-label-text label-password-text">New Password</span>
                    </label>
                    <div className="pill-input-wrapper input-wrapper-password">
                      <FaLock className="field-prefix-icon icon-purple" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="pill-input has-prefix-icon password-input input-password"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label="Toggle new password visibility"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label label-password">
                      <FaLock className="field-label-icon icon-purple" />
                      <span className="field-label-text label-password-text">Confirm New Password</span>
                    </label>
                    <div className="pill-input-wrapper input-wrapper-password">
                      <FaLock className="field-prefix-icon icon-purple" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="pill-input has-prefix-icon password-input input-password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="primary-login-btn"
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    <span>Update Password & Login</span>
                    <FaArrowRight className="login-arrow-icon" />
                  </button>

                  <button
                    type="button"
                    className="back-to-signup-btn"
                    onClick={handleCancelForgotPassword}
                  >
                    ← Cancel & Return to Login
                  </button>
                </form>
              </>
            )}
          </div>
        ) : isOtpStep ? (
          /* OTP VERIFICATION STEP (SIGNUP) */
          <div className="otp-verification-section">
            <div className="login-subheading-group">
              <h2 className="welcome-heading">Verify Your Email</h2>
              <p className="welcome-caption">
                Enter the 6-digit code sent to<br />
                <strong className="otp-email-badge">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="form-field-group">
                <label className="field-label">6-Digit Verification Code</label>
                <OtpSixBoxInput 
                  value={otp}
                  onChange={setOtp}
                  onComplete={(fullCode) => {
                    handleVerifyOtp({ preventDefault: () => {} });
                  }}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="primary-login-btn"
                disabled={isLoading || otp.length < 6}
              >
                <span>Verify & Activate Account</span>
                <FaArrowRight className="login-arrow-icon" />
              </button>

              <div className="otp-resend-row">
                {resendTimer > 0 ? (
                  <span className="resend-timer-text">Resend code in <strong>{resendTimer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    className="resend-code-btn"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    <FaRedo className="resend-icon" /> Resend Code
                  </button>
                )}
              </div>

              <button
                type="button"
                className="back-to-signup-btn"
                onClick={() => setIsOtpStep(false)}
              >
                ← Back to Edit Email
              </button>
            </form>
          </div>
        ) : (
          /* STANDARD LOGIN / SIGNUP FORM */
          <>
            <div className="login-subheading-group">
              <h2 className="welcome-heading">{isSignUp ? 'Create Patient Account' : 'Welcome Back'}</h2>
              <p className="welcome-caption">
                {isSignUp ? 'Verify email & create your health ID' : 'Real-time AI Health Portal'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {isSignUp && (
                <div className="signup-extra-fields">
                  <div className="form-field-group">
                    <label className="field-label label-name">
                      <FaUser className="field-label-icon icon-cyan" />
                      <span className="field-label-text label-name-text">Patient Full Name</span>
                    </label>
                    <div className="pill-input-wrapper input-wrapper-name">
                      <FaUser className="field-prefix-icon icon-cyan" />
                      <input
                        type="text"
                        className="pill-input has-prefix-icon input-name"
                        placeholder="e.g. Alex Mercer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  {/* Phone Number with Country Flag Selector */}
                  <div className="form-field-group">
                    <label className="field-label label-phone">
                      <FaPhoneAlt className="field-label-icon icon-cyan" />
                      <span className="field-label-text label-phone-text">Phone Number</span>
                    </label>
                    <div className="phone-input-combo">
                      <div className="country-select-wrapper">
                        <select
                          className="country-select"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          title="Select Country Dial Code"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code + c.name} value={c.code}>
                              {c.flag} {c.code} ({c.name})
                            </option>
                          ))}
                        </select>
                        <span className="select-arrow">▾</span>
                      </div>
                      <div className="pill-input-wrapper flex-1">
                        <input
                          type="tel"
                          className="pill-input phone-input-field"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label label-blood">
                      <span className="field-label-text">Blood Group</span>
                    </label>
                    <div className="blood-group-chips">
                      {bloodGroups.map((bg) => (
                        <button
                          type="button"
                          key={bg}
                          className={`bg-chip ${bloodGroup === bg ? 'active' : ''}`}
                          onClick={() => setBloodGroup(bg)}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-field-group">
                <label className="field-label label-email">
                  <FaEnvelope className="field-label-icon icon-cyan" />
                  <span className="field-label-text label-email-text">Email Address</span>
                </label>
                <div className="pill-input-wrapper input-wrapper-email">
                  <FaEnvelope className="field-prefix-icon icon-cyan" />
                  <input
                    type="email"
                    className="pill-input has-prefix-icon input-email"
                    placeholder="user@titanvitals.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label label-password">
                  <FaLock className="field-label-icon icon-purple" />
                  <span className="field-label-text label-password-text">Password</span>
                </label>
                <div className="pill-input-wrapper input-wrapper-password">
                  <FaLock className="field-prefix-icon icon-purple" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="pill-input has-prefix-icon password-input input-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="forgot-password-row">
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={handleOpenForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="primary-login-btn"
                disabled={isLoading}
              >
                <span>{isSignUp ? 'Send Verification OTP' : 'Login'}</span>
                <FaArrowRight className="login-arrow-icon" />
              </button>
            </form>

            <div className="login-divider-row">
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </div>

            <div className="social-auth-grid">
              <button
                type="button"
                className="social-auth-btn google-auth-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="google-svg-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="login-footer-row">
              <span className="footer-prompt-text">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                className="toggle-auth-mode-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsOtpStep(false);
                }}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
