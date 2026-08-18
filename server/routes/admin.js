import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';
import Transfer from '../models/Transfer.js';
import Broadcast from '../models/Broadcast.js';
import AuditLog from '../models/AuditLog.js';
import Booking from '../models/Booking.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'titanvitals_super_secret_jwt_key_2026_nxtgen';

// ----------------------------------------------------
// 1. ADMIN AUTHENTICATION
// ----------------------------------------------------

/**
 * POST /api/admin/login
 * Strict Admin Login: Checks Admin ID (e.g. 2319) or Admin Email and Password
 */
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Admin ID and Password.'
      });
    }

    const cleanId = adminId.toString().trim();
    // Match either by adminId or email
    const admin = await Admin.findOne({
      $or: [
        { adminId: cleanId },
        { email: cleanId.toLowerCase() }
      ]
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or credentials. Access denied.'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Password. Access denied.'
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        adminId: admin.adminId,
        role: admin.role,
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin Authentication Successful! Welcome to TitanVitals Command Portal.',
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isMaster: admin.isMaster,
        department: admin.department,
        createdAt: admin.createdAt
      }
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin authentication.' });
  }
});

/**
 * GET /api/admin/me
 * Get current authenticated admin info
 */
router.get('/me', requireAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// ----------------------------------------------------
// 2. MULTI-ADMIN DIRECTORY & MANAGEMENT
// ----------------------------------------------------

/**
 * GET /api/admin/admins
 * View all registered administrators
 */
router.get('/admins', requireAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (err) {
    console.error('Fetch Admins Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve administrator list.' });
  }
});

/**
 * POST /api/admin/admins
 * Add a new Administrator
 */
router.post('/admins', requireAdmin, async (req, res) => {
  try {
    const { adminId, name, email, password, role, department } = req.body;

    if (!adminId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID, Name, Email, and Password are required.'
      });
    }

    const cleanAdminId = adminId.toString().trim();
    const cleanEmail = email.toString().trim().toLowerCase();

    const existingId = await Admin.findOne({ adminId: cleanAdminId });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Admin ID "${cleanAdminId}" is already taken.`
      });
    }

    const existingEmail = await Admin.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email "${cleanEmail}" is already registered as an admin.`
      });
    }

    const newAdmin = new Admin({
      adminId: cleanAdminId,
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role || 'Hospital Administrator',
      department: department || 'Healthcare Operations',
      isMaster: false
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: `Admin account "${name}" (ID: ${cleanAdminId}) created successfully!`,
      admin: {
        id: newAdmin._id,
        adminId: newAdmin.adminId,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        department: newAdmin.department,
        isMaster: newAdmin.isMaster,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    console.error('Create Admin Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create new administrator.' });
  }
});

/**
 * DELETE /api/admin/admins/:id
 * Remove / Revoke an Admin (Master Admin 2319 protected)
 */
