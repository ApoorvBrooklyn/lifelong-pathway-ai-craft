import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Spin, Alert } from 'antd';
import SkillGapAnalysis from './SkillGapAnalysis';
import LearningPath from './LearningPath';

const { Title } = Typography;
const { TabPane } = Tabs;

const AssessmentResults = ({ assessmentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        console.log('Fetching assessment data for ID:', assessmentId);
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/get-assessment/${assessmentId}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received assessment data:', data);
        
        // Ensure we have the required data structure
        const processedData = {
          skill_gaps: data.skill_gaps || [],
          current_skills: data.current_skills || [],
          learning_path: data.learning_path || [],
          milestones: data.milestones || [],
          resources: data.resources || []
        };
        
        console.log('Processed assessment data:', processedData);
        setAssessmentData(processedData);
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessmentData();
    } else {
      console.warn('No assessment ID provided');
      setError('No assessment ID provided');
      setLoading(false);
    }
  }, [assessmentId]);

  // Debug render states
  console.log('Current state:', { loading, error, assessmentData });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading assessment results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!assessmentData) {
    return (
      <Alert
        message="No Data"
        description="No assessment data available."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="assessment-results">
      <Title level={2}>Assessment Results</Title>
      
      <Tabs defaultActiveKey="skill-gaps">
        <TabPane tab="Skill Gaps" key="skill-gaps">
          <SkillGapAnalysis
            skillGaps={assessmentData.skill_gaps}
            currentSkills={assessmentData.current_skills}
          />
        </TabPane>
        
        <TabPane tab="Learning Path" key="learning-path">
          <LearningPath
            learningPath={assessmentData.learning_path}
            milestones={assessmentData.milestones}
            resources={assessmentData.resources}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AssessmentResults; 