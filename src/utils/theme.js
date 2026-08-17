/**
 * Theme Management - Handles all theme-related functionality
 * Includes theme switching, dynamic styling, and CSS variable management
 */

import { THEMES } from './constants'

// ============================================
// THEME STATE
// ============================================

let currentTheme = 'dark'
let themeListeners = []

// ============================================
// THEME MANAGEMENT FUNCTIONS
// ============================================

/**
 * Initialize theme
 */
export const initTheme = () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme_preference')
  
  // Check for system preference
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    currentTheme = prefersDark ? 'dark' : 'light'
  } else {
    currentTheme = savedTheme
  }
  
  // Apply theme
  applyTheme(currentTheme)
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  return currentTheme
}

/**
 * Handle system theme change
 */
const handleSystemThemeChange = (e) => {
  const systemTheme = e.matches ? 'dark' : 'light'
  const savedTheme = localStorage.getItem('theme_preference')
  
  // Only change if user hasn't set a preference
  if (!savedTheme) {
    setTheme(systemTheme)
  }
}

/**
 * Set theme
 */
export const setTheme = (themeId) => {
  if (!THEMES[themeId]) {
    console.error(`Theme "${themeId}" not found`)
    return
  }
  
  currentTheme = themeId
  localStorage.setItem('theme_preference', themeId)
  applyTheme(themeId)
  notifyListeners(themeId)
}

/**
 * Apply theme to DOM
 */
export const applyTheme = (themeId) => {
  const theme = THEMES[themeId]
  if (!theme) return
  
  const root = document.documentElement
  
  // Apply theme colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
  
  // Apply theme class to body
  document.body.className = `theme-${themeId}`
  
  // Set data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', themeId)
  
  // Update meta theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.content = theme.colors.background
  }
  
  // Update favicon for dark/light mode (optional)
  updateFavicon(themeId)
}

/**
 * Toggle theme
 */
export const toggleTheme = () => {
  const current = getCurrentTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/**
 * Get current theme
 */
export const getCurrentTheme = () => {
  return currentTheme
}

/**
 * Get theme object
 */
export const getTheme = (themeId) => {
  return THEMES[themeId] || null
}

/**
 * Get all themes
 */
export const getAllThemes = () => {
  return Object.values(THEMES)
}

/**
 * Get theme colors
 */
export const getThemeColors = (themeId) => {
  const theme = getTheme(themeId || currentTheme)
  return theme ? theme.colors : null
}

/**
 * Get color by name
 */
export const getColor = (colorName, themeId) => {
  const colors = getThemeColors(themeId)
  return colors ? colors[colorName] : null
}

// ============================================
// THEME LISTENER SYSTEM
// ============================================

/**
 * Add theme change listener
 */
export const addThemeListener = (listener) => {
  if (typeof listener === 'function') {
    themeListeners.push(listener)
    // Immediately call with current theme
    listener(currentTheme)
  }
}

/**
 * Remove theme change listener
 */
export const removeThemeListener = (listener) => {
  themeListeners = themeListeners.filter(l => l !== listener)
}

/**
 * Notify all listeners of theme change
 */
const notifyListeners = (themeId) => {
  themeListeners.forEach(listener => {
    try {
      listener(themeId)
    } catch (error) {
      console.error('Theme listener error:', error)
    }
  })
}

/**
 * Clear all theme listeners
 */
export const clearThemeListeners = () => {
  themeListeners = []
}

// ============================================
// STYLING UTILITIES
// ============================================

/**
 * Generate dynamic CSS styles based on theme
 */
export const getDynamicStyles = (themeId) => {
  const theme = getTheme(themeId)
  if (!theme) return ''
  
  const { colors } = theme
  
  return `
    /* Dynamic Theme Styles */
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --success: ${colors.success};
      --warning: ${colors.warning};
      --danger: ${colors.danger};
      --info: ${colors.info};
      --background: ${colors.background};
      --surface: ${colors.surface};
      --text-primary: ${colors.text};
      --text-secondary: ${colors.textSecondary};
      --border-color: ${colors.border};
      --shadow-color: ${colors.shadow};
      --glass-bg: ${colors.glass};
      --glow-color: ${colors.glow};
    }
    
    /* Theme-specific overrides */
    .theme-${themeId} {
      --primary-gradient: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      --card-shadow: 0 8px 32px ${colors.shadow};
      --border-glow: 0 0 20px ${colors.glow};
    }
  `
}

/**
 * Get gradient style
 */
export const getGradientStyle = (direction = '135deg', color1, color2) => {
  const theme = getCurrentTheme()
  const colors = getThemeColors(theme)
  
  const c1 = color1 || colors.primary
  const c2 = color2 || colors.secondary
  
  return `linear-gradient(${direction}, ${c1}, ${c2})`
}

/**
 * Get glassmorphism style
 */
export const getGlassStyle = (opacity = 0.7, blur = 10) => {
  const theme = getCurrentTheme()
  const colors = getThemeColors(theme)
  
  return {
    background: `${colors.glass}`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 8px 32px ${colors.shadow}`
  }
}

/**
 * Get neon glow style
 */
export const getGlowStyle = (color, intensity = 0.3) => {
  const theme = getCurrentTheme()
  const colors = getThemeColors(theme)
  
  const glowColor = color || colors.primary
  return {
    boxShadow: `0 0 20px ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
    animation: 'glow 3s ease-in-out infinite'
  }
}

/**
 * Get shadow style
 */
export const getShadowStyle = (size = 'md') => {
  const sizes = {
    sm: '0 2px 8px',
    md: '0 8px 32px',
    lg: '0 16px 48px',
    xl: '0 24px 64px'
  }
  
  const theme = getCurrentTheme()
  const colors = getThemeColors(theme)
  
  return `${sizes[size] || sizes.md} ${colors.shadow}`
}

// ============================================
// RESPONSIVE STYLING
// ============================================

/**
 * Breakpoints
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

/**
 * Get media query string
 */
export const getMediaQuery = (breakpoint, minMax = 'min') => {
  const width = BREAKPOINTS[breakpoint]
  if (!width) return ''
  return `@media (${minMax}-width: ${width}px)`
}

/**
 * Get responsive style
 */
export const getResponsiveStyle = (styles) => {
  const result = {}
  
  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint === 'base') {
      Object.assign(result, style)
    } else {
      const query = getMediaQuery(breakpoint)
      result[query] = style
    }
  })
  
  return result
}

