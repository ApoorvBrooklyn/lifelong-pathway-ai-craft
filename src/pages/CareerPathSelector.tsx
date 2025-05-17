import React from 'react';
import { useNavigate } from 'react-router-dom';

const careerPaths = [
  {
    id: 'web-dev',
    title: 'Web Development',
    color: '#1976D2',
    icon: '🌐',
    description: 'Full-stack web development career path'
  },
  {
    id: 'data-science',
    title: 'Data Scientist',
    color: '#7B1FA2',
    icon: '📊',
    description: 'Data science and analytics career path'
  },
  {
    id: 'aiml',
    title: 'AI/ML Engineer',
    color: '#388E3C',
    icon: '🤖',
    description: 'Artificial Intelligence and Machine Learning career path'
  },
  {
    id: 'software-eng',
    title: 'Software Engineer',
    color: '#E64A19',
    icon: '💻',
    description: 'General software engineering career path'
  },
  {
    id: 'embedded',
    title: 'Embedded Systems',
    color: '#00796B',
    icon: '🔧',
    description: 'Embedded systems and IoT career path'
  },
  {
    id: 'cybersecurity',
    title: 'Cyber Security',
    color: '#C62828',
    icon: '🔒',
    description: 'Cyber security and information security career path'
  }
];

const CareerPathSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Choose Your Career Path</h1>
          <p className="text-xl text-gray-600 mb-12">Select a career path to explore in VR</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careerPaths.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/vr-career-path/${path.id}`)}
            >
              <div className="p-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto"
                  style={{ backgroundColor: path.color + '20' }}
                >
                  {path.icon}
                </div>
                <h2 className="text-2xl font-semibold text-center mb-2" style={{ color: path.color }}>
                  {path.title}
                </h2>
                <p className="text-gray-600 text-center">{path.description}</p>
              </div>
              <div 
                className="py-3 text-center text-white font-semibold"
                style={{ backgroundColor: path.color }}
              >
                Enter VR Experience
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerPathSelector; 