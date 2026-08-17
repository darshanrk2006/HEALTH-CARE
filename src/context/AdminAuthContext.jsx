// src/context/AdminAuthContext.jsx
// Isolated Authentication Provider for System Administrators

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLoginApi, getAdminProfileApi } from '../services/adminService';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('titanvitals_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('titanvitals_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Validate admin token on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      const savedToken = localStorage.getItem('titanvitals_admin_token');
      if (savedToken) {
        try {
          const data = await getAdminProfileApi();
          if (data?.admin) {
            setAdminUser(data.admin);
            localStorage.setItem('titanvitals_admin_user', JSON.stringify(data.admin));
          }
        } catch (err) {
          // Token expired or invalid
          adminLogout();
        }
      }
    };
    checkAdminAuth();
  }, []);

  // Admin Login action
  const adminLogin = async (adminId, password) => {
    setIsAdminLoading(true);
    try {
      const res = await adminLoginApi(adminId, password);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setAdminUser(res.admin);
        localStorage.setItem('titanvitals_admin_token', res.token);
        localStorage.setItem('titanvitals_admin_user', JSON.stringify(res.admin));
        setIsAdminLoading(false);
        return res;
      }
      throw new Error(res.message || 'Admin authentication failed');
    } catch (error) {
      setIsAdminLoading(false);
      const msg = error.response?.data?.message || error.message || 'Admin login failed';
      toast.error(msg);
      throw error;
    }
  };

  // Admin Logout action
  const adminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('titanvitals_admin_token');
    localStorage.removeItem('titanvitals_admin_user');
    toast.success('Administrator logged out successfully');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isAdminAuthenticated: !!adminToken && !!adminUser,
        isAdminLoading,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
