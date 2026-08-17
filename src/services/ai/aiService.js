import { GoogleGenerativeAI } from '@google/generative-ai'
import { OpenAI } from 'openai'
import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * AI Service - Handles all AI interactions for the health management platform
 * Supports multiple AI providers: Gemini, OpenAI, and Hugging Face
 */
class AIService {
  constructor() {
    // Initialize AI clients
    this.geminiAI = null
    this.openAI = null
    this.huggingFaceAPI = null
    
    // API Keys from environment
    this.GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    this.OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
    this.HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY
    
    // Initialize services
    this.initializeServices()
  }

  /**
   * Initialize AI services with API keys
   */
  initializeServices() {
    try {
      if (this.GEMINI_API_KEY) {
        this.geminiAI = new GoogleGenerativeAI(this.GEMINI_API_KEY)
        console.log('✅ Gemini AI initialized')
      }
      
      if (this.OPENAI_API_KEY) {
        this.openAI = new OpenAI({
          apiKey: this.OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        })
        console.log('✅ OpenAI initialized')
      }
      
      if (this.HUGGINGFACE_API_KEY) {
        this.huggingFaceAPI = this.HUGGINGFACE_API_KEY
        console.log('✅ Hugging Face initialized')
      }
    } catch (error) {
      console.error('Failed to initialize AI services:', error)
    }
  }

  /**
   * Get primary AI model (Gemini) or fallback
   */
  getPrimaryModel() {
    if (this.geminiAI) {
      return this.geminiAI.getGenerativeModel({ model: 'gemini-pro' })
    }
    return null
  }

