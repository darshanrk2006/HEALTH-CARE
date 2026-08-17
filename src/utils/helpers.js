/**
 * Helper Functions - Comprehensive utility library
 * Contains formatters, validators, converters, and general helper functions
 */

import { DATE_FORMATS, VALIDATION } from './constants'

// ============================================
// DATE & TIME HELPERS
// ============================================

/**
 * Format date to specified format
 */
export const formatDate = (date, format = DATE_FORMATS.dateDisplay) => {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  const options = {
    [DATE_FORMATS.dateDisplay]: { year: 'numeric', month: 'short', day: 'numeric' },
    [DATE_FORMATS.timeDisplay]: { hour: 'numeric', minute: 'numeric', hour12: true },
    [DATE_FORMATS.datetimeDisplay]: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true },
    [DATE_FORMATS.monthYear]: { year: 'numeric', month: 'long' },
    [DATE_FORMATS.year]: { year: 'numeric' }
  }
  
  return d.toLocaleDateString('en-US', options[format] || options[DATE_FORMATS.dateDisplay])
}

/**
 * Format time
 */
export const formatTime = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A'
  
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const d = new Date(date)
  const today = new Date()
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  return new Date(date) < new Date()
}

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  return new Date(date) > new Date()
}

/**
 * Get age from date of birth
 */
export const getAge = (dob) => {
  if (!dob) return null
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Get date range
 */
export const getDateRange = (startDate, endDate) => {
  const dates = []
  let current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// ============================================
// NUMBER & STRING HELPERS
// ============================================

/**
 * Format number with commas
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null) return 'N/A'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return 'N/A'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitalize each word
 */
export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.split(' ').map(word => capitalize(word)).join(' ')
}

/**
 * Slugify string (for URLs)
 */
export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate unique ID
 */
export const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// HEALTH & MEDICAL HELPERS
// ============================================

/**
 * Calculate BMI
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

/**
 * Get BMI category
 */
export const getBMICategory = (bmi) => {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Underweight', color: '#f59e0b', emoji: '📉' }
  if (bmi < 25) return { label: 'Normal', color: '#10b981', emoji: '✅' }
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b', emoji: '⚠️' }
  if (bmi < 40) return { label: 'Obese', color: '#ef4444', emoji: '🔴' }
  return { label: 'Severely Obese', color: '#dc2626', emoji: '🚨' }
}

/**
 * Calculate BMR (Basal Metabolic Rate)
 * Harris-Benedict Equation
 */
export const calculateBMR = (weight, height, age, gender = 'male') => {
  if (!weight || !height || !age) return null
  
  if (gender.toLowerCase() === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
}

/**
 * Calculate ideal weight (Devine formula)
 */
export const calculateIdealWeight = (height, gender = 'male') => {
  if (!height) return null
  
  const heightInInches = height / 2.54
  
  if (gender.toLowerCase() === 'male') {
    return 50 + 2.3 * (heightInInches - 60)
  } else {
    return 45.5 + 2.3 * (heightInInches - 60)
  }
}

/**
 * Calculate body fat percentage (BMI method)
 */
export const calculateBodyFat = (bmi, age, gender = 'male') => {
  if (!bmi || !age) return null
  
  if (gender.toLowerCase() === 'male') {
    return 1.20 * bmi + 0.23 * age - 16.2
  } else {
    return 1.20 * bmi + 0.23 * age - 5.4
  }
}

/**
 * Get blood pressure category
 */
export const getBPCategory = (systolic, diastolic) => {
  if (!systolic || !diastolic) return null
  
  if (systolic < 90 || diastolic < 60) {
    return { label: 'Low', color: '#f59e0b', emoji: '📉' }
  }
  if (systolic >= 180 || diastolic >= 120) {
    return { label: 'Hypertensive Crisis', color: '#dc2626', emoji: '🚨' }
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { label: 'High', color: '#ef4444', emoji: '🔴' }
  }
  if (systolic >= 120 || diastolic >= 80) {
    return { label: 'Elevated', color: '#f59e0b', emoji: '⚠️' }
  }
  return { label: 'Normal', color: '#10b981', emoji: '✅' }
}

/**
 * Get heart rate category
 */
export const getHRCategory = (heartRate, age) => {
  if (!heartRate) return null
  
  if (heartRate < 40) return { label: 'Bradycardia', color: '#ef4444', emoji: '🔴' }
  if (heartRate > 100) return { label: 'Tachycardia', color: '#ef4444', emoji: '🔴' }
  if (heartRate < 60) return { label: 'Low', color: '#f59e0b', emoji: '⚠️' }
  if (heartRate > 90) return { label: 'Elevated', color: '#f59e0b', emoji: '⚠️' }
  return { label: 'Normal', color: '#10b981', emoji: '✅' }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  if (!email) return false
  return VALIDATION.email.pattern.test(email)
}

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return true // Not required
  return VALIDATION.phone.pattern.test(phone)
}

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  if (!password) return false
  return VALIDATION.password.pattern.test(password)
}

