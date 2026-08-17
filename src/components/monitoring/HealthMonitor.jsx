import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const HealthMonitor = () => {
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: 72,
    sleep: 0,
    water: 0
  })
  const [history, setHistory] = useState([])

  // Simulate wearable data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        steps: Math.floor(Math.random() * 1000) + 500,
        heartRate: Math.floor(Math.random() * 30) + 60,
        sleep: Math.random() * 8 + 4,
        water: Math.random() * 2 + 1,
        timestamp: new Date().toLocaleTimeString()
      }
      
      setHealthData(prev => ({
        steps: prev.steps + newData.steps,
        heartRate: newData.heartRate,
        sleep: newData.sleep,
        water: newData.water
      }))

      setHistory(prev => [...prev, newData].slice(-20))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const chartData = {
    labels: history.map(d => d.timestamp),
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: history.map(d => d.heartRate),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4
      },
      {
        label: 'Steps',
        data: history.map(d => d.steps),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
        yAxisID: 'steps'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--border-color)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      },
      steps: {
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      }
    }
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        📊 Health Monitor
      </h1>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '30px' }}>
        <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>👣 Steps</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{healthData.steps.toLocaleString()}</p>
        </div>
        <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>❤️ Heart Rate</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{healthData.heartRate} BPM</p>
        </div>
        <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>😴 Sleep</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{healthData.sleep.toFixed(1)} hrs</p>
        </div>
        <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>💧 Water</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00d4ff' }}>{healthData.water.toFixed(1)} L</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '30px' }}>
        <h3>📈 Health Trends</h3>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}

export default HealthMonitor