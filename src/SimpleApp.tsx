import React, { useState } from 'react';

const SimpleApp = () => {
  const [message, setMessage] = useState('Hello Lao OCR!');
  
  console.log('🚀 SimpleApp is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            color: '#1e40af',
            marginBottom: '0.5rem'
          }}>
            🎨 Lao Font Craft
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#64748b',
            marginBottom: '0.5rem'
          }}>
            ເຄື່ອງມືສ້າງ Dataset OCR ພາສາລາວ
          </p>
          <p style={{ color: '#94a3b8' }}>
            Professional Lao OCR Dataset Generator
          </p>
        </header>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Status</h2>
          <p style={{ color: '#059669', fontWeight: 'bold' }}>✅ Application loaded successfully</p>
          <p style={{ color: '#6b7280' }}>Ready to upload fonts and generate dataset</p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Test Controls</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setMessage('ສະບາຍດີ! Lao text works!')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Test Lao Text
            </button>
            <button 
              onClick={() => setMessage('Font upload ready!')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Test Font Upload
            </button>
            <button 
              onClick={() => setMessage('Dataset generation ready!')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Test Generation
            </button>
          </div>
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f1f5f9',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <strong>Message: </strong>{message}
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          <p>If you can see this, React is working correctly!</p>
          <p>Next step: Load the full application</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;