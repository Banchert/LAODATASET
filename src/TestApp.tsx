import React from 'react';

const TestApp = () => {
  console.log('🧪 TestApp is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>🧪 Test App Working!</h1>
        <p style={{ color: '#666' }}>React is rendering correctly</p>
        <p style={{ color: '#666', fontSize: '14px' }}>ລາວ ພາສາ ທົດສອບ</p>
        <button 
          onClick={() => alert('Button works!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestApp;