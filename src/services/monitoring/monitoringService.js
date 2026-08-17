import { EventEmitter } from 'events'
import toast from 'react-hot-toast'

/**
 * Monitoring Service - Handles all health monitoring, wearable data, and vital sign tracking
 * Supports multiple data sources: wearables, manual input, camera-based monitoring
 */
class MonitoringService extends EventEmitter {
  constructor() {
    super()
    
    // Monitoring state
    this.isMonitoring = false
    this.monitoringInterval = null
    this.currentData = null
    this.history = []
    this.alerts = []
    this.devices = new Map()
    
    // Configuration
    this.config = {
      heartRate: {
        normalRange: { min: 60, max: 100 },
        warningThreshold: { min: 50, max: 120 },
        criticalThreshold: { min: 40, max: 140 }
      },
      bloodPressure: {
        normalRange: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } },
        warningThreshold: { systolic: { min: 80, max: 140 }, diastolic: { min: 50, max: 90 } },
        criticalThreshold: { systolic: { min: 70, max: 180 }, diastolic: { min: 40, max: 110 } }
      },
      oxygenSaturation: {
        normalRange: { min: 95, max: 100 },
        warningThreshold: { min: 90, max: 100 },
        criticalThreshold: { min: 85, max: 100 }
      },
      temperature: {
        normalRange: { min: 36.0, max: 37.5 },
        warningThreshold: { min: 35.0, max: 38.5 },
        criticalThreshold: { min: 34.0, max: 40.0 }
      },
      glucose: {
        normalRange: { min: 70, max: 110 },
        warningThreshold: { min: 60, max: 140 },
        criticalThreshold: { min: 40, max: 200 }
      }
    }
    
    // Historical trends
    this.trends = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map()
    }
    
    // Initialize monitoring
    this.initializeMonitoring()
  }

  /**
   * Initialize monitoring service
   */
  initializeMonitoring() {
    console.log('✅ Monitoring Service initialized')
    
    // Load saved data from localStorage
    this.loadSavedData()
    
    // Set up default monitoring
    this.setupDefaultMonitoring()
  }

  /**
   * Load saved monitoring data
   */
  loadSavedData() {
    try {
      const saved = localStorage.getItem('monitoring_data')
      if (saved) {
        const data = JSON.parse(saved)
        this.history = data.history || []
        this.alerts = data.alerts || []
        this.currentData = data.currentData || null
        console.log('📊 Loaded saved monitoring data')
      }
    } catch (error) {
      console.error('Failed to load saved monitoring data:', error)
    }
  }

  /**
   * Save monitoring data to localStorage
   */
  saveData() {
    try {
      localStorage.setItem('monitoring_data', JSON.stringify({
        history: this.history.slice(-1000), // Keep last 1000 entries
        alerts: this.alerts.slice(-100),
        currentData: this.currentData
      }))
    } catch (error) {
      console.error('Failed to save monitoring data:', error)
    }
  }

  /**
   * Setup default monitoring
   */
  setupDefaultMonitoring() {
    // Simulate initial data
    this.updateVitalSigns({
      heartRate: 72,
      bloodPressure: { systolic: 118, diastolic: 76 },
      oxygenSaturation: 98,
      temperature: 36.8,
      glucose: 85,
      timestamp: new Date()
    })
  }

  /**
   * ============================================
   * VITAL SIGN MONITORING
   * ============================================
   */

  /**
   * Update vital signs
   */
  updateVitalSigns(data) {
    const timestamp = data.timestamp || new Date()
    
    // Validate data
    const validated = this.validateVitalSigns(data)
    
    // Create monitoring entry
    const entry = {
      ...validated,
      timestamp,
      id: `mon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Update current data
    this.currentData = entry
    
    // Add to history
    this.history.push(entry)
    
    // Update trends
    this.updateTrends(entry)
    
    // Check for alerts
    this.checkAlerts(entry)
    
    // Emit update event
    this.emit('vitalUpdate', entry)
    
    // Save data
    this.saveData()
    
    return entry
  }

  /**
   * Validate vital signs
   */
  validateVitalSigns(data) {
    const validated = { ...data }
    
    // Validate each parameter
    if (data.heartRate !== undefined) {
      validated.heartRate = Math.max(0, Math.min(300, data.heartRate))
    }
    
    if (data.bloodPressure) {
      validated.bloodPressure = {
        systolic: Math.max(50, Math.min(250, data.bloodPressure.systolic || 0)),
        diastolic: Math.max(30, Math.min(150, data.bloodPressure.diastolic || 0))
      }
    }
    
    if (data.oxygenSaturation !== undefined) {
      validated.oxygenSaturation = Math.max(50, Math.min(100, data.oxygenSaturation))
    }
    
    if (data.temperature !== undefined) {
      validated.temperature = Math.max(30, Math.min(45, data.temperature))
    }
    
    if (data.glucose !== undefined) {
      validated.glucose = Math.max(20, Math.min(500, data.glucose))
    }
    
    return validated
  }

  /**
   * Check for alerts
   */
  checkAlerts(entry) {
    const alerts = []
    
    // Check heart rate
    if (entry.heartRate) {
      const hrAlert = this.checkHeartRate(entry.heartRate)
      if (hrAlert) alerts.push(hrAlert)
    }
    
    // Check blood pressure
    if (entry.bloodPressure) {
      const bpAlert = this.checkBloodPressure(entry.bloodPressure)
      if (bpAlert) alerts.push(bpAlert)
    }
    
    // Check oxygen saturation
    if (entry.oxygenSaturation) {
      const oxAlert = this.checkOxygenSaturation(entry.oxygenSaturation)
      if (oxAlert) alerts.push(oxAlert)
    }
    
    // Check temperature
    if (entry.temperature) {
      const tempAlert = this.checkTemperature(entry.temperature)
      if (tempAlert) alerts.push(tempAlert)
    }
    
    // Check glucose
    if (entry.glucose) {
      const glucoseAlert = this.checkGlucose(entry.glucose)
      if (glucoseAlert) alerts.push(glucoseAlert)
    }
    
    // Process alerts
    alerts.forEach(alert => {
      this.alerts.push({
        ...alert,
        timestamp: new Date(),
        entryId: entry.id
      })
      
      // Emit alert event
      this.emit('alert', alert)
      
      // Show notification
      this.showAlertNotification(alert)
    })
    
    return alerts
  }

  /**
   * Check heart rate
   */
  checkHeartRate(hr) {
    const config = this.config.heartRate
    
    if (hr <= config.criticalThreshold.min || hr >= config.criticalThreshold.max) {
      return {
        type: 'critical',
        parameter: 'Heart Rate',
        value: hr,
        message: `Critical heart rate: ${hr} BPM. Seek immediate medical attention!`,
        severity: 3
      }
    }
    
    if (hr <= config.warningThreshold.min || hr >= config.warningThreshold.max) {
      return {
        type: 'warning',
        parameter: 'Heart Rate',
        value: hr,
        message: `Abnormal heart rate: ${hr} BPM. Please monitor closely.`,
        severity: 2
      }
    }
    
    if (hr < config.normalRange.min || hr > config.normalRange.max) {
      return {
        type: 'info',
        parameter: 'Heart Rate',
        value: hr,
        message: `Heart rate is outside normal range: ${hr} BPM`,
        severity: 1
      }
    }
    
    return null
  }

  /**
   * Check blood pressure
   */
  checkBloodPressure(bp) {
    const config = this.config.bloodPressure
    const { systolic, diastolic } = bp
    
    // Check systolic
    if (systolic >= config.criticalThreshold.systolic.max) {
      return {
        type: 'critical',
        parameter: 'Blood Pressure',
        value: `${systolic}/${diastolic}`,
        message: `Critically high blood pressure: ${systolic}/${diastolic}. Immediate attention needed!`,
        severity: 3
      }
    }
    
    if (systolic >= config.warningThreshold.systolic.max) {
      return {
        type: 'warning',
        parameter: 'Blood Pressure',
        value: `${systolic}/${diastolic}`,
        message: `High blood pressure: ${systolic}/${diastolic}. Consult a doctor.`,
        severity: 2
      }
    }
    
    if (systolic > config.normalRange.systolic.max || diastolic > config.normalRange.diastolic.max) {
      return {
        type: 'info',
        parameter: 'Blood Pressure',
        value: `${systolic}/${diastolic}`,
        message: `Blood pressure above normal: ${systolic}/${diastolic}`,
        severity: 1
      }
    }
    
    if (systolic < config.warningThreshold.systolic.min) {
      return {
        type: 'warning',
        parameter: 'Blood Pressure',
        value: `${systolic}/${diastolic}`,
        message: `Low blood pressure: ${systolic}/${diastolic}. Monitor for symptoms.`,
        severity: 2
      }
    }
    
    return null
  }

  /**
   * Check oxygen saturation
   */
  checkOxygenSaturation(ox) {
    const config = this.config.oxygenSaturation
    
    if (ox <= config.criticalThreshold.min) {
      return {
        type: 'critical',
        parameter: 'Oxygen Saturation',
        value: ox,
        message: `Critically low oxygen saturation: ${ox}%. Emergency!`,
        severity: 3
      }
    }
    
    if (ox <= config.warningThreshold.min) {
      return {
        type: 'warning',
        parameter: 'Oxygen Saturation',
        value: ox,
        message: `Low oxygen saturation: ${ox}%. Seek medical advice.`,
        severity: 2
      }
    }
    
    if (ox < config.normalRange.min) {
      return {
        type: 'info',
        parameter: 'Oxygen Saturation',
        value: ox,
        message: `Oxygen saturation below normal: ${ox}%`,
        severity: 1
      }
    }
    
    return null
  }

  /**
   * Check temperature
   */
  checkTemperature(temp) {
    const config = this.config.temperature
    
    if (temp >= config.criticalThreshold.max || temp <= config.criticalThreshold.min) {
      return {
        type: 'critical',
        parameter: 'Temperature',
        value: temp,
        message: `Critical temperature: ${temp}°C. Immediate attention needed!`,
        severity: 3
      }
    }
    
    if (temp >= config.warningThreshold.max || temp <= config.warningThreshold.min) {
      return {
        type: 'warning',
        parameter: 'Temperature',
        value: temp,
        message: `Abnormal temperature: ${temp}°C. Monitor closely.`,
        severity: 2
      }
    }
    
    if (temp > config.normalRange.max || temp < config.normalRange.min) {
      return {
        type: 'info',
        parameter: 'Temperature',
        value: temp,
        message: `Temperature outside normal range: ${temp}°C`,
        severity: 1
      }
    }
    
    return null
  }

  /**
   * Check glucose
   */
  checkGlucose(glucose) {
    const config = this.config.glucose
    
    if (glucose <= config.criticalThreshold.min || glucose >= config.criticalThreshold.max) {
      return {
        type: 'critical',
        parameter: 'Glucose',
        value: glucose,
        message: `Critical glucose level: ${glucose} mg/dL. Emergency!`,
        severity: 3
      }
    }
    
    if (glucose <= config.warningThreshold.min || glucose >= config.warningThreshold.max) {
      return {
        type: 'warning',
        parameter: 'Glucose',
        value: glucose,
        message: `Abnormal glucose level: ${glucose} mg/dL. Consult doctor.`,
        severity: 2
      }
    }
    
    if (glucose < config.normalRange.min || glucose > config.normalRange.max) {
      return {
        type: 'info',
        parameter: 'Glucose',
        value: glucose,
        message: `Glucose outside normal range: ${glucose} mg/dL`,
        severity: 1
      }
    }
    
    return null
  }

  /**
   * Show alert notification
   */
  showAlertNotification(alert) {
    const styles = {
      critical: { color: '#ef4444', icon: '🚨' },
      warning: { color: '#f59e0b', icon: '⚠️' },
      info: { color: '#3b82f6', icon: 'ℹ️' }
    }
    
    const style = styles[alert.type] || styles.info
    
    toast.custom(
      (t) => (
        <div style={{
          background: 'var(--bg-card)',
          border: `2px solid ${style.color}`,
          borderRadius: '15px',
          padding: '15px 20px',
          color: 'var(--text-primary)',
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{style.icon}</span>
            <div>
              <h4 style={{ margin: 0, color: style.color }}>{alert.parameter} Alert</h4>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>{alert.message}</p>
            </div>
          </div>
        </div>
      ),
      { duration: alert.type === 'critical' ? 10000 : 5000 }
    )
  }

  /**
   * ============================================
   * TREND ANALYSIS
   * ============================================
   */

  /**
   * Update trends
   */
  updateTrends(entry) {
    const timestamp = new Date(entry.timestamp)
    const dateKey = timestamp.toDateString()
    const weekKey = this.getWeekKey(timestamp)
    const monthKey = timestamp.toISOString().substring(0, 7)
    
    // Daily trends
    if (!this.trends.daily.has(dateKey)) {
      this.trends.daily.set(dateKey, [])
    }
    this.trends.daily.get(dateKey).push(entry)
    
    // Weekly trends
    if (!this.trends.weekly.has(weekKey)) {
      this.trends.weekly.set(weekKey, [])
    }
    this.trends.weekly.get(weekKey).push(entry)
    
    // Monthly trends
    if (!this.trends.monthly.has(monthKey)) {
      this.trends.monthly.set(monthKey, [])
    }
    this.trends.monthly.get(monthKey).push(entry)
  }

  /**
   * Get week key from timestamp
   */
  getWeekKey(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    return `${date.getFullYear()}-W${weekNumber}`
  }

  /**
   * Analyze trends
   */
  analyzeTrends(parameter, period = 'daily') {
    const data = this.getTrendData(parameter, period)
    
    if (!data || data.length === 0) {
      return null
    }
    
    const values = data.map(d => d.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const trend = this.calculateTrend(values)
    const stability = this.calculateStability(values)
    
    return {
      parameter,
      period,
      current: values[values.length - 1],
      average: avg,
      max,
      min,
      trend,
      stability,
      data: data,
      change: ((values[values.length - 1] - values[0]) / values[0]) * 100
    }
  }

  /**
   * Get trend data
   */
  getTrendData(parameter, period = 'daily') {
    const trendMap = {
      daily: this.trends.daily,
      weekly: this.trends.weekly,
      monthly: this.trends.monthly
    }
    
    const data = []
    const entries = Array.from(trendMap[period].values()).flat()
    
    entries.forEach(entry => {
      if (entry[parameter] !== undefined) {
        data.push({
          timestamp: entry.timestamp,
          value: entry[parameter]
        })
      }
    })
    
    return data
  }

  /**
   * Calculate trend
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable'
    
    const first = values[0]
    const last = values[values.length - 1]
    const diff = ((last - first) / first) * 100
    
    if (diff > 5) return 'increasing'
    if (diff < -5) return 'decreasing'
    return 'stable'
  }

  /**
   * Calculate stability
   */
  calculateStability(values) {
    if (values.length < 2) return 'stable'
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    const cv = (stdDev / mean) * 100 // Coefficient of variation
    
    if (cv < 10) return 'very stable'
    if (cv < 20) return 'stable'
    if (cv < 30) return 'moderate'
    return 'unstable'
  }

  /**
   * ============================================
   * WEARABLE DEVICE INTEGRATION
   * ============================================
   */

  /**
   * Connect wearable device
   */
  async connectDevice(deviceType) {
    try {
      const device = {
        id: `dev_${Date.now()}`,
        type: deviceType,
        connected: false,
        data: null
      }
      
      // Simulate device connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      device.connected = true
      this.devices.set(device.id, device)
      
      // Emit device connected event
      this.emit('deviceConnected', device)
      
      toast.success(`✅ ${deviceType} connected successfully!`)
      return device
    } catch (error) {
      toast.error('Failed to connect device')
      throw error
    }
  }

  /**
   * Disconnect device
   */
  disconnectDevice(deviceId) {
    const device = this.devices.get(deviceId)
    if (device) {
      device.connected = false
      this.devices.delete(deviceId)
      this.emit('deviceDisconnected', device)
      toast.info(`📱 ${device.type} disconnected`)
      return true
    }
    return false
  }

  /**
   * Get connected devices
   */
  getConnectedDevices() {
    return Array.from(this.devices.values())
  }

  /**
   * Simulate wearable data
   */
  simulateWearableData(deviceId) {
    const device = this.devices.get(deviceId)
    if (!device || !device.connected) return null
    
    const data = {
      heartRate: Math.floor(Math.random() * 40) + 60,
      steps: Math.floor(Math.random() * 1000) + 500,
      calories: Math.floor(Math.random() * 200) + 100,
      sleep: Math.random() * 8 + 4,
      timestamp: new Date()
    }
    
    device.data = data
    this.emit('deviceData', { deviceId, data })
    
    // Update vital signs with wearable data
    this.updateVitalSigns({
      heartRate: data.heartRate,
      timestamp: data.timestamp
    })
    
    return data
  }

  /**
   * ============================================
   * BP MONITORING (Camera/Flash)
   * ============================================
   */

  /**
   * Process BP from camera data
   */
  async processBPCameraData(imageData) {
    try {
      // Simulate BP analysis from camera
      const bp = this.simulateBPAnalysis()
      
      // Update vital signs
      const entry = this.updateVitalSigns({
        bloodPressure: bp,
        timestamp: new Date()
      })
      
      return {
        systolic: bp.systolic,
        diastolic: bp.diastolic,
        timestamp: entry.timestamp,
        status: this.getBPStatus(bp)
      }
    } catch (error) {
      console.error('BP camera processing failed:', error)
      throw error
    }
  }

  /**
   * Simulate BP analysis
   */
  simulateBPAnalysis() {
    // Generate realistic BP values
    const systolic = Math.floor(Math.random() * 40) + 100
    const diastolic = Math.floor(Math.random() * 30) + 60
    
    return { systolic, diastolic }
  }

  /**
   * Get BP status
   */
  getBPStatus(bp) {
    const { systolic, diastolic } = bp
    
    if (systolic < 90 || diastolic < 60) {
      return { status: 'Low', color: '#f59e0b', advice: 'Blood pressure is low. Stay hydrated and consult doctor.' }
    }
    
    if (systolic > 140 || diastolic > 90) {
      return { status: 'High', color: '#ef4444', advice: 'Blood pressure is high. Consult healthcare provider.' }
    }
    
    if (systolic >= 120 || diastolic >= 80) {
      return { status: 'Elevated', color: '#f59e0b', advice: 'Blood pressure is elevated. Monitor regularly.' }
    }
    
    return { status: 'Normal', color: '#10b981', advice: 'Blood pressure is normal. Keep up healthy habits!' }
  }

  /**
   * ============================================
   * HEALTH SCORE CALCULATION
   * ============================================
   */

  /**
   * Calculate overall health score
   */
  calculateHealthScore(vitals) {
    let score = 0
    let maxScore = 0
    
    // Heart Rate Score (0-25)
    if (vitals.heartRate) {
      const hr = vitals.heartRate
      if (hr >= 60 && hr <= 100) score += 25
      else if (hr >= 50 && hr <= 120) score += 15
      else score += 5
      maxScore += 25
    }
    
    // Blood Pressure Score (0-25)
    if (vitals.bloodPressure) {
      const { systolic, diastolic } = vitals.bloodPressure
      if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) {
        score += 25
      } else if (systolic >= 80 && systolic <= 140 && diastolic >= 50 && diastolic <= 90) {
        score += 15
      } else {
        score += 5
      }
      maxScore += 25
    }
    
    // Oxygen Saturation Score (0-25)
    if (vitals.oxygenSaturation) {
      const ox = vitals.oxygenSaturation
      if (ox >= 95) score += 25
      else if (ox >= 90) score += 15
      else score += 5
      maxScore += 25
    }
    
    // Temperature Score (0-25)
    if (vitals.temperature) {
      const temp = vitals.temperature
      if (temp >= 36.0 && temp <= 37.5) score += 25
      else if (temp >= 35.0 && temp <= 38.5) score += 15
      else score += 5
      maxScore += 25
    }
    
    return Math.round((score / maxScore) * 100)
  }

  /**
   * Get health score category
   */
  getHealthScoreCategory(score) {
    if (score >= 85) return { label: 'Excellent', color: '#10b981', emoji: '🌟' }
    if (score >= 70) return { label: 'Good', color: '#3b82f6', emoji: '😊' }
    if (score >= 50) return { label: 'Fair', color: '#f59e0b', emoji: '⚠️' }
    if (score >= 30) return { label: 'Poor', color: '#ef4444', emoji: '🔴' }
    return { label: 'Critical', color: '#dc2626', emoji: '🚨' }
  }

  /**
   * ============================================
   * MONITORING CONTROL
   * ============================================
   */

  /**
   * Start monitoring
   */
  startMonitoring(interval = 5000) {
    if (this.isMonitoring) {
      console.log('Monitoring already running')
      return
    }
    
    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      // Simulate vital signs update
      const vitals = {
        heartRate: Math.floor(Math.random() * 30) + 65,
        bloodPressure: {
          systolic: Math.floor(Math.random() * 30) + 105,
          diastolic: Math.floor(Math.random() * 20) + 65
        },
        oxygenSaturation: Math.floor(Math.random() * 5) + 95,
        temperature: 36.5 + (Math.random() * 0.8),
        glucose: Math.floor(Math.random() * 30) + 75,
        timestamp: new Date()
      }
      
      this.updateVitalSigns(vitals)
    }, interval)
    
    this.emit('monitoringStarted')
    toast.success('📊 Health monitoring started!')
    console.log('📊 Monitoring started')
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    this.isMonitoring = false
    this.emit('monitoringStopped')
    toast.info('📊 Monitoring stopped')
    console.log('📊 Monitoring stopped')
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      devicesConnected: this.devices.size,
      alertsCount: this.alerts.length,
      historyCount: this.history.length,
      lastUpdate: this.currentData?.timestamp || null
    }
  }

  /**
   * ============================================
   * DATA EXPORT
   * ============================================
   */

  /**
   * Export monitoring data
   */
  exportData(format = 'json', dateRange = null) {
    let data = this.history
    
    if (dateRange) {
      data = data.filter(entry => {
        const date = new Date(entry.timestamp)
        return date >= dateRange.start && date <= dateRange.end
      })
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data)
      default:
        return data
    }
  }

  /**
   * Convert data to CSV
   */
  convertToCSV(data) {
    if (data.length === 0) return ''
    
    const headers = ['timestamp', 'heartRate', 'systolicBP', 'diastolicBP', 'oxygenSaturation', 'temperature', 'glucose']
    const csv = [
      headers.join(','),
      ...data.map(entry => {
        return [
          entry.timestamp,
          entry.heartRate || '',
          entry.bloodPressure?.systolic || '',
          entry.bloodPressure?.diastolic || '',
          entry.oxygenSaturation || '',
          entry.temperature || '',
          entry.glucose || ''
        ].join(',')
      })
    ]
    
    return csv.join('\n')
  }

  /**
   * ============================================
   * RESET AND CLEANUP
   * ============================================
   */

  /**
   * Reset monitoring data
   */
  resetData() {
    this.history = []
    this.alerts = []
    this.currentData = null
    this.trends = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map()
    }
    this.saveData()
    this.emit('dataReset')
    toast.info('🔄 Monitoring data reset')
  }

  /**
   * Clean up
   */
  cleanup() {
    this.stopMonitoring()
    this.devices.clear()
    this.removeAllListeners()
    this.saveData()
    console.log('🧹 Monitoring service cleaned up')
  }
}

// Create singleton instance
const monitoringService = new MonitoringService()

// Export for use in components
export default monitoringService

// Export specific methods for easier imports
export const {
  updateVitalSigns,
  startMonitoring,
  stopMonitoring,
  connectDevice,
  disconnectDevice,
  getConnectedDevices,
  processBPCameraData,
  calculateHealthScore,
  getHealthScoreCategory,
  analyzeTrends,
  exportData,
  resetData,
  getMonitoringStatus
} = monitoringService