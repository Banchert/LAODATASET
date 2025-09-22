import React from 'react';

const SimpleTest = () => {
  console.log('SimpleTest component is rendering...');

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      border: '2px solid #333',
      margin: '20px'
    }}>
      <h1 style={{ color: 'red' }}>Simple Test Component</h1>
      <p>If you can see this, React is working!</p>
      <p>การทดสอบภาษาลาว: ສະບາຍດີ</p>
      <button onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
};

export default SimpleTest;