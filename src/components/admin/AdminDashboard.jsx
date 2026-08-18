import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHospital, 
  FaBed, 
  FaUsersCog, 
  FaPlus, 
  FaSignOutAlt, 
  FaTrashAlt, 
  FaEdit, 
  FaSearch, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaPhone,
  FaMapMarkerAlt,
  FaSun,
  FaMoon,
  FaUserPlus,
  FaCrown,
  FaSave,
  FaTimes,
  FaProcedures,
  FaLungs,
  FaSyncAlt,
  FaAmbulance,
  FaCog,
  FaDatabase,
  FaDownload,
  FaTint,
  FaExchangeAlt,
  FaBullhorn,
  FaHistory,
  FaChartLine,
  FaBoxes,
  FaPills,
  FaVial,
  FaNotesMedical,
  FaHeartbeat,
  FaExclamationCircle,
  FaCheck,
  FaFilter,
  FaRobot,
  FaArrowRight,
  FaBolt,
  FaBuilding,
  FaBell,
  FaUserInjured,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaFolderOpen,
  FaListUl,
  FaUserCheck
} from 'react-icons/fa';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  getAdminHospitalsApi, 
  createHospitalApi, 
  updateHospitalApi, 
  deleteHospitalApi,
  getAdminsListApi,
  createAdminApi,
  deleteAdminApi,
  getTransfersApi,
  createTransferApi,
  updateTransferApi,
  deleteTransferApi,
  getBroadcastsApi,
  createBroadcastApi,
  deleteBroadcastApi,
  getAuditLogsApi,
  deleteAuditLogApi,
  deletePatientDossierApi,
  clearAllAuditLogsApi,
  updateHospitalInventoryApi,
  getBookingsApi,
  updateBookingStatusApi,
  deleteBookingApi,
  clearAllBookingsApi,
  markAllBookingsReadApi
} from '../../services/adminService';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

// Label Helpers for Blood Bank & Pharma
const formatBloodLabel = (key) => {
  const map = {
    oNegative: 'O-',
    oPositive: 'O+',
    aNegative: 'A-',
    aPositive: 'A+',
    bNegative: 'B-',
    bPositive: 'B+',
    abNegative: 'AB-',
    abPositive: 'AB+',
    plasmaUnits: 'Plasma',
    plateletUnits: 'Platelets'
  };
  return map[key] || key;
};

