import React from 'react';
import { Card, Typography, Progress, Space, Alert, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SkillGapAnalysis = ({ skillGaps, currentSkills }) => {
  console.log('SkillGapAnalysis props:', { skillGaps, currentSkills });

  // Default skill gaps if none provided
  const defaultSkillGaps = [
    {
      skill: "Core Skills",
      current_score: 0,
      target_score: 80,
      gap: 80,
      priority: "high"
    },
    {
      skill: "Technical Skills",
      current_score: 0,
      target_score: 85,
      gap: 85,
      priority: "high"
    },
    {
      skill: "Soft Skills",
      current_score: 0,
      target_score: 75,
      gap: 75,
      priority: "medium"
    }
  ];

  // Process and validate skill gaps
  const processSkillGaps = (gaps) => {
    if (!Array.isArray(gaps)) return defaultSkillGaps;
    
    return gaps.map(gap => {
      // Handle both object and string formats
      const skillName = typeof gap === 'object' ? gap.skill : gap;
      const currentScore = typeof gap === 'object' ? (gap.current_score || 0) : 0;
      const targetScore = typeof gap === 'object' ? (gap.target_score || 100) : 100;
      const gapValue = typeof gap === 'object' ? (gap.gap || (targetScore - currentScore)) : 100;
      const priority = typeof gap === 'object' ? (gap.priority || 'medium') : 'medium';

      return {
        skill: skillName || 'Unknown Skill',
        current_score: Number(currentScore),
        target_score: Number(targetScore),
        gap: Number(gapValue),
        priority: priority
      };
    });
  };

  // Use provided skill gaps or default
  const gaps = processSkillGaps(skillGaps);
  console.log('Processed skill gaps:', gaps);

  // Calculate overall progress
  const calculateProgress = () => {
    if (!gaps.length) return 0;
    const totalGap = gaps.reduce((sum, gap) => sum + (gap.gap || 0), 0);
    const totalCurrent = gaps.reduce((sum, gap) => sum + (gap.current_score || 0), 0);
    return Math.round((totalCurrent / (totalCurrent + totalGap)) * 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ff4d4f';
      case 'medium':
        return '#faad14';
      case 'low':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  return (
    <div className="skill-gap-analysis">
      <Card className="mb-4">
        <Title level={4}>Skill Gap Analysis</Title>
        {!Array.isArray(skillGaps) || skillGaps.length === 0 ? (
          <Alert
            message="Using default skill gaps"
            description="Personalized skill gaps will be generated based on your assessment results."
            type="info"
            showIcon
            className="mb-4"
          />
        )}
        
        <div className="overall-progress mb-4">
          <Text strong>Overall Progress</Text>
          <Progress percent={calculateProgress()} status="active" />
        </div>

        <Space direction="vertical" style={{ width: '100%' }}>
          {gaps.map((gap, index) => (
            <Card key={index} size="small" className="mb-2">
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Text strong>{String(gap.skill)}</Text>
                </Col>
                <Col span={16}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Row justify="space-between">
                      <Col>
                        <Text type="secondary">Current: {gap.current_score}%</Text>
                      </Col>
                      <Col>
                        <Text type="secondary">Target: {gap.target_score}%</Text>
                      </Col>
                    </Row>
                    <Progress
                      percent={gap.current_score}
                      success={{ percent: gap.target_score }}
                      strokeColor={getPriorityColor(gap.priority)}
                    />
                    <Row justify="space-between">
                      <Col>
                        <Text type="secondary">
                          Gap: {gap.gap}%
                          {gap.gap > 0 ? (
                            <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
                          ) : (
                            <ArrowDownOutlined style={{ color: '#52c41a' }} />
                          )}
                        </Text>
                      </Col>
                      <Col>
                        <Text type="secondary">Priority: {String(gap.priority)}</Text>
                      </Col>
                    </Row>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default SkillGapAnalysis; 