// ============================================
// CSS UTILITIES
// ============================================

/**
 * Convert object to CSS string
 */
export const objectToCSS = (obj) => {
  return Object.entries(obj)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value};`
    })
    .join(' ')
}

/**
 * Get CSS class names conditionally
 */
export const classNames = (...classes) => {
  return classes
    .filter(Boolean)
    .map(c => {
      if (typeof c === 'object') {
        return Object.entries(c)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(' ')
      }
      return c
    })
    .filter(Boolean)
    .join(' ')
}

// ============================================
// THEME PERSISTENCE
// ============================================

/**
 * Save theme to localStorage
 */
export const saveTheme = (themeId) => {
  try {
    localStorage.setItem('theme_preference', themeId)
  } catch (error) {
    console.error('Failed to save theme:', error)
  }
}

/**
 * Load theme from localStorage
 */
export const loadTheme = () => {
  try {
    return localStorage.getItem('theme_preference')
  } catch (error) {
    console.error('Failed to load theme:', error)
    return null
  }
}

/**
 * Clear saved theme preference
 */
export const clearThemePreference = () => {
  try {
    localStorage.removeItem('theme_preference')
  } catch (error) {
    console.error('Failed to clear theme preference:', error)
  }
}

// ============================================
// FAVICON MANAGEMENT
// ============================================

/**
 * Update favicon based on theme
 */
export const updateFavicon = (themeId) => {
  const favicon = document.querySelector('link[rel="icon"]')
  if (!favicon) return
  
  const isDark = themeId === 'dark' || themeId === 'futuristic'
  favicon.href = isDark 
    ? '/favicon-dark.svg' 
    : '/favicon-light.svg'
}

// ============================================
// THEME PREVIEW GENERATOR
// ============================================

/**
 * Generate theme preview CSS
 */
export const getThemePreview = (themeId) => {
  const theme = getTheme(themeId)
  if (!theme) return ''
  
  const { colors } = theme
  
  return `
    .theme-preview {
      background: ${colors.background};
      color: ${colors.text};
      padding: 20px;
      border-radius: 12px;
      border: 1px solid ${colors.border};
      box-shadow: 0 8px 32px ${colors.shadow};
    }
    
    .theme-preview .primary { color: ${colors.primary}; }
    .theme-preview .secondary { color: ${colors.secondary}; }
    .theme-preview .success { color: ${colors.success}; }
    .theme-preview .warning { color: ${colors.warning}; }
    .theme-preview .danger { color: ${colors.danger}; }
    
    .theme-preview .glass {
      background: ${colors.glass};
      backdrop-filter: blur(10px);
      border: 1px solid ${colors.border};
    }
  `
}

// ============================================
// THEME COMPATIBILITY
// ============================================

/**
 * Check if theme is compatible with current browser
 */
export const isThemeCompatible = () => {
  // Check if CSS custom properties are supported
  try {
    const test = document.createElement('div')
    test.style.setProperty('--test', 'test')
    return test.style.getPropertyValue('--test') === 'test'
  } catch {
    return false
  }
}

/**
 * Get fallback theme for older browsers
 */
export const getFallbackTheme = () => {
  return 'light'
}

// ============================================
// EXPORT THEME SYSTEM
// ============================================

export default {
  // Theme management
  initTheme,
  setTheme,
  toggleTheme,
  getCurrentTheme,
  getTheme,
  getAllThemes,
  getThemeColors,
  getColor,
  
  // Listeners
  addThemeListener,
  removeThemeListener,
  clearThemeListeners,
  
  // Styling utilities
  getDynamicStyles,
  getGradientStyle,
  getGlassStyle,
  getGlowStyle,
  getShadowStyle,
  
  // Responsive styling
  BREAKPOINTS,
  getMediaQuery,
  getResponsiveStyle,
  
  // CSS utilities
  objectToCSS,
  classNames,
  
  // Persistence
  saveTheme,
  loadTheme,
  clearThemePreference,
  
  // Advanced
  getThemePreview,
  isThemeCompatible,
  getFallbackTheme,
  updateFavicon
}