const formatMedicineLabel = (key) => {
  const map = {
    oxygenCylinders: 'Oxygen Cylinders',
    dialysisKits: 'Dialysis Kits',
    antiVenomVials: 'Anti-Venom',
    epinephrineVials: 'Epinephrine',
    ventilatorCircuits: 'Ventilator Circuits'
  };
  return map[key] || key;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, adminLogout, isAdminAuthenticated } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('beds'); // 'beds' | 'forecast' | 'blood' | 'transfers' | 'broadcasts' | 'audit' | 'bookings'

  // Main Data States
  const [hospitals, setHospitals] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [forecastHorizon, setForecastHorizon] = useState('24h');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('All');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditViewMode, setAuditViewMode] = useState('structured'); // 'structured' | 'feed'
  const [expandedPatients, setExpandedPatients] = useState({});
  const [clearAuditModalOpen, setClearAuditModalOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('All');

  // Notification Bell Dropdown
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  // Modals State
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [adminsModalOpen, setAdminsModalOpen] = useState(false);
  const [newAdminFormOpen, setNewAdminFormOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [selectedInventoryHosp, setSelectedInventoryHosp] = useState(null);
  
  // Interactive KPI Modals
  const [bedSummaryModalOpen, setBedSummaryModalOpen] = useState(false);
  const [icuTelemetryModalOpen, setIcuTelemetryModalOpen] = useState(false);

  // Forms
  const [hospForm, setHospForm] = useState({
    name: '',
    address: '',
    city: 'Metro Medical District',
    state: 'National Health Zone',
    phone: '',
    distanceKm: 2.5,
    etaMin: 8,
    icuBeds: 5,
    oxygenBeds: 15,
    generalBeds: 30,
    ventilators: 4,
    maxBedCapacity: 100,
    departments: 'Emergency / Trauma, Cardiology, Pulmonology',
    emergencyStatus: 'Open - Rapid Triage Active'
  });

  const [adminForm, setAdminForm] = useState({
    adminId: '',
    name: '',
    email: '',
    password: '',
    role: 'Hospital Administrator',
    department: 'Emergency & Bed Logistics'
  });

  const [transferForm, setTransferForm] = useState({
    patientName: '',
    patientAge: 45,
    patientGender: 'Male',
    conditionSummary: 'Acute STEMI myocardial infarction requiring emergent cardiac ICU bed and cath lab transfer',
    priority: 'P1 - Critical Emergency',
    requiredBedType: 'ICU Bed',
    originHospital: '',
    destinationHospital: '',
    ambulanceUnit: 'ALS-Rescue-09',
    etaMinutes: 14,
    notes: 'Patient on continuous oxygen telemetry'
  });

  const [broadcastForm, setBroadcastForm] = useState({
    title: 'Surge Warning: Heavy Trauma Inflow',
    message: 'High regional trauma emergency. All secondary facilities please place standby ICU beds on rapid hold.',
    severity: 'Code Red - Mass Casualty',
    targetHospitals: 'All Regional Hospitals'
  });

  const [inventoryForm, setInventoryForm] = useState({
    bloodInventory: {
      oNegative: 8,
      oPositive: 22,
      aNegative: 6,
      aPositive: 18,
      bNegative: 5,
      bPositive: 20,
      abNegative: 3,
      abPositive: 12,
      plasmaUnits: 35,
      plateletUnits: 16
    },
    medicineStock: {
      oxygenCylinders: 45,
      dialysisKits: 14,
      antiVenomVials: 10,
      epinephrineVials: 50,
      ventilatorCircuits: 22
    }
  });

  const [adminSettings, setAdminSettings] = useState({
    autoRefreshSec: 10,
    criticalIcuThreshold: 2,
    soundAlerts: true,
    defaultRegion: 'All Regions'
  });

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------------------------------------------
  // INITIAL DATA FETCH & REAL-TIME POLLING
  // ----------------------------------------------------
  const loadDashboardData = async () => {
    try {
      const [hospData, adminData, transferData, broadcastData, logData, bookingData] = await Promise.allSettled([
        getAdminHospitalsApi(),
        getAdminsListApi(),
        getTransfersApi(),
        getBroadcastsApi(),
        getAuditLogsApi(),
        getBookingsApi()
      ]);

      if (hospData.status === 'fulfilled') setHospitals(hospData.value);
      if (adminData.status === 'fulfilled') setAdminsList(adminData.value);
      if (transferData.status === 'fulfilled') setTransfers(transferData.value);
      if (broadcastData.status === 'fulfilled') setBroadcasts(broadcastData.value);
      if (logData.status === 'fulfilled') setAuditLogs(logData.value);
      if (bookingData.status === 'fulfilled') setBookings(bookingData.value?.bookings || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 8000); // 8s live telemetry refresh
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // DERIVED METRICS & KPIS
  // ----------------------------------------------------
  const totalHospitals = hospitals.length;
  const totalBeds = useMemo(() => hospitals.reduce((sum, h) => sum + (h.generalBeds || 0) + (h.icuBeds || 0) + (h.oxygenBeds || 0), 0), [hospitals]);
  const totalMaxCapacity = useMemo(() => hospitals.reduce((sum, h) => sum + (h.maxBedCapacity || ((h.generalBeds || 0) + (h.icuBeds || 0) + (h.oxygenBeds || 0) + 25)), 0), [hospitals]);
  const totalIcuBeds = useMemo(() => hospitals.reduce((sum, h) => sum + (h.icuBeds || 0), 0), [hospitals]);
  const totalOxygenBeds = useMemo(() => hospitals.reduce((sum, h) => sum + (h.oxygenBeds || 0), 0), [hospitals]);
  const totalGeneralBeds = useMemo(() => hospitals.reduce((sum, h) => sum + (h.generalBeds || 0), 0), [hospitals]);
  const totalVentilators = useMemo(() => hospitals.reduce((sum, h) => sum + (h.ventilators || 0), 0), [hospitals]);
  const activeTransfersCount = useMemo(() => transfers.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length, [transfers]);
  const activeBroadcasts = useMemo(() => broadcasts.filter(b => b.isActive), [broadcasts]);
  const unreadBookingsCount = useMemo(() => bookings.filter(b => !b.isRead).length, [bookings]);

  // Filtered Hospital List for Beds Tab
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'All') return matchesSearch;
      if (filterStatus === 'Critical') return matchesSearch && h.icuBeds <= adminSettings.criticalIcuThreshold;
      if (filterStatus === 'Open') return matchesSearch && h.emergencyStatus.includes('Open');
      return matchesSearch;
    });
  }, [hospitals, searchTerm, filterStatus, adminSettings.criticalIcuThreshold]);

  // ----------------------------------------------------
  // PATIENT BOOKING ACTIONS (NOTIFICATIONS)
  // ----------------------------------------------------
  const handleClearSingleBooking = async (bookingId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteBookingApi(bookingId);
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      toast.success('Patient reservation notification cleared.');
    } catch (err) {
      toast.error('Failed to clear notification');
    }
  };

  const handleClearAllBookings = async () => {
    if (!window.confirm('Are you sure you want to clear all patient bed booking notifications?')) {
      return;
    }
    try {
      await clearAllBookingsApi();
      setBookings([]);
      toast.success('All patient booking notifications cleared!');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, nextStatus) => {
    try {
      await updateBookingStatusApi(bookingId, nextStatus);
      toast.success(`Patient status updated to "${nextStatus}"!`);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to update patient booking status');
    }
  };

  const handleOpenNotifDropdown = async () => {
    setNotifDropdownOpen(!notifDropdownOpen);
    if (!notifDropdownOpen && unreadBookingsCount > 0) {
      try {
        await markAllBookingsReadApi();
        setBookings(prev => prev.map(b => ({ ...b, isRead: true })));
      } catch (e) {}
    }
  };

  // ----------------------------------------------------
  // HOSPITAL ACTIONS
  // ----------------------------------------------------
  const handleOpenAddHospital = () => {
    setEditingHospital(null);
    setHospForm({
      name: '',
      address: '',
      city: 'Metro Medical District',
      state: 'National Health Zone',
      phone: '',
      distanceKm: 2.5,
      etaMin: 8,
      icuBeds: 5,
      oxygenBeds: 15,
      generalBeds: 30,
      ventilators: 4,
      maxBedCapacity: 100,
      departments: 'Emergency / Trauma, Cardiology, Pulmonology',
      emergencyStatus: 'Open - Rapid Triage Active'
    });
    setHospitalModalOpen(true);
  };

  const handleOpenEditHospital = (hosp) => {
    setEditingHospital(hosp);
    const currMax = hosp.maxBedCapacity || ((hosp.generalBeds || 0) + (hosp.oxygenBeds || 0) + (hosp.icuBeds || 0) + 25);
    setHospForm({
      name: hosp.name,
      address: hosp.address,
      city: hosp.city || 'Metro Medical District',
      state: hosp.state || 'National Health Zone',
      phone: hosp.phone,
      distanceKm: hosp.distanceKm || 2.5,
      etaMin: hosp.etaMin || 8,
      icuBeds: hosp.icuBeds,
      oxygenBeds: hosp.oxygenBeds,
      generalBeds: hosp.generalBeds,
      ventilators: hosp.ventilators,
      maxBedCapacity: currMax,
      departments: Array.isArray(hosp.departments) ? hosp.departments.join(', ') : hosp.departments,
      emergencyStatus: hosp.emergencyStatus
    });
    setHospitalModalOpen(true);
  };

  const handleSaveHospital = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await updateHospitalApi(editingHospital._id, hospForm);
        toast.success(`Hospital "${hospForm.name}" updated successfully!`);
      } else {
        await createHospitalApi(hospForm);
        toast.success(`Hospital "${hospForm.name}" added to MongoDB!`);
      }
      setHospitalModalOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save hospital record');
    }
  };

  const handleDeleteHospital = async (hosp) => {
    if (!window.confirm(`Are you sure you want to delete "${hosp.name}" from the hospital directory?`)) {
      return;
    }
    try {
      await deleteHospitalApi(hosp._id);
      toast.success(`Hospital "${hosp.name}" deleted.`);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to delete hospital');
    }
  };

  const handleQuickBedAdjust = async (hospId, field, delta) => {
    const targetHosp = hospitals.find(h => h._id === hospId);
    if (!targetHosp) return;

    const currentVal = targetHosp[field] !== undefined ? targetHosp[field] : (field === 'maxBedCapacity' ? 100 : 0);
    const newVal = Math.max(0, currentVal + delta);

    setHospitals(prev => prev.map(h => h._id === hospId ? { ...h, [field]: newVal } : h));

    try {
      await updateHospitalApi(hospId, { [field]: newVal });
    } catch (e) {
      loadDashboardData();
      toast.error('Failed to update bed telemetry in database');
    }
  };

  // Bulk Emergency Surge Boost
  const handleBulkIcuSurgeBoost = async (delta = 2) => {
    try {
      const updatePromises = hospitals.map(h => 
        updateHospitalApi(h._id, { icuBeds: (h.icuBeds || 0) + delta })
      );
      await Promise.all(updatePromises);
      toast.success(`Emergency Surge: +${delta} ICU beds allocated across all ${hospitals.length} facilities!`);
      loadDashboardData();
    } catch (e) {
      toast.error('Failed to apply emergency ICU surge');
    }
  };

  // ----------------------------------------------------
  // ADMIN DIRECTORY ACTIONS
  // ----------------------------------------------------
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.adminId.trim() || !adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      toast.error('Please fill in all admin fields');
      return;
    }

    try {
      await createAdminApi(adminForm);
      toast.success(`Admin ID [${adminForm.adminId}] registered successfully!`);
      setAdminForm({
        adminId: '',
        name: '',
        email: '',
        password: '',
        role: 'Hospital Administrator',
        department: 'Emergency & Bed Logistics'
      });
      setNewAdminFormOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create new admin account');
    }
  };

  const handleDeleteAdmin = async (adminObj) => {
    if (adminObj.isMaster || adminObj.adminId === '2319') {
      toast.error('Master Administrator account is protected and cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to revoke admin access for "${adminObj.name}" (ID: ${adminObj.adminId})?`)) {
      return;
    }

    try {
      await deleteAdminApi(adminObj._id);
      toast.success(`Admin ID [${adminObj.adminId}] removed.`);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to remove administrator');
    }
  };

  // ----------------------------------------------------
  // PATIENT TRANSFER ACTIONS
  // ----------------------------------------------------
  const handleOpenTransferModal = () => {
    if (hospitals.length < 2) {
      toast.error('At least 2 registered hospitals are required for transfer routing.');
      return;
    }
    setTransferForm({
      patientName: '',
      patientAge: 48,
      patientGender: 'Male',
      conditionSummary: 'Acute Trauma / Multi-organ stabilization needed',
      priority: 'P1 - Critical Emergency',
      requiredBedType: 'ICU Bed',
      originHospital: hospitals[0]?.name || '',
      destinationHospital: hospitals[1]?.name || '',
      ambulanceUnit: `ALS-Rescue-${Math.floor(Math.random() * 90 + 10)}`,
      etaMinutes: 12,
      notes: 'Airway secured, telemetry monitoring active'
    });
    setTransferModalOpen(true);
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.patientName || !transferForm.originHospital || !transferForm.destinationHospital) {
      toast.error('Please specify patient name and hospital routing.');
      return;
    }
    if (transferForm.originHospital === transferForm.destinationHospital) {
      toast.error('Origin and Destination hospitals must be different.');
      return;
    }

    try {
      await createTransferApi(transferForm);
      toast.success(`Emergency transfer for ${transferForm.patientName} dispatched!`);
      setTransferModalOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch transfer');
    }
  };

  const handleUpdateTransferStatus = async (transferId, nextStatus) => {
    try {
      await updateTransferApi(transferId, { status: nextStatus });
      toast.success(`Transfer status updated to "${nextStatus}"`);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to update transfer status');
    }
  };

  const handleDeleteTransfer = async (transferId) => {
    if (!window.confirm('Delete this transfer dispatch record?')) return;
    try {
      await deleteTransferApi(transferId);
      toast.success('Transfer record deleted.');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to delete transfer record');
    }
  };

  // ----------------------------------------------------
  // EMERGENCY BROADCAST ACTIONS
  // ----------------------------------------------------
  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Please enter broadcast title and emergency message.');
      return;
    }

    try {
      await createBroadcastApi(broadcastForm);
      toast.success(`Emergency broadcast "${broadcastForm.title}" published!`);
      setBroadcastModalOpen(false);
      setBroadcastForm({
        title: '',
        message: '',
        severity: 'Code Red - Mass Casualty',
        targetHospitals: 'All Regional Hospitals'
      });
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch broadcast');
    }
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    try {
      await deleteBroadcastApi(broadcastId);
      toast.success('Emergency broadcast dismissed.');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to dismiss broadcast');
    }
  };

  // ----------------------------------------------------
  // INVENTORY / BLOOD BANK ACTIONS
  // ----------------------------------------------------
  const handleOpenInventoryModal = (hosp) => {
    setSelectedInventoryHosp(hosp);
    setInventoryForm({
      bloodInventory: {
        oNegative: hosp.bloodInventory?.oNegative ?? 8,
        oPositive: hosp.bloodInventory?.oPositive ?? 24,
        aNegative: hosp.bloodInventory?.aNegative ?? 6,
        aPositive: hosp.bloodInventory?.aPositive ?? 18,
        bNegative: hosp.bloodInventory?.bNegative ?? 5,
        bPositive: hosp.bloodInventory?.bPositive ?? 20,
        abNegative: hosp.bloodInventory?.abNegative ?? 3,
        abPositive: hosp.bloodInventory?.abPositive ?? 12,
        plasmaUnits: hosp.bloodInventory?.plasmaUnits ?? 35,
        plateletUnits: hosp.bloodInventory?.plateletUnits ?? 16
      },
      medicineStock: {
        oxygenCylinders: hosp.medicineStock?.oxygenCylinders ?? 45,
        dialysisKits: hosp.medicineStock?.dialysisKits ?? 14,
        antiVenomVials: hosp.medicineStock?.antiVenomVials ?? 10,
        epinephrineVials: hosp.medicineStock?.epinephrineVials ?? 50,
        ventilatorCircuits: hosp.medicineStock?.ventilatorCircuits ?? 22
      }
    });
    setInventoryModalOpen(true);
  };

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!selectedInventoryHosp) return;

    try {
      await updateHospitalInventoryApi(selectedInventoryHosp._id, inventoryForm);
      toast.success(`Supplies & Blood units updated for "${selectedInventoryHosp.name}"!`);
      setInventoryModalOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to update hospital inventory');
    }
  };

  // ----------------------------------------------------
  // COMPLIANCE AUDIT EXPORT
  // ----------------------------------------------------
  const handleExportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `titanvitals_compliance_audit_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Compliance audit trail exported (JSON)');
  };

  const handleDeleteSingleAuditLog = async (logId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteAuditLogApi(logId);
      setAuditLogs(prev => prev.filter(l => l._id !== logId));
      toast.success('Audit log entry deleted.');
    } catch (err) {
      toast.error('Failed to delete audit log entry');
    }
  };

  const handleDeletePatientDossier = async (patientName, logs = []) => {
    const totalLogs = logs.length || 1;
    if (!window.confirm(`Are you sure you want to delete all ${totalLogs} milestone log(s) for In-Patient "${patientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const logIds = logs.map(l => l._id).filter(Boolean);
      
      try {
        await deletePatientDossierApi(patientName);
      } catch (endpointErr) {
        // Fallback: delete each log id individually
        await Promise.all(logIds.map(id => deleteAuditLogApi(id)));
      }

      setAuditLogs(prev => prev.filter(l => {
        if (logIds.includes(l._id)) return false;
        const detailsLower = (l.details || '').toLowerCase();
        const actionLower = (l.action || '').toLowerCase();
        const nameLower = patientName.toLowerCase();
        return !detailsLower.includes(nameLower) && !actionLower.includes(nameLower);
      }));

      toast.success(`Complete in-patient log for "${patientName}" deleted successfully!`);
    } catch (err) {
      console.error('Failed to delete patient dossier:', err);
      toast.error(`Failed to delete in-patient log for "${patientName}"`);
    }
  };

  const handlePurgeAllAuditLogs = async () => {
    try {
      await clearAllAuditLogsApi();
      setClearAuditModalOpen(false);
      toast.success('All security audit log entries have been permanently purged!');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to purge audit trail');
    }
  };

  const togglePatientExpand = (name) => {
    setExpandedPatients(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const extractPatientName = (log) => {
    if (!log || !log.details) return null;
    const match1 = log.details.match(/Patient ["']([^"']+)["']/i);
    if (match1) return match1[1].trim();
    const match2 = log.details.match(/Transfer for ([A-Za-z\s]+?)(?: updated| to| \()/i);
    if (match2) return match2[1].trim();
    const match3 = log.details.match(/for patient ([A-Za-z\s]+?)(?: from| to| \()/i);
    if (match3) return match3[1].trim();
    const match4 = log.details.match(/Patient ([A-Za-z\s]+?)(?: marked| booked| admitted| reserved)/i);
    if (match4) return match4[1].trim();
    return null;
  };

  const { patientJourneys, facilitySystemLogs } = useMemo(() => {
    const pMap = {};
    const sysLogs = [];

    auditLogs.forEach(log => {
      const matchesCat = auditCategoryFilter === 'All' || log.category === auditCategoryFilter;
      const matchesSearch = !auditSearch || 
        log.action?.toLowerCase().includes(auditSearch.toLowerCase()) || 
        log.details?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.targetResource?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.adminName?.toLowerCase().includes(auditSearch.toLowerCase());

      if (!matchesCat || !matchesSearch) return;

      const pName = extractPatientName(log);
      if (pName) {
        if (!pMap[pName]) {
          pMap[pName] = {
            name: pName,
            logs: [],
            latestTime: log.createdAt,
            latestHospital: log.targetResource,
            latestAction: log.action
          };
        }
        pMap[pName].logs.push(log);
      } else {
        sysLogs.push(log);
      }
    });

    return {
      patientJourneys: Object.values(pMap).sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime)),
      facilitySystemLogs: sysLogs
    };
  }, [auditLogs, auditCategoryFilter, auditSearch]);

  return (
    <div className="admin-dashboard-container">
      {/* 0. ACTIVE EMERGENCY BROADCAST TICKER */}
      {activeBroadcasts.length > 0 && (
        <div className="emergency-broadcast-banner">
          <div className="broadcast-banner-left">
            <span className="live-pulse-badge">🚨 LIVE REGIONAL ALERT</span>
            <strong>{activeBroadcasts[0].title}:</strong>
            <span>{activeBroadcasts[0].message}</span>
            <span className="broadcast-meta">({activeBroadcasts[0].targetHospitals})</span>
          </div>
          <button 
            type="button" 
            className="dismiss-broadcast-btn" 
            onClick={() => handleDeleteBroadcast(activeBroadcasts[0]._id)}
            title="Dismiss Alert"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER COMMAND BAR */}
      <header className="admin-header-bar glass-card">
        <div className="admin-header-left">
          <div className="admin-logo-badge">
            <FaShieldAlt className="admin-brand-icon" />
          </div>
          <div className="admin-brand-text">
            <h1>TitanVitals <span className="cmd-pill">NEXT GEN AI</span></h1>
            <span className="admin-active-status">
              <span className="pulse-dot"></span> Logged in as: <strong>{adminUser?.name || 'Administrator'} (ID: {adminUser?.adminId || '2319'})</strong>
            </span>
          </div>
        </div>

        <div className="admin-header-right">
          {/* Real-Time Patient Booking Notification Bell */}
          <div className="notif-bell-container" ref={notifDropdownRef}>
            <button 
              type="button"
              className={`admin-cmd-btn btn-notif-bell ${unreadBookingsCount > 0 ? 'has-unread' : ''}`}
              onClick={handleOpenNotifDropdown}
              title="Patient Bed Booking Alerts"
            >
              <FaBell className="btn-icon text-amber" />
              <span className="btn-label">Alerts</span>
              {bookings.length > 0 && (
                <span className="notif-badge-pill">{bookings.length}</span>
              )}
            </button>

            {/* Notification Popover Flyout */}
            {notifDropdownOpen && (
              <div className="notif-dropdown-popover glass-card">
                <div className="notif-popover-header">
                  <div className="notif-head-title">
                    <FaBell className="text-amber" />
                    <strong>Incoming Bed Reservations</strong>
                    <span className="notif-count-tag">{bookings.length} Total</span>
                  </div>
                  {bookings.length > 0 && (
                    <button 
                      type="button" 
                      className="notif-clear-all-btn"
                      onClick={handleClearAllBookings}
                      title="Clear All Notifications"
                    >
                      <FaTrashAlt /> Clear All
                    </button>
                  )}
                </div>

                <div className="notif-popover-list">
                  {bookings.length === 0 ? (
                    <div className="notif-empty-state">
                      <FaCheckCircle className="empty-check-ico" />
                      <span>No active booking alerts</span>
                      <p>When patients reserve beds online, real-time alerts appear here.</p>
                    </div>
                  ) : (
                    bookings.map(b => (
                      <div 
                        key={b._id} 
                        className={`notif-item-card ${!b.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          setActiveTab('bookings');
                          setNotifDropdownOpen(false);
                        }}
                      >
                        <div className="notif-avatar">
                          <FaUserInjured />
                        </div>
                        <div className="notif-body">
                          <div className="notif-line-1">
                            <strong>{b.patientName}</strong>
                            <span className="notif-time">{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="notif-facility">
                            Reserved <strong>{b.bedType}</strong> at <span className="text-cyan">{b.hospitalName}</span>
                          </p>
                          <div className="notif-token-row">
                            <span className="notif-token-badge">{b.token}</span>
                            <span className="notif-phone"><FaPhone className="ico-xs" /> {b.phone}</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="notif-item-clear-btn"
                          onClick={(e) => handleClearSingleBooking(b._id, e)}
                          title="Dismiss notification"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {bookings.length > 0 && (
                  <div className="notif-popover-footer">
                    <button 
                      type="button" 
                      className="view-all-bookings-btn"
                      onClick={() => {
                        setActiveTab('bookings');
                        setNotifDropdownOpen(false);
                      }}
                    >
                      View Full Reservations Table <FaArrowRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manage Admins Button */}
          <button 
            type="button"
            className="admin-cmd-btn btn-manage-admins"
            onClick={() => setAdminsModalOpen(true)}
            title="View & Manage Administrators"
          >
            <FaUsersCog className="btn-icon" />
            <span className="btn-label">Admins ({adminsList.length})</span>
          </button>

          {/* Add Hospital Button */}
          <button 
            type="button"
            className="admin-cmd-btn btn-add-hospital"
            onClick={handleOpenAddHospital}
            title="Add New Hospital & Bed Facility"
          >
            <FaPlus className="btn-icon" />
            <span className="btn-label">Add Hospital</span>
          </button>

          {/* New Transfer Button */}
          <button 
            type="button"
            className="admin-cmd-btn btn-transfer-shortcut"
            onClick={handleOpenTransferModal}
            title="Initiate Inter-Hospital Transfer"
          >
            <FaExchangeAlt className="btn-icon text-cyan" />
            <span className="btn-label">New Transfer</span>
          </button>

          {/* Broadcast Alert Button */}
          <button 
            type="button"
            className="admin-cmd-btn btn-broadcast-shortcut"
            onClick={() => setBroadcastModalOpen(true)}
            title="Dispatch Emergency Broadcast Alert"
          >
            <FaBullhorn className="btn-icon text-rose" />
            <span className="btn-label">Broadcast</span>
          </button>

          {/* Admin System Settings */}
          <button 
            type="button"
            className="admin-cmd-btn btn-settings-cmd" 
            onClick={() => setSettingsModalOpen(true)}
            title="Admin System & Telemetry Settings"
          >
            <FaCog className="btn-icon text-cyan" />
            <span className="btn-label">Settings</span>
          </button>

          {/* Theme Toggle */}
          <button 
            type="button"
            className="admin-cmd-btn btn-theme-cmd" 
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FaSun className="btn-icon text-amber" /> : <FaMoon className="btn-icon text-cyan" />}
            <span className="btn-label">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Sign Out */}
          <button 
            type="button"
            className="admin-cmd-btn btn-logout-cmd" 
            onClick={() => { adminLogout(); navigate('/admin/login'); }}
            title="Secure Sign Out"
          >
            <FaSignOutAlt className="btn-icon text-rose" />
            <span className="btn-label">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. RESOURCE ANALYTICS KPI ROW (INTERACTIVE POWER TOOLS) */}
      <section className="admin-kpi-grid">
        <div 
          className="admin-kpi-card glass-card kpi-interactive" 
          onClick={() => { setActiveTab('beds'); setFilterStatus('All'); }}
          title="Click to view all registered hospitals"
        >
          <div className="kpi-icon-wrap icon-cyan">
            <FaHospital />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Registered Hospitals</span>
            <h3 className="kpi-value text-cyan">{totalHospitals}</h3>
            <span className="kpi-trend">Live in MongoDB</span>
          </div>
        </div>

        {/* Total Bed Capacity -> Interactive Regional Analytics */}
        <div 
          className="admin-kpi-card glass-card kpi-interactive" 
          onClick={() => setBedSummaryModalOpen(true)}
          title="Click for Regional Bed Capacity Analytics & Allocation Matrix"
        >
          <div className="kpi-icon-wrap icon-green">
            <FaBed />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Active / Max Capacity</span>
            <h3 className="kpi-value text-green">{totalBeds} <span className="kpi-max-sub">/ {totalMaxCapacity}</span></h3>
            <span className="kpi-trend">🔍 {Math.round((totalBeds / (totalMaxCapacity || 1)) * 100)}% Max Regional Utilization</span>
          </div>
        </div>

        {/* Available ICU Beds -> Interactive ICU Surge Allocator */}
        <div 
          className="admin-kpi-card glass-card kpi-interactive" 
          onClick={() => setIcuTelemetryModalOpen(true)}
          title="Click for Live ICU Surge Allocator & Triage Dispatch"
        >
          <div className="kpi-icon-wrap icon-rose">
            <FaProcedures />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Available ICU Beds</span>
            <h3 className="kpi-value text-rose">{totalIcuBeds}</h3>
            <span className="kpi-trend">🚨 Emergency ICU Allocator</span>
          </div>
        </div>

        {/* Patient Bed Bookings KPI Card */}
        <div 
          className="admin-kpi-card glass-card kpi-interactive" 
          onClick={() => setActiveTab('bookings')}
          title="Click to view Patient Bed Reservations"
        >
          <div className="kpi-icon-wrap icon-amber">
            <FaClipboardList />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Patient Bookings</span>
            <h3 className="kpi-value text-amber">{bookings.length}</h3>
            <span className="kpi-trend">{unreadBookingsCount > 0 ? `🔔 ${unreadBookingsCount} New Alerts` : 'Live Stream'}</span>
          </div>
        </div>

        <div 
          className="admin-kpi-card glass-card kpi-interactive" 
          onClick={() => setActiveTab('transfers')}
          title="Click to view Active Patient Transfers"
        >
          <div className="kpi-icon-wrap icon-purple">
            <FaAmbulance />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Active Transfers</span>
            <h3 className="kpi-value text-purple">{activeTransfersCount}</h3>
            <span className="kpi-trend">In Transit / En Route</span>
          </div>
        </div>

        <div 
          className="admin-kpi-card glass-card kpi-interactive" 
          onClick={() => setActiveTab('audit')}
          title="Click to view Audit Trail"
        >
          <div className="kpi-icon-wrap icon-blue">
            <FaHistory />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Audit Logs</span>
            <h3 className="kpi-value text-cyan">{auditLogs.length}</h3>
            <span className="kpi-trend">Tracked Events</span>
          </div>
        </div>
      </section>

      {/* 3. PRIMARY MODULE NAVIGATION TABS (ENHANCED WITH PATIENT BOOKINGS) */}
      <nav className="admin-module-tabs-nav glass-card">
        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
          onClick={() => setActiveTab('beds')}
        >
          <FaHospital className="tab-ico text-cyan" />
          <span>Hospital & Bed Command</span>
        </button>

        {/* 🌟 NEW: PATIENT BED BOOKINGS TAB */}
        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <FaUserInjured className="tab-ico text-amber" />
          <span>Patient Bed Bookings</span>
          {bookings.length > 0 && <span className="tab-counter-badge">{bookings.length}</span>}
        </button>

        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          <FaChartLine className="tab-ico text-green" />
          <span>AI Surge Forecasting</span>
          <span className="tab-micro-badge">AI ML</span>
        </button>

        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'blood' ? 'active' : ''}`}
          onClick={() => setActiveTab('blood')}
        >
          <FaTint className="tab-ico text-rose" />
          <span>Blood & Pharma Telemetry</span>
        </button>

        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          <FaExchangeAlt className="tab-ico text-purple" />
          <span>Patient Transfers</span>
          {activeTransfersCount > 0 && <span className="tab-counter-badge">{activeTransfersCount}</span>}
        </button>

        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'broadcasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcasts')}
        >
          <FaBullhorn className="tab-ico text-rose" />
          <span>Broadcast Hub</span>
          {activeBroadcasts.length > 0 && <span className="tab-alert-badge">{activeBroadcasts.length}</span>}
        </button>

        <button 
          type="button" 
          className={`module-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FaHistory className="tab-ico text-cyan" />
          <span>Security Audit Trail</span>
        </button>
      </nav>

      {/* ========================================================
          TAB 1: HOSPITAL & BED COMMAND
          ======================================================== */}
      {activeTab === 'beds' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaHospital className="title-icon text-cyan" /> Hospital & Emergency Bed Management
              </h2>
              <p className="section-subtitle">Real-time control over hospital capacity, max bed ceilings, ICU bed counts, and triage statuses</p>
            </div>

            <div className="section-controls-group">
              <div className="admin-search-bar">
                <FaSearch className="search-icon text-cyan" />
                <input
                  type="text"
                  placeholder="Search hospitals by name, city, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-pill-group">
                <button 
                  type="button" 
                  className={`filter-chip ${filterStatus === 'All' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('All')}
                >All</button>
                <button 
                  type="button" 
                  className={`filter-chip ${filterStatus === 'Critical' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Critical')}
                >Critical ICU</button>
                <button 
                  type="button" 
                  className={`filter-chip ${filterStatus === 'Open' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Open')}
                >Open Triage</button>
              </div>

              <button 
                type="button" 
                className="admin-cmd-btn btn-sync-telemetry" 
                onClick={loadDashboardData} 
                title="Sync with Live Database"
              >
                <FaSyncAlt className="btn-icon" />
                <span className="btn-label">Sync</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="admin-loading-state">
              <FaSyncAlt className="spinning-icon text-cyan" />
              <p>Loading real-time hospital facilities from MongoDB...</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="admin-empty-state">
              <FaHospital className="empty-icon" />
              <h3>No Hospital Facilities Found</h3>
              <p>No hospitals match your search criteria. Add a new facility to get started.</p>
              <button type="button" className="admin-cmd-btn btn-add-hospital" onClick={handleOpenAddHospital}>
                <FaPlus /> Add New Hospital
              </button>
            </div>
          ) : (
            <div className="admin-hospitals-table-wrap">
              <table className="admin-hospitals-table">
                <thead>
                  <tr>
                    <th>Hospital Facility</th>
                    <th>Location & Contact</th>
                    <th>ICU Beds</th>
                    <th>Oxygen Beds</th>
                    <th>General Beds</th>
                    <th>Ventilators</th>
                    <th>Max Bed Capacity</th>
                    <th>Emergency Status</th>
                    <th>Supplies</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.map((hosp) => {
                    const currentTotal = (hosp.generalBeds || 0) + (hosp.oxygenBeds || 0) + (hosp.icuBeds || 0);
                    const currentMax = hosp.maxBedCapacity || (currentTotal + 25);
                    const utilPct = Math.min(100, Math.round((currentTotal / (currentMax || 1)) * 100));

                    return (
                      <tr key={hosp._id}>
                        <td>
                          <div className="hosp-table-name">
                            <strong>{hosp.name}</strong>
                            <div className="hosp-table-depts">
                              {Array.isArray(hosp.departments) ? (
                                hosp.departments.slice(0, 2).map((d, i) => (
                                  <span key={i} className="dept-micro-pill">{d}</span>
                                ))
                              ) : (
                                <span className="dept-micro-pill">{hosp.departments}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="hosp-table-loc">
                            <span><FaMapMarkerAlt className="loc-ico" /> {hosp.address}</span>
                            <span className="text-secondary"><FaPhone className="loc-ico" /> {hosp.phone}</span>
                          </div>
                        </td>

                        <td>
                          <div className="bed-telemetry-adjuster">
                            <button 
                              type="button"
                              className="adjust-btn minus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'icuBeds', -1)}
                              title="Decrease ICU Beds"
                            >-</button>
                            <span className={`bed-badge-val ${hosp.icuBeds <= adminSettings.criticalIcuThreshold ? 'badge-critical' : 'badge-good'}`}>
                              {hosp.icuBeds}
                            </span>
                            <button 
                              type="button"
                              className="adjust-btn plus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'icuBeds', 1)}
                              title="Increase ICU Beds"
                            >+</button>
                          </div>
                        </td>

                        <td>
                          <div className="bed-telemetry-adjuster">
                            <button 
                              type="button"
                              className="adjust-btn minus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'oxygenBeds', -1)}
                              title="Decrease Oxygen Beds"
                            >-</button>
                            <span className="bed-badge-val badge-neutral">{hosp.oxygenBeds}</span>
                            <button 
                              type="button"
                              className="adjust-btn plus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'oxygenBeds', 1)}
                              title="Increase Oxygen Beds"
                            >+</button>
                          </div>
                        </td>

                        <td>
                          <div className="bed-telemetry-adjuster">
                            <button 
                              type="button"
                              className="adjust-btn minus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'generalBeds', -1)}
                              title="Decrease General Beds"
                            >-</button>
                            <span className="bed-badge-val badge-neutral">{hosp.generalBeds}</span>
                            <button 
                              type="button"
                              className="adjust-btn plus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'generalBeds', 1)}
                              title="Increase General Beds"
                            >+</button>
                          </div>
                        </td>

                        <td>
                          <div className="bed-telemetry-adjuster">
                            <button 
                              type="button"
                              className="adjust-btn minus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'ventilators', -1)}
                              title="Decrease Ventilators"
                            >-</button>
                            <span className="bed-badge-val badge-purple">{hosp.ventilators}</span>
                            <button 
                              type="button"
                              className="adjust-btn plus" 
                              onClick={() => handleQuickBedAdjust(hosp._id, 'ventilators', 1)}
                              title="Increase Ventilators"
                            >+</button>
                          </div>
                        </td>

                        <td>
                          <div className="max-bed-adjuster-col">
                            <div className="bed-telemetry-adjuster">
                              <button 
                                type="button"
                                className="adjust-btn minus" 
                                onClick={() => handleQuickBedAdjust(hosp._id, 'maxBedCapacity', -5)}
                                title="Decrease Max Capacity by 5"
                              >-</button>
                              <span className="bed-badge-val badge-amber">
                                {currentMax}
                              </span>
                              <button 
                                type="button"
                                className="adjust-btn plus" 
                                onClick={() => handleQuickBedAdjust(hosp._id, 'maxBedCapacity', 5)}
                                title="Increase Max Capacity by 5"
                              >+</button>
                            </div>
                            <div className="table-util-bar-wrap" title={`${currentTotal} / ${currentMax} beds occupied (${utilPct}%)`}>
                              <div className="table-util-bar-track">
                                <div 
                                  className={`table-util-bar-fill ${utilPct > 85 ? 'fill-danger' : (utilPct > 65 ? 'fill-warning' : 'fill-good')}`}
                                  style={{ width: `${utilPct}%` }}
                                ></div>
                              </div>
                              <span className="util-pct-text">{utilPct}%</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`status-pill ${hosp.emergencyStatus.includes('Open') ? 'status-open' : (hosp.emergencyStatus.includes('Critical') ? 'status-critical' : 'status-limited')}`}>
                            {hosp.emergencyStatus}
                          </span>
                        </td>

                        <td>
                          <button 
                            type="button"
                            className="tbl-action-pill btn-supplies-pill"
                            onClick={() => handleOpenInventoryModal(hosp)}
                            title="Manage Blood & Medical Supplies"
                          >
                            <FaTint className="text-rose" />
                            <span>Supplies</span>
                          </button>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-btns">
                            <button 
                              type="button"
                              className="tbl-action-pill btn-edit-pill" 
                              onClick={() => handleOpenEditHospital(hosp)}
                              title="Edit Full Hospital Details"
                            >
                              <FaEdit className="tbl-act-ico" />
                              <span>Edit</span>
                            </button>
                            <button 
                              type="button"
                              className="tbl-action-pill btn-del-pill" 
                              onClick={() => handleDeleteHospital(hosp)}
                              title="Delete Hospital Facility"
                            >
                              <FaTrashAlt className="tbl-act-ico" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 2: PATIENT BED BOOKINGS (REAL-TIME ADMISSIONS)
          ======================================================== */}
      {activeTab === 'bookings' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaUserInjured className="title-icon text-amber" /> Real-Time Patient Bed Reservations & Admissions
              </h2>
              <p className="section-subtitle">Live stream of incoming patient digital bed holds, ambulance requests, and triage admissions</p>
            </div>

            <div className="section-controls-group">
              <div className="filter-pill-group">
                <button 
                  type="button" 
                  className={`filter-chip ${bookingFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('All')}
                >All ({bookings.length})</button>
                <button 
                  type="button" 
                  className={`filter-chip ${bookingFilter === 'Confirmed' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('Confirmed')}
                >Active Holds</button>
                <button 
                  type="button" 
                  className={`filter-chip ${bookingFilter === 'Admitted' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('Admitted')}
                >Admitted</button>
                <button 
                  type="button" 
                  className={`filter-chip ${bookingFilter === 'Discharged' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('Discharged')}
                >Discharged</button>
              </div>

              {bookings.length > 0 && (
                <button 
                  type="button" 
                  className="admin-cmd-btn btn-clear-all-notifs"
                  onClick={handleClearAllBookings}
                  title="Clear All Booking Notifications"
                >
                  <FaTrashAlt className="btn-icon text-rose" />
                  <span className="btn-label">Clear All</span>
                </button>
              )}

              <button 
                type="button" 
                className="admin-cmd-btn btn-sync-telemetry" 
                onClick={loadDashboardData} 
                title="Sync with Live Database"
              >
                <FaSyncAlt className="btn-icon" />
                <span className="btn-label">Sync</span>
              </button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="admin-empty-state">
              <FaClipboardList className="empty-icon text-amber" />
              <h3>No Incoming Patient Bed Bookings</h3>
              <p>When patients reserve emergency beds online via the Hospital Coordination portal, incoming digital tokens appear here instantly.</p>
            </div>
          ) : (
            <div className="admin-hospitals-table-wrap">
              <table className="admin-hospitals-table">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Hospital Facility</th>
                    <th>Bed Reserved</th>
                    <th>Ambulance</th>
                    <th>Admission Token</th>
                    <th>Reservation Time</th>
                    <th>Admission Status</th>
                    <th style={{ textAlign: 'right' }}>Manage Case</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter(b => bookingFilter === 'All' || b.status === bookingFilter)
                    .map((b) => (
                      <tr key={b._id} className={!b.isRead ? 'row-unread-highlight' : ''}>
                        <td>
                          <div className="hosp-table-name">
                            <strong>{b.patientName}</strong>
                            <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                              <FaPhone className="loc-ico" /> {b.phone}
                            </span>
                            <span className="patient-cond-text">{b.conditionSummary}</span>
                          </div>
                        </td>

                        <td>
                          <strong className="text-cyan">{b.hospitalName}</strong>
                        </td>

                        <td>
                          <span className={`bed-req-pill ${b.bedType?.includes('ICU') ? 'pill-icu' : 'pill-gen'}`}>
                            {b.bedType}
                          </span>
                        </td>

                        <td>
                          <span className={`ambulance-badge ${b.needAmbulance ? 'amb-yes' : 'amb-no'}`}>
                            {b.needAmbulance ? '🚑 ALS Dispatched' : '🚗 Self-Transport'}
                          </span>
                        </td>

                        <td>
                          <span className="token-code-tag">{b.token}</span>
                        </td>

                        <td>
                          <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                            {new Date(b.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td>
                          <span className={`status-pill ${b.status === 'Confirmed' ? 'status-open' : (b.status === 'Admitted' ? 'status-limited' : 'status-critical')}`}>
                            {b.status}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div className="transfer-action-group">
                            {b.status === 'Confirmed' && (
                              <button 
                                type="button" 
                                className="tbl-action-pill btn-dispatch-pill"
                                onClick={() => handleUpdateBookingStatus(b._id, 'Admitted')}
                                title="Mark Patient as Admitted"
                              >
                                <FaCheck /> Admit
                              </button>
                            )}

                            {b.status === 'Admitted' && (
                              <button 
                                type="button" 
                                className="tbl-action-pill btn-admit-pill"
                                onClick={() => handleUpdateBookingStatus(b._id, 'Discharged')}
                                title="Discharge Patient and Return Bed to Capacity"
                              >
                                <FaHeartbeat /> Discharge (+1 Bed)
                              </button>
                            )}

                            {/* Clear Single Notification Button */}
                            <button 
                              type="button" 
                              className="tbl-action-pill btn-del-pill"
                              onClick={(e) => handleClearSingleBooking(b._id, e)}
                              title="Clear / Dismiss this booking notification"
                            >
                              <FaTrashAlt /> Clear
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 3: AI SURGE FORECASTING & PREDICTIVE ANALYTICS
          ======================================================== */}
      {activeTab === 'forecast' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaChartLine className="title-icon text-green" /> Predictive AI Bed Occupancy & Surge Analytics
              </h2>
              <p className="section-subtitle">Deep learning models forecasting 24h to 72h bed demand, saturation risks, and triage diversions</p>
            </div>

            <div className="forecast-horizon-selector">
              <span className="horizon-label">Forecast Horizon:</span>
              <button 
                type="button"
                className={`horizon-btn ${forecastHorizon === '24h' ? 'active' : ''}`}
                onClick={() => setForecastHorizon('24h')}
              >24 Hours</button>
              <button 
                type="button"
                className={`horizon-btn ${forecastHorizon === '48h' ? 'active' : ''}`}
                onClick={() => setForecastHorizon('48h')}
              >48 Hours</button>
              <button 
                type="button"
                className={`horizon-btn ${forecastHorizon === '72h' ? 'active' : ''}`}
                onClick={() => setForecastHorizon('72h')}
              >72 Hours</button>
            </div>
          </div>

          <div className="ai-insight-box">
            <div className="ai-insight-icon">
              <FaRobot />
            </div>
            <div className="ai-insight-text">
              <h4>TitanVitals Clinical Intelligence Recommendation</h4>
              <p>
                Projected regional triage inflow is elevated by <strong>+18.4%</strong> over the next {forecastHorizon}. 
                Recommend pre-authorizing patient transfers from <strong>Central Apex Multi-Specialty</strong> to <strong>St. Jude Trauma Center</strong> to safeguard ICU reserve buffer.
              </p>
            </div>
          </div>

          <div className="forecast-cards-grid">
            {hospitals.map((hosp, idx) => {
              const currentIcu = hosp.icuBeds || 0;
              const multiplier = forecastHorizon === '24h' ? 0.8 : (forecastHorizon === '48h' ? 0.6 : 0.45);
              const predictedIcu = Math.max(0, Math.round(currentIcu * multiplier));
              const surgeRiskPercent = Math.min(100, Math.round((1 - (predictedIcu / (currentIcu + 2 || 1))) * 100));
              const isHighRisk = surgeRiskPercent > 70 || predictedIcu <= 1;

              return (
                <div key={hosp._id || idx} className={`forecast-hosp-card ${isHighRisk ? 'card-risk-high' : 'card-risk-normal'}`}>
                  <div className="forecast-card-header">
                    <div>
                      <h4>{hosp.name}</h4>
                      <span className="text-secondary">{hosp.city}</span>
                    </div>
                    <span className={`risk-badge ${isHighRisk ? 'risk-critical' : 'risk-optimal'}`}>
                      {isHighRisk ? '⚠️ High Surge Risk' : '🟢 Stable Capacity'}
                    </span>
                  </div>

                  <div className="forecast-metrics-grid">
                    <div className="f-metric">
                      <span className="f-lbl">Current ICU</span>
                      <strong className="f-val text-cyan">{currentIcu} Beds</strong>
                    </div>
                    <div className="f-metric">
                      <span className="f-lbl">Projected ({forecastHorizon})</span>
                      <strong className={`f-val ${predictedIcu <= 1 ? 'text-rose' : 'text-green'}`}>{predictedIcu} Beds</strong>
                    </div>
                    <div className="f-metric">
                      <span className="f-lbl">Surge Index</span>
                      <strong className="f-val text-amber">{surgeRiskPercent}%</strong>
                    </div>
                  </div>

                  <div className="forecast-bar-wrap">
                    <div className="bar-label-row">
                      <span>Predicted Saturation Level</span>
                      <span>{surgeRiskPercent}%</span>
                    </div>
                    <div className="forecast-progress-track">
                      <div 
                        className={`forecast-progress-fill ${surgeRiskPercent > 75 ? 'fill-danger' : (surgeRiskPercent > 50 ? 'fill-warning' : 'fill-good')}`}
                        style={{ width: `${surgeRiskPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="forecast-card-footer">
                    <button 
                      type="button" 
                      className="quick-route-btn"
                      onClick={() => {
                        setTransferForm(prev => ({
                          ...prev,
                          originHospital: hosp.name,
                          destinationHospital: hospitals.find(o => o._id !== hosp._id)?.name || ''
                        }));
                        setTransferModalOpen(true);
                      }}
                    >
                      <FaExchangeAlt /> Initiate Preventive Transfer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 4: BLOOD BANK & PHARMA TELEMETRY
          ======================================================== */}
      {activeTab === 'blood' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaTint className="title-icon text-rose" /> Regional Blood Bank & Critical Medicine Telemetry
              </h2>
              <p className="section-subtitle">Real-time inventory matrix of rare blood units, plasma bags, and emergency medical reserves</p>
            </div>

            <button 
              type="button" 
              className="admin-cmd-btn btn-sync-telemetry"
              onClick={loadDashboardData}
            >
              <FaSyncAlt className="btn-icon" />
              <span>Refresh Stocks</span>
            </button>
          </div>

          <div className="blood-matrix-grid">
            {hospitals.map(hosp => {
              const b = hosp.bloodInventory || {};
              const m = hosp.medicineStock || {};

              return (
                <div key={hosp._id} className="blood-hosp-card glass-card">
                  <div className="blood-card-top">
                    <div>
                      <h3>{hosp.name}</h3>
                      <span className="text-secondary">{hosp.address}</span>
                    </div>
                    <button 
                      type="button" 
                      className="edit-inventory-btn"
                      onClick={() => handleOpenInventoryModal(hosp)}
                    >
                      <FaEdit /> Edit Inventory
                    </button>
                  </div>

                  <div className="blood-units-section">
                    <span className="section-micro-tag">🩸 Blood Units In Stock</span>
                    <div className="blood-units-pills-grid">
                      <div className={`blood-pill ${b.oNegative <= 4 ? 'pill-low' : ''}`}>
                        <span className="bg-type">O-</span>
                        <strong className="bg-count">{b.oNegative ?? 8}</strong>
                      </div>
                      <div className="blood-pill">
                        <span className="bg-type">O+</span>
                        <strong className="bg-count">{b.oPositive ?? 24}</strong>
                      </div>
                      <div className={`blood-pill ${b.aNegative <= 4 ? 'pill-low' : ''}`}>
                        <span className="bg-type">A-</span>
                        <strong className="bg-count">{b.aNegative ?? 6}</strong>
                      </div>
                      <div className="blood-pill">
                        <span className="bg-type">A+</span>
                        <strong className="bg-count">{b.aPositive ?? 18}</strong>
                      </div>
                      <div className={`blood-pill ${b.bNegative <= 4 ? 'pill-low' : ''}`}>
                        <span className="bg-type">B-</span>
                        <strong className="bg-count">{b.bNegative ?? 5}</strong>
                      </div>
                      <div className="blood-pill">
                        <span className="bg-type">B+</span>
                        <strong className="bg-count">{b.bPositive ?? 20}</strong>
                      </div>
                      <div className={`blood-pill ${b.abNegative <= 2 ? 'pill-low' : ''}`}>
                        <span className="bg-type">AB-</span>
                        <strong className="bg-count">{b.abNegative ?? 3}</strong>
                      </div>
                      <div className="blood-pill">
                        <span className="bg-type">AB+</span>
                        <strong className="bg-count">{b.abPositive ?? 12}</strong>
                      </div>
                      <div className="blood-pill pill-special">
                        <span className="bg-type">Plasma</span>
                        <strong className="bg-count">{b.plasmaUnits ?? 35}</strong>
                      </div>
                      <div className="blood-pill pill-special">
                        <span className="bg-type">Platelets</span>
                        <strong className="bg-count">{b.plateletUnits ?? 16}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="med-supplies-section">
                    <span className="section-micro-tag">💊 Critical Medical Reserves</span>
                    <div className="med-stock-row">
                      <div className="med-stock-item">
                        <span>Oxygen Cylinders</span>
                        <strong>{m.oxygenCylinders ?? 45} units</strong>
                      </div>
                      <div className="med-stock-item">
                        <span>Dialysis Kits</span>
                        <strong>{m.dialysisKits ?? 14} kits</strong>
                      </div>
                      <div className="med-stock-item">
                        <span>Anti-Venom Vials</span>
                        <strong>{m.antiVenomVials ?? 10} vials</strong>
                      </div>
                      <div className="med-stock-item">
                        <span>Epinephrine</span>
                        <strong>{m.epinephrineVials ?? 50} vials</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 5: INTER-HOSPITAL PATIENT TRANSFERS
          ======================================================== */}
      {activeTab === 'transfers' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaExchangeAlt className="title-icon text-purple" /> Inter-Hospital Patient Transfer Pipeline
              </h2>
              <p className="section-subtitle">Real-time coordinator for emergency bed triage transfers, ALS ambulance dispatch, and admission handoffs</p>
            </div>

            <button 
              type="button" 
              className="admin-cmd-btn btn-add-hospital"
              onClick={handleOpenTransferModal}
            >
              <FaPlus className="btn-icon" />
              <span>Request Patient Transfer</span>
            </button>
          </div>

          {transfers.length === 0 ? (
            <div className="admin-empty-state">
              <FaAmbulance className="empty-icon" />
              <h3>No Active Patient Transfers</h3>
              <p>All emergency facilities are currently operating with balanced local capacity.</p>
              <button type="button" className="admin-cmd-btn btn-add-hospital" onClick={handleOpenTransferModal}>
                <FaPlus /> Request Emergency Transfer
              </button>
            </div>
          ) : (
            <div className="transfers-table-wrap">
              <table className="admin-hospitals-table">
                <thead>
                  <tr>
                    <th>Patient Case</th>
                    <th>Triage Priority</th>
                    <th>Bed Requested</th>
                    <th>Origin Hospital</th>
                    <th>Destination Facility</th>
                    <th>Ambulance & ETA</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Update Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(tr => (
                    <tr key={tr._id}>
                      <td>
                        <div className="hosp-table-name">
                          <strong>{tr.patientName} ({tr.patientAge}y, {tr.patientGender})</strong>
                          <span className="text-secondary" style={{ fontSize: '0.76rem' }}>{tr.conditionSummary}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`priority-tag ${tr.priority.includes('P1') ? 'p-critical' : (tr.priority.includes('P2') ? 'p-urgent' : 'p-routine')}`}>
                          {tr.priority}
                        </span>
                      </td>

                      <td>
                        <span className="bed-req-pill">{tr.requiredBedType}</span>
                      </td>

                      <td>
                        <strong>{tr.originHospital}</strong>
                      </td>

                      <td>
                        <strong className="text-cyan">{tr.destinationHospital}</strong>
                      </td>

                      <td>
                        <div className="ambulance-eta-box">
                          <span><FaAmbulance className="text-amber" /> {tr.ambulanceUnit}</span>
                          <span className="text-secondary">ETA ~{tr.etaMinutes} min</span>
                        </div>
                      </td>

                      <td>
                        <span className={`status-pill ${tr.status === 'Completed' ? 'status-open' : (tr.status === 'In Transit' ? 'status-limited' : 'status-critical')}`}>
                          {tr.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="transfer-action-group">
                          {tr.status === 'Pending Review' && (
                            <button 
                              type="button" 
                              className="tbl-action-pill btn-dispatch-pill"
                              onClick={() => handleUpdateTransferStatus(tr._id, 'Ambulance Dispatched')}
                            >
                              Dispatch ALS
                            </button>
                          )}
                          {tr.status === 'Ambulance Dispatched' && (
                            <button 
                              type="button" 
                              className="tbl-action-pill btn-transit-pill"
                              onClick={() => handleUpdateTransferStatus(tr._id, 'In Transit')}
                            >
                              Mark In Transit
                            </button>
                          )}
                          {tr.status === 'In Transit' && (
                            <button 
                              type="button" 
                              className="tbl-action-pill btn-admit-pill"
                              onClick={() => handleUpdateTransferStatus(tr._id, 'Completed')}
                            >
                              <FaCheck /> Mark Admitted
                            </button>
                          )}
                          <button 
                            type="button"
                            className="tbl-action-pill btn-del-pill" 
                            onClick={() => handleDeleteTransfer(tr._id)}
                            title="Remove Transfer Record"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 6: EMERGENCY BROADCAST HUB
          ======================================================== */}
      {activeTab === 'broadcasts' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaBullhorn className="title-icon text-rose" /> Regional Emergency Broadcast Hub
              </h2>
              <p className="section-subtitle">Transmit instant high-priority emergency notifications and surge alerts across all hospital networks</p>
            </div>

            <button 
              type="button" 
              className="admin-cmd-btn btn-broadcast-shortcut"
              onClick={() => setBroadcastModalOpen(true)}
            >
              <FaBullhorn className="btn-icon" />
              <span>Dispatch New Broadcast</span>
            </button>
          </div>

          <div className="broadcast-history-list">
            {broadcasts.length === 0 ? (
              <div className="admin-empty-state">
                <FaBullhorn className="empty-icon" />
                <h3>No Emergency Broadcasts Active</h3>
                <p>Use this channel to transmit emergency disaster warnings and critical capacity lockdowns.</p>
              </div>
            ) : (
              broadcasts.map(bc => (
                <div key={bc._id} className="broadcast-item-card glass-card">
                  <div className="bc-card-left">
                    <div className={`bc-severity-tag ${bc.severity.includes('Red') ? 'sev-red' : (bc.severity.includes('Blue') ? 'sev-blue' : 'sev-yellow')}`}>
                      {bc.severity}
                    </div>
                    <div className="bc-content">
                      <h4>{bc.title}</h4>
                      <p>{bc.message}</p>
                      <div className="bc-meta-row">
                        <span>Target: <strong>{bc.targetHospitals}</strong></span>
                        <span>Author: <strong>{bc.authorName} (ID: {bc.authorAdminId})</strong></span>
                        <span>Dispatched: <strong>{new Date(bc.createdAt).toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="tbl-action-pill btn-del-pill"
                    onClick={() => handleDeleteBroadcast(bc._id)}
                    title="Dismiss Broadcast"
                  >
                    <FaTrashAlt /> Dismiss
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 7: SECURITY AUDIT TRAIL & COMPLIANCE (STRUCTURED IN-PATIENT)
          ======================================================== */}
      {activeTab === 'audit' && (
        <section className="admin-section glass-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                <FaHistory className="title-icon text-cyan" /> Tamper-Proof Security & Compliance Audit Trail
              </h2>
              <p className="section-subtitle">Structured tracking of In-Patient clinical moves, telemetry shifts, and administrative dispatches</p>
            </div>

            <div className="audit-controls-row">
              {/* Search in Audit */}
              <div className="admin-search-bar audit-search-box">
                <FaSearch className="search-icon text-cyan" />
                <input
                  type="text"
                  placeholder="Search patient, action, or hospital..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>

              {/* View Mode Switcher: Structured In-Patient vs Flat Feed */}
              <div className="filter-pill-group">
                <button 
                  type="button" 
                  className={`filter-chip ${auditViewMode === 'structured' ? 'active' : ''}`}
                  onClick={() => setAuditViewMode('structured')}
                  title="Group moves under structured In-Patient case dossiers"
                >
                  <FaUserInjured className="chip-ico" /> In-Patient Dossiers ({patientJourneys.length})
                </button>
                <button 
                  type="button" 
                  className={`filter-chip ${auditViewMode === 'feed' ? 'active' : ''}`}
                  onClick={() => setAuditViewMode('feed')}
                  title="View flat chronological stream"
                >
                  <FaListUl className="chip-ico" /> Chronological Feed ({auditLogs.length})
                </button>
              </div>

              {/* Category Filter */}
              <select
                className="audit-filter-select"
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories ({auditLogs.length})</option>
                <option value="Bed Telemetry">Bed Telemetry</option>
                <option value="Hospital Management">Hospital Management</option>
                <option value="Patient Transfer">Patient Transfers</option>
                <option value="Emergency Broadcast">Emergency Broadcasts</option>
                <option value="Supply Inventory">Supply Inventory</option>
              </select>

              {/* Clear All Audit Logs Button (Opens Confirmation Modal) */}
              {auditLogs.length > 0 && (
                <button 
                  type="button" 
                  className="admin-cmd-btn btn-clear-all-notifs"
                  onClick={() => setClearAuditModalOpen(true)}
                  title="Purge All Audit Trail Records"
                >
                  <FaTrashAlt className="btn-icon text-rose" />
                  <span className="btn-label">Clear All Logs</span>
                </button>
              )}

              {/* Export Audit Log */}
              <button 
                type="button" 
                className="admin-cmd-btn btn-sync-telemetry"
                onClick={handleExportAuditLogs}
                title="Download JSON Compliance Report"
              >
                <FaDownload className="btn-icon" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="admin-empty-state">
              <FaHistory className="empty-icon" />
              <h3>No Audit Events Logged</h3>
              <p>Patient admissions, bed adjustments, and transfer movements will be automatically recorded here.</p>
            </div>
          ) : auditViewMode === 'structured' ? (
            /* ========================================================
               STRUCTURED IN-PATIENT CASE DOSSIERS
               ======================================================== */
            <div className="structured-audit-container">
              {/* Group 1: In-Patient Case Dossiers */}
              {patientJourneys.length > 0 && (
                <div className="patient-dossiers-group">
                  <div className="group-heading-row">
                    <div className="group-heading-title">
                      <FaUserInjured className="text-cyan" />
                      <h3>In-Patient Case Dossiers & Clinical Movements</h3>
                    </div>
                    <span className="group-count-tag">{patientJourneys.length} Active Patients</span>
                  </div>

                  <div className="patient-dossiers-grid">
                    {patientJourneys.map((patient) => {
                      const isExpanded = !!expandedPatients[patient.name]; // default collapsed, expands on click
                      return (
                        <div key={patient.name} className="patient-case-card glass-card">
                          <div 
                            className="patient-case-header"
                            onClick={() => togglePatientExpand(patient.name)}
                          >
                            <div className="patient-header-left">
                              <div className="patient-avatar-badge">
                                <FaUserInjured />
                              </div>
                              <div className="patient-title-col">
                                <div className="patient-name-row">
                                  <h4>In-Patient: <strong>{patient.name}</strong></h4>
                                  <span className="milestone-count-badge">
                                    {patient.logs.length} Milestones Tracked
                                  </span>
                                </div>
                                <div className="patient-meta-row">
                                  <span className="latest-action-text">Latest: <strong>{patient.latestAction}</strong></span>
                                  {patient.latestHospital && (
                                    <span className="facility-pill"><FaHospital className="ico-xs" /> {patient.latestHospital}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="patient-header-right">
                              <button
                                type="button"
                                className="patient-delete-dossier-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePatientDossier(patient.name, patient.logs);
                                }}
                                title={`Permanently delete all logs and history for In-Patient ${patient.name}`}
                              >
                                <FaTrashAlt className="dossier-trash-icon" />
                                <span className="dossier-trash-label">Delete In-Patient Log</span>
                              </button>
                              <span className="expand-hint-text">{isExpanded ? 'Close' : 'Expand Timeline'}</span>
                              <button type="button" className="patient-expand-btn" aria-label="Expand Timeline">
                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Patient Milestone Journey */}
                          {isExpanded && (
                            <div className="patient-journey-stepper">
                              <div className="stepper-timeline-track">
                                {patient.logs.map((log, idx) => (
                                  <div key={log._id || idx} className="journey-milestone-step">
                                    <div className="milestone-bullet">
                                      {log.action.includes('Transfer') ? <FaAmbulance /> : (log.action.includes('Bed') ? <FaBed /> : <FaCheckCircle />)}
                                    </div>
                                    <div className="milestone-content-box">
                                      <div className="milestone-head">
                                        <strong>{log.action}</strong>
                                        <span className="milestone-timestamp">
                                          {new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="milestone-details">{log.details}</p>
                                      <div className="milestone-footer-row">
                                        <span className="signature-tag">✍️ Signed by: <strong>{log.adminName} (ID: {log.adminId})</strong></span>
                                        {log.targetResource && <span className="target-tag">Target: {log.targetResource}</span>}
                                        <button 
                                          type="button" 
                                          className="audit-delete-item-btn"
                                          onClick={(e) => handleDeleteSingleAuditLog(log._id, e)}
                                          title="Delete this milestone log"
                                        >
                                          <FaTrashAlt />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 2: Hospital & Facility Infrastructure Operations */}
              {facilitySystemLogs.length > 0 && (
                <div className="system-logs-group">
                  <div className="group-heading-row">
                    <div className="group-heading-title">
                      <FaBuilding className="text-amber" />
                      <h3>Facility & System Operations Logs</h3>
                    </div>
                    <span className="group-count-tag">{facilitySystemLogs.length} Events</span>
                  </div>

                  <div className="audit-timeline">
                    {facilitySystemLogs.map((log) => (
                      <div key={log._id} className="audit-log-entry">
                        <div className="audit-badge-col">
                          <span className="audit-category-badge">{log.category}</span>
                        </div>
                        <div className="audit-details-col">
                          <div className="audit-header-line">
                            <strong>{log.action}</strong>
                            <span className="audit-time">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="audit-desc">{log.details}</p>
                          <div className="audit-signature-line">
                            <span>Admin Signature: <strong>{log.adminName} (ID: {log.adminId})</strong></span>
                            <span>Target: <strong className="text-cyan">{log.targetResource}</strong></span>
                            <button 
                              type="button" 
                              className="audit-delete-item-btn"
                              onClick={(e) => handleDeleteSingleAuditLog(log._id, e)}
                              title="Delete log entry"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================
               FLAT CHRONOLOGICAL AUDIT FEED
               ======================================================== */
            <div className="audit-timeline-wrap">
              <div className="audit-timeline">
                {auditLogs
                  .filter(l => auditCategoryFilter === 'All' || l.category === auditCategoryFilter)
                  .filter(l => !auditSearch || 
                    l.action?.toLowerCase().includes(auditSearch.toLowerCase()) || 
                    l.details?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                    l.targetResource?.toLowerCase().includes(auditSearch.toLowerCase()))
                  .map(log => (
                    <div key={log._id} className="audit-log-entry">
                      <div className="audit-badge-col">
                        <span className="audit-category-badge">{log.category}</span>
                      </div>
                      <div className="audit-details-col">
                        <div className="audit-header-line">
                          <strong>{log.action}</strong>
                          <span className="audit-time">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="audit-desc">{log.details}</p>
                        <div className="audit-signature-line">
                          <span>Admin Signature: <strong>{log.adminName} (ID: {log.adminId})</strong></span>
                          <span>Target: <strong className="text-cyan">{log.targetResource}</strong></span>
                          <button 
                            type="button" 
                            className="audit-delete-item-btn"
                            onClick={(e) => handleDeleteSingleAuditLog(log._id, e)}
                            title="Delete log entry"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          MODAL 1: ADD / EDIT HOSPITAL & BEDS
          ======================================================== */}
      {hospitalModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setHospitalModalOpen(false)}>
          <div className="admin-modal-box glass-card admin-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaHospital className="modal-title-icon text-cyan" />
                <div className="modal-title-texts">
                  <h3>{editingHospital ? 'Edit Hospital & Bed Capacity' : 'Add New Hospital Facility'}</h3>
                  <p className="modal-sub">Configure facility details, department specialties, active beds & max ceiling</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setHospitalModalOpen(false)}
                title="Close Modal"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <form onSubmit={handleSaveHospital} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Hospital Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Metro Trauma & Heart Institute"
                    value={hospForm.name}
                    onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Emergency Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="+1 (800) 555-0199"
                    value={hospForm.phone}
                    onChange={(e) => setHospForm({ ...hospForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Address / Street *</label>
                  <input
                    type="text"
                    placeholder="e.g. 742 Healthcare Boulevard"
                    value={hospForm.address}
                    onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>City / Medical Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Metro Medical District"
                    value={hospForm.city}
                    onChange={(e) => setHospForm({ ...hospForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="bed-inputs-5-row">
                <div className="bed-input-box">
                  <label className="text-rose"><FaProcedures /> ICU Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={hospForm.icuBeds}
                    onChange={(e) => setHospForm({ ...hospForm, icuBeds: e.target.value })}
                    required
                  />
                </div>

                <div className="bed-input-box">
                  <label className="text-cyan"><FaBed /> Oxygen Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={hospForm.oxygenBeds}
                    onChange={(e) => setHospForm({ ...hospForm, oxygenBeds: e.target.value })}
                    required
                  />
                </div>

                <div className="bed-input-box">
                  <label className="text-green"><FaBed /> General Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={hospForm.generalBeds}
                    onChange={(e) => setHospForm({ ...hospForm, generalBeds: e.target.value })}
                    required
                  />
                </div>

                <div className="bed-input-box">
                  <label className="text-purple"><FaLungs /> Ventilators</label>
                  <input
                    type="number"
                    min="0"
                    value={hospForm.ventilators}
                    onChange={(e) => setHospForm({ ...hospForm, ventilators: e.target.value })}
                    required
                  />
                </div>

                <div className="bed-input-box box-max-cap">
                  <label className="text-amber"><FaBuilding /> Max Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={hospForm.maxBedCapacity}
                    onChange={(e) => setHospForm({ ...hospForm, maxBedCapacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Departments / Specializations (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Emergency, Cardiology, Pulmonology"
                    value={hospForm.departments}
                    onChange={(e) => setHospForm({ ...hospForm, departments: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Emergency Triage Status</label>
                  <select
                    value={hospForm.emergencyStatus}
                    onChange={(e) => setHospForm({ ...hospForm, emergencyStatus: e.target.value })}
                  >
                    <option value="Open - Rapid Triage Active">🟢 Open - Rapid Triage Active</option>
                    <option value="Limited ICU Capacity">🟡 Limited ICU Capacity</option>
                    <option value="Critical Surge - Emergency Divert">🔴 Critical Surge - Emergency Divert</option>
                    <option value="Restricted - Trauma Only">🟠 Restricted - Trauma Only</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="modal-cancel-btn" onClick={() => setHospitalModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  <FaSave /> {editingHospital ? 'Update Hospital Record' : 'Save Hospital to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: VIEW & MANAGE ADMINISTRATORS
          ======================================================== */}
      {adminsModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setAdminsModalOpen(false)}>
          <div className="admin-modal-box glass-card admin-directory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaUsersCog className="modal-title-icon text-amber" />
                <div className="modal-title-texts">
                  <h3>System Administrator Directory</h3>
                  <p className="modal-sub">View, register, and manage authorized hospital & telemetry admins</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setAdminsModalOpen(false)}
                title="Close Modal"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <div className="admin-dir-top-actions">
              <span className="admin-count-tag">Total Admins: <strong>{adminsList.length}</strong></span>
              <button 
                type="button" 
                className="admin-toggle-form-btn"
                onClick={() => setNewAdminFormOpen(!newAdminFormOpen)}
              >
                <FaUserPlus /> {newAdminFormOpen ? 'Hide Add Form' : 'Register New Administrator'}
              </button>
            </div>

            {newAdminFormOpen && (
              <form onSubmit={handleCreateAdmin} className="create-admin-form-panel">
                <h4><FaUserPlus className="text-cyan" /> New Admin Registration</h4>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Admin ID (Unique Access Key) *</label>
                    <input
                      type="text"
                      placeholder="e.g. 2320"
                      value={adminForm.adminId}
                      onChange={(e) => setAdminForm({ ...adminForm, adminId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Administrator Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Sarah Jenkins"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Official Email *</label>
                    <input
                      type="email"
                      placeholder="s.jenkins@titanvitals.ai"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Password *</label>
                    <input
                      type="password"
                      placeholder="Secure Admin Passcode"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Authority Role</label>
                    <select
                      value={adminForm.role}
                      onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    >
                      <option value="Hospital Administrator">Hospital Administrator</option>
                      <option value="Bed Logistics Officer">Bed Logistics Officer</option>
                      <option value="Emergency Triage Lead">Emergency Triage Lead</option>
                      <option value="Medical Director">Medical Director</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Assigned Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Emergency Healthcare Operations"
                      value={adminForm.department}
                      onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-submit-row">
                  <button type="submit" className="modal-save-btn">
                    <FaSave /> Create Administrator Account
                  </button>
                </div>
              </form>
            )}

            <div className="admins-table-wrap">
              <table className="admins-table">
                <thead>
                  <tr>
                    <th>Admin ID</th>
                    <th>Administrator Name</th>
                    <th>Email Address</th>
                    <th>Role / Authority</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminsList.map((adm) => (
                    <tr key={adm._id}>
                      <td>
                        <span className="admin-id-pill">
                          {adm.adminId === '2319' || adm.isMaster ? <FaCrown className="crown-icon" /> : <FaShieldAlt className="shield-sm" />}
                          <strong>{adm.adminId}</strong>
                        </span>
                      </td>
                      <td>
                        <strong>{adm.name}</strong>
                      </td>
                      <td>
                        <span className="text-secondary">{adm.email}</span>
                      </td>
                      <td>
                        <span className={`admin-role-badge ${adm.isMaster || adm.adminId === '2319' ? 'role-master' : 'role-standard'}`}>
                          {adm.role || 'Hospital Administrator'}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                          {new Date(adm.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {adm.adminId === '2319' || adm.isMaster ? (
                          <span className="protected-tag" title="Master Admin Account is Protected">
                            👑 Master
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="tbl-action-pill btn-del-pill"
                            onClick={() => handleDeleteAdmin(adm)}
                            title="Revoke Admin Access"
                          >
                            <FaTrashAlt className="tbl-act-ico" />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: INITIATE PATIENT TRANSFER
          ======================================================== */}
      {transferModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setTransferModalOpen(false)}>
          <div className="admin-modal-box glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaExchangeAlt className="modal-title-icon text-amber" />
                <div className="modal-title-texts">
                  <h3>Initiate Inter-Hospital Patient Transfer</h3>
                  <p className="modal-sub">Route emergency cases to partner facilities with live bed holds</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setTransferModalOpen(false)}
                title="Close Modal"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. David Vance"
                    value={transferForm.patientName}
                    onChange={(e) => setTransferForm({ ...transferForm, patientName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Age *</label>
                    <input
                      type="number"
                      value={transferForm.patientAge}
                      onChange={(e) => setTransferForm({ ...transferForm, patientAge: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Gender</label>
                    <select
                      value={transferForm.patientGender}
                      onChange={(e) => setTransferForm({ ...transferForm, patientGender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Origin Hospital (Overcrowded) *</label>
                  <select
                    value={transferForm.originHospital}
                    onChange={(e) => setTransferForm({ ...transferForm, originHospital: e.target.value })}
                    required
                  >
                    {hospitals.map(h => <option key={h._id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Destination Hospital (Target) *</label>
                  <select
                    value={transferForm.destinationHospital}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationHospital: e.target.value })}
                    required
                  >
                    {hospitals.map(h => <option key={h._id} value={h.name}>{h.name} (ICU: {h.icuBeds})</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Required Bed Facility</label>
                  <select
                    value={transferForm.requiredBedType}
                    onChange={(e) => setTransferForm({ ...transferForm, requiredBedType: e.target.value })}
                  >
                    <option value="ICU Bed">ICU Bed (Critical Care)</option>
                    <option value="Oxygen Bed">Oxygen Bed (High Flow)</option>
                    <option value="General Bed">General Ward Bed</option>
                    <option value="Ventilator Unit">Ventilator Unit</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Triage Urgency Priority</label>
                  <select
                    value={transferForm.priority}
                    onChange={(e) => setTransferForm({ ...transferForm, priority: e.target.value })}
                  >
                    <option value="P1 - Critical Emergency">🔴 P1 - Critical Emergency (Immediate)</option>
                    <option value="P2 - Urgent Care">🟡 P2 - Urgent Care</option>
                    <option value="P3 - Standard Transfer">🟢 P3 - Standard Ward Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Clinical Case Summary & Reason for Transfer *</label>
                <textarea
                  rows="2"
                  className="admin-textarea"
                  value={transferForm.conditionSummary}
                  onChange={(e) => setTransferForm({ ...transferForm, conditionSummary: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="modal-cancel-btn" onClick={() => setTransferModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  <FaAmbulance /> Dispatch Emergency Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: DISPATCH EMERGENCY BROADCAST
          ======================================================== */}
      {broadcastModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setBroadcastModalOpen(false)}>
          <div className="admin-modal-box glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaBullhorn className="modal-title-icon text-rose" />
                <div className="modal-title-texts">
                  <h3>Transmit Regional Emergency Broadcast</h3>
                  <p className="modal-sub">Alert hospitals and trauma centers of mass casualty or capacity surge</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setBroadcastModalOpen(false)}
                title="Close"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Broadcast Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Code Red: Multiple Trauma Incident"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Severity Level *</label>
                  <select
                    value={broadcastForm.severity}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                  >
                    <option value="Code Red - Mass Casualty">🔴 Code Red - Mass Casualty Incident</option>
                    <option value="Code Blue - Severe Surge">🔵 Code Blue - Severe Surge Alert</option>
                    <option value="Yellow Alert - Bed Capacity">🟡 Yellow Alert - Bed Capacity Warning</option>
                    <option value="General Advisory">ℹ️ General Clinical Advisory</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Target Audience / Facility Zone</label>
                <input
                  type="text"
                  placeholder="All Regional Hospitals, Metro Medical District"
                  value={broadcastForm.targetHospitals}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetHospitals: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Emergency Message Instructions *</label>
                <textarea
                  rows="3"
                  className="admin-textarea"
                  placeholder="Provide urgent instructions for on-duty medical officers..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="modal-cancel-btn" onClick={() => setBroadcastModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn btn-broadcast-publish">
                  <FaBullhorn /> Transmit Live Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: EDIT BLOOD & PHARMA INVENTORY
          ======================================================== */}
      {inventoryModalOpen && selectedInventoryHosp && (
        <div className="admin-modal-overlay" onClick={() => setInventoryModalOpen(false)}>
          <div className="admin-modal-box glass-card admin-inventory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaTint className="modal-title-icon text-rose" />
                <div className="modal-title-texts">
                  <h3>Supplies & Blood: {selectedInventoryHosp.name}</h3>
                  <p className="modal-sub">Update live units of rare blood groups and critical emergency medicines</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setInventoryModalOpen(false)}
                title="Close"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="admin-modal-form">
              <h4 className="sub-section-title"><FaTint className="text-rose" /> Blood Bank Stock (Units)</h4>
              <div className="blood-edit-grid">
                {Object.keys(inventoryForm.bloodInventory).map(bg => (
                  <div key={bg} className="blood-input-group">
                    <label>{formatBloodLabel(bg)}</label>
                    <input
                      type="number"
                      min="0"
                      value={inventoryForm.bloodInventory[bg]}
                      onChange={(e) => setInventoryForm({
                        ...inventoryForm,
                        bloodInventory: { ...inventoryForm.bloodInventory, [bg]: Number(e.target.value) }
                      })}
                    />
                  </div>
                ))}
              </div>

              <h4 className="sub-section-title"><FaPills className="text-cyan" /> Critical Medicine & Equipment Reserves</h4>
              <div className="med-edit-grid">
                {Object.keys(inventoryForm.medicineStock).map(med => (
                  <div key={med} className="blood-input-group">
                    <label>{formatMedicineLabel(med)}</label>
                    <input
                      type="number"
                      min="0"
                      value={inventoryForm.medicineStock[med]}
                      onChange={(e) => setInventoryForm({
                        ...inventoryForm,
                        medicineStock: { ...inventoryForm.medicineStock, [med]: Number(e.target.value) }
                      })}
                    />
                  </div>
                ))}
              </div>

              <div className="modal-footer-row">
                <button type="button" className="modal-cancel-btn" onClick={() => setInventoryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  <FaSave /> Save Inventory Reserves
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: REGIONAL BED CAPACITY ANALYTICS (KPI CARD 2)
          ======================================================== */}
      {bedSummaryModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setBedSummaryModalOpen(false)}>
          <div className="admin-modal-box glass-card admin-directory-modal admin-surge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaBed className="modal-title-icon text-green" />
                <div className="modal-title-texts">
                  <h3>Regional Bed Capacity Breakdown & Max Allocations</h3>
                  <p className="modal-sub">Aggregated telemetry of all {totalBeds} active beds / {totalMaxCapacity} max ceiling across {totalHospitals} facilities</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setBedSummaryModalOpen(false)}
                title="Close"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            {/* Aggregated Stat Pills */}
            <div className="bed-analytics-stats-grid">
              <div className="bed-stat-pill bg-stat-general">
                <span>General Ward</span>
                <strong>{totalGeneralBeds} Beds</strong>
                <span className="stat-pct">({Math.round((totalGeneralBeds / (totalBeds || 1)) * 100)}%)</span>
              </div>
              <div className="bed-stat-pill bg-stat-oxygen">
                <span>Oxygen High-Flow</span>
                <strong>{totalOxygenBeds} Beds</strong>
                <span className="stat-pct">({Math.round((totalOxygenBeds / (totalBeds || 1)) * 100)}%)</span>
              </div>
              <div className="bed-stat-pill bg-stat-icu">
                <span>ICU Critical Care</span>
                <strong>{totalIcuBeds} Beds</strong>
                <span className="stat-pct">({Math.round((totalIcuBeds / (totalBeds || 1)) * 100)}%)</span>
              </div>
              <div className="bed-stat-pill bg-stat-vent">
                <span>Max Ceiling</span>
                <strong>{totalMaxCapacity} Beds</strong>
                <span className="stat-pct">Regional Reserve Buffer</span>
              </div>
            </div>

            {/* Hospital Breakdown Table */}
            <div className="admins-table-wrap">
              <table className="admins-table">
                <thead>
                  <tr>
                    <th>Hospital Name</th>
                    <th>ICU</th>
                    <th>Oxygen</th>
                    <th>General</th>
                    <th>Active / Max</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map(h => {
                    const hospActive = (h.generalBeds || 0) + (h.oxygenBeds || 0) + (h.icuBeds || 0);
                    const hospMax = h.maxBedCapacity || (hospActive + 25);
                    const utilPct = Math.min(100, Math.round((hospActive / (hospMax || 1)) * 100));
                    return (
                      <tr key={h._id}>
                        <td><strong>{h.name}</strong></td>
                        <td><span className={`bed-badge-val ${h.icuBeds <= 2 ? 'badge-critical' : 'badge-good'}`}>{h.icuBeds}</span></td>
                        <td><span className="bed-badge-val badge-neutral">{h.oxygenBeds}</span></td>
                        <td><span className="bed-badge-val badge-neutral">{h.generalBeds}</span></td>
                        <td>
                          <strong className="text-green">{hospActive}</strong> <span className="text-secondary">/ {hospMax}</span>
                        </td>
                        <td>
                          <div className="cap-bar-wrap">
                            <div className="cap-bar-track">
                              <div className="cap-bar-fill" style={{ width: `${utilPct}%` }}></div>
                            </div>
                            <span className="text-secondary" style={{ fontSize: '0.74rem' }}>{utilPct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer-row">
              <button 
                type="button" 
                className="modal-save-btn"
                onClick={() => {
                  setBedSummaryModalOpen(false);
                  setActiveTab('beds');
                }}
              >
                <FaEdit /> Jump to Bed Management Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 7: EMERGENCY ICU SURGE ALLOCATOR (KPI CARD 3)
          ======================================================== */}
      {icuTelemetryModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIcuTelemetryModalOpen(false)}>
          <div className="admin-modal-box glass-card admin-directory-modal admin-surge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaProcedures className="modal-title-icon text-rose" />
                <div className="modal-title-texts">
                  <h3>Emergency ICU Surge Allocator & Triage Monitor</h3>
                  <p className="modal-sub">Live critical care capacity with 1-click surge reallocation</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setIcuTelemetryModalOpen(false)}
                title="Close"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            {/* Emergency Action Banner */}
            <div className="icu-surge-action-banner">
              <div>
                <h4><FaBolt className="text-amber" /> Mass Casualty & Surge Emergency Allocation</h4>
                <p>Instantly deploy +2 emergency ICU reserve beds to all {totalHospitals} regional hospitals simultaneously.</p>
              </div>
              <button 
                type="button"
                className="surge-boost-btn"
                onClick={() => handleBulkIcuSurgeBoost(2)}
              >
                <FaPlus /> Deploy +2 ICU Surge Beds
              </button>
            </div>

            {/* Hospital-by-Hospital ICU Telemetry Grid */}
            <div className="admins-table-wrap">
              <table className="admins-table">
                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>Available ICU Beds</th>
                    <th>Shortage Risk Level</th>
                    <th>Emergency Triage</th>
                    <th style={{ textAlign: 'right' }}>Quick Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map(h => {
                    const isCrit = h.icuBeds <= adminSettings.criticalIcuThreshold;
                    return (
                      <tr key={h._id}>
                        <td><strong>{h.name}</strong></td>
                        <td>
                          <span className={`bed-badge-val ${isCrit ? 'badge-critical' : 'badge-good'}`} style={{ fontSize: '1rem' }}>
                            {h.icuBeds} ICU Beds
                          </span>
                        </td>
                        <td>
                          <span className={`risk-badge ${isCrit ? 'risk-critical' : 'risk-optimal'}`}>
                            {isCrit ? '⚠️ Critical Shortage' : '🟢 Ample Buffer'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${h.emergencyStatus.includes('Open') ? 'status-open' : 'status-limited'}`}>
                            {h.emergencyStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="bed-telemetry-adjuster" style={{ display: 'inline-flex' }}>
                            <button 
                              type="button"
                              className="adjust-btn minus" 
                              onClick={() => handleQuickBedAdjust(h._id, 'icuBeds', -1)}
                            >-</button>
                            <span className="bed-badge-val badge-neutral">{h.icuBeds}</span>
                            <button 
                              type="button"
                              className="adjust-btn plus" 
                              onClick={() => handleQuickBedAdjust(h._id, 'icuBeds', 1)}
                            >+</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer-row">
              <button 
                type="button" 
                className="modal-cancel-btn"
                onClick={() => {
                  setIcuTelemetryModalOpen(false);
                  setActiveTab('beds');
                  setFilterStatus('Critical');
                }}
              >
                Filter Critical ICU Facilities
              </button>
              <button 
                type="button" 
                className="modal-save-btn"
                onClick={() => setIcuTelemetryModalOpen(false)}
              >
                <FaCheck /> Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 8: ADMIN SETTINGS & COMMAND PREFERENCES
          ======================================================== */}
      {settingsModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="admin-modal-box glass-card admin-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaCog className="modal-title-icon text-cyan" />
                <div className="modal-title-texts">
                  <h3>Admin System & Telemetry Settings</h3>
                  <p className="modal-sub">Configure live bed telemetry alerts, clearance roles & database sync</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setSettingsModalOpen(false)}
                title="Close Settings"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <div className="admin-settings-body">
              <div className="settings-panel-box">
                <h4><FaShieldAlt className="text-cyan" /> Active Administrator Clearance</h4>
                <div className="admin-profile-grid">
                  <div className="prof-item">
                    <span className="prof-lbl">Admin Identity:</span>
                    <strong>{adminUser?.name || 'Chief Medical Administrator'}</strong>
                  </div>
                  <div className="prof-item">
                    <span className="prof-lbl">Admin Clearance ID:</span>
                    <span className="admin-id-pill"><FaCrown className="crown-icon" /> <strong>{adminUser?.adminId || '2319'}</strong></span>
                  </div>
                  <div className="prof-item">
                    <span className="prof-lbl">Official Email:</span>
                    <span className="text-secondary">{adminUser?.email || 'admin2319@titanvitals.ai'}</span>
                  </div>
                  <div className="prof-item">
                    <span className="prof-lbl">Command Role:</span>
                    <span className="admin-role-badge role-master">{adminUser?.role || 'Master Admin'}</span>
                  </div>
                </div>
              </div>

              <div className="settings-panel-box">
                <h4><FaHospital className="text-rose" /> Bed Capacity & Critical Dispatch Rules</h4>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Auto-Sync Telemetry Interval</label>
                    <select
                      value={adminSettings.autoRefreshSec}
                      onChange={(e) => setAdminSettings({ ...adminSettings, autoRefreshSec: Number(e.target.value) })}
                    >
                      <option value={5}>Every 5 Seconds (Real-time Stream)</option>
                      <option value={10}>Every 10 Seconds (Standard)</option>
                      <option value={30}>Every 30 Seconds</option>
                      <option value={60}>Every 1 Minute</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Critical ICU Alert Threshold</label>
                    <select
                      value={adminSettings.criticalIcuThreshold}
                      onChange={(e) => setAdminSettings({ ...adminSettings, criticalIcuThreshold: Number(e.target.value) })}
                    >
                      <option value={1}>Alert when ICU Beds ≤ 1</option>
                      <option value={2}>Alert when ICU Beds ≤ 2 (Recommended)</option>
                      <option value={5}>Alert when ICU Beds ≤ 5</option>
                    </select>
                  </div>
                </div>

                <div className="settings-toggle-row">
                  <div>
                    <strong>Emergency Shortage Audio Alerts</strong>
                    <p className="sub-desc">Play audio tone when ICU bed capacity hits critical status</p>
                  </div>
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={adminSettings.soundAlerts}
                    onChange={(e) => setAdminSettings({ ...adminSettings, soundAlerts: e.target.checked })}
                  />
                </div>
              </div>

              <div className="settings-panel-box">
                <h4><FaDatabase className="text-green" /> Database & Offline Backup</h4>
                <div className="db-info-row">
                  <div className="db-info-text">
                    <span className="text-secondary">Connected Database:</span>
                    <strong className="text-cyan">MongoDB (localhost:27017/titanvitals)</strong>
                    <span className="db-status-pill">🟢 Active & Encrypted</span>
                  </div>
                  <button
                    type="button"
                    className="export-backup-btn"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hospitals, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `titanvitals_bed_telemetry_${new Date().toISOString().slice(0,10)}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      toast.success('Hospital & Bed database backup exported!');
                    }}
                  >
                    <FaDownload /> Export Bed Inventory (JSON)
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer-row">
              <button 
                type="button" 
                className="modal-save-btn"
                onClick={() => {
                  toast.success('Admin preferences saved successfully!');
                  setSettingsModalOpen(false);
                }}
              >
                <FaSave /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 9: CONFIRM AUDIT TRAIL PURGE (ALERT BOX)
          ======================================================== */}
      {clearAuditModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setClearAuditModalOpen(false)}>
          <div className="admin-modal-box glass-card audit-purge-alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <FaExclamationTriangle className="modal-title-icon text-rose" />
                <div className="modal-title-texts">
                  <h3>Permanent Audit Trail Purge</h3>
                  <p className="modal-sub">Security & Compliance Alert</p>
                </div>
              </div>
              <button 
                type="button" 
                className="admin-modal-close-btn"
                onClick={() => setClearAuditModalOpen(false)}
                title="Close"
              >
                <FaTimes className="close-x-icon" />
              </button>
            </div>

            <div className="purge-alert-content">
              <div className="purge-warning-banner">
                <FaExclamationTriangle className="banner-alert-icon" />
                <div>
                  <strong>Irreversible Database Action</strong>
                  <p>
                    You are about to permanently delete all <strong>{auditLogs.length}</strong> historical security and compliance audit records from MongoDB.
                  </p>
                </div>
              </div>

              <p className="purge-subtext">
                All patient movement histories, bed adjustment trails, transfer handoffs, and administrator signatures will be wiped from the active log. A single cryptographic entry recording this purge event will be created.
              </p>
            </div>

            <div className="modal-footer-row">
              <button 
                type="button" 
                className="modal-cancel-btn" 
                onClick={() => setClearAuditModalOpen(false)}
              >
                Cancel / Keep Records
              </button>
              <button 
                type="button" 
                className="modal-save-btn btn-confirm-purge"
                onClick={handlePurgeAllAuditLogs}
              >
                <FaTrashAlt /> Confirm & Purge All Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
