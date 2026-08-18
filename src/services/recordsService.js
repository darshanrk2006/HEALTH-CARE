// src/services/recordsService.js
// Client service for saving and retrieving categorized health records (BP, Lab Reports, Prescriptions)

const API_BASE = '/api/records';
const LOCAL_STORAGE_KEY = 'titanvitals_saved_records';

/**
 * Get current active user identifier / Health ID
 */
export const getCurrentUserId = () => {
  try {
    const rawUser = localStorage.getItem('titanvitals_user') || localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed.healthId) return parsed.healthId;
      if (parsed.name) return parsed.name;
      if (parsed.email) return parsed.email;
    }
  } catch (e) {}
  return 'TV-8942-AI';
};

/**
 * Get fallback records from LocalStorage
 */
const getLocalRecords = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Save records array to LocalStorage
 */
const setLocalRecords = (records) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {}
};

/**
 * Initial sample records if none exist
 */
const getSeedRecords = () => {
  const now = new Date();
  return [
    {
      _id: 'seed-bp-1',
      id: 'seed-bp-1',
      userId: getCurrentUserId(),
      type: 'bp',
      title: 'Resting Blood Pressure & Telemetry',
      data: {
        systolic: 118,
        diastolic: 72,
        bpString: '118/72',
        heartRate: 72,
        spo2: 99,
        map: 87,
        pulsePressure: 46,
        category: 'Optimal Normal',
        vascularElasticity: 'Grade 1 (Excellent Elasticity)'
      },
      summary: 'Optimal cardiovascular telemetry. Normal resting heart rate and arterial compliance.',
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      _id: 'seed-report-1',
      id: 'seed-report-1',
      userId: getCurrentUserId(),
      type: 'report',
      title: 'Comprehensive Metabolic Panel (CMP)',
      data: {
        metrics: [
          { name: 'Fasting Blood Glucose', value: 92, unit: 'mg/dL', status: 'Normal', refRange: '70 - 99' },
          { name: 'HbA1c', value: 5.4, unit: '%', status: 'Optimal', refRange: '< 5.7' },
          { name: 'Serum Creatinine', value: 0.9, unit: 'mg/dL', status: 'Normal', refRange: '0.7 - 1.3' },
          { name: 'eGFR', value: 104, unit: 'mL/min/1.73m²', status: 'Normal', refRange: '> 90' },
          { name: 'Total Cholesterol', value: 178, unit: 'mg/dL', status: 'Normal', refRange: '< 200' },
          { name: 'LDL Cholesterol', value: 98, unit: 'mg/dL', status: 'Normal', refRange: '< 100' }
        ],
        summary: 'All metabolic parameters and renal filtration markers are within standard clinical physiological limits.'
      },
      summary: 'Normal glycemic and lipid levels. Renal filtration rate is optimal.',
      createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
    },
    {
      _id: 'seed-rx-1',
      id: 'seed-rx-1',
      userId: getCurrentUserId(),
      type: 'prescription',
      title: "Dr. Chen's Cardiology Prescription",
      data: {
        medications: [
          { name: 'Metformin HCl', dose: '500 mg', timing: 'After Meals', frequency: 'Twice Daily (Morning/Night)', duration: '30 Days', precautions: 'Take with food to minimize stomach upset.' },
          { name: 'Telmisartan', dose: '40 mg', timing: 'Morning Before Food', frequency: 'Once Daily', duration: '30 Days', precautions: 'Take at the same time every morning.' },
          { name: '3 ORS Sachet', dose: '1 Sachet in 1 Litre Water', timing: 'As Needed', frequency: 'Throughout Day', duration: '3 Days', precautions: 'Dissolve fully in clean drinking water.' }
        ],
        summary: 'Daily maintenance schedule for glycemic and blood pressure stability with electrolyte hydration support.'
      },
      summary: 'Cardiovascular and glycemic medication regimen with electrolyte support.',
      createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString()
    }
  ];
};

/**
 * Save a new health record (BP, Lab Report, Prescription, General)
 * Persists immediately to LocalStorage and syncs to MongoDB / Serverless API
 */
export const saveHealthRecord = async ({ type, title, data, summary = '', notes = '' }) => {
  const userId = getCurrentUserId();
  const payload = {
    userId,
    type,
    title,
    data,
    summary,
    notes,
    createdAt: new Date().toISOString()
  };

  // 1. Always save locally immediately
  const localList = getLocalRecords();
  const localRecord = { ...payload, _id: `local-${Date.now()}`, id: `local-${Date.now()}` };
  setLocalRecords([localRecord, ...localList]);

  // If this was a BP / Vitals scan, save the latest vitals snapshot
  if (type === 'bp' && data) {
    try {
      localStorage.setItem('titanvitals_latest_vitals', JSON.stringify({
        ...data,
        createdAt: payload.createdAt
      }));
    } catch (e) {}
  }

  // 2. Dispatch instant reactive window events across all tabs/components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('titanvitals_records_updated', { detail: localRecord }));
    if (type === 'bp') {
      window.dispatchEvent(new CustomEvent('titanvitals_vitals_updated', { detail: data }));
    }
  }

  // 3. Sync to Backend Database
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json();
      return json.record || localRecord;
    }
  } catch (error) {
    console.warn('Backend database sync note:', error.message);
  }

  return localRecord;
};

/**
 * Fetch records by type (all, bp, report, prescription)
 */
export const getHealthRecords = async (type = 'all') => {
  const userId = getCurrentUserId();
  let records = [];

  // Try fetching from Backend Database
  try {
    const url = `${API_BASE}?userId=${encodeURIComponent(userId)}${type && type !== 'all' ? `&type=${type}` : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.records && json.records.length > 0) {
        records = json.records;
      }
    }
  } catch (err) {
    console.warn('Backend fetch failed, falling back to local records:', err.message);
  }

  // Fallback to local storage if server returned empty
  if (records.length === 0) {
    let localList = getLocalRecords();
    if (localList.length === 0) {
      localList = getSeedRecords();
      setLocalRecords(localList);
    }
    records = localList;
    if (type && type !== 'all') {
      records = records.filter(r => r.type === type);
    }
  }

  return records;
};

/**
 * Delete a specific record
 */
export const deleteHealthRecord = async (id) => {
  // Delete from local storage
  const localList = getLocalRecords().filter(r => r._id !== id && r.id !== id);
  setLocalRecords(localList);

  // Attempt delete on server
  try {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  } catch (e) {}

  return true;
};

export default {
  saveHealthRecord,
  getHealthRecords,
  deleteHealthRecord
};