/**
 * Validate name
 */
export const isValidName = (name) => {
  if (!name) return false
  return name.length >= VALIDATION.name.minLength &&
    name.length <= VALIDATION.name.maxLength &&
    VALIDATION.name.pattern.test(name)
}

/**
 * Validate age
 */
export const isValidAge = (age) => {
  if (age === undefined || age === null) return true
  return age >= VALIDATION.age.min && age <= VALIDATION.age.max
}

/**
 * Validate weight
 */
export const isValidWeight = (weight) => {
  if (weight === undefined || weight === null) return true
  return weight >= VALIDATION.weight.min && weight <= VALIDATION.weight.max
}

/**
 * Validate height
 */
export const isValidHeight = (height) => {
  if (height === undefined || height === null) return true
  return height >= VALIDATION.height.min && height <= VALIDATION.height.max
}

/**
 * Validate URL
 */
export const isValidURL = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file) return false
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSize) => {
  if (!file) return false
  return file.size <= maxSize
}

// ============================================
// OBJECT & ARRAY HELPERS
// ============================================

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

/**
 * Remove null/undefined values from object
 */
export const cleanObject = (obj) => {
  if (!obj) return {}
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  )
}

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  if (!array || !key) return {}
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  if (!array || !key) return array
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

/**
 * Get unique values from array
 */
export const getUnique = (array) => {
  if (!array) return []
  return [...new Set(array)]
}

/**
 * Chunk array into smaller arrays
 */
export const chunkArray = (array, size) => {
  if (!array || !size) return []
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Shuffle array (Fisher-Yates)
 */
export const shuffleArray = (array) => {
  if (!array) return []
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ============================================
// COLOR HELPERS
// ============================================

/**
 * Generate random color
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Get color based on health score
 */
export const getHealthColor = (score) => {
  if (score >= 85) return '#10b981' // Excellent
  if (score >= 70) return '#3b82f6' // Good
  if (score >= 50) return '#f59e0b' // Fair
  if (score >= 30) return '#ef4444' // Poor
  return '#dc2626' // Critical
}

/**
 * Get color based on value range
 */
export const getColorForValue = (value, ranges) => {
  if (!value || !ranges) return '#808080'
  
  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      return range.color
    }
  }
  return '#808080'
}

/**
 * Lighten color
 */
export const lightenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}

/**
 * Darken color
 */
export const darkenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}

// ============================================
// FILE & DOWNLOAD HELPERS
// ============================================

/**
 * Download file
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download text as file
 */
