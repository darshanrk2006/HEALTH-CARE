import React, { useState, useRef, useEffect } from 'react'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'
import './BPMonitor.css'

const BPMonitor = () => {
  const webcamRef = useRef(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [bpReading, setBpReading] = useState(null)
  const [heartRate, setHeartRate] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [flashOn, setFlashOn] = useState(false)

  // Simulate BP analysis (In real implementation, use actual photoplethysmography)
  const analyzeBP = async (imageData) => {
    setIsAnalyzing(true)
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate realistic BP values
      const systolic = Math.floor(Math.random() * 40) + 100
      const diastolic = Math.floor(Math.random() * 30) + 60
      const heartRateVal = Math.floor(Math.random() * 30) + 60

      setBpReading({ systolic, diastolic })
      setHeartRate(heartRateVal)

      // Provide health insights
      let status = 'Normal'
      let color = '#10b981'
      let advice = 'Your blood pressure is in the normal range. Keep up your healthy lifestyle!'
      
      if (systolic > 140 || diastolic > 90) {
        status = 'High'
        color = '#ef4444'
        advice = 'Your blood pressure is elevated. Please consult a healthcare provider.'
      } else if (systolic < 90 || diastolic < 60) {
        status = 'Low'
        color = '#f59e0b'
        advice = 'Your blood pressure is low. Stay hydrated and consult a doctor if symptoms persist.'
      }

      toast.success(`BP Analysis Complete: ${systolic}/${diastolic} mmHg`)
      
      return { status, color, advice }
    } catch (error) {
      toast.error('Failed to analyze BP')
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        setIsCapturing(true)
        try {
          // Turn on flash if available
          if (flashOn) {
            // Simulate flash
            document.getElementById('flash-overlay')?.classList.add('flash-active')
            setTimeout(() => {
              document.getElementById('flash-overlay')?.classList.remove('flash-active')
            }, 300)
          }

          const result = await analyzeBP(imageSrc)
          setBpReading(prev => ({
            ...prev,
            ...result
          }))
        } catch (error) {
          console.error('Capture failed:', error)
        } finally {
          setIsCapturing(false)
        }
      }
    }
  }

  const startContinuousMonitoring = () => {
    // Simulate continuous monitoring
    toast.success('Starting continuous monitoring...')
    const interval = setInterval(() => {
      capture()
    }, 5000)
    return () => clearInterval(interval)
  }

  return (
    <div className="bp-container container">
      <div className="bp-header">
        <h1>🩸 Blood Pressure Monitor</h1>
        <p>Use your camera to monitor blood pressure and heart rate</p>
      </div>

      <div className="bp-content">
        <div className="bp-camera glass">
          <div className="camera-wrapper">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'user'
              }}
              className="webcam-feed"
            />
            <div id="flash-overlay" className="flash-overlay"></div>
          </div>

          <div className="camera-controls">
            <button 
              className="btn-futuristic"
              onClick={capture}
              disabled={isCapturing || isAnalyzing}
            >
              {isCapturing || isAnalyzing ? '⏳ Analyzing...' : '📸 Capture & Analyze'}
            </button>
            
            <button 
              className={`btn-futuristic ${flashOn ? 'active' : ''}`}
              onClick={() => setFlashOn(!flashOn)}
              style={{ background: flashOn ? '#f59e0b' : 'var(--bg-card)' }}
            >
              {flashOn ? '🔦 Flash ON' : '🔦 Flash OFF'}
            </button>

            <button 
              className="btn-futuristic"
              onClick={startContinuousMonitoring}
              style={{ background: '#10b981' }}
            >
              📊 Start Monitoring
            </button>
          </div>
        </div>

        {bpReading && (
          <div className="bp-results glass">
            <h2>📊 Results</h2>
            
            <div className="bp-values">
              <div className="bp-value">
                <h3>Systolic</h3>
                <p className="value" style={{ color: bpReading.color }}>
                  {bpReading.systolic} mmHg
                </p>
              </div>
              <div className="bp-value">
                <h3>Diastolic</h3>
                <p className="value" style={{ color: bpReading.color }}>
                  {bpReading.diastolic} mmHg
                </p>
              </div>
              <div className="bp-value">
                <h3>Heart Rate</h3>
                <p className="value" style={{ color: '#8b5cf6' }}>
                  {heartRate} BPM
                </p>
              </div>
            </div>

            <div className="bp-status">
              <h3>Status: <span style={{ color: bpReading.color }}>{bpReading.status}</span></h3>
              <p>{bpReading.advice}</p>
            </div>

            <div className="bp-chart">
              <h3>📈 Blood Pressure Trend</h3>
              <div className="bp-trend">
                {/* Simple visual bar chart */}
                <div className="bp-bar">
                  <div 
                    className="bp-bar-fill systolic"
                    style={{ 
                      width: `${(bpReading.systolic / 200) * 100}%`,
                      background: 'linear-gradient(90deg, #00d4ff, #7c3aed)'
                    }}
                  >
                    {bpReading.systolic}
                  </div>
                </div>
                <div className="bp-bar">
                  <div 
                    className="bp-bar-fill diastolic"
                    style={{ 
                      width: `${(bpReading.diastolic / 130) * 100}%`,
                      background: 'linear-gradient(90deg, #8b5cf6, #ef4444)'
                    }}
                  >
                    {bpReading.diastolic}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BPMonitor