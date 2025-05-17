import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssessmentPage from './pages/AssessmentPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default App; 