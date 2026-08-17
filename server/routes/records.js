import express from 'express';
import HealthRecord from '../models/HealthRecord.js';

const router = express.Router();

// 1. POST /api/records - Save a new health record (BP, Report, Prescription)
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, data, summary, notes } = req.body;

    if (!type || !title || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, title, data'
      });
    }

    const validTypes = ['bp', 'report', 'prescription', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid record type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const newRecord = new HealthRecord({
      userId: userId || 'guest_user',
      type,
      title,
      data,
      summary: summary || '',
      notes: notes || ''
    });

    const savedRecord = await newRecord.save();

    res.status(201).json({
      success: true,
      message: `Health record (${type}) saved successfully`,
      record: savedRecord
    });
  } catch (error) {
    console.error('Error saving health record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save health record to database',
      error: error.message
    });
  }
});

// 2. GET /api/records - Fetch records for a user with optional ?type= filter
router.get('/', async (req, res) => {
  try {
    const { userId, type, limit = 50 } = req.query;

    const query = {};
    if (userId) {
      query.userId = userId;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    const records = await HealthRecord.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    console.error('Error retrieving health records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health records',
      error: error.message
    });
  }
});

// 3. GET /api/records/summary - Fetch aggregated vital stats and counts
router.get('/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const userQuery = userId ? { userId } : {};

    const [totalCount, bpCount, reportCount, rxCount, latestBp] = await Promise.all([
      HealthRecord.countDocuments(userQuery),
      HealthRecord.countDocuments({ ...userQuery, type: 'bp' }),
      HealthRecord.countDocuments({ ...userQuery, type: 'report' }),
      HealthRecord.countDocuments({ ...userQuery, type: 'prescription' }),
      HealthRecord.findOne({ ...userQuery, type: 'bp' }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      summary: {
        totalRecords: totalCount,
        bpRecords: bpCount,
        labReports: reportCount,
        prescriptions: rxCount,
        latestBp: latestBp ? latestBp.data : null
      }
    });
  } catch (error) {
    console.error('Error getting records summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate records summary',
      error: error.message
    });
  }
});

// 4. DELETE /api/records/:id - Delete a specific record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HealthRecord.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete record',
      error: error.message
    });
  }
});

export default router;
