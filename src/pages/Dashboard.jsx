// src/pages/Dashboard.jsx
import React from 'react';

function Dashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a1a', 
      color: '#ffffff',
      padding: '40px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome to your Dashboard
      </h1>
      <p style={{ color: '#8088a0', marginTop: '1rem', fontSize: '1.2rem' }}>
        Your HealthAI system is now running!
      </p>
    </div>
  );
}

export default Dashboard;