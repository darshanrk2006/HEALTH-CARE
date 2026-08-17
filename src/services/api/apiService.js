import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * API Service - Centralized API handling for all external services
 * Manages health data APIs, OCR, external health resources, and more
 */
class APIService {
  constructor() {
    // Base URLs for different services
    this.baseURLs = {
      healthData: 'https://healthdata.gov/api',
      openFDA: 'https://api.fda.gov',
      who: 'https://api.who.int',
      maps: 'https://maps.googleapis.com/maps/api',
      weather: 'https://api.openweathermap.org/data/2.5',
      news: 'https://newsapi.org/v2',
      translate: 'https://translation.googleapis.com/language/translate/v2'
    }

    // API Keys from environment
    this.apiKeys = {
      googleMaps: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      weather: import.meta.env.VITE_WEATHER_API_KEY,
      news: import.meta.env.VITE_NEWS_API_KEY,
      translate: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY,
      openFDA: import.meta.env.VITE_OPENFDA_API_KEY,
      healthData: import.meta.env.VITE_HEALTHDATA_API_KEY
    }

    // Axios instances with interceptors
    this.healthDataClient = this.createClient('healthData')
    this.fdaClient = this.createClient('openFDA')
    this.whoClient = this.createClient('who')
    this.mapsClient = this.createClient('maps')
    this.weatherClient = this.createClient('weather')
    this.newsClient = this.createClient('news')
    this.translateClient = this.createClient('translate')

    // Cache for API responses
    this.cache = new Map()
    this.cacheTTL = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Create axios client with interceptors
   */
  createClient(service) {
    const client = axios.create({
      baseURL: this.baseURLs[service],
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Request interceptor
    client.interceptors.request.use(
      (config) => {
        // Add API key to requests
        if (this.apiKeys[service]) {
          config.params = {
            ...config.params,
            key: this.apiKeys[service]
          }
        }
        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )

    return client
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    let message = 'An error occurred. Please try again.'
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = 'Bad request. Please check your input.'
          break
        case 401:
          message = 'Unauthorized. Please check your API key.'
          break
        case 403:
          message = 'Access forbidden. Please check your permissions.'
          break
        case 404:
          message = 'Resource not found.'
          break
        case 429:
          message = 'Too many requests. Please try again later.'
          break
        case 500:
        case 502:
        case 503:
          message = 'Server error. Please try again later.'
          break
        default:
          message = error.response.data?.message || message
      }
    } else if (error.request) {
      message = 'No response from server. Please check your connection.'
    }

    console.error('API Error:', error)
    toast.error(message)
  }

  /**
   * Get cached data or fetch from API
   */
  async getCachedOrFetch(cacheKey, fetchFn) {
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    const data = await fetchFn()
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
    return data
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * ============================================
   * HEALTH DATA API SERVICES
   * ============================================
   */

  /**
   * Fetch disease statistics
   */
  async getDiseaseStats(disease, region = 'global') {
    try {
      const cacheKey = `disease_stats_${disease}_${region}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.healthDataClient.get('/disease/stats', {
          params: { disease, region }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch disease stats:', error)
      return this.getMockDiseaseStats(disease)
    }
  }

  /**
   * Get hospital availability
   */
  async getHospitalAvailability(lat, lng, radius = 50) {
    try {
      const cacheKey = `hospital_availability_${lat}_${lng}_${radius}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.healthDataClient.get('/hospitals/availability', {
          params: { lat, lng, radius }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch hospital availability:', error)
      return this.getMockHospitalData(lat, lng)
    }
  }

  /**
   * Get bed availability in hospitals
   */
  async getBedAvailability(hospitalId) {
    try {
      const cacheKey = `bed_availability_${hospitalId}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.healthDataClient.get(`/hospitals/${hospitalId}/beds`)
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch bed availability:', error)
      return this.getMockBedData()
    }
  }

  /**
   * ============================================
   * FDA API SERVICES
   * ============================================
   */

  /**
   * Search drug information
   */
  async searchDrugs(query) {
    try {
      const cacheKey = `drug_search_${query}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.fdaClient.get('/drug/label.json', {
          params: {
            search: `openfda.brand_name:"${query}" OR openfda.generic_name:"${query}"`,
            limit: 10
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to search drugs:', error)
      return this.getMockDrugData(query)
    }
  }

  /**
   * Get drug recalls
   */
  async getDrugRecalls(drugName) {
    try {
      const cacheKey = `drug_recalls_${drugName}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.fdaClient.get('/drug/enforcement.json', {
          params: {
            search: `openfda.brand_name:"${drugName}"`,
            limit: 5
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch drug recalls:', error)
      return { results: [] }
    }
  }

  /**
   * Get adverse events for drug
   */
  async getDrugSideEffects(drugName) {
    try {
      const cacheKey = `drug_side_effects_${drugName}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.fdaClient.get('/drug/event.json', {
          params: {
            search: `patient.drug.medicinalproduct:"${drugName}"`,
            limit: 10
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch side effects:', error)
      return this.getMockSideEffects(drugName)
    }
  }

  /**
   * ============================================
   * WHO API SERVICES
   * ============================================
   */

  /**
   * Get WHO health guidelines
   */
  async getWHOGuidelines(topic) {
    try {
      const cacheKey = `who_guidelines_${topic}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.whoClient.get('/guidelines', {
          params: { topic }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch WHO guidelines:', error)
      return this.getMockGuidelines(topic)
    }
  }

  /**
   * Get global health statistics
   */
  async getGlobalHealthStats() {
    try {
      const cacheKey = 'global_health_stats'
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.whoClient.get('/statistics/global')
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch global health stats:', error)
      return this.getMockGlobalStats()
    }
  }

  /**
   * Get disease outbreak alerts
   */
  async getOutbreakAlerts(region) {
    try {
      const cacheKey = `outbreak_alerts_${region}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.whoClient.get('/outbreaks', {
          params: { region }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch outbreak alerts:', error)
      return this.getMockOutbreakAlerts(region)
    }
  }

  /**
   * ============================================
   * MAPS API SERVICES
   * ============================================
   */

  /**
   * Find nearby hospitals
   */
  async findNearbyHospitals(lat, lng, radius = 5000) {
    try {
      const cacheKey = `nearby_hospitals_${lat}_${lng}_${radius}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.mapsClient.get('/place/nearbysearch/json', {
          params: {
            location: `${lat},${lng}`,
            radius,
            type: 'hospital'
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to find nearby hospitals:', error)
      return this.getMockNearbyPlaces(lat, lng)
    }
  }

  /**
   * Find nearby pharmacies
   */
  async findNearbyPharmacies(lat, lng, radius = 5000) {
    try {
      const cacheKey = `nearby_pharmacies_${lat}_${lng}_${radius}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.mapsClient.get('/place/nearbysearch/json', {
          params: {
            location: `${lat},${lng}`,
            radius,
            type: 'pharmacy'
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to find nearby pharmacies:', error)
      return this.getMockNearbyPlaces(lat, lng, 'pharmacy')
    }
  }

  /**
   * Get place details
   */
  async getPlaceDetails(placeId) {
    try {
      const cacheKey = `place_details_${placeId}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.mapsClient.get('/place/details/json', {
          params: { place_id: placeId }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to get place details:', error)
      return null
    }
  }

  /**
   * ============================================
   * WEATHER API SERVICES
   * ============================================
   */

  /**
   * Get weather for health monitoring
   */
  async getWeatherData(lat, lng) {
    try {
      const cacheKey = `weather_${lat}_${lng}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.weatherClient.get('/weather', {
          params: {
            lat,
            lon: lng,
            units: 'metric'
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
      return this.getMockWeatherData()
    }
  }

  /**
   * Get air quality data
   */
  async getAirQuality(lat, lng) {
    try {
      const cacheKey = `air_quality_${lat}_${lng}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.weatherClient.get('/air_pollution', {
          params: {
            lat,
            lon: lng
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch air quality:', error)
      return this.getMockAirQuality()
    }
  }

  /**
   * ============================================
   * NEWS API SERVICES
   * ============================================
   */

  /**
   * Get health news
   */
  async getHealthNews(category = 'health') {
    try {
      const cacheKey = `health_news_${category}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.newsClient.get('/everything', {
          params: {
            q: category,
            language: 'en',
            pageSize: 20,
            sortBy: 'publishedAt'
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch health news:', error)
      return this.getMockHealthNews()
    }
  }

  /**
   * Get medical research updates
   */
  async getMedicalResearch(keyword) {
    try {
      const cacheKey = `medical_research_${keyword}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.newsClient.get('/everything', {
          params: {
            q: `medicine OR medical OR research ${keyword}`,
            language: 'en',
            pageSize: 10
          }
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to fetch medical research:', error)
      return this.getMockResearchData()
    }
  }

  /**
   * ============================================
   * TRANSLATION API SERVICES
   * ============================================
   */

  /**
   * Translate medical content
   */
  async translateMedicalContent(text, targetLanguage) {
    try {
      const cacheKey = `translate_${text.substring(0, 50)}_${targetLanguage}`
      return await this.getCachedOrFetch(cacheKey, async () => {
        const response = await this.translateClient.post('', {
          q: text,
          target: targetLanguage,
          format: 'text'
        })
        return response.data
      })
    } catch (error) {
      console.error('Failed to translate content:', error)
      return { data: { translations: [{ translatedText: text }] } }
    }
  }

  /**
   * ============================================
   * MOCK DATA SERVICES (for development/fallback)
   * ============================================
   */

  /**
   * Mock disease statistics
   */
  getMockDiseaseStats(disease) {
    return {
      disease,
      totalCases: Math.floor(Math.random() * 1000000),
      activeCases: Math.floor(Math.random() * 100000),
      recovered: Math.floor(Math.random() * 500000),
      deaths: Math.floor(Math.random() * 10000),
      trends: {
        daily: [100, 200, 150, 300, 250, 200, 180],
        weekly: 1200,
        monthly: 5000
      }
    }
  }

  /**
   * Mock hospital data
   */
  getMockHospitalData(lat, lng) {
    return {
      hospitals: [
        {
          name: 'City General Hospital',
          distance: '2.5 km',
          beds: 500,
          available: 45,
          emergency: true,
          specialty: 'General',
          rating: 4.5
        },
        {
          name: 'Memorial Medical Center',
          distance: '5.1 km',
          beds: 300,
          available: 20,
          emergency: true,
          specialty: 'Cardiology',
          rating: 4.8
        },
        {
          name: 'Community Health Clinic',
          distance: '3.8 km',
          beds: 100,
          available: 15,
          emergency: false,
          specialty: 'Family Medicine',
          rating: 4.2
        }
      ]
    }
  }

  /**
   * Mock bed data
   */
  getMockBedData() {
    return {
      total: 500,
      occupied: 455,
      available: 45,
      icu: { total: 50, available: 5 },
      emergency: { total: 30, available: 8 },
      ward: { total: 300, available: 25 },
      private: { total: 120, available: 7 }
    }
  }

  /**
   * Mock drug data
   */
  getMockDrugData(query) {
    return {
      results: [
        {
          openfda: {
            brand_name: [query],
            generic_name: [`Generic ${query}`],
            manufacturer_name: ['Pharma Inc.']
          },
          purpose: ['Treatment of condition'],
          warnings: ['Consult doctor before use'],
          dosage: ['Take as prescribed']
        }
      ]
    }
  }

  /**
   * Mock side effects
   */
  getMockSideEffects(drugName) {
    return {
      results: [
        {
          patient: {
            drug: [{ medicinalproduct: drugName }],
            reaction: [
              {
                reactionmeddrapt: 'Headache',
                severity: 'Mild'
              },
              {
                reactionmeddrapt: 'Nausea',
                severity: 'Moderate'
              }
            ]
          }
        }
      ]
    }
  }

  /**
   * Mock health guidelines
   */
  getMockGuidelines(topic) {
    return {
      topic,
      guidelines: [
        {
          title: `Guideline for ${topic}`,
          description: `Comprehensive guideline for managing ${topic}`,
          recommendations: [
            'Consult healthcare professional',
            'Regular monitoring',
            'Healthy lifestyle'
          ]
        }
      ]
    }
  }

  /**
   * Mock global health statistics
   */
  getMockGlobalStats() {
    return {
      population: 8000000000,
      lifeExpectancy: 72.6,
      infantMortality: 28.5,
      leadingCauses: ['Heart Disease', 'Cancer', 'Stroke'],
      healthcareSpending: 8.6,
      diseaseBurden: {
        infectious: 25,
        nonCommunicable: 65,
        injuries: 10
      }
    }
  }

  /**
   * Mock outbreak alerts
   */
  getMockOutbreakAlerts(region) {
    return {
      region,
      alerts: [
        {
          disease: 'Influenza',
          severity: 'Moderate',
          cases: 150,
          region: 'Northern',
          date: new Date().toISOString()
        },
        {
          disease: 'COVID-19',
          severity: 'Low',
          cases: 30,
          region: 'Central',
          date: new Date().toISOString()
        }
      ]
    }
  }

  /**
   * Mock nearby places
   */
  getMockNearbyPlaces(lat, lng, type = 'hospital') {
    return {
      results: [
        {
          name: `Nearby ${type}`,
          vicinity: '123 Main Street',
          rating: 4.5,
          user_ratings_total: 100,
          geometry: {
            location: { lat: lat + 0.01, lng: lng + 0.01 }
          },
          opening_hours: { open_now: true }
        },
        {
          name: `Second ${type}`,
          vicinity: '456 Oak Avenue',
          rating: 4.2,
          user_ratings_total: 75,
          geometry: {
            location: { lat: lat - 0.01, lng: lng - 0.01 }
          }
        }
      ]
    }
  }

  /**
   * Mock weather data
   */
  getMockWeatherData() {
    return {
      main: {
        temp: 22,
        feels_like: 21,
        humidity: 65,
        pressure: 1015
      },
      weather: [
        {
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      wind: {
        speed: 5.2,
        deg: 180
      }
    }
  }

  /**
   * Mock air quality
   */
  getMockAirQuality() {
    return {
      list: [
        {
          main: { aqi: 2 },
          components: {
            co: 234,
            no: 0.5,
            no2: 2.5,
            o3: 35,
            so2: 1.2,
            pm2_5: 8.5,
            pm10: 15.2,
            nh3: 2.8
          }
        }
      ]
    }
  }

  /**
   * Mock health news
   */
  getMockHealthNews() {
    return {
      articles: [
        {
          title: 'Breakthrough in Cancer Research',
          description: 'New treatment shows promising results in clinical trials',
          url: '#',
          urlToImage: 'https://via.placeholder.com/300x200',
          publishedAt: new Date().toISOString(),
          source: { name: 'Health News Daily' }
        },
        {
          title: 'WHO Updates Vaccination Guidelines',
          description: 'New recommendations for booster shots',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'Medical Times' }
        }
      ]
    }
  }

  /**
   * Mock research data
   */
  getMockResearchData() {
    return {
      articles: [
        {
          title: 'Recent Advances in Medical Research',
          description: 'Scientists discover new treatment approach',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'Medical Research Journal' }
        }
      ]
    }
  }

  /**
   * ============================================
   * UTILITY METHODS
   * ============================================
   */

  /**
   * Get API status
   */
  getAPIStatus() {
    return {
      healthData: !!this.healthDataClient,
      fda: !!this.fdaClient,
      who: !!this.whoClient,
      maps: !!this.mapsClient,
      weather: !!this.weatherClient,
      news: !!this.newsClient,
      translate: !!this.translateClient,
      cacheSize: this.cache.size
    }
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl) {
    this.cacheTTL = ttl
  }

  /**
   * Batch API requests
   */
  async batchRequests(requests) {
    try {
      const results = await Promise.allSettled(
        requests.map(req => this[req.method](...req.params))
      )
      return results.map((result, index) => ({
        id: requests[index].id,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }))
    } catch (error) {
      console.error('Batch request failed:', error)
      throw error
    }
  }

  /**
   * Validate API configuration
   */
  validateConfig() {
    const missingKeys = []
    const services = ['googleMaps', 'weather', 'news', 'translate', 'openFDA', 'healthData']
    
    for (const service of services) {
      if (!this.apiKeys[service]) {
        missingKeys.push(service)
      }
    }

    return {
      valid: missingKeys.length === 0,
      missingKeys,
      configuredServices: Object.keys(this.apiKeys).filter(key => this.apiKeys[key])
    }
  }
}

// Create singleton instance
const apiService = new APIService()

// Export for use in components
export default apiService

// Export specific methods for easier imports
export const {
  getDiseaseStats,
  getHospitalAvailability,
  getBedAvailability,
  searchDrugs,
  getDrugRecalls,
  getDrugSideEffects,
  getWHOGuidelines,
  getGlobalHealthStats,
  getOutbreakAlerts,
  findNearbyHospitals,
  findNearbyPharmacies,
  getPlaceDetails,
  getWeatherData,
  getAirQuality,
  getHealthNews,
  getMedicalResearch,
  translateMedicalContent,
  getAPIStatus,
  batchRequests
} = apiService