router.delete('/admins/:id', requireAdmin, async (req, res) => {
  try {
    const targetAdmin = await Admin.findById(req.params.id);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'Admin record not found.' });
    }

    // Protection rule for Master Admin 2319
    if (targetAdmin.adminId === '2319' || targetAdmin.isMaster) {
      return res.status(403).json({
        success: false,
        message: 'Protected Account: Master Admin (ID: 2319) cannot be deleted.'
      });
    }

    // Prevent admin from deleting themselves
    if (targetAdmin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active administrator account.'
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Administrator "${targetAdmin.name}" (ID: ${targetAdmin.adminId}) has been removed.`
    });
  } catch (err) {
    console.error('Delete Admin Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete administrator.' });
  }
});

// ----------------------------------------------------
// 3. HOSPITAL & BED CAPACITY ADMINISTRATION
// ----------------------------------------------------

/**
 * GET /api/admin/hospitals
 * Retrieve all hospital facilities and bed telemetry
 */
router.get('/hospitals', requireAdmin, async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (err) {
    console.error('Admin Get Hospitals Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve hospitals.' });
  }
});

/**
 * POST /api/admin/hospitals
 * Add a new hospital facility
 */
router.post('/hospitals', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      phone,
      distanceKm,
      etaMin,
      icuBeds,
      oxygenBeds,
      generalBeds,
      ventilators,
      maxBedCapacity,
      departments,
      emergencyStatus,
      isEmergencyReady
    } = req.body;

    if (!name || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name, address, and phone number are required.'
      });
    }

    const icu = Number(icuBeds) || 0;
    const oxy = Number(oxygenBeds) || 0;
    const gen = Number(generalBeds) || 0;
    const calcMax = Number(maxBedCapacity) || (icu + oxy + gen + 25) || 100;

    const hospital = new Hospital({
      name: name.trim(),
      address: address.trim(),
      city: city ? city.trim() : 'Metro Medical District',
      state: state ? state.trim() : 'National Health Zone',
      phone: phone.trim(),
      distanceKm: Number(distanceKm) || 2.5,
      etaMin: Number(etaMin) || 8,
      icuBeds: icu,
      oxygenBeds: oxy,
      generalBeds: gen,
      ventilators: Number(ventilators) || 0,
      maxBedCapacity: calcMax,
      departments: Array.isArray(departments) ? departments : (departments ? departments.split(',').map(d => d.trim()) : ['Emergency / Trauma']),
      emergencyStatus: emergencyStatus || 'Open - Rapid Triage Active',
      isEmergencyReady: isEmergencyReady !== undefined ? isEmergencyReady : true,
      createdBy: req.admin.adminId
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      message: `Hospital "${hospital.name}" added successfully with live bed capacity!`,
      hospital
    });
  } catch (err) {
    console.error('Admin Add Hospital Error:', err);
    res.status(500).json({ success: false, message: 'Failed to add hospital facility.' });
  }
});

/**
 * PUT /api/admin/hospitals/:id
 * Live edit hospital details & bed counts
 */
router.put('/hospitals/:id', requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital record not found.' });
    }

    const allowedUpdates = [
      'name', 'address', 'city', 'state', 'phone', 'distanceKm', 'etaMin',
      'icuBeds', 'oxygenBeds', 'generalBeds', 'ventilators', 'maxBedCapacity', 'departments',
      'emergencyStatus', 'isEmergencyReady'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['icuBeds', 'oxygenBeds', 'generalBeds', 'ventilators', 'maxBedCapacity', 'distanceKm', 'etaMin'].includes(field)) {
          hospital[field] = Number(req.body[field]);
        } else if (field === 'departments' && typeof req.body[field] === 'string') {
          hospital[field] = req.body[field].split(',').map(d => d.trim());
        } else {
          hospital[field] = req.body[field];
        }
      }
    });

    hospital.updatedAt = new Date();
    await hospital.save();

    // Log to Audit Trail with specific details of what changed
    const changes = [];
    if (req.body.icuBeds !== undefined) changes.push(`ICU Beds: ${hospital.icuBeds}`);
    if (req.body.oxygenBeds !== undefined) changes.push(`Oxygen Beds: ${hospital.oxygenBeds}`);
    if (req.body.generalBeds !== undefined) changes.push(`General Beds: ${hospital.generalBeds}`);
    if (req.body.ventilators !== undefined) changes.push(`Ventilators: ${hospital.ventilators}`);
    if (req.body.maxBedCapacity !== undefined) changes.push(`Max Bed Ceiling: ${hospital.maxBedCapacity}`);
    if (req.body.emergencyStatus !== undefined) changes.push(`Status: "${hospital.emergencyStatus}"`);

    if (changes.length > 0) {
      try {
        await AuditLog.create({
          action: 'Bed Telemetry & Capacity Adjusted',
          category: 'Bed Telemetry',
          details: `Adjusted parameters for "${hospital.name}": ${changes.join(' | ')}`,
          adminId: req.admin?.adminId || '2319',
          adminName: req.admin?.name || 'Administrator',
          targetResource: hospital.name
        });
      } catch (aErr) {
        console.error('Audit log error:', aErr);
      }
    }

    res.json({
      success: true,
      message: `Hospital "${hospital.name}" updated successfully!`,
      hospital
    });
  } catch (err) {
    console.error('Admin Update Hospital Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update hospital.' });
  }
});

/**
 * DELETE /api/admin/hospitals/:id
 * Delete a hospital facility
 */
router.delete('/hospitals/:id', requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital record not found.' });
    }

    res.json({
      success: true,
      message: `Hospital "${hospital.name}" has been deleted.`
    });
  } catch (err) {
    console.error('Admin Delete Hospital Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete hospital.' });
  }
});

// ----------------------------------------------------
// 4. INTER-HOSPITAL PATIENT TRANSFERS
// ----------------------------------------------------

/**
 * GET /api/admin/transfers
 * List all patient transfer requests
 */
router.get('/transfers', requireAdmin, async (req, res) => {
  try {
    const transfers = await Transfer.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: transfers.length,
      transfers
    });
  } catch (err) {
    console.error('Get Transfers Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch transfer requests.' });
  }
});

/**
 * POST /api/admin/transfers
 * Create a new patient transfer request
 */
router.post('/transfers', requireAdmin, async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      conditionSummary,
      priority,
      requiredBedType,
      originHospital,
      destinationHospital,
      ambulanceUnit,
      etaMinutes,
      notes
    } = req.body;

    if (!patientName || !conditionSummary || !originHospital || !destinationHospital) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, clinical summary, origin, and destination hospitals are required.'
      });
    }

    const transfer = new Transfer({
      patientName,
      patientAge: Number(patientAge) || 35,
      patientGender: patientGender || 'Male',
      conditionSummary,
      priority: priority || 'P1 - Critical Emergency',
      requiredBedType: requiredBedType || 'ICU Bed',
      originHospital,
      destinationHospital,
      ambulanceUnit: ambulanceUnit || 'ALS-Rescue-04',
      etaMinutes: Number(etaMinutes) || 12,
      requestedBy: req.admin?.name || 'Administrator',
      notes: notes || ''
    });

    await transfer.save();

    // Log to Audit Trail
    await AuditLog.create({
      action: 'Patient Transfer Initiated',
      category: 'Patient Transfer',
      details: `Initiated transfer for patient ${patientName} from ${originHospital} to ${destinationHospital} (${priority})`,
      adminId: req.admin?.adminId || '2319',
      adminName: req.admin?.name || 'Administrator',
      targetResource: destinationHospital
    });

    res.status(201).json({
      success: true,
      message: `Emergency transfer request for ${patientName} dispatched!`,
      transfer
    });
  } catch (err) {
    console.error('Create Transfer Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create transfer request.' });
  }
});

/**
 * PUT /api/admin/transfers/:id
 * Update transfer status (e.g. Ambulance Dispatched -> In Transit -> Completed)
 */
router.put('/transfers/:id', requireAdmin, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer record not found.' });
    }

    const { status, etaMinutes, ambulanceUnit, notes } = req.body;
    if (status) transfer.status = status;
    if (etaMinutes !== undefined) transfer.etaMinutes = Number(etaMinutes);
    if (ambulanceUnit) transfer.ambulanceUnit = ambulanceUnit;
    if (notes) transfer.notes = notes;

    await transfer.save();

    // Log to Audit Trail
    await AuditLog.create({
      action: 'Transfer Status Updated',
      category: 'Patient Transfer',
      details: `Transfer for ${transfer.patientName} updated to "${transfer.status}" (Ambulance: ${transfer.ambulanceUnit})`,
      adminId: req.admin?.adminId || '2319',
      adminName: req.admin?.name || 'Administrator',
      targetResource: transfer.destinationHospital
    });

    res.json({
      success: true,
      message: `Transfer status updated to "${transfer.status}".`,
      transfer
    });
  } catch (err) {
    console.error('Update Transfer Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update transfer status.' });
  }
});

/**
 * DELETE /api/admin/transfers/:id
 * Cancel/remove transfer request
 */
router.delete('/transfers/:id', requireAdmin, async (req, res) => {
  try {
    const transfer = await Transfer.findByIdAndDelete(req.params.id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer record not found.' });
    }

    res.json({
      success: true,
      message: `Transfer request for "${transfer.patientName}" deleted.`
    });
  } catch (err) {
    console.error('Delete Transfer Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete transfer.' });
  }
});

// ----------------------------------------------------
// 5. EMERGENCY BROADCAST HUB
// ----------------------------------------------------

/**
 * GET /api/admin/broadcasts
 * List all emergency broadcasts
 */
router.get('/broadcasts', async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: broadcasts.length,
      broadcasts
    });
  } catch (err) {
    console.error('Get Broadcasts Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch broadcasts.' });
  }
});

/**
 * POST /api/admin/broadcasts
 * Dispatch a regional emergency broadcast alert
 */
router.post('/broadcasts', requireAdmin, async (req, res) => {
  try {
    const { title, message, severity, targetHospitals } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Broadcast title and message are required.' });
    }

    const broadcast = new Broadcast({
      title,
      message,
      severity: severity || 'Code Red - Mass Casualty',
      targetHospitals: targetHospitals || 'All Regional Hospitals',
      authorName: req.admin?.name || 'Chief Medical Administrator',
      authorAdminId: req.admin?.adminId || '2319'
    });

    await broadcast.save();

    // Log to Audit Trail
    await AuditLog.create({
      action: 'Emergency Broadcast Transmitted',
      category: 'Emergency Broadcast',
      details: `[${broadcast.severity}] ${broadcast.title} broadcasted to ${broadcast.targetHospitals}`,
      adminId: req.admin?.adminId || '2319',
      adminName: req.admin?.name || 'Administrator',
      targetResource: broadcast.targetHospitals
    });

    res.status(201).json({
      success: true,
      message: `Emergency broadcast "${title}" transmitted to regional hospitals!`,
      broadcast
    });
  } catch (err) {
    console.error('Create Broadcast Error:', err);
    res.status(500).json({ success: false, message: 'Failed to dispatch broadcast.' });
  }
});

/**
 * DELETE /api/admin/broadcasts/:id
 * Dismiss or delete broadcast
 */
router.delete('/broadcasts/:id', requireAdmin, async (req, res) => {
  try {
    const broadcast = await Broadcast.findByIdAndDelete(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast record not found.' });
    }

    res.json({
      success: true,
      message: 'Emergency broadcast dismissed.'
    });
  } catch (err) {
    console.error('Delete Broadcast Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete broadcast.' });
  }
});

// ----------------------------------------------------
// 6. COMPLIANCE AUDIT TRAIL & ACTIVITY LOGS
// ----------------------------------------------------

/**
 * GET /api/admin/audit-logs
 * Fetch all system audit logs
 */
router.get('/audit-logs', requireAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(250);
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    console.error('Get Audit Logs Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch audit trail.' });
  }
});

/**
 * DELETE /api/admin/audit-logs/:id
 * Delete a single audit log entry
 */
router.delete('/audit-logs/:id', requireAdmin, async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit entry not found.' });
    }
    res.json({ success: true, message: 'Audit log entry deleted successfully.' });
  } catch (err) {
    console.error('Delete Audit Log Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete audit log entry.' });
  }
});

/**
 * DELETE /api/admin/audit-logs/patient/:patientName
 * Delete all audit logs & milestones for a specific in-patient dossier across MongoDB
 */
router.delete('/audit-logs/patient/:patientName', requireAdmin, async (req, res) => {
  try {
    const patientName = decodeURIComponent(req.params.patientName);
    const regex = new RegExp(`^${patientName}$|\\b${patientName}\\b`, 'i');
    
    // 1. Permanently delete from MongoDB AuditLog collection
    const auditDeleteResult = await AuditLog.deleteMany({
      $or: [
        { details: { $regex: regex } },
        { action: { $regex: regex } }
      ]
    });

    // 2. Permanently delete matching records from Transfer collection
    const transferDeleteResult = await Transfer.deleteMany({
      patientName: { $regex: regex }
    });

    // 3. Permanently delete matching records from Booking collection
    const bookingDeleteResult = await Booking.deleteMany({
      patientName: { $regex: regex }
    });

    res.json({
      success: true,
      message: `Successfully removed in-patient record for "${patientName}" from MongoDB database.`,
      deletedAuditLogs: auditDeleteResult.deletedCount,
      deletedTransfers: transferDeleteResult.deletedCount,
      deletedBookings: bookingDeleteResult.deletedCount
    });
  } catch (err) {
    console.error('Delete Patient Dossier Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete in-patient dossier.' });
  }
});

/**
 * DELETE /api/admin/audit-logs
 * Clear all audit log records
 */
router.delete('/audit-logs', requireAdmin, async (req, res) => {
  try {
    const count = await AuditLog.countDocuments();
    await AuditLog.deleteMany({});
    
    // Create one fresh entry stating audit log was cleared
    await AuditLog.create({
      action: 'Audit Trail Purged',
      category: 'Hospital Management',
      details: `Administrator cleared all ${count} historical audit log records.`,
      adminId: req.admin?.adminId || '2319',
      adminName: req.admin?.name || 'Administrator',
      targetResource: 'Audit Trail System'
    });

    res.json({
      success: true,
      message: `All ${count} audit log records have been cleared.`
    });
  } catch (err) {
    console.error('Clear Audit Logs Error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear audit trail.' });
  }
});

// ----------------------------------------------------
// 7. BLOOD BANK & MEDICAL SUPPLY INVENTORY
// ----------------------------------------------------

/**
 * PUT /api/admin/hospitals/:id/inventory
 * Live adjust blood bank units or medicine reserves
 */
router.put('/hospitals/:id/inventory', requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital record not found.' });
    }

    const { bloodInventory, medicineStock } = req.body;

    if (bloodInventory) {
      hospital.bloodInventory = { ...hospital.bloodInventory?.toObject?.() || {}, ...bloodInventory };
    }

    if (medicineStock) {
      hospital.medicineStock = { ...hospital.medicineStock?.toObject?.() || {}, ...medicineStock };
    }

    hospital.updatedAt = new Date();
    await hospital.save();

    // Generate clear breakdown of adjusted stock
    const detailsList = [];
    if (bloodInventory) {
      const bloodMap = {
        oNegative: 'O-', oPositive: 'O+', aNegative: 'A-', aPositive: 'A+',
        bNegative: 'B-', bPositive: 'B+', abNegative: 'AB-', abPositive: 'AB+',
        plasmaUnits: 'Plasma', plateletUnits: 'Platelets'
      };
      const bloodItems = Object.entries(bloodInventory)
        .map(([k, v]) => `${bloodMap[k] || k}: ${v}`)
        .join(', ');
      detailsList.push(`Blood Reserves [${bloodItems}]`);
    }
    if (medicineStock) {
      const medMap = {
        oxygenCylinders: 'O₂ Cylinders', dialysisKits: 'Dialysis', antiVenomVials: 'Anti-Venom',
        epinephrineVials: 'Epinephrine', ventilatorCircuits: 'Vent Circuits'
      };
      const medItems = Object.entries(medicineStock)
        .map(([k, v]) => `${medMap[k] || k}: ${v}`)
        .join(', ');
      detailsList.push(`Pharma Reserves [${medItems}]`);
    }

    const detailString = detailsList.length > 0 
      ? `Updated supplies for "${hospital.name}": ${detailsList.join(' | ')}`
      : `Updated blood/medicine supplies for "${hospital.name}"`;

    // Log to Audit Trail
    await AuditLog.create({
      action: 'Inventory Stock Adjusted',
      category: 'Supply Inventory',
      details: detailString,
      adminId: req.admin?.adminId || '2319',
      adminName: req.admin?.name || 'Administrator',
      targetResource: hospital.name
    });

    res.json({
      success: true,
      message: `Inventory reserves for "${hospital.name}" updated successfully!`,
      hospital
    });
  } catch (err) {
    console.error('Update Inventory Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update supply inventory.' });
  }
});

// ----------------------------------------------------
// 8. PATIENT BED BOOKINGS & REAL-TIME NOTIFICATIONS
// ----------------------------------------------------

/**
 * GET /api/admin/bookings
 * Retrieve all patient bed reservation notifications
 */
router.get('/bookings', requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    const unreadCount = bookings.filter(b => !b.isRead).length;

    res.json({
      success: true,
      count: bookings.length,
      unreadCount,
      bookings
    });
  } catch (err) {
    console.error('Fetch Bookings Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve patient reservations.' });
  }
});

/**
 * PUT /api/admin/bookings/:id/status
 * Update patient booking status (e.g. Admitted, Discharged)
 */
router.put('/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const previousStatus = booking.status;
    booking.status = status || booking.status;
    booking.isRead = true;
    await booking.save();

    // If patient is Discharged or Cancelled, return the bed to the hospital
    if ((status === 'Discharged' || status === 'Cancelled') && previousStatus !== 'Discharged' && previousStatus !== 'Cancelled') {
      try {
        const hospital = await Hospital.findById(booking.hospitalId);
        if (hospital) {
          let field = 'generalBeds';
          if (booking.bedType?.toLowerCase().includes('icu')) field = 'icuBeds';
          else if (booking.bedType?.toLowerCase().includes('oxygen')) field = 'oxygenBeds';
          else if (booking.bedType?.toLowerCase().includes('ventilator')) field = 'ventilators';

          hospital[field] = (hospital[field] || 0) + 1;
          await hospital.save();

          await AuditLog.create({
            action: `Patient Bed Released (${status})`,
            category: 'Bed Telemetry',
            details: `Patient "${booking.patientName}" marked as ${status}. 1 ${booking.bedType} returned to ${hospital.name}. Live count: ${hospital[field]}.`,
            adminId: req.admin?.adminId || '2319',
            adminName: req.admin?.name || 'Administrator',
            targetResource: `${hospital.name} [${field}]`
          });
        }
      } catch (hErr) {
        console.error('Bed release error:', hErr);
      }
    }

    res.json({
      success: true,
      message: `Reservation for "${booking.patientName}" updated to ${booking.status}!`,
      booking
    });
  } catch (err) {
    console.error('Update Booking Status Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update reservation status.' });
  }
});

/**
 * PUT /api/admin/bookings/mark-read
 * Mark all notifications as read
 */
router.put('/bookings/mark-read', requireAdmin, async (req, res) => {
  try {
    await Booking.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All booking notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
});

/**
 * DELETE /api/admin/bookings/:id
 * Clear / Delete a single booking notification
 */
router.delete('/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    res.json({
      success: true,
      message: `Booking notification for "${booking.patientName}" cleared.`
    });
  } catch (err) {
    console.error('Delete Booking Error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear booking notification.' });
  }
});

/**
 * DELETE /api/admin/bookings
 * Clear All patient booking notifications
 */
router.delete('/bookings', requireAdmin, async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    await Booking.deleteMany({});

    // Record in audit log
    await AuditLog.create({
      action: 'Cleared All Booking Notifications',
      category: 'Hospital Management',
      details: `Admin cleared all ${count} patient booking notifications and history logs.`,
      adminId: req.admin?.adminId || '2319',
      adminName: req.admin?.name || 'Administrator',
      targetResource: 'Patient Bookings'
    });

    res.json({
      success: true,
      message: `All ${count} patient booking notifications have been cleared.`
    });
  } catch (err) {
    console.error('Clear All Bookings Error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear booking notifications.' });
  }
});

export default router;
