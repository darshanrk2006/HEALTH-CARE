import React, { useState, useEffect } from 'react';
import {
  FaFolder,
  FaHeartbeat,
  FaFlask,
  FaPrescription,
  FaSearch,
  FaTrash,
  FaEye,
  FaTimes,
  FaCalendarAlt,
  FaSyncAlt,
  FaPills,
  FaDownload,
  FaFileMedical,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getHealthRecords, deleteHealthRecord } from '../../services/recordsService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './HealthMonitor.css';

const HealthMonitor = () => {
  const { user } = useAuth();
  // Categorized tabs: 'all', 'bp', 'report', 'prescription'
  const [activeCategory, setActiveCategory] = useState('all');
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);

  // Load database records for active category
  const loadRecords = async (category = activeCategory) => {
    setLoadingRecords(true);
    try {
      const data = await getHealthRecords(category);
      setRecords(data);
    } catch (e) {
      console.warn('Error loading health records:', e);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecords(activeCategory);

    const handleRecordsUpdate = () => {
      loadRecords(activeCategory);
    };

    window.addEventListener('titanvitals_records_updated', handleRecordsUpdate);
    window.addEventListener('storage', handleRecordsUpdate);

    return () => {
      window.removeEventListener('titanvitals_records_updated', handleRecordsUpdate);
      window.removeEventListener('storage', handleRecordsUpdate);
    };
  }, [activeCategory]);

  // Handle Record Deletion
  const handleDelete = async (e, recordId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this health record?')) {
      await deleteHealthRecord(recordId);
      setRecords(prev => prev.filter(r => r._id !== recordId && r.id !== recordId));
      if (selectedRecordModal && (selectedRecordModal._id === recordId || selectedRecordModal.id === recordId)) {
        setSelectedRecordModal(null);
      }
      toast.success('Health record deleted');
    }
  };

  // Export Filtered Records as CSV
  const exportRecordsCSV = () => {
    if (records.length === 0) {
      toast.error('No records available to export');
      return;
    }
    const headers = 'ID,Type,Title,Summary,Date\n';
    const rows = records.map(r =>
      `"${r._id || r.id}","${r.type}","${(r.title || '').replace(/"/g, '""')}","${(r.summary || '').replace(/"/g, '""').slice(0, 120)}","${r.createdAt}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TitanVitals_Records_${activeCategory}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Health records exported successfully');
  };

  // Filter records based on search
  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchTitle = (r.title || '').toLowerCase().includes(query);
    const matchSummary = (r.summary || '').toLowerCase().includes(query);
    const matchType = (r.type || '').toLowerCase().includes(query);
    return matchTitle || matchSummary || matchType;
  });

  return (
    <div className="health-records-hub-view">
      {/* Top Header */}
      <div className="records-main-header glass-card">
        <div className="records-header-text">
          <div className="records-badge">
            <FaFolder className="badge-icon-cyan" />
            <span>Patient Telemetry & Health Records Database</span>
          </div>
          <h1 className="records-hub-title">Health History & Document Records</h1>
          <p className="records-hub-sub">
            Collect, inspect, and organize all historical Blood Pressure scans, Lab Test Reports, and Prescription OCR data.
          </p>
        </div>

        <div className="records-header-actions">
          <button className="records-refresh-btn" onClick={() => loadRecords(activeCategory)} title="Sync Database">
            <FaSyncAlt className={loadingRecords ? 'spin-icon' : ''} />
            <span>Sync Records</span>
          </button>
          <button className="records-export-btn" onClick={exportRecordsCSV}>
            <FaDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Categorized Filter Tabs (Records -> All, BP, Report, Prescription) */}
      <div className="records-category-tabs">
        <button
          className={`rec-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <FaFolder className="tab-icon" />
          <span>All Records</span>
          <span className="tab-count-tag">{records.length}</span>
        </button>

        <button
          className={`rec-tab-btn tab-bp ${activeCategory === 'bp' ? 'active' : ''}`}
          onClick={() => setActiveCategory('bp')}
        >
          <FaHeartbeat className="tab-icon" />
          <span>Blood Pressure</span>
        </button>

        <button
          className={`rec-tab-btn tab-lab ${activeCategory === 'report' ? 'active' : ''}`}
          onClick={() => setActiveCategory('report')}
        >
          <FaFlask className="tab-icon" />
          <span>Lab Reports</span>
        </button>

        <button
          className={`rec-tab-btn tab-rx ${activeCategory === 'prescription' ? 'active' : ''}`}
          onClick={() => setActiveCategory('prescription')}
        >
          <FaPrescription className="tab-icon" />
          <span>Prescriptions</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="records-search-bar">
        <FaSearch className="rec-search-icon" />
        <input 
          type="text"
          placeholder={`Search ${activeCategory === 'all' ? 'all' : activeCategory} records by title, medicine name, or biomarker...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')} title="Clear search">
            <FaTimes />
          </button>
        )}
      </div>

      {/* CATEGORIZED DATABASE RECORDS LIST */}
      <div className="records-content-container">
        {loadingRecords ? (
          <div className="records-loading-state glass-card">
            <FaSyncAlt className="loading-spin-icon" />
            <span>Fetching patient records from database...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="records-empty-state glass-card">
            <FaFolder className="empty-folder-icon" />
            <h3>No {activeCategory === 'all' ? '' : activeCategory} records found</h3>
            <p>Perform a Blood Pressure scan or document scan to automatically save records here.</p>
          </div>
        ) : (
          <div className="records-items-grid">
            {filteredRecords.map((record) => {
              const isBp = record.type === 'bp';
              const isReport = record.type === 'report';
              const isRx = record.type === 'prescription';
              const formattedDate = new Date(record.createdAt).toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={record._id || record.id}
                  className={`record-card-item glass-card card-type-${record.type}`}
                  onClick={() => setSelectedRecordModal(record)}
                >
                  <div className="record-card-top-row">
                    <div className="record-type-badge">
                      {isBp && <><FaHeartbeat className="type-ico icon-bp" /> Blood Pressure</>}
                      {isReport && <><FaFlask className="type-ico icon-lab" /> Lab Report</>}
                      {isRx && <><FaPrescription className="type-ico icon-rx" /> Prescription OCR</>}
                    </div>
                    <span className="record-date-tag">
                      <FaCalendarAlt className="cal-ico" /> {formattedDate}
                    </span>
                  </div>

                  <h3 className="record-item-title">{record.title}</h3>

                  {/* Quick Metric Highlights based on type */}
                  {isBp && record.data && (
                    <div className="record-quick-pills">
                      <span className="quick-pill pill-cyan">
                        <strong>{record.data.bpString || `${record.data.systolic}/${record.data.diastolic}`}</strong> mmHg
                      </span>
                      <span className="quick-pill pill-green">
                        <strong>{record.data.heartRate}</strong> bpm
                      </span>
                      {record.data.category && (
                        <span className="quick-pill pill-purple">{record.data.category}</span>
                      )}
                    </div>
                  )}

                  {isReport && record.data?.metrics && (
                    <div className="record-quick-pills">
                      <span className="quick-pill pill-purple">
                        <strong>{record.data.metrics.length}</strong> Biomarkers Analyzed
                      </span>
                      {record.data.metrics.slice(0, 2).map((m, idx) => (
                        <span key={idx} className="quick-pill pill-neutral">
                          {m.name}: <strong>{m.value} {m.unit}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {isRx && record.data?.medications && (
                    <div className="record-quick-pills">
                      <span className="quick-pill pill-cyan">
                        <FaPills className="pill-ico" /> <strong>{record.data.medications.length}</strong> Prescribed Medicines
                      </span>
                      {record.data.medications.slice(0, 2).map((med, idx) => (
                        <span key={idx} className="quick-pill pill-neutral">
                          {med.name} ({med.dose})
                        </span>
                      ))}
                    </div>
                  )}

                  {record.summary && (
                    <p className="record-item-summary-snippet">
                      {record.summary.replace(/[#*_`]/g, '').slice(0, 140)}...
                    </p>
                  )}

                  <div className="record-card-footer">
                    <button className="view-record-btn" onClick={(e) => { e.stopPropagation(); setSelectedRecordModal(record); }}>
                      <FaEye /> View Full Details
                    </button>
                    <button className="delete-record-btn" onClick={(e) => handleDelete(e, record._id || record.id)} title="Delete Record">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED RECORD INSPECTION MODAL */}
      {selectedRecordModal && (
        <div className="record-details-modal-overlay" onClick={() => setSelectedRecordModal(null)}>
          <div className="record-details-modal-box glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-header-left">
                <span className={`modal-type-tag tag-${selectedRecordModal.type}`}>
                  {selectedRecordModal.type.toUpperCase()}
                </span>
                <h2 className="modal-record-title">{selectedRecordModal.title}</h2>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setSelectedRecordModal(null)}
                title="Close"
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-meta-bar">
              <span>Date: <strong>{new Date(selectedRecordModal.createdAt).toLocaleString()}</strong></span>
              <span>Patient ID: <strong className="patient-id-highlight">{user?.healthId || user?.name || user?.email || selectedRecordModal.userId || 'TV-8942-AI'}</strong></span>
            </div>

            <div className="modal-body-scrollable">
              {/* BP Telemetry Details */}
              {selectedRecordModal.type === 'bp' && selectedRecordModal.data && (
                <div className="modal-section-bp">
                  <div className="bp-stats-showcase">
                    <div className="bp-showcase-box">
                      <span className="showcase-val">{selectedRecordModal.data.bpString || `${selectedRecordModal.data.systolic}/${selectedRecordModal.data.diastolic}`}</span>
                      <span className="showcase-lbl">Blood Pressure (mmHg)</span>
                    </div>
                    <div className="bp-showcase-box">
                      <span className="showcase-val">{selectedRecordModal.data.heartRate} bpm</span>
                      <span className="showcase-lbl">Pulse</span>
                    </div>
                    <div className="bp-showcase-box">
                      <span className="showcase-val">{selectedRecordModal.data.spo2}%</span>
                      <span className="showcase-lbl">SpO2 Oxygen</span>
                    </div>
                    <div className="bp-showcase-box">
                      <span className="showcase-val">{selectedRecordModal.data.map || 90} mmHg</span>
                      <span className="showcase-lbl">Mean Arterial Pressure</span>
                    </div>
                  </div>
                  {selectedRecordModal.data.vascularElasticity && (
                    <div className="bp-compliance-note">
                      <strong>Arterial Compliance:</strong> {selectedRecordModal.data.vascularElasticity}
                    </div>
                  )}
                </div>
              )}

              {/* Lab Report Biomarkers Table */}
              {selectedRecordModal.type === 'report' && selectedRecordModal.data?.metrics && (
                <div className="modal-section-report">
                  <h4 className="modal-section-heading">Extracted Pathology Biomarkers</h4>
                  <table className="modal-biomarker-table">
                    <thead>
                      <tr>
                        <th>Biomarker Test</th>
                        <th>Actual Value</th>
                        <th>Standard Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecordModal.data.metrics.map((m, idx) => (
                        <tr key={idx}>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.value} {m.unit}</td>
                          <td>{m.refRange || m.standardRange || '--'}</td>
                          <td>
                            <span className={`status-pill ${m.status?.toLowerCase().includes('high') ? 'status-high' : m.status?.toLowerCase().includes('low') ? 'status-low' : 'status-normal'}`}>
                              {m.status || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Prescription Medications Details */}
              {selectedRecordModal.type === 'prescription' && selectedRecordModal.data?.medications && (
                <div className="modal-section-rx">
                  <h4 className="modal-section-heading">Prescribed Medications & Dosage Schedule</h4>
                  <div className="modal-meds-list">
                    {selectedRecordModal.data.medications.map((med, idx) => (
                      <div key={idx} className="modal-med-item glass-card">
                        <div className="med-item-top">
                          <FaPills className="med-ico" />
                          <h4 className="med-name">{med.name}</h4>
                          <span className="med-dose-tag">{med.dose}</span>
                        </div>
                        <div className="med-schedule-grid">
                          <div><strong>Timing:</strong> {med.timing}</div>
                          <div><strong>Frequency:</strong> {med.frequency}</div>
                          {med.duration && <div><strong>Duration:</strong> {med.duration}</div>}
                        </div>
                        {med.precautions && (
                          <div className="med-precaution-text">
                            ⚠️ {med.precautions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Clinical Interpretation & Guidance */}
              {selectedRecordModal.summary && (
                <div className="modal-summary-box">
                  <h4 className="modal-section-heading">Clinical AI Summary & Guidance</h4>
                  <div className="modal-summary-text">
                    {selectedRecordModal.summary}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-actions">
              <button className="modal-action-btn delete-btn" onClick={(e) => handleDelete(e, selectedRecordModal._id || selectedRecordModal.id)}>
                <FaTrash /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMonitor;
