import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';

// API key for content generation (replace with your actual API key and proper handling)
const API_KEY = "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";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface CareerPathData {
  title: string;
  color: string;
  steps: {
    title: string;
    description: string;
    skills: string[];
  }[];
}

const careerPathsData: { [key: string]: CareerPathData } = {
  'web-dev': {
    title: 'Web Development',
    color: '#1976D2',
    steps: [
      {
        title: 'Frontend Fundamentals',
        description: 'Master HTML, CSS, and JavaScript basics',
        skills: ['HTML5', 'CSS3', 'JavaScript ES6+']
      },
      {
        title: 'Frontend Frameworks',
        description: 'Learn modern frontend frameworks',
        skills: ['React', 'Vue.js', 'State Management']
      },
      {
        title: 'Backend Development',
        description: 'Build server-side applications',
        skills: ['Node.js', 'Express', 'Databases']
      },
      {
        title: 'Full Stack Mastery',
        description: 'Combine frontend and backend skills',
        skills: ['API Design', 'DevOps', 'Testing']
      }
    ]
  },
  'data-science': {
    title: 'Data Science',
    color: '#7B1FA2',
    steps: [
      {
        title: 'Data Analysis Basics',
        description: 'Learn fundamental data analysis',
        skills: ['Python', 'Pandas', 'NumPy']
      },
      {
        title: 'Statistical Methods',
        description: 'Master statistical analysis',
        skills: ['Statistics', 'Probability', 'R']
      },
      {
        title: 'Machine Learning',
        description: 'Implement ML algorithms',
        skills: ['Scikit-learn', 'TensorFlow', 'Feature Engineering']
      },
      {
        title: 'Advanced Analytics',
        description: 'Apply advanced analytics techniques',
        skills: ['Deep Learning', 'Big Data', 'MLOps']
      }
    ]
  },
  'aiml': {
    title: 'AI/ML Engineer',
    color: '#388E3C',
    steps: [
      {
        title: 'Mathematics & Programming',
        description: 'Build strong foundations in math and programming for AI',
        skills: ['Linear Algebra', 'Calculus', 'Python', 'Advanced Mathematics']
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Master core machine learning concepts and algorithms',
        skills: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation', 'Neural Networks']
      },
      {
        title: 'Deep Learning & Neural Networks',
        description: 'Specialize in deep learning architectures and applications',
        skills: ['CNN', 'RNN', 'Transformers', 'PyTorch/TensorFlow']
      },
      {
        title: 'Advanced AI Applications',
        description: 'Build and deploy production-ready AI systems',
        skills: ['MLOps', 'Model Deployment', 'AI Ethics', 'Large Language Models']
      }
    ]
  },
  'software-eng': {
    title: 'Software Engineer',
    color: '#E64A19',
    steps: [
      {
        title: 'Programming Fundamentals',
        description: 'Master core programming concepts and best practices',
        skills: ['Data Structures', 'Algorithms', 'OOP', 'Design Patterns']
      },
      {
        title: 'Software Architecture',
        description: 'Learn to design scalable and maintainable systems',
        skills: ['System Design', 'Design Patterns', 'Microservices', 'Cloud Architecture']
      },
      {
        title: 'Development Practices',
        description: 'Implement professional development workflows',
        skills: ['Git', 'CI/CD', 'Testing', 'Code Review']
      },
      {
        title: 'Advanced Engineering',
        description: 'Master advanced software engineering concepts',
        skills: ['Performance Optimization', 'Security', 'Scalability', 'System Integration']
      }
    ]
  },
  'embedded': {
    title: 'Embedded Systems',
    color: '#00796B',
    steps: [
      {
        title: 'Hardware Basics',
        description: 'Understand fundamental electronics and microcontrollers',
        skills: ['Digital Electronics', 'Microcontrollers', 'Circuit Design', 'Arduino']
      },
      {
        title: 'Embedded Programming',
        description: 'Master embedded C/C++ programming',
        skills: ['Embedded C', 'C++', 'Assembly', 'RTOS']
      },
      {
        title: 'IoT & Connectivity',
        description: 'Implement connected embedded systems',
        skills: ['IoT Protocols', 'Wireless Communication', 'Sensors', 'Bluetooth/WiFi']
      },
      {
        title: 'Advanced Systems',
        description: 'Design complex embedded systems',
        skills: ['Real-time Systems', 'Power Management', 'Security', 'System Integration']
      }
    ]
  },
  'cybersecurity': {
    title: 'Cyber Security',
    color: '#C62828',
    steps: [
      {
        title: 'Security Fundamentals',
        description: 'Learn core security concepts and principles',
        skills: ['Network Security', 'Cryptography', 'Security Protocols', 'Risk Assessment']
      },
      {
        title: 'Offensive Security',
        description: 'Master ethical hacking and penetration testing',
        skills: ['Penetration Testing', 'Vulnerability Assessment', 'Exploit Development', 'Social Engineering']
      },
      {
        title: 'Defensive Security',
        description: 'Implement robust security measures',
        skills: ['Incident Response', 'Security Operations', 'Threat Detection', 'Malware Analysis']
      },
      {
        title: 'Advanced Security',
        description: 'Specialize in advanced security domains',
        skills: ['Cloud Security', 'Zero Trust', 'Forensics', 'Security Architecture']
      }
    ]
  }
};

