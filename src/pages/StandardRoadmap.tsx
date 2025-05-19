import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Check, 
  Clock, 
  BookOpen,
  Award,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/use-toast";

// Define the standard roadmaps for each career path
const standardRoadmaps = {
  "data-science": {
    title: "Data Science & Analytics",
    description: "A comprehensive roadmap for becoming a proficient data scientist",
    phases: [
      {
        title: "Foundations (3-6 months)",
        skills: ["Python Programming", "Statistics Fundamentals", "Data Manipulation (Pandas)", "Data Visualization (Matplotlib/Seaborn)"],
        milestones: [
          "Master Python basics and data structures",
          "Learn descriptive and inferential statistics",
          "Build your first data analysis project",
          "Create compelling data visualizations"
        ],
        resources: [
          { title: "Python for Data Science Handbook", type: "Book" },
          { title: "Statistics and Probability in Data Science", type: "Course" },
          { title: "Data Cleaning and Analysis with Pandas", type: "Tutorial" }
        ]
      },
      {
        title: "Core Skills (4-8 months)",
        skills: ["Machine Learning Algorithms", "SQL & Databases", "Feature Engineering", "Model Evaluation"],
        milestones: [
          "Implement supervised learning algorithms",
          "Master database querying and data extraction",
          "Build end-to-end machine learning projects",
          "Learn model validation techniques"
        ],
        resources: [
          { title: "Machine Learning Specialization", type: "Course" },
          { title: "Hands-On Machine Learning", type: "Book" },
          { title: "SQL for Data Scientists", type: "Tutorial" }
        ]
      },
      {
        title: "Advanced Skills (6-12 months)",
        skills: ["Deep Learning", "Big Data Technologies", "MLOps", "Advanced Statistics"],
        milestones: [
          "Build neural network models",
          "Deploy ML models to production",
          "Work with distributed computing frameworks",
          "Implement A/B testing frameworks"
        ],
        resources: [
          { title: "Deep Learning Specialization", type: "Course" },
          { title: "MLOps: Machine Learning Operations", type: "Tutorial" },
          { title: "Designing Data-Intensive Applications", type: "Book" }
        ]
      },
      {
        title: "Specialization (Ongoing)",
        skills: ["Natural Language Processing", "Computer Vision", "Time Series Analysis", "Reinforcement Learning"],
        milestones: [
          "Choose a specialization area",
          "Contribute to open-source projects",
          "Build a comprehensive portfolio",
          "Network with other professionals"
        ],
        resources: [
          { title: "NLP with Transformers", type: "Book" },
          { title: "Computer Vision with Deep Learning", type: "Course" },
          { title: "Time Series Forecasting in Python", type: "Tutorial" }
        ]
      }
    ]
  },
  
  "software-eng": {
    title: "Software Engineering",
    description: "A guided pathway to becoming a well-rounded software engineer",
    phases: [
      {
        title: "Programming Fundamentals (3-6 months)",
        skills: ["Core Programming Concepts", "Data Structures", "Algorithms", "Version Control (Git)"],
        milestones: [
          "Master a programming language (JavaScript/Python/Java)",
          "Implement common data structures",
          "Solve algorithmic problems",
          "Learn Git basics and collaboration workflows"
        ],
        resources: [
          { title: "The Complete Developer Course", type: "Course" },
          { title: "Grokking Algorithms", type: "Book" },
          { title: "Git & GitHub Crash Course", type: "Tutorial" }
        ]
      },
      {
        title: "Web Development (4-8 months)",
        skills: ["HTML/CSS", "JavaScript", "Frontend Frameworks", "Backend Development"],
        milestones: [
          "Build responsive web layouts",
          "Create interactive UIs with JavaScript",
          "Develop applications with React/Vue/Angular",
          "Implement RESTful APIs"
        ],
        resources: [
          { title: "The Web Developer Bootcamp", type: "Course" },
          { title: "React - The Complete Guide", type: "Course" },
          { title: "Node.js and Express Fundamentals", type: "Tutorial" }
        ]
      },
      {
        title: "Software Architecture (6-10 months)",
        skills: ["Design Patterns", "System Design", "Databases", "Cloud Services"],
        milestones: [
          "Implement common design patterns",
          "Design scalable architectures",
          "Master SQL and NoSQL databases",
          "Deploy applications to cloud platforms"
        ],
        resources: [
          { title: "Clean Architecture", type: "Book" },
          { title: "System Design Interview", type: "Book" },
          { title: "AWS Certified Developer", type: "Course" }
        ]
      },
      {
        title: "Advanced Engineering (Ongoing)",
        skills: ["DevOps", "Testing Strategies", "Security", "Performance Optimization"],
        milestones: [
          "Implement CI/CD pipelines",
          "Master automated testing strategies",
          "Secure your applications",
          "Optimize for performance and scale"
        ],
        resources: [
          { title: "DevOps Engineering on AWS", type: "Course" },
          { title: "Web Application Security", type: "Tutorial" },
          { title: "High Performance Browser Networking", type: "Book" }
        ]
      }
    ]
  },
  
  "ux-design": {
    title: "UX/UI Design",
    description: "A structured path for becoming a skilled UX/UI designer",
    phases: [
      {
        title: "Design Fundamentals (2-4 months)",
        skills: ["Design Principles", "Color Theory", "Typography", "Layout & Composition"],
        milestones: [
          "Understand core design principles",
          "Create effective color schemes",
          "Master typography fundamentals",
          "Design balanced layouts"
        ],
        resources: [
          { title: "Design Fundamentals Course", type: "Course" },
          { title: "The Elements of Graphic Design", type: "Book" },
          { title: "Typography Fundamentals", type: "Tutorial" }
        ]
      },
      {
        title: "UX Principles (3-6 months)",
        skills: ["User Research", "Information Architecture", "Wireframing", "Usability Testing"],
        milestones: [
          "Conduct user interviews and surveys",
          "Create user personas and journey maps",
          "Design site maps and user flows",
          "Perform usability testing sessions"
        ],
        resources: [
          { title: "Don't Make Me Think", type: "Book" },
          { title: "UX Research Fundamentals", type: "Course" },
          { title: "Wireframing & Prototyping", type: "Tutorial" }
        ]
      },
      {
        title: "UI Design (4-8 months)",
        skills: ["Visual Design", "Interface Design", "Design Systems", "Prototyping"],
        milestones: [
          "Design appealing interfaces",
          "Create interactive prototypes",
          "Build a comprehensive design system",
          "Develop a cohesive design language"
        ],
        resources: [
          { title: "UI Design Bootcamp", type: "Course" },
          { title: "Design Systems Handbook", type: "Book" },
          { title: "Figma Master Course", type: "Tutorial" }
        ]
      },
      {
        title: "Professional Practice (Ongoing)",
        skills: ["Design Portfolio", "Collaboration Skills", "Design Strategy", "Accessibility"],
        milestones: [
          "Build a professional portfolio",
          "Collaborate effectively with developers",
          "Align design with business goals",
          "Implement accessible design practices"
        ],
        resources: [
          { title: "Building a Design Portfolio", type: "Course" },
          { title: "Designing for Accessibility", type: "Tutorial" },
          { title: "Design Leadership", type: "Book" }
        ]
      }
    ]
  }
};