  /**
   * Generate content using Gemini AI
   */
  async generateWithGemini(prompt, options = {}) {
    try {
      const model = this.getPrimaryModel()
      if (!model) {
        throw new Error('Gemini AI not initialized')
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2048,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })

      return result.response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error(`Gemini AI error: ${error.message}`)
    }
  }

  /**
   * Generate content using OpenAI
   */
  async generateWithOpenAI(prompt, options = {}) {
    try {
      if (!this.openAI) {
        throw new Error('OpenAI not initialized')
      }

      const completion = await this.openAI.chat.completions.create({
        model: options.model || 'gpt-4',
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful medical AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 0.95,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
      })

      return completion.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI error: ${error.message}`)
    }
  }

  /**
   * Generate using Hugging Face models
   */
  async generateWithHuggingFace(prompt, model = 'google/flan-t5-base') {
    try {
      if (!this.huggingFaceAPI) {
        throw new Error('Hugging Face API key not set')
      }

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceAPI}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data[0]?.generated_text || response.data
    } catch (error) {
      console.error('Hugging Face API error:', error)
      throw new Error(`Hugging Face error: ${error.message}`)
    }
  }

  /**
   * Smart AI generation with fallback
   */
  async generateContent(prompt, options = {}) {
    try {
      // Try Gemini first (primary)
      if (this.geminiAI) {
        return await this.generateWithGemini(prompt, options)
      }
      
      // Fallback to OpenAI
      if (this.openAI) {
        return await this.generateWithOpenAI(prompt, options)
      }
      
      // Fallback to Hugging Face
      if (this.huggingFaceAPI) {
        return await this.generateWithHuggingFace(prompt, options.huggingFaceModel)
      }
      
      throw new Error('No AI service available')
    } catch (error) {
      console.error('All AI services failed:', error)
      throw error
    }
  }

  /**
   * Analyze medical report
   */
  async analyzeMedicalReport(reportText, reportType = 'general') {
    const prompt = `
      You are a medical AI assistant. Analyze the following ${reportType} report:
      
      ${reportText}
      
      Provide a comprehensive analysis with:
      1. Summary of key findings
      2. Abnormal values and their implications
      3. Normal ranges comparison
      4. Recommendations
      5. Plain language explanation
      
      Format with clear sections and emojis.
    `

    return await this.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 2500
    })
  }

  /**
   * Analyze prescription
   */
  async analyzePrescription(prescriptionText) {
    const prompt = `
      You are a pharmacy AI assistant. Analyze this prescription:
      
      ${prescriptionText}
      
      Provide:
      1. List of medications with dosages
      2. Purpose of each medication
      3. Potential side effects
      4. Drug interactions
      5. Important precautions
      6. Simplified medication schedule
      
      Include clear warnings and disclaimers.
    `

    return await this.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 2000
    })
  }

  /**
   * Symptom checker and disease detection
   */
  async checkSymptoms(symptoms, additionalInfo = '') {
    const prompt = `
      You are a medical AI for symptom analysis. Patient symptoms: ${symptoms.join(', ')}
      Additional context: ${additionalInfo}
      
      Provide:
      1. Possible conditions with probability estimates
      2. Severity assessment
      3. Recommended actions
      4. Warning signs to watch for
      5. When to seek emergency care
      
      Be thorough but clear. Include disclaimer.
    `

    return await this.generateContent(prompt, {
      temperature: 0.5,
      maxTokens: 2000
    })
  }

  /**
   * Mental health support
   */
  async getMentalHealthSupport(userMessage, mood = 'neutral') {
    const prompt = `
      You are a compassionate mental health AI assistant.
      
      User's mood: ${mood}
      User's message: ${userMessage}
      
      Provide:
      1. Empathetic listening response
      2. Coping strategies
      3. Positive affirmations
      4. Resources for professional help
      5. Crisis hotline information
      
      Be warm, supportive, and encouraging.
      Include mental health disclaimer.
    `

    return await this.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 1500
    })
  }

  /**
   * Rural healthcare guidance
   */
  async getRuralHealthcareGuidance(symptoms, location = 'rural area') {
    const prompt = `
      You are a rural healthcare AI assistant.
      
      Location: ${location}
      Symptoms/Concerns: ${symptoms}
      
      Provide practical healthcare guidance considering limited resources:
      1. Initial assessment
      2. Home remedies
      3. When to seek immediate care
      4. Nearest healthcare options
      5. Telemedicine alternatives
      6. Preventive measures
      
      Be practical and culturally sensitive.
    `

    return await this.generateContent(prompt, {
      temperature: 0.5,
      maxTokens: 2000
    })
  }

  /**
   * Generate health insights from wearable data
   */
  async generateHealthInsights(vitalData) {
    const prompt = `
      You are a health monitoring AI. Analyze these vital signs:
      
      ${JSON.stringify(vitalData, null, 2)}
      
      Provide:
      1. Overall health assessment
      2. Trends and patterns
      3. Areas of concern
      4. Positive achievements
      5. Personalized recommendations
      
      Be encouraging and actionable.
    `

    return await this.generateContent(prompt, {
      temperature: 0.4,
      maxTokens: 1500
    })
  }

  /**
   * Hospital coordination assistance
   */
  async getHospitalCoordination(patientInfo, bedAvailability) {
    const prompt = `
      You are a hospital coordination AI assistant.
      
      Patient Information: ${JSON.stringify(patientInfo)}
      Bed Availability: ${bedAvailability}
      
      Provide:
      1. Bed allocation recommendation
      2. Staff requirements
      3. Priority assessment
      4. Resource allocation
      5. Emergency protocols
      
      Be practical and efficient.
    `

    return await this.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 1500
    })
  }

  /**
   * Disease outbreak detection
   */
  async detectDiseaseOutbreak(symptomPatterns, region) {
    const prompt = `
      You are a disease surveillance AI.
      
      Region: ${region}
      Symptom Patterns: ${JSON.stringify(symptomPatterns)}
      
      Analyze for:
      1. Potential outbreak indicators
      2. Disease patterns
      3. Risk assessment
      4. Alert level
      5. Recommended actions
      6. Public health measures
      
      Be specific and actionable.
    `

    return await this.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 1500
    })
  }

  /**
   * Generate health education content
   */
  async generateHealthEducation(topic, targetAudience = 'general') {
    const prompt = `
      Create health education content about: ${topic}
      Target audience: ${targetAudience}
      
      Include:
      1. Clear explanation
      2. Key facts
      3. Common myths
      4. Prevention tips
      5. When to seek help
      6. Resources
      
      Make it engaging and easy to understand.
    `

    return await this.generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 2000
    })
  }

  /**
   * Medical translation (medical terms to plain language)
   */
  async translateMedicalTerms(medicalText) {
    const prompt = `
      Translate the following medical text into simple, easy-to-understand language:
      
      ${medicalText}
      
      Provide:
      1. Plain language translation
      2. Simple analogies
      3. Key takeaways
      4. Actionable insights
      
      Make it accessible to non-medical readers.
    `

    return await this.generateContent(prompt, {
      temperature: 0.4,
      maxTokens: 1500
    })
  }

  /**
   * Generate health recommendations
   */
  async getHealthRecommendations(healthData) {
    const prompt = `
      Based on the following health data, provide personalized recommendations:
      
      ${JSON.stringify(healthData, null, 2)}
      
      Include:
      1. Dietary recommendations
      2. Exercise suggestions
      3. Lifestyle changes
      4. Sleep improvements
      5. Stress management
      6. Follow-up actions
      
      Be specific, practical, and achievable.
    `

    return await this.generateContent(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    })
  }

  /**
   * Chatbot response with context
   */
  async getChatbotResponse(userMessage, conversationHistory = []) {
    const history = conversationHistory.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n')

    const prompt = `
      You are a friendly health AI assistant.
      
      Conversation History:
      ${history || 'No previous conversation'}
      
      User: ${userMessage}
      
      Provide a helpful, accurate, and safe response.
      Include relevant health information.
      Recommend professional consultation when appropriate.
    `

    return await this.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 1000
    })
  }

  /**
   * Batch processing for multiple queries
   */
  async batchProcess(queries) {
    const results = []
    for (const query of queries) {
      try {
        const result = await this.generateContent(query.prompt, query.options)
        results.push({
          id: query.id,
          success: true,
          result
        })
      } catch (error) {
        results.push({
          id: query.id,
          success: false,
          error: error.message
        })
      }
    }
    return results
  }

  /**
   * Get AI model information
   */
  getModelInfo() {
    return {
      gemini: this.geminiAI ? 'Available' : 'Not available',
      openai: this.openAI ? 'Available' : 'Not available',
      huggingface: this.huggingFaceAPI ? 'Available' : 'Not available',
      primary: this.geminiAI ? 'Gemini' : (this.openAI ? 'OpenAI' : 'None')
    }
  }

  /**
   * Validate API keys
   */
  validateAPIKeys() {
    return {
      gemini: !!this.GEMINI_API_KEY,
      openai: !!this.OPENAI_API_KEY,
      huggingface: !!this.HUGGINGFACE_API_KEY
    }
  }
}

// Create singleton instance
const aiService = new AIService()

// Export for use in components
export default aiService

// Export individual functions for specific use cases
export const {
  analyzeMedicalReport,
  analyzePrescription,
  checkSymptoms,
  getMentalHealthSupport,
  getRuralHealthcareGuidance,
  generateHealthInsights,
  getHospitalCoordination,
  detectDiseaseOutbreak,
  generateHealthEducation,
  translateMedicalTerms,
  getHealthRecommendations,
  getChatbotResponse
} = aiService

// Export class for testing
export { AIService }