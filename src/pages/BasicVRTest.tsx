import React from 'react';

const BasicVRTest = () => {
  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f0f0" }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">VR Test Page</h1>
        <p className="text-xl mb-4">This is a simple test page for the VR experience</p>
        <p>If you can see this, routing is working correctly!</p>
      </div>
    </div>
  );
};

export default BasicVRTest; 