const StandardRoadmap = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Get the roadmap data based on the pathId
  const roadmap = standardRoadmaps[pathId as keyof typeof standardRoadmaps];
  
  // Handle if roadmap not found
  if (!roadmap) {
    return (
      <div>
        <Navbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Roadmap Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">The requested career path roadmap could not be found.</p>
                  <div className="mt-4">
                    <Button onClick={() => navigate('/')} variant="outline">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Return to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Handle saving the roadmap to the user's dashboard
  const handleSaveRoadmap = async () => {
    setSaving(true);
    
    try {
      // Prepare the assessment data structure
      const assessmentData = {
        user_id: localStorage.getItem('user_id') || undefined,
        user_name: localStorage.getItem('user_name') || undefined,
        target_role: roadmap.title,
        current_role: "Current Role", // Default value
        experience: "1-3", // Default value
        timeframe: "1y", // Default value
        assessment_results: {
          analysis: {
            required_skills: roadmap.phases.flatMap(phase => 
              phase.skills.map(skill => ({
                skill,
                importance: "high",
                description: `Required for ${roadmap.title}`
              }))
            ),
            skill_gaps: roadmap.phases.flatMap(phase => 
              phase.skills.map(skill => ({
                skill,
                current_score: 10,
                target_score: 90,
                gap: `Need to develop ${skill}`,
                priority: "high"
              }))
            ),
            learning_path: roadmap.phases.map((phase, index) => ({
              phase: (index + 1).toString(),
              title: phase.title,
              description: `Phase ${index + 1}: ${phase.title}`,
              duration: phase.title.split("(")[1]?.split(")")[0] || "3 months",
              skills_to_develop: phase.skills,
              resources: phase.resources.map(r => r.title)
            })),
            milestones: roadmap.phases.flatMap((phase, phaseIndex) => 
              phase.milestones.map((milestone, mIndex) => ({
                milestone,
                description: `Phase ${phaseIndex + 1}: ${milestone}`,
                target_date: new Date(Date.now() + (phaseIndex * 3 + mIndex) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                dependencies: []
              }))
            ),
            resources: roadmap.phases.flatMap(phase => 
              phase.resources.map(resource => ({
                title: resource.title,
                type: resource.type.toLowerCase(),
                url: `https://example.com/${resource.title.toLowerCase().replace(/\s+/g, '-')}`,
                description: `A ${resource.type.toLowerCase()} on ${resource.title}`,
                difficulty: "intermediate",
                estimated_time: "4 weeks"
              }))
            ),
            risk_assessment: [
              {
                risk: "Time management",
                impact: "high",
                probability: "medium",
                mitigation: "Create a consistent study schedule and track progress weekly"
              },
              {
                risk: "Skill retention",
                impact: "medium",
                probability: "medium",
                mitigation: "Practice regularly and build projects to apply what you learn"
              }
            ],
            summary: {
              title: `Career Path Analysis for ${roadmap.title}`,
              overview: roadmap.description,
              key_findings: [
                `Identified ${roadmap.phases.flatMap(p => p.skills).length} key skills for the role`,
                `Created a ${roadmap.phases.length}-phase learning path`,
                `Set ${roadmap.phases.flatMap(p => p.milestones).length} key milestones`,
                `Recommended ${roadmap.phases.flatMap(p => p.resources).length} learning resources`
              ]
            }
          }
        }
      };
      
      // Call the API to save the assessment
      const response = await fetch('http://localhost:5000/api/save-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }
      
      const result = await response.json();
      
      // Store user ID for future use
      if (result.user_id) {
        localStorage.setItem('user_id', result.user_id);
      }
      
      // Store assessment ID
      if (result.assessment_id) {
        localStorage.setItem('latest_assessment_id', result.assessment_id);
      }
      
      toast({
        title: "Roadmap saved successfully",
        description: "You can view your learning path in the dashboard.",
      });
      
      // Navigate to the learning path
      navigate(`/learning-path/${result.assessment_id}`);
      
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast({
        title: "Failed to save roadmap",
        description: "There was a problem saving your roadmap.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold">{roadmap.title} Roadmap</h1>
                  <p className="text-muted-foreground">{roadmap.description}</p>
                </div>
                
                <Button 
                  onClick={handleSaveRoadmap} 
                  className="mt-4 md:mt-0"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Save to Dashboard
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-8">
              {roadmap.phases.map((phase, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                  <CardHeader>
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">
                        {index + 1}
                      </span>
                      <CardTitle>{phase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Key Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {phase.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Milestones</h3>
                      <ul className="space-y-2">
                        {phase.milestones.map((milestone, milestoneIndex) => (
                          <li key={milestoneIndex} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Recommended Resources</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {phase.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="bg-muted p-3 rounded-md">
                            <div className="flex items-center mb-1">
                              <BookOpen className="h-4 w-4 text-primary mr-2" />
                              <span className="font-medium">{resource.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{resource.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  {index < roadmap.phases.length - 1 && (
                    <div className="flex justify-center py-4">
                      <div className="w-0.5 h-8 bg-border"></div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                onClick={handleSaveRoadmap} 
                size="lg"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save and Start This Roadmap"}
                {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StandardRoadmap; 