
import { useState, useRef, FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import SkillsRadarChart from "@/components/dashboard/SkillsRadarChart";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Mock data for radar chart
const skillsData = [
  { name: "Technical Skills", value: 75, color: "#3182CE" },
  { name: "Communication", value: 60, color: "#38B2AC" },
  { name: "Leadership", value: 45, color: "#4C51BF" },
  { name: "Problem Solving", value: 80, color: "#2C7A7B" },
  { name: "Creativity", value: 55, color: "#2B6CB0" },
];

const Assessment = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    currentRole: '',
    experience: '',
    technicalSkills: '',
    softSkills: '',
    targetRole: '',
    timeframe: '',
    jobDescription: '',
    interests: '',
    learningStyle: '',
    timeCommitment: '',
    budget: ''
  });
  
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    // For radio buttons with name="learning-style"
    if (e.target.type === 'radio' && e.target.name === 'learning-style') {
      setFormData({
        ...formData,
        learningStyle: value
      });
      return;
    }
    
    // Map the HTML id to the corresponding state property
    const fieldMap: { [key: string]: string } = {
      'current-role': 'currentRole',
      'experience': 'experience',
      'target-role': 'targetRole',
      'timeframe': 'timeframe'
    };
    
    const field = fieldMap[id] || id;
    
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setUploadingResume(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      
      const data = await response.json();
      setResumeAnalysis(data.analysis);
      
      toast({
        title: "Resume analyzed successfully",
        description: "Your skills have been extracted from your resume.",
      });
      
      // If the backend extracted skills, populate the skills fields
      if (data.analysis && data.analysis.skills) {
        const technicalSkills = data.analysis.skills
          .filter((skill: string) => !['leadership', 'communication', 'teamwork', 
                                     'problem solving', 'creativity', 'management'].includes(skill))
          .join(', ');
        
        const softSkills = data.analysis.skills
          .filter((skill: string) => ['leadership', 'communication', 'teamwork', 
                                    'problem solving', 'creativity', 'management'].includes(skill))
          .join(', ');
        
        setFormData(prev => ({
          ...prev,
          technicalSkills: technicalSkills || prev.technicalSkills,
          softSkills: softSkills || prev.softSkills
        }));
      }
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Resume upload failed",
        description: "There was a problem analyzing your resume.",
        variant: "destructive"
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step, submit assessment
      setLoading(true);
      
      try {
        // Prepare data for submission
        const assessmentData = {
          currentRole: formData.currentRole,
          experience: formData.experience,
          technicalSkills: formData.technicalSkills,
          softSkills: formData.softSkills,
          targetRole: formData.targetRole,
          timeframe: formData.timeframe,
          jobDescription: formData.jobDescription,
          interests: formData.interests,
          learningStyle: formData.learningStyle,
          timeCommitment: formData.timeCommitment,
          budget: formData.budget,
          resumeAnalysis: resumeAnalysis
        };
        
        // Call the API to process the assessment
        const response = await fetch('http://localhost:5000/api/assess-skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assessmentData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to process assessment');
        }
        
        const results = await response.json();
        setAssessmentResults(results);
        setCompleted(true);
      } catch (error) {
        console.error('Error submitting assessment:', error);
        toast({
          title: "Assessment submission failed",
          description: "There was a problem processing your assessment.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAssessment = () => {
    setCurrentStep(1);
    setCompleted(false);
    setResumeAnalysis(null);
    setAssessmentResults(null);
    setFormData({
      currentRole: '',
      experience: '',
      technicalSkills: '',
      softSkills: '',
      targetRole: '',
      timeframe: '',
      jobDescription: '',
      interests: '',
      learningStyle: '',
      timeCommitment: '',
      budget: ''
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Skills Assessment</h1>
            <p className="text-center text-muted-foreground mb-10">
              Let our AI analyze your skills and help you discover the best career paths.
            </p>

            {!completed ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2 mt-2" />
                </CardHeader>
                <CardContent>
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl font-medium mb-4">Current Skills & Experience</h2>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="current-role" className="block text-sm font-medium mb-1">
                            Current Role
                          </label>
                          <input
                            type="text"
                            id="current-role"
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="e.g. Frontend Developer"
                            value={formData.currentRole}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="experience" className="block text-sm font-medium mb-1">
                            Years of Experience
                          </label>
                          <select
                            id="experience"
                            className="w-full p-2 border border-border rounded-md"
                            value={formData.experience}
                            onChange={handleInputChange}
                          >
                            <option value="">Select</option>
                            <option value="0-1">0-1 years</option>
                            <option value="1-3">1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Technical Skills
                          </label>
                          <textarea
                            id="technicalSkills"
                            className="w-full p-2 border border-border rounded-md"
                            rows={3}
                            placeholder="List your technical skills (e.g. JavaScript, React, SQL)"
                            value={formData.technicalSkills}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Soft Skills
                          </label>
                          <textarea
                            id="softSkills"
                            className="w-full p-2 border border-border rounded-md"
                            rows={3}
                            placeholder="List your soft skills (e.g. Communication, Problem-solving)"
                            value={formData.softSkills}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Resume Upload (optional)
                          </label>
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              id="resume-upload"
                              accept=".pdf,.docx,.txt"
                              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                              onChange={handleFileChange}
                              ref={fileInputRef}
                              disabled={uploadingResume}
                            />
                            {uploadingResume && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Analyzing resume...</span>
                              </div>
                            )}
                            {resumeAnalysis && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                                Resume analyzed successfully! {resumeAnalysis.skills.length} skills detected.
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Upload your resume for AI-powered skills analysis (PDF, DOCX, or TXT formats)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl font-medium mb-4">Career Goals</h2>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="target-role" className="block text-sm font-medium mb-1">
                            Target Role
                          </label>
                          <input
                            type="text"
                            id="target-role"
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="e.g. Senior Frontend Engineer"
                            value={formData.targetRole}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="timeframe" className="block text-sm font-medium mb-1">
                            Target Timeframe
                          </label>
                          <select
                            id="timeframe"
                            className="w-full p-2 border border-border rounded-md"
                            value={formData.timeframe}
                            onChange={handleInputChange}
                          >
                            <option value="">Select</option>
                            <option value="6m">6 months</option>
                            <option value="1y">1 year</option>
                            <option value="2y">2 years</option>
                            <option value="5y">5 years</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Job Description (paste target role description)
                          </label>
                          <textarea
                            id="jobDescription"
                            className="w-full p-2 border border-border rounded-md"
                            rows={4}
                            placeholder="Paste the job description for your target role to help our AI analyze skill gaps"
                            value={formData.jobDescription}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            What interests you most about this role?
                          </label>
                          <textarea
                            id="interests"
                            className="w-full p-2 border border-border rounded-md"
                            rows={3}
                            placeholder="Describe what attracts you to this career path"
                            value={formData.interests}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-xl font-medium mb-4">Learning Preferences</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Preferred Learning Style
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input 
                                type="radio" 
                                name="learning-style" 
                                className="mr-2" 
                                value="visual"
                                checked={formData.learningStyle === "visual"}
                                onChange={handleInputChange}
                              />
                              <span>Visual Learning</span>
                            </label>
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input 
                                type="radio" 
                                name="learning-style" 
                                className="mr-2" 
                                value="reading"
                                checked={formData.learningStyle === "reading"}
                                onChange={handleInputChange}
                              />
                              <span>Reading/Writing</span>
                            </label>
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input 
                                type="radio" 
                                name="learning-style" 
                                className="mr-2"
                                value="interactive"
                                checked={formData.learningStyle === "interactive"}
                                onChange={handleInputChange}
                              />
                              <span>Interactive/Hands-on</span>
                            </label>
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input 
                                type="radio" 
                                name="learning-style" 
                                className="mr-2"
                                value="audio_video"
                                checked={formData.learningStyle === "audio_video"}
                                onChange={handleInputChange}
                              />
                              <span>Audio/Video</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Weekly Time Commitment
                          </label>
                          <select
                            id="timeCommitment"
                            className="w-full p-2 border border-border rounded-md"
                            value={formData.timeCommitment}
                            onChange={handleInputChange}
                          >
                            <option value="">Select</option>
                            <option value="1-3">1-3 hours</option>
                            <option value="4-7">4-7 hours</option>
                            <option value="8-15">8-15 hours</option>
                            <option value="16+">16+ hours</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Budget Constraints
                          </label>
                          <select
                            id="budget"
                            className="w-full p-2 border border-border rounded-md"
                            value={formData.budget}
                            onChange={handleInputChange}
                          >
                            <option value="">Select</option>
                            <option value="free">Free resources only</option>
                            <option value="low">Low budget ($1-50/month)</option>
                            <option value="medium">Medium budget ($51-200/month)</option>
                            <option value="high">High budget ($200+/month)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    <Button onClick={handleNext} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        currentStep < totalSteps ? "Next" : "Submit"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Your Skills Assessment Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="strengths">Strengths</TabsTrigger>
                        <TabsTrigger value="improvement">Areas for Growth</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-3">Skill Distribution</h3>
                            <SkillsRadarChart data={assessmentResults?.skillScores || skillsData} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-3">Assessment Summary</h3>
                            <p className="text-muted-foreground mb-4">
                              {assessmentResults?.estimatedMonths ? (
                                <>Based on our analysis, we estimate it will take approximately {assessmentResults.estimatedMonths} months to reach your target role with your current commitment level.</>
                              ) : (
                                <>Based on your profile, you have strong technical skills particularly in frontend development. 
                                Your problem-solving abilities are excellent, but there are opportunities to develop leadership 
                                and strategic communication skills to reach your career goals.</>
                              )}
                            </p>
                            
                            <h4 className="font-medium mb-2">Skill Gaps:</h4>
                            {assessmentResults?.skillGaps ? (
                              <div className="space-y-2 mb-4">
                                {assessmentResults.skillGaps.highPriority?.length > 0 && (
                                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                                    <p className="font-medium text-sm text-red-800 mb-1">High Priority Gaps:</p>
                                    <p className="text-sm text-red-700">
                                      {assessmentResults.skillGaps.highPriority.join(", ")}
                                    </p>
                                  </div>
                                )}
                                
                                {assessmentResults.skillGaps.mediumPriority?.length > 0 && (
                                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
                                    <p className="font-medium text-sm text-amber-800 mb-1">Medium Priority Gaps:</p>
                                    <p className="text-sm text-amber-700">
                                      {assessmentResults.skillGaps.mediumPriority.join(", ")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground mb-4">
                                Upload your resume and add a job description to identify specific skill gaps.
                              </p>
                            )}
                            
                            <h4 className="font-medium mb-2">Recommended Focus Areas:</h4>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                              {assessmentResults?.recommendations ? (
                                assessmentResults.recommendations.map((rec: string, index: number) => (
                                  <li key={index}>{rec}</li>
                                ))
                              ) : (
                                <>
                                  <li>Team leadership and management</li>
                                  <li>Technical communication with non-technical stakeholders</li>
                                  <li>Advanced React patterns and architecture</li>
                                </>
                              )}
                            </ul>
                            
                            {assessmentResults?.improvementAreas && assessmentResults.improvementAreas.length > 0 && (
                              <>
                                <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {assessmentResults.improvementAreas.map((area: string, index: number) => (
                                    <li key={index}>{area}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                            
                            {assessmentResults?.timelineRecommendations && assessmentResults.timelineRecommendations.length > 0 && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-800">
                                  <strong>Timeline Assessment:</strong> {assessmentResults.timelineRecommendations[0]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="strengths" className="pt-6">
                        <h3 className="text-lg font-medium mb-3">Your Key Strengths</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <span className="inline-flex bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                            <div>
                              <span className="font-medium">Technical Proficiency</span>
                              <p className="text-muted-foreground">Strong coding skills with expertise in JavaScript and modern frameworks.</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                            <div>
                              <span className="font-medium">Problem Solving</span>
                              <p className="text-muted-foreground">Excellent ability to diagnose complex technical issues and implement effective solutions.</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                            <div>
                              <span className="font-medium">Adaptability</span>
                              <p className="text-muted-foreground">Quick to learn new technologies and frameworks as needed for projects.</p>
                            </div>
                          </li>
                        </ul>
                      </TabsContent>
                      <TabsContent value="improvement" className="pt-6">
                        <h3 className="text-lg font-medium mb-3">Areas for Development</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <span className="inline-flex bg-amber-100 text-amber-800 rounded-full p-1 mr-2">!</span>
                            <div>
                              <span className="font-medium">Leadership Skills</span>
                              <p className="text-muted-foreground">Developing mentorship abilities and team coordination skills would help in progression to senior roles.</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex bg-amber-100 text-amber-800 rounded-full p-1 mr-2">!</span>
                            <div>
                              <span className="font-medium">Strategic Communication</span>
                              <p className="text-muted-foreground">Improving ability to communicate technical concepts to non-technical stakeholders.</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex bg-amber-100 text-amber-800 rounded-full p-1 mr-2">!</span>
                            <div>
                              <span className="font-medium">System Architecture</span>
                              <p className="text-muted-foreground">Enhancing knowledge of broader system design principles for more complex applications.</p>
                            </div>
                          </li>
                        </ul>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <div className="flex justify-center mt-8">
                  <Button onClick={resetAssessment} variant="outline" className="mr-4">
                    Restart Assessment
                  </Button>
                  <Button asChild>
                    <a href="/dashboard">View Recommended Paths</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;