const VRCareerPath = () => {
  const { pathId = 'web-dev' } = useParams();
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizQuestions, setQuizQuestions] = useState<{[key: string]: QuizQuestion[]}>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const careerPath = careerPathsData[pathId] || careerPathsData['web-dev'];

  const celebrateSuccess = () => {
    setShowCelebration(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // Function to toggle step titles visibility
  const toggleStepTitles = (show: boolean) => {
    const stepGroups = document.querySelectorAll('.step-title');
    stepGroups.forEach(group => {
      (group as HTMLElement).setAttribute('visible', show.toString());
    });
  };

  useEffect(() => {
    // Load A-Frame script
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (sceneContainerRef.current && (window as any).AFRAME) {
        // Create VR scene
        const steps = careerPath.steps;
        const sceneHTML = `
          <a-scene embedded background="color: #1A237E" raycaster="objects: .clickable" cursor="rayOrigin: mouse">
            <!-- Camera + Controls -->
            <a-entity position="0 1.6 5">
              <a-camera look-controls wasd-controls></a-camera>
            </a-entity>

            <!-- Lighting -->
            <a-entity light="type: ambient; intensity: 0.8"></a-entity>
            <a-entity light="type: directional; intensity: 1" position="1 3 2"></a-entity>

            <!-- Career Path Title -->
            <a-entity
              position="0 3.5 0"
              text="value: ${careerPath.title}; width: 10; color: #FFFFFF; align: center; font: mozillavr; wrapCount: 20; baseline: center"
              scale="2.5 2.5 2.5"
            ></a-entity>

            <!-- Road -->
            <a-plane position="0 0.02 -10" rotation="-90 0 0" width="4" height="30" color="#000000" material="roughness: 0.7"></a-plane>
            <a-plane position="0 0.03 -10" rotation="-90 0 0" width="0.3" height="30" color="#FFFFFF" material="roughness: 0.5; metalness: 0.2"></a-plane>

            <!-- Moving Ball -->
            <a-sphere
              id="progress-ball"
              position="0 0.3 -4"
              radius="0.15"
              color="${careerPath.color}"
              material="metalness: 0.8; roughness: 0.2"
              animation="property: position; to: 0 0.3 -19; dur: 15000; easing: linear; loop: true"
            >
              <a-light type="point" intensity="0.7" color="${careerPath.color}" distance="3"></a-light>
            </a-sphere>

            ${steps.map((step, index) => `
              <!-- Step ${index + 1} Group -->
              <a-entity class="step-group" id="step-group-${index + 1}">
                <!-- Step Cylinder -->
                <a-cylinder 
                  position="0 0.5 ${-4 - index * 5}"
                  color="${careerPath.color}"
                  radius="0.3"
                  height="1.2"
                  material="metalness: 0.5; roughness: 0.3"
                  class="clickable step-marker"
                  data-step="${index + 1}"
                  animation__mouseenter="property: scale; to: 1.1 1.1 1.1; startEvents: mouseenter; dur: 200"
                  animation__mouseleave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
                  animation__click="property: scale; to: 0.9 0.9 0.9; startEvents: click; dur: 100; dir: alternate"
                >
                  <!-- Step Number -->
                  <a-text
                    value="${index + 1}"
                    position="0 0 0.35"
                    scale="3 3 3"
                    align="center"
                    color="white"
                    font="mozillavr"
                  ></a-text>
                </a-cylinder>

                <!-- Step Title Container -->
                <a-entity
                  class="step-title"
                  position="0 1.8 ${-4 - index * 5}"
                >
                  <!-- Title Background -->
                  <a-plane
                    width="5"
                    height="1"
                    color="#3F51B5"
                    opacity="0.9"
                    material="shader: standard; metalness: 0.2; roughness: 0.8"
                  ></a-plane>

                  <!-- Title Text -->
                  <a-text
                    value="${step.title}"
                    position="0 0 0.01"
                    align="center"
                    color="#FFFFFF"
                    font="mozillavr"
                    width="8"
                    scale="1.3 1.3 1.3"
                    baseline="center"
                  ></a-text>
                </a-entity>

                ${index < steps.length - 1 ? `
                  <!-- Bridge to next step -->
                  <a-box
                    position="0 0.1 ${-6.5 - index * 5}"
                    rotation="-90 0 0"
                    depth="0.05"
                    width="0.4"
                    height="5"
                    color="#5C6BC0"
                    material="roughness: 0.8"
                  ></a-box>

                  <!-- Arrow -->
                  <a-entity position="0 0.8 ${-9 - index * 5}">
                    <a-triangle
                      color="#FFC107"
                      rotation="0 0 180"
                      scale="0.3 0.3 0.3"
                      material="metalness: 0.5; roughness: 0.3"
                    ></a-triangle>
                    <a-cylinder
                      position="0 0.25 0"
                      color="#FFC107"
                      radius="0.05"
                      height="0.5"
                      material="metalness: 0.5; roughness: 0.3"
                    ></a-cylinder>
                  </a-entity>
                ` : ''}
              </a-entity>
            `).join('')}

            <!-- Sky -->
            <a-sky color="#0D47A1"></a-sky>
          </a-scene>
        `;

        sceneContainerRef.current.innerHTML = sceneHTML;

        // Add event listeners to step markers
        const markers = document.querySelectorAll('.step-marker');
        markers.forEach(marker => {
          marker.addEventListener('click', (event) => {
            const step = (event.target as HTMLElement).getAttribute('data-step');
            if (step) {
              setCurrentStep(parseInt(step));
              toggleStepTitles(false);
              showStepInfo(parseInt(step) - 1);
            }
          });
        });

        // Register custom components
        if ((window as any).AFRAME) {
          // Update quiz option component for direct clicking
          (window as any).AFRAME.registerComponent('quiz-option', {
            schema: {
              isCorrect: { type: 'boolean', default: false }
            },
            init: function() {
              const el = this.el;
              const isCorrect = this.data.isCorrect;
              
              el.addEventListener('click', function() {
                if (isCorrect) {
                  el.setAttribute('color', '#4CAF50');
                  celebrateSuccess();
                } else {
                  el.setAttribute('color', '#F44336');
                }
              });
              
              el.addEventListener('mouseenter', function() {
                el.setAttribute('scale', '1.1 1.1 1.1');
              });
              
              el.addEventListener('mouseleave', function() {
                el.setAttribute('scale', '1 1 1');
              });
            }
          });
        }
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [pathId, careerPath]);

  const showStepInfo = (stepIndex: number) => {
    const step = careerPath.steps[stepIndex];
    if (!step) return;

    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Remove existing info panel
    const existingPanel = document.querySelector('#info-panel');
    if (existingPanel && existingPanel.parentNode) {
      existingPanel.parentNode.removeChild(existingPanel);
      toggleStepTitles(true);
    }

    // Create new panel with improved styling
    const panel = document.createElement('a-entity');
    panel.id = 'info-panel';
    panel.setAttribute('position', `0 2 ${-4 - stepIndex * 5}`);

    // Add panel content with better styling
    panel.innerHTML = `
      <!-- Panel Background -->
      <a-entity
        geometry="primitive: plane; width: 4; height: 3"
        material="color: #3F51B5; opacity: 0.95; transparent: true"
        animation="property: scale; from: 0.1 0.1 0.1; to: 1 1 1; dur: 300; easing: easeOutQuad"
      ></a-entity>

      <!-- Title -->
      <a-text
        value="${step.title}"
        position="0 1 0.01"
        align="center"
        color="#FFFFFF"
        font="mozillavr"
        width="3.5"
        scale="1.5 1.5 1.5"
        baseline="center"
      ></a-text>

      <!-- Description -->
      <a-text
        value="${step.description}"
        position="0 0.4 0.01"
        align="center"
        color="#E8EAF6"
        font="mozillavr"
        width="3"
        scale="1.2 1.2 1.2"
        baseline="center"
        style="font-style: italic"
      ></a-text>

      <!-- Skills List -->
      ${step.skills.map((skill, index) => `
        <a-text
          value="• ${skill}"
          position="-1.5 ${-0.2 - index * 0.3} 0.01"
          color="#90CAF9"
          font="mozillavr"
          width="3"
          scale="1.1 1.1 1.1"
          baseline="center"
          style="font-style: italic"
        ></a-text>
      `).join('')}

      <!-- Close Button -->
      <a-entity
        position="1.8 1.3 0.02"
        geometry="primitive: circle; radius: 0.15"
        material="color: #F44336"
        class="clickable"
        onclick="this.parentElement.parentElement.removeChild(this.parentElement); document.querySelectorAll('.step-title').forEach(el => el.setAttribute('visible', 'true'))"
      >
        <a-text
          value="×"
          position="0 0 0.01"
          align="center"
          color="white"
          scale="1.5 1.5 1.5"
          baseline="center"
        ></a-text>
      </a-entity>
    `;

    scene.appendChild(panel);
  };

  return (
    <div className="vr-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <button 
        onClick={() => navigate('/career-paths')}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#E53935',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Exit VR
      </button>
      
      {showCelebration && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}
        >
          <h2>Congratulations! 🎉</h2>
          <p>You've completed this step!</p>
        </div>
      )}
      
      <div ref={sceneContainerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default VRCareerPath; 