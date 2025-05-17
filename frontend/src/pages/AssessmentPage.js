import React from 'react';
import { useParams } from 'react-router-dom';
import AssessmentResults from '../components/AssessmentResults';

const AssessmentPage = () => {
  const { assessmentId } = useParams();

  return (
    <div className="assessment-page">
      <AssessmentResults assessmentId={assessmentId} />
    </div>
  );
};

export default AssessmentPage; 