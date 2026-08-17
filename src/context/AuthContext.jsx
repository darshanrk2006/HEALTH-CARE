import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const DEFAULT_USER = {
  name: 'Alex Mercer',
  email: 'alex.mercer@titanvitals.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  role: 'Patient / Health Member',
  bloodGroup: 'O+',
  healthId: 'TV-8942-AI'
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('titanvitals_token') || null);

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('titanvitals_token');
    const savedUser = localStorage.getItem('titanvitals_user');
    const savedAuth = localStorage.getItem('titanvitals_auth');
    if (savedToken && savedAuth === 'true' && savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedToken = localStorage.getItem('titanvitals_token');
    const savedAuth = localStorage.getItem('titanvitals_auth');
    return Boolean(savedToken && savedAuth === 'true');
  });

  const [mongoConnected, setMongoConnected] = useState(true);

  // Sync token to axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('titanvitals_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('titanvitals_token');
    }
  }, [token]);

  // Persist user and authentication
  useEffect(() => {
    if (user && isAuthenticated && token) {
      localStorage.setItem('titanvitals_user', JSON.stringify(user));
      localStorage.setItem('titanvitals_auth', 'true');
    } else {
      localStorage.removeItem('titanvitals_user');
      localStorage.removeItem('titanvitals_auth');
    }
  }, [user, isAuthenticated, token]);

  // Check MongoDB Server Status & Validate Token on Mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const healthRes = await axios.get('/api/health');
        if (healthRes.data?.status === 'online') {
          setMongoConnected(true);
        }

        if (token) {
          const res = await axios.get('/api/auth/me');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
          } else {
            // Invalid/expired token
            logout();
          }
        }
      } catch (error) {
        console.warn('Session verification notice:', error.message);
        if (error.response?.status === 401) {
          logout();
        }
      }
    };
    verifySession();
  }, [token]);

  // Strict MongoDB Login: ONLY logs in if credentials match MongoDB document
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      if (res.data?.success && res.data?.token) {
        const { user: dbUser, token: authToken } = res.data;
        setUser(dbUser);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('titanvitals_user', JSON.stringify(dbUser));
        localStorage.setItem('titanvitals_token', authToken);
        localStorage.setItem('titanvitals_auth', 'true');
        return true;
      } else {
        throw new Error(res.data?.message || 'Invalid credentials');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Invalid email or password. Please check your credentials.';
      toast.error(errorMsg, { id: 'auth' });
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      throw new Error(errorMsg);
    }
  };

  // Send Signup OTP to email
  const sendSignupOtp = async (userData) => {
    try {
      const res = await axios.post('/api/auth/send-signup-otp', userData);
      if (res.data?.success) {
        toast.success(res.data.message || `Verification code dispatched to ${userData.email}`, { id: 'otp' });
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to send verification code');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP to email';
      toast.error(errorMsg, { id: 'otp' });
      throw new Error(errorMsg);
    }
  };

  // Verify OTP and complete registration
  const verifySignupOtp = async (email, otp) => {
    try {
      const res = await axios.post('/api/auth/verify-signup-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });

      if (res.data?.success && res.data?.token) {
        const { user: dbUser, token: authToken } = res.data;
        setUser(dbUser);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('titanvitals_user', JSON.stringify(dbUser));
        localStorage.setItem('titanvitals_token', authToken);
        localStorage.setItem('titanvitals_auth', 'true');
        toast.success('Email verified successfully! Welcome to TitanVitals.', { id: 'otp' });
        return true;
      } else {
        throw new Error(res.data?.message || 'Invalid verification code');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Invalid or expired OTP code';
      toast.error(errorMsg, { id: 'otp' });
      throw new Error(errorMsg);
    }
  };

  // Send Forgot Password OTP to email
  const sendForgotPasswordOtp = async (email) => {
    try {
      const res = await axios.post('/api/auth/send-forgot-password-otp', {
        email: email.trim().toLowerCase()
      });
      if (res.data?.success) {
        toast.success(res.data.message || `Verification code sent to ${email}`, { id: 'auth' });
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to send reset code');
      }
    } catch (error) {
      let errorMsg = 'Account with this email does not exist. Please create an account.';
      if (error.response?.data?.message && typeof error.response.data.message === 'string') {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMsg = 'Account with this email does not exist. Please create an account.';
      } else if (error.message && !error.message.includes('404')) {
        errorMsg = error.message;
      }
      toast.error(errorMsg, { id: 'auth' });
      throw new Error(errorMsg);
    }
  };

  // Verify Forgot Password OTP
  const verifyForgotPasswordOtp = async (email, otp) => {
    try {
      const res = await axios.post('/api/auth/verify-forgot-password-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Code verified successfully', { id: 'auth' });
        return true;
      } else {
        throw new Error(res.data?.message || 'Invalid verification code');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Invalid or expired OTP code';
      toast.error(errorMsg, { id: 'auth' });
      throw new Error(errorMsg);
    }
  };

  // Reset Password in MongoDB and auto-login
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axios.post('/api/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword
      });

      if (res.data?.success && res.data?.token) {
        const { user: dbUser, token: authToken } = res.data;
        setUser(dbUser);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('titanvitals_user', JSON.stringify(dbUser));
        localStorage.setItem('titanvitals_token', authToken);
        localStorage.setItem('titanvitals_auth', 'true');
        toast.success('Password has been changed successfully! Welcome back.', { id: 'auth' });
        return true;
      } else {
        throw new Error(res.data?.message || 'Failed to update password');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error updating password';
      toast.error(errorMsg, { id: 'auth' });
      throw new Error(errorMsg);
    }
  };

  // Direct Signup fallback
  const signup = async (name, email, password, bloodGroup = 'O+') => {
    const cleanName = name ? name.replace(/^dr\.\s*/i, '').trim() : email.split('@')[0];
    try {
      const res = await axios.post('/api/auth/signup', {
        name: cleanName,
        email: email.trim().toLowerCase(),
        password,
        bloodGroup
      });

      if (res.data?.success && res.data?.token) {
        const { user: dbUser, token: authToken } = res.data;
        setUser(dbUser);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('titanvitals_user', JSON.stringify(dbUser));
        localStorage.setItem('titanvitals_token', authToken);
        localStorage.setItem('titanvitals_auth', 'true');
        return true;
      } else {
        throw new Error(res.data?.message || 'Failed to create account');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed. An account with this email may already exist.';
      toast.error(errorMsg, { id: 'auth' });
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      throw new Error(errorMsg);
    }
  };

  // Real Google OAuth authentication with MongoDB
  const loginWithGoogle = async (googleResponse) => {
    try {
      let payload = {};
      if (typeof googleResponse === 'string') {
        payload = { credential: googleResponse };
      } else if (googleResponse?.credential) {
        payload = { credential: googleResponse.credential };
      } else if (googleResponse?.access_token) {
        payload = { access_token: googleResponse.access_token };
      } else {
        payload = googleResponse || {};
      }

      const res = await axios.post('/api/auth/google', payload);
      if (res.data?.success && res.data?.token) {
        const { user: dbUser, token: authToken } = res.data;
        setUser(dbUser);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('titanvitals_user', JSON.stringify(dbUser));
        localStorage.setItem('titanvitals_token', authToken);
        localStorage.setItem('titanvitals_auth', 'true');
        toast.success(`Google Sign-In Successful! Welcome, ${dbUser.name}`, { id: 'auth' });
        return true;
      } else {
        throw new Error(res.data?.message || 'Google login failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Google authentication failed';
      toast.error(errorMsg, { id: 'auth' });
      throw new Error(errorMsg);
    }
  };

  // Update Patient Name in MongoDB & State
  const updateUserName = async (newName) => {
    if (!newName || !newName.trim()) return;
    const clean = newName.replace(/^dr\.\s*/i, '').trim();

    try {
      const res = await axios.put('/api/auth/profile', { 
        name: clean,
        email: user?.email,
        healthId: user?.healthId
      });
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('titanvitals_user', JSON.stringify(res.data.user));
        return;
      }
    } catch (e) {
      console.warn('Profile sync notice:', e.message);
    }

    setUser((prev) => {
      const updated = prev ? ({ ...prev, name: clean }) : null;
      if (updated) localStorage.setItem('titanvitals_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Update Full Patient Profile & Avatar in MongoDB
  const updateUserProfile = async (profileData) => {
    try {
      const payload = {
        ...profileData,
        email: profileData.email || user?.email,
        healthId: profileData.healthId || user?.healthId || 'TV-8942-AI'
      };
      
      const res = await axios.put('/api/auth/profile', payload);
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('titanvitals_user', JSON.stringify(res.data.user));
        toast.success('Patient profile & ID saved to MongoDB database!');
        return res.data.user;
      }
    } catch (e) {
      console.warn('Profile database sync notice:', e.message);
    }

    const updated = {
      ...user,
      ...profileData,
    };
    setUser(updated);
    localStorage.setItem('titanvitals_user', JSON.stringify(updated));
    toast.success('Patient profile & ID saved!');
    return updated;
  };

  // Sync System Settings to MongoDB
  const syncSettingsToMongoDB = async (settingsData) => {
    try {
      await axios.put('/api/auth/settings', { settings: settingsData });
    } catch (e) {
      console.warn('Settings MongoDB sync notice:', e.message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('titanvitals_user');
    localStorage.removeItem('titanvitals_token');
    localStorage.removeItem('titanvitals_auth');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      mongoConnected,
      login,
      signup,
      sendSignupOtp,
      verifySignupOtp,
      sendForgotPasswordOtp,
      verifyForgotPasswordOtp,
      resetPassword,
      loginWithGoogle,
      updateUserName,
      updateUserProfile,
      syncSettingsToMongoDB,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
