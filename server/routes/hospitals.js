import express from 'express';
import Hospital from '../models/Hospital.js';
import AuditLog from '../models/AuditLog.js';
import Booking from '../models/Booking.js';

const router = express.Router();

/**
 * GET /api/hospitals
 * Public endpoint to fetch all active hospitals with live bed telemetry
 */
router.get('/', async (req, res) => {
  try {
    const { search, dept, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (dept && dept !== 'All') {
      query.departments = dept;
    }

    if (status && status !== 'All') {
      query.emergencyStatus = { $regex: status, $options: 'i' };
    }

    const hospitals = await Hospital.find(query).sort({ distanceKm: 1, createdAt: -1 });

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (err) {
    console.error('Fetch Hospitals Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve hospital directory.' });
  }
});

/**
 * GET /api/hospitals/:id
 * Get single hospital details
 */
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }
    res.json({ success: true, hospital });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve hospital details.' });
  }
});

/**
 * POST /api/hospitals/:id/reserve
 * Public patient bed reservation: Decrements bed count in MongoDB and records audit trail
 */
router.post('/:id/reserve', async (req, res) => {
  try {
    const { patientName, phone, bedType, needAmbulance, conditionSummary } = req.body;
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital facility not found.' });
    }

    let fieldToDecrement = 'generalBeds';
    if (bedType?.toLowerCase().includes('icu')) fieldToDecrement = 'icuBeds';
    else if (bedType?.toLowerCase().includes('oxygen')) fieldToDecrement = 'oxygenBeds';
    else if (bedType?.toLowerCase().includes('ventilator')) fieldToDecrement = 'ventilators';

    const currentCount = hospital[fieldToDecrement] || 0;
    if (currentCount <= 0) {
      return res.status(400).json({
        success: false,
        message: `No available ${bedType}s remaining at ${hospital.name}. Please select another facility or bed type.`
      });
    }

    // Decrement bed in database
    hospital[fieldToDecrement] = currentCount - 1;

    // Adjust emergency triage status if ICU bed was reserved and now low
    if (fieldToDecrement === 'icuBeds') {
      if (hospital.icuBeds <= 0) {
        hospital.emergencyStatus = 'Critical Surge - Emergency Divert';
      } else if (hospital.icuBeds <= 2) {
        hospital.emergencyStatus = 'Limited ICU Capacity';
      }
    }

    hospital.updatedAt = new Date();
    await hospital.save();

    // Generate admission confirmation token
    const token = `TV-BED-${Math.floor(1000 + Math.random() * 9000)}-${hospital.name.slice(0, 3).toUpperCase()}`;

    // Create persistent patient booking record
    let bookingDoc = null;
    try {
      bookingDoc = await Booking.create({
        patientName: patientName || 'Alex Mercer',
        phone: phone || '+1 555-0199',
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        bedType: bedType || 'ICU Bed',
        needAmbulance: needAmbulance || false,
        conditionSummary: conditionSummary || 'Emergency Bed Reservation',
        token,
        status: 'Confirmed',
        isRead: false
      });
    } catch (bErr) {
      console.error('Create booking record error:', bErr);
    }

    // Record in Tamper-Proof Audit Trail
    try {
      await AuditLog.create({
        action: `Patient Self-Service Bed Reservation`,
        category: 'Bed Telemetry',
        details: `Patient "${patientName || 'Alex Mercer'}" booked 1 ${bedType} at ${hospital.name}. Live ${bedType}s remaining: ${hospital[fieldToDecrement]}. Token: [${token}].`,
        adminId: 'Patient-Portal',
        adminName: patientName || 'Patient Web User',
        targetResource: `${hospital.name} [${fieldToDecrement}]`
      });
    } catch (auditErr) {
      console.error('Reservation audit log error:', auditErr);
    }

    res.json({
      success: true,
      message: `Emergency reservation confirmed! 1 ${bedType} reserved at ${hospital.name}.`,
      token,
      booking: bookingDoc,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        etaMin: hospital.etaMin,
        [fieldToDecrement]: hospital[fieldToDecrement],
        emergencyStatus: hospital.emergencyStatus
      }
    });
  } catch (err) {
    console.error('Bed reservation error:', err);
    res.status(500).json({ success: false, message: 'Server error while reserving hospital bed.' });
  }
});

export default router;
