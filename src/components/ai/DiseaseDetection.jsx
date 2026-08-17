import React, { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import toast from 'react-hot-toast'

const DiseaseDetection = () => {
  const [symptoms, setSymptoms] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea',
    'Dizziness', 'Sore Throat', 'Shortness of Breath',
    'Chest Pain', 'Joint Pain', 'Muscle Aches', 'Skin Rash'
  ]

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.error('Please select at least one symptom')
      return
    }

    setLoading(true)
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const prompt = `
        Based on the following symptoms: ${symptoms.join(', ')}
        
        Please provide:
        1. Possible health conditions (with probability percentages)
        2. Severity level (Low/Medium/High)
        3. Recommended actions
        4. When to see a doctor
        5. Preventive measures
        
        Format with clear sections and emojis.
      `

      const result = await model.generateContent(prompt)
      setResult(result.response.text())
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🦠 Disease Detection
      </h1>

      <div className="glass" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3>Select Your Symptoms</h3>
        <div className="symptom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', margin: '20px 0' }}>
          {commonSymptoms.map(symptom => (
            <button
              key={symptom}
              onClick={() => {
                if (symptoms.includes(symptom)) {
                  setSymptoms(symptoms.filter(s => s !== symptom))
                } else {
                  setSymptoms([...symptoms, symptom])
                }
              }}
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: symptoms.includes(symptom) ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: symptoms.includes(symptom) ? 'var(--accent-primary)' : 'transparent',
                color: symptoms.includes(symptom) ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {symptom}
            </button>
          ))}
        </div>
        <button 
          className="btn-futuristic"
          onClick={analyzeSymptoms}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : '🔍 Analyze Symptoms'}
        </button>
      </div>

      {result && (
        <div className="glass" style={{ padding: '30px' }}>
          <h3>📊 Analysis Results</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}

export default DiseaseDetection