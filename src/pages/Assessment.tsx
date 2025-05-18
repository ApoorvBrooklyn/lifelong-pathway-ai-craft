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
import SkillsAssessmentResults from './SkillsAssessmentResults';
import axios from 'axios';

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
        console.log("Received assessment results:", results); // Log the entire response
        setAssessmentResults(results);
        setCompleted(true);

        // Save assessment results automatically
        if (results) {
          await handleSaveAssessment();
        }
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

  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  async function fetchAnalysis() {
    setLoading(true);
    try {
      const response = await axios.post('/api/assess-skills', {
        // Your skill assessment data
        targetRole: 'Machine Learning Engineer',
        jobDescription: '...',
        // other fields
      });
      setAnalysisData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAssessment = async () => {
    if (!assessmentResults) return;
    
    try {
      const saveData = {
        user_id: localStorage.getItem('user_id') || undefined, // Get user ID from local storage if available
        user_name: localStorage.getItem('user_name') || undefined,
        target_role: formData.targetRole,
        current_role: formData.currentRole,
        experience: formData.experience,
        timeframe: formData.timeframe,
        assessment_results: assessmentResults
      };
      
      const response = await fetch('http://localhost:5000/api/save-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
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
        title: "Assessment saved successfully",
        description: "You can view your learning path in the dashboard.",
      });
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Failed to save assessment",
        description: "There was a problem saving your assessment.",
        variant: "destructive"
      });
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
                            Job Description (optional)
                          </label>
                          <textarea
                            id="jobDescription"
                            className="w-full p-2 border border-border rounded-md"
                            rows={4}
                            placeholder="Paste a specific job description or leave blank to use AI-generated description"
                            value={formData.jobDescription}
                            onChange={handleInputChange}
                          ></textarea>
                          <p className="text-xs text-muted-foreground mt-1">
                            If left blank, we'll generate a general job description based on the target role.
                          </p>
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
                {assessmentResults ? (
                  <SkillsAssessmentResults analysisData={assessmentResults} />
                ) : (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>No Results Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>No assessment results were returned. Please try again.</p>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <Button onClick={resetAssessment} variant="outline">
                    Restart Assessment
                  </Button>
                  <Button onClick={handleSaveAssessment} variant="default" className="bg-green-600 hover:bg-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save Assessment
                  </Button>
                  <Button asChild>
                    <a href="/dashboard">View Dashboard</a>
                  </Button>
                  <Button asChild variant="secondary">
                    <a href={`/learning-path/${localStorage.getItem('latest_assessment_id')}`}>View Learning Path</a>
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
