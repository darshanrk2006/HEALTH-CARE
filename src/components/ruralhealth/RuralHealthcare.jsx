import React, { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import toast from 'react-hot-toast'

const RuralHealthcare = () => {
  const [symptoms, setSymptoms] = useState('')
  const [location, setLocation] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const getHealthcareAccess = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe symptoms or health concerns')
      return
    }

    setLoading(true)
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const prompt = `
        Rural healthcare consultation for:
        Location: ${location || 'Rural area'}
        Symptoms/Concerns: ${symptoms}
        
        Please provide:
        1. Initial assessment of the condition
        2. Home remedies that can be tried
        3. When to seek immediate medical attention
        4. Nearby healthcare facility suggestions (government/private)
        5. Telemedicine consultation options
        6. Preventive healthcare tips
        
        Format with clear sections and emojis.
        Be practical and consider limited healthcare access.
      `

      const result = await model.generateContent(prompt)
      setResult(result.response.text())
      toast.success('Healthcare guidance generated!')
    } catch (error) {
      toast.error('Failed to generate guidance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🏥 Rural Healthcare Access
      </h1>

      <div className="glass" style={{ padding: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>Your Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your village/town name..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '15px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              marginTop: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Describe your symptoms or health concerns</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms, duration, severity..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '15px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              minHeight: '120px',
              marginTop: '5px',
              resize: 'vertical'
            }}
          />
        </div>

        <button 
          className="btn-futuristic"
          onClick={getHealthcareAccess}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
        >
          {loading ? 'Processing...' : '🌿 Get Healthcare Guidance'}
        </button>
      </div>

      {result && (
        <div className="glass" style={{ padding: '30px', marginTop: '30px' }}>
          <h3>📋 Healthcare Guidance</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}

export default RuralHealthcare