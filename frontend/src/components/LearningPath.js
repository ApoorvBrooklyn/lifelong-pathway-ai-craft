import React from 'react';
import { Card, Typography, Steps, Tag, Space, Alert } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const LearningPath = ({ learningPath, milestones, resources }) => {
  // Default learning path if none provided
  const defaultPath = {
    phases: [
      {
        name: "Foundation",
        description: "Build core knowledge and skills",
        duration: "2-3 months",
        skills: ["Basic concepts", "Fundamental tools", "Core principles"]
      },
      {
        name: "Intermediate",
        description: "Develop practical skills and experience",
        duration: "3-4 months",
        skills: ["Advanced concepts", "Practical applications", "Project work"]
      },
      {
        name: "Advanced",
        description: "Master advanced topics and specialization",
        duration: "2-3 months",
        skills: ["Expert-level knowledge", "Specialized skills", "Industry best practices"]
      }
    ]
  };

  // Use provided path or default
  const path = learningPath?.phases?.length > 0 ? learningPath : defaultPath;

  // Default milestones if none provided
  const defaultMilestones = [
    {
      title: "Complete Foundation Phase",
      description: "Master basic concepts and tools",
      deadline: "3 months from start",
      status: "pending"
    },
    {
      title: "Complete Intermediate Phase",
      description: "Build practical experience",
      deadline: "6 months from start",
      status: "pending"
    },
    {
      title: "Complete Advanced Phase",
      description: "Achieve expert-level proficiency",
      deadline: "9 months from start",
      status: "pending"
    }
  ];

  // Use provided milestones or default
  const milestoneList = milestones?.length > 0 ? milestones : defaultMilestones;

  return (
    <div className="learning-path">
      <Card className="mb-4">
        <Title level={4}>Learning Path</Title>
        {!learningPath?.phases?.length > 0 && (
          <Alert
            message="Using default learning path"
            description="A personalized learning path will be generated based on your assessment results."
            type="info"
            showIcon
            className="mb-4"
          />
        )}
        <Steps direction="vertical" current={-1}>
          {path.phases.map((phase, index) => (
            <Step
              key={index}
              title={phase.name}
              description={
                <div>
                  <Text>{phase.description}</Text>
                  <div className="mt-2">
                    <Tag color="blue">Duration: {phase.duration}</Tag>
                  </div>
                  <div className="mt-2">
                    <Space direction="vertical">
                      {phase.skills.map((skill, skillIndex) => (
                        <div key={skillIndex}>
                          <RightOutlined className="mr-2" />
                          <Text>{skill}</Text>
                        </div>
                      ))}
                    </Space>
                  </div>
                </div>
              }
              icon={index === 0 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            />
          ))}
        </Steps>
      </Card>

      <Card>
        <Title level={4}>Milestones</Title>
        {!milestones?.length > 0 && (
          <Alert
            message="Using default milestones"
            description="Personalized milestones will be generated based on your learning path."
            type="info"
            showIcon
            className="mb-4"
          />
        )}
        <Steps direction="vertical" current={-1}>
          {milestoneList.map((milestone, index) => (
            <Step
              key={index}
              title={milestone.title}
              description={
                <div>
                  <Text>{milestone.description}</Text>
                  <div className="mt-2">
                    <Tag color="blue">Deadline: {milestone.deadline}</Tag>
                  </div>
                </div>
              }
              status={milestone.status}
            />
          ))}
        </Steps>
      </Card>
    </div>
  );
};

export default LearningPath; 