export const downloadTextAsFile = (text, filename, type = 'text/plain') => {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

/**
 * Convert file to base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return ''
  return filename.split('.').pop().toLowerCase()
}

/**
 * Get file size readable
 */
export const getReadableFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

// ============================================
// BROWSER HELPERS
// ============================================

/**
 * Check if browser supports a feature
 */
export const browserSupports = (feature) => {
  switch (feature) {
    case 'webcam':
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    case 'geolocation':
      return !!navigator.geolocation
    case 'webSpeech':
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    case 'webShare':
      return !!navigator.share
    case 'serviceWorker':
      return 'serviceWorker' in navigator
    default:
      return false
  }
}

/**
 * Get browser info
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let version = 'Unknown'
  
  if (ua.includes('Chrome')) {
    browser = 'Chrome'
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox'
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari'
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Edge')) {
    browser = 'Edge'
    version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
  }
  
  return { browser, version }
}

/**
 * Get device info
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent
  let device = 'Unknown'
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'Tablet'
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    device = 'Mobile'
  } else {
    device = 'Desktop'
  }
  
  return { device }
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

/**
 * Set item in localStorage with expiry
 */
export const setLocalStorageWithExpiry = (key, value, expiryInMinutes = 60) => {
  const item = {
    value,
    expiry: new Date().getTime() + (expiryInMinutes * 60 * 1000)
  }
  localStorage.setItem(key, JSON.stringify(item))
}

/**
 * Get item from localStorage
 */
export const getLocalStorageWithExpiry = (key) => {
  const item = localStorage.getItem(key)
  if (!item) return null
  
  const parsed = JSON.parse(item)
  if (new Date().getTime() > parsed.expiry) {
    localStorage.removeItem(key)
    return null
  }
  
  return parsed.value
}

// ============================================
// HEALTH SCORE CALCULATIONS
// ============================================

/**
 * Calculate overall health score
 */
export const calculateHealthScore = (vitals) => {
  let score = 0
  let maxScore = 0
  
  // Heart Rate (0-25)
  if (vitals.heartRate) {
    const hr = vitals.heartRate
    if (hr >= 60 && hr <= 100) score += 25
    else if (hr >= 50 && hr <= 120) score += 15
    else score += 5
    maxScore += 25
  }
  
  // Blood Pressure (0-25)
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
  
  // Oxygen Saturation (0-25)
  if (vitals.oxygenSaturation) {
    const ox = vitals.oxygenSaturation
    if (ox >= 95) score += 25
    else if (ox >= 90) score += 15
    else score += 5
    maxScore += 25
  }
  
  // Temperature (0-25)
  if (vitals.temperature) {
    const temp = vitals.temperature
    if (temp >= 36.0 && temp <= 37.5) score += 25
    else if (temp >= 35.0 && temp <= 38.5) score += 15
    else score += 5
    maxScore += 25
  }
  
  return Math.round((score / maxScore) * 100)
}

// ============================================
// EXPORT ALL HELPERS
// ============================================

export default {
  // Date & Time
  formatDate,
  formatTime,
  getRelativeTime,
  isToday,
  isPast,
  isFuture,
  getAge,
  getDateRange,
  
  // Number & String
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  capitalize,
  capitalizeWords,
  slugify,
  generateRandomString,
  generateId,
  
  // Health & Medical
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateIdealWeight,
  calculateBodyFat,
  getBPCategory,
  getHRCategory,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isValidName,
  isValidAge,
  isValidWeight,
  isValidHeight,
  isValidURL,
  isValidFileType,
  isValidFileSize,
  
  // Object & Array
  deepClone,
  isEmptyObject,
  cleanObject,
  groupBy,
  sortBy,
  getUnique,
  chunkArray,
  shuffleArray,
  
  // Color
  getRandomColor,
  getHealthColor,
  getColorForValue,
  lightenColor,
  darkenColor,
  
  // File & Download
  downloadFile,
  downloadTextAsFile,
  fileToBase64,
  getFileExtension,
  getReadableFileSize,
  
  // Browser
  browserSupports,
  getBrowserInfo,
  getDeviceInfo,
  copyToClipboard,
  
  // Storage
  setLocalStorageWithExpiry,
  getLocalStorageWithExpiry,
  
  // Health Score
  calculateHealthScore
}