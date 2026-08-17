// src/services/adminService.js
// Client API service for Admin Authentication, Multi-Admin Management, and Hospital/Bed Administration

import axios from 'axios';

const API_BASE = '/api/admin';
const HOSPITALS_PUBLIC_API = '/api/hospitals';

/**
 * Helper to get active admin authorization headers
 */
const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('titanvitals_admin_token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

/**
 * 1. Admin Login
 */
export const adminLoginApi = async (adminId, password) => {
  const res = await axios.post(`${API_BASE}/login`, {
    adminId: adminId.toString().trim(),
    password: password.trim()
  });
  return res.data;
};

/**
 * 2. Get Current Admin Profile
 */
export const getAdminProfileApi = async () => {
  const res = await axios.get(`${API_BASE}/me`, getAdminAuthHeaders());
  return res.data;
};

/**
 * 3. Multi-Admin Directory: List all admins
 */
export const getAdminsListApi = async () => {
  const res = await axios.get(`${API_BASE}/admins`, getAdminAuthHeaders());
  return res.data?.admins || [];
};

/**
 * 4. Add a new Administrator
 */
export const createAdminApi = async (adminData) => {
  const res = await axios.post(`${API_BASE}/admins`, adminData, getAdminAuthHeaders());
  return res.data;
};

/**
 * 5. Delete / Revoke an Admin
 */
export const deleteAdminApi = async (adminMongoId) => {
  const res = await axios.delete(`${API_BASE}/admins/${adminMongoId}`, getAdminAuthHeaders());
  return res.data;
};

/**
 * 6. Get Hospitals for Admin (Full details & bed management)
 */
export const getAdminHospitalsApi = async () => {
  const res = await axios.get(`${API_BASE}/hospitals`, getAdminAuthHeaders());
  return res.data?.hospitals || [];
};

/**
 * 7. Add New Hospital with Bed Capacities
 */
export const createHospitalApi = async (hospitalData) => {
  const res = await axios.post(`${API_BASE}/hospitals`, hospitalData, getAdminAuthHeaders());
  return res.data;
};

/**
 * 8. Live Update Hospital & Bed Numbers
 */
export const updateHospitalApi = async (hospitalId, updateData) => {
  const res = await axios.put(`${API_BASE}/hospitals/${hospitalId}`, updateData, getAdminAuthHeaders());
  return res.data;
};

/**
 * 9. Delete Hospital
 */
export const deleteHospitalApi = async (hospitalId) => {
  const res = await axios.delete(`${API_BASE}/hospitals/${hospitalId}`, getAdminAuthHeaders());
  return res.data;
};

/**
 * 10. Public Hospital Directory (for patient app)
 */
export const getPublicHospitalsApi = async (params = {}) => {
  const res = await axios.get(HOSPITALS_PUBLIC_API, { params });
  return res.data?.hospitals || [];
};

/**
 * 11. Patient Transfers
 */
export const getTransfersApi = async () => {
  const res = await axios.get(`${API_BASE}/transfers`, getAdminAuthHeaders());
  return res.data?.transfers || [];
};

export const createTransferApi = async (transferData) => {
  const res = await axios.post(`${API_BASE}/transfers`, transferData, getAdminAuthHeaders());
  return res.data;
};

export const updateTransferApi = async (transferId, updateData) => {
  const res = await axios.put(`${API_BASE}/transfers/${transferId}`, updateData, getAdminAuthHeaders());
  return res.data;
};

export const deleteTransferApi = async (transferId) => {
  const res = await axios.delete(`${API_BASE}/transfers/${transferId}`, getAdminAuthHeaders());
  return res.data;
};

/**
 * 12. Emergency Broadcasts
 */
export const getBroadcastsApi = async () => {
  const res = await axios.get(`${API_BASE}/broadcasts`, getAdminAuthHeaders());
  return res.data?.broadcasts || [];
};

export const createBroadcastApi = async (broadcastData) => {
  const res = await axios.post(`${API_BASE}/broadcasts`, broadcastData, getAdminAuthHeaders());
  return res.data;
};

export const deleteBroadcastApi = async (broadcastId) => {
  const res = await axios.delete(`${API_BASE}/broadcasts/${broadcastId}`, getAdminAuthHeaders());
  return res.data;
};

/**
 * 13. Audit Trail & Activity Logs
 */
export const getAuditLogsApi = async () => {
  const res = await axios.get(`${API_BASE}/audit-logs`, getAdminAuthHeaders());
  return res.data?.logs || [];
};

export const deleteAuditLogApi = async (logId) => {
  const res = await axios.delete(`${API_BASE}/audit-logs/${logId}`, getAdminAuthHeaders());
  return res.data;
};

export const clearAllAuditLogsApi = async () => {
  const res = await axios.delete(`${API_BASE}/audit-logs`, getAdminAuthHeaders());
  return res.data;
};

/**
 * 14. Blood Bank & Supply Inventory
 */
export const updateHospitalInventoryApi = async (hospitalId, inventoryData) => {
  const res = await axios.put(`${API_BASE}/hospitals/${hospitalId}/inventory`, inventoryData, getAdminAuthHeaders());
  return res.data;
};

/**
 * 15. Public Patient Bed Reservation
 */
export const reserveHospitalBedApi = async (hospitalId, bookingData) => {
  const res = await axios.post(`${HOSPITALS_PUBLIC_API}/${hospitalId}/reserve`, bookingData);
  return res.data;
};

/**
 * 16. Patient Bed Bookings & Notifications (Admin)
 */
export const getBookingsApi = async () => {
  const res = await axios.get(`${API_BASE}/bookings`, getAdminAuthHeaders());
  return res.data;
};

export const updateBookingStatusApi = async (bookingId, status) => {
  const res = await axios.put(`${API_BASE}/bookings/${bookingId}/status`, { status }, getAdminAuthHeaders());
  return res.data;
};

export const markAllBookingsReadApi = async () => {
  const res = await axios.put(`${API_BASE}/bookings/mark-read`, {}, getAdminAuthHeaders());
  return res.data;
};

export const deleteBookingApi = async (bookingId) => {
  const res = await axios.delete(`${API_BASE}/bookings/${bookingId}`, getAdminAuthHeaders());
  return res.data;
};

export const clearAllBookingsApi = async () => {
  const res = await axios.delete(`${API_BASE}/bookings`, getAdminAuthHeaders());
  return res.data;
};
