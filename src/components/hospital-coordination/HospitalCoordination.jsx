import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHospital, 
  FaBed, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaAmbulance, 
  FaCheckCircle, 
  FaDirections,
  FaShieldAlt,
  FaSearch,
  FaTimes,
  FaIdCard
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getPublicHospitalsApi, reserveHospitalBedApi } from '../../services/adminService';
import { GLOBAL_COUNTRY_CODES } from '../../constants/countryCodes';
import './HospitalCoordination.css';

const HospitalCoordination = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live Hospital Directory loaded from MongoDB
  const [hospitals, setHospitals] = useState([]);

  // Fetch real-time hospitals from MongoDB
  const fetchLiveHospitals = async () => {
    try {
      const data = await getPublicHospitalsApi();
      if (data && data.length > 0) {
        setHospitals(data);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHospitals();
    const interval = setInterval(fetchLiveHospitals, 8000); // 8s polling for live bed changes
    return () => clearInterval(interval);
  }, []);

  const [bookingCountryCode, setBookingCountryCode] = useState('+91');
  const [bookingForm, setBookingForm] = useState({
    patientName: 'Alex Mercer',
    phone: '98765 43210',
    bedType: 'ICU Bed',
    needAmbulance: true,
    conditionSummary: 'Acute Chest Tightness & Elevated BP'
  });

  const handleOpenBooking = (hospital) => {
    setSelectedHospital(hospital);
    setReservationSuccess(null);
    setBookingModalOpen(true);
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;

    try {
      const fullPhone = bookingForm.phone ? `${bookingCountryCode} ${bookingForm.phone}`.trim() : '';
      const payload = { ...bookingForm, phone: fullPhone };
      const res = await reserveHospitalBedApi(selectedHospital._id, payload);
      const token = res.token || `TV-BED-${Math.floor(1000 + Math.random() * 9000)}-${selectedHospital.name.slice(0, 3).toUpperCase()}`;

      setReservationSuccess({
        token,
        hospital: selectedHospital.name,
        address: selectedHospital.address,
        eta: selectedHospital.etaMin,
        bedType: bookingForm.bedType,
        ambulanceDispatched: bookingForm.needAmbulance
      });

      toast.success(`Emergency reservation confirmed! 1 ${bookingForm.bedType} decremented from live database.`);
      fetchLiveHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reserve bed. Facility may be at maximum capacity.');
    }
  };

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || (Array.isArray(h.departments) ? h.departments.some(d => d.includes(selectedDept)) : true);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="hospital-coord-view">
      {/* Header */}
      <div className="hospital-header-row">
        <div className="hospital-title-group">
          <div className="hospital-title-badge">
            <FaHospital />
            <span>Real-Time Bed Telemetry & Dispatch</span>
          </div>
          <h1 className="hospital-title">Hospital Coordination & Emergency Beds</h1>
          <p className="hospital-subtitle">
            Live ICU, Oxygen, and General Ward bed tracking with instant digital reservation tokens.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-card glass-card">
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search hospitals by name, area, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hospital-search-input"
          />
        </div>

        <div className="dept-filter-pills">
          {['All', 'Emergency', 'Cardiology', 'Pulmonology', 'Pediatrics', 'Maternity'].map((dept) => (
            <button
              key={dept}
              className={`dept-pill-btn ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="hospitals-list-grid">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="hospital-card glass-card">
            <div className="hospital-card-top-row">
              <div className="hospital-brand-info">
                <div className="hospital-icon-ring">
                  <FaHospital />
                </div>
                <div>
                  <h3 className="hospital-name">{hospital.name}</h3>
                  <span className="hospital-address">
                    <FaMapMarkerAlt /> {hospital.address}
                  </span>
                </div>
              </div>

              <div className="hospital-distance-badge">
                <span className="distance-km">{hospital.distanceKm} km</span>
                <span className="distance-eta">~{hospital.etaMin} mins ETA</span>
              </div>
            </div>

            {/* Live Bed Counters */}
            <div className="bed-counters-grid">
              <div className="bed-stat-box icu">
                <span className="bed-stat-num">{hospital.icuBeds}</span>
                <span className="bed-stat-lbl">ICU Beds</span>
              </div>
              <div className="bed-stat-box oxygen">
                <span className="bed-stat-num">{hospital.oxygenBeds}</span>
                <span className="bed-stat-lbl">Oxygen Beds</span>
              </div>
              <div className="bed-stat-box general">
                <span className="bed-stat-num">{hospital.generalBeds}</span>
                <span className="bed-stat-lbl">General Ward</span>
              </div>
              <div className="bed-stat-box vent">
                <span className="bed-stat-num">{hospital.ventilators}</span>
                <span className="bed-stat-lbl">Ventilators</span>
              </div>
            </div>

            <div className="hospital-card-footer">
              <div className="departments-tag-list">
                {hospital.departments.map((d) => (
                  <span key={d} className="dept-tag">{d}</span>
                ))}
              </div>

              <div className="hospital-action-buttons">
                <a href={`tel:${hospital.phone}`} className="phone-btn" title="Call Emergency Desk">
                  <FaPhone /> Call Desk
                </a>
                <button 
                  className="reserve-bed-btn"
                  onClick={() => handleOpenBooking(hospital)}
                >
                  <FaBed /> Instant Bed Pass
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instant Reservation Modal */}
      {bookingModalOpen && selectedHospital && (
        <div className="modal-backdrop">
          <div className="booking-modal glass-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <FaShieldAlt className="shield-cyan" />
                <h3>Instant Emergency Bed Pass</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setBookingModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {reservationSuccess ? (
              <div className="reservation-success-content">
                <div className="success-icon-wrap">
                  <FaCheckCircle />
                </div>
                <h3>Emergency Admission Token Generated</h3>
                <div className="token-display-box">
                  <span className="token-lbl">Official Token ID:</span>
                  <span className="token-code">{reservationSuccess.token}</span>
                </div>
                <p className="success-sub">
                  Present this digital pass at <strong>{reservationSuccess.hospital}</strong> emergency reception upon arrival. Priority admission has been reserved for your selected <strong>{reservationSuccess.bedType}</strong>.
                </p>

                {reservationSuccess.ambulanceDispatched && (
                  <div className="ambulance-dispatch-banner">
                    <FaAmbulance className="ambulance-icon-pulse" />
                    <div>
                      <strong>Ambulance Dispatched:</strong> On route to your GPS location (ETA ~{reservationSuccess.eta} mins).
                    </div>
                  </div>
                )}

                <button 
                  className="close-success-btn"
                  onClick={() => setBookingModalOpen(false)}
                >
                  Close & Return
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="booking-form">
                <div className="selected-hosp-summary">
                  <h4>{selectedHospital.name}</h4>
                  <span>{selectedHospital.address} • ~{selectedHospital.etaMin} mins away</span>
                </div>

                <div className="form-group">
                  <label>Patient Full Name</label>
                  <input 
                    type="text" 
                    value={bookingForm.patientName} 
                    onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone Number</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      style={{ 
                        flex: '0 0 135px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.15)', 
                        borderRadius: '10px', 
                        color: '#fff', 
                        padding: '10px 8px', 
                        fontSize: '0.88rem', 
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                      value={bookingCountryCode}
                      onChange={(e) => setBookingCountryCode(e.target.value)}
                      title="Select Country Calling Code"
                    >
                      {GLOBAL_COUNTRY_CODES.map((c, i) => (
                        <option key={`hosp-cc-${c.code}-${i}`} value={c.code} style={{ background: '#111827', color: '#fff' }} title={`${c.country} (${c.code})`}>
                          {c.display}
                        </option>
                      ))}
                    </select>
                    <input 
                      type="tel" 
                      style={{ flex: 1 }}
                      placeholder="98765 43210"
                      value={bookingForm.phone} 
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value.replace(/[^\d\s-]/g, '') })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Required Bed Category</label>
                  <select 
                    value={bookingForm.bedType}
                    onChange={(e) => setBookingForm({ ...bookingForm, bedType: e.target.value })}
                  >
                    <option value="ICU Bed">ICU Bed (Critical Care)</option>
                    <option value="Oxygen Supported Bed">Oxygen Supported Bed</option>
                    <option value="General Acute Bed">General Acute Ward</option>
                    <option value="Pediatric Emergency Bed">Pediatric Emergency Bed</option>
                  </select>
                </div>

                <div className="form-checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={bookingForm.needAmbulance}
                      onChange={(e) => setBookingForm({ ...bookingForm, needAmbulance: e.target.checked })}
                    />
                    <span>Request Immediate GPS Ambulance Dispatch</span>
                  </label>
                </div>

                <button type="submit" className="confirm-booking-btn">
                  <FaCheckCircle /> Confirm Emergency Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalCoordination;
