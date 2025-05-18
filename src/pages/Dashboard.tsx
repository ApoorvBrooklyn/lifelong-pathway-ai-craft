import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import CareerProgressCard from "@/components/dashboard/CareerProgressCard";
import CourseCard from "@/components/dashboard/CourseCard";
import SkillsRadarChart from "@/components/dashboard/SkillsRadarChart";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/providers/SessionProvider";
// Supabase API calls removed - using local data instead
import { 
  Loader2,
  ChevronRight,
  PlusCircle,
  Briefcase,
  Target,
  Clock,
  School,
  BarChart,
  CheckCircle2,
  Circle,
  Trash2
} from "lucide-react";

// Fallback data
const fallbackSkillsData = [
  { name: "Technical Skills", value: 75, color: "#3182CE" },
  { name: "Communication", value: 60, color: "#38B2AC" },
  { name: "Leadership", value: 45, color: "#4C51BF" },
  { name: "Problem Solving", value: 80, color: "#2C7A7B" },
  { name: "Creativity", value: 55, color: "#2B6CB0" },
];

const fallbackCourses = [
  {
    id: 1,
    title: "Advanced JavaScript Concepts",
    provider: "Udemy",
    duration: "12 weeks",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80",
    url: "#",
    match: 96
  },
  {
    id: 2,
    title: "Leadership for Technical Professionals",
    provider: "Coursera",
    duration: "8 weeks",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=80",
    url: "#",
    match: 92
  },
  {
    id: 3,
    title: "System Design for Web Applications",
    provider: "edX",
    duration: "10 weeks",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&q=80",
    url: "#",
    match: 88
  }
];

interface Assessment {
  id: string;
  user_id: string;
  target_role: string;
  current_role: string;
  experience: string;
  timeframe: string;
  created_at: string;
  assessment_data: any;
  progress?: number;
}

interface Milestone {
  id: string;
  milestone: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dependencies?: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSession();
  // We're not actually using user data, just showing assessments
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(fallbackSkillsData);
  const [courses, setCourses] = useState(fallbackCourses);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Using fallback data instead of fetching from Supabase
    // This ensures the dashboard loads even if Supabase is not available
    console.log("Using fallback data for skills and courses");
    // We'll keep the skills and courses as their default fallback values
    // Only assessments will show loading state
  }, []);

  useEffect(() => {
    const fetchAssessments = async () => {
      // Get user ID from local storage
      let userId = localStorage.getItem('user_id');
      
      if (!userId) {
        console.log("No user ID found in localStorage");
        
        // Try to get assessment ID as fallback
        const assessmentId = localStorage.getItem('latest_assessment_id');
        if (assessmentId) {
          console.log("Found assessment ID, attempting to fetch specific assessment");
          try {
            const response = await fetch(`http://localhost:5000/api/get-assessment/${assessmentId}`);
            if (response.ok) {
              const data = await response.json();
              // If we found an assessment, use its user_id
              if (data && data.user_id) {
                userId = data.user_id;
                localStorage.setItem('user_id', userId);
                console.log("Retrieved user ID from assessment:", userId);
              }
            }
          } catch (e) {
            console.error("Error fetching assessment by ID:", e);
          }
        }
        
        // If still no user ID, create a temporary one for this session
        if (!userId) {
          userId = 'temp_user_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('user_id', userId);
          console.log("Created temporary user ID:", userId);
          setLoading(false);
          return; // No assessments to fetch for new user
        }
      }
      
      try {
        console.log("Fetching assessments for user:", userId);
        const response = await fetch(`http://localhost:5000/api/get-assessments/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }
        
        const data = await response.json();
        console.log("Assessments received:", data.assessments?.length || 0);
        setAssessments(data.assessments || []);
        
      } catch (error) {
        console.error('Error fetching assessments:', error);
        setError("Failed to load assessments");
        toast({
          title: "Error loading assessments",
          description: "There was a problem fetching your saved assessments.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, [toast]);

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleNewAssessment = () => {
    navigate('/assessment');
  };
  
  const handleViewLearningPath = (assessmentId: string) => {
    navigate(`/learning-path/${assessmentId}`);
  };
  
  const handleViewRoadmap = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    
    try {
      // Fetch milestones for the selected assessment
      const response = await fetch(`http://localhost:5000/api/get-assessment/${assessment.id}`);
      if (response.ok) {
        const data = await response.json();
        setMilestones(data.progress || []);
      } else {
        throw new Error('Failed to fetch milestone data');
      }
    } catch (error) {
      console.error('Error fetching milestone data:', error);
      toast({
        title: "Error loading roadmap",
        description: "There was a problem fetching your milestone data.",
        variant: "destructive"
      });
    }
  };
  
  const handleMilestoneStatusChange = async (milestoneId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    try {
      const response = await fetch('http://localhost:5000/api/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress_id: milestoneId,
          status: status,
          notes: ''
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update milestone status');
      }
      
      // Update milestone status locally
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, status } 
            : milestone
        )
      );
      
      toast({
        title: "Progress updated",
        description: "Your milestone progress has been saved.",
      });
      
      // Refresh assessments to update progress indicators
      handleRefreshAssessments();
      
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast({
        title: "Error updating progress",
        description: "There was a problem saving your progress.",
        variant: "destructive"
      });
    }
  };
  
  const calculateOverallProgress = (milestones: Milestone[]) => {
    if (!milestones.length) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length;
    return Math.round((completed + (inProgress * 0.5)) / milestones.length * 100);
  };
  
  const handleRefreshAssessments = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const response = await fetch(`http://localhost:5000/api/get-assessments/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setAssessments(data.assessments || []);
          toast({
            title: "Assessments refreshed",
            description: "Your latest assessments have been loaded."
          });
        }
      } catch (error) {
        console.error('Error refreshing assessments:', error);
        toast({
          title: "Error refreshing assessments",
          description: "There was a problem fetching your assessments.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAssessment = async (assessmentId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent navigating to learning path when clicking delete
    event.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this learning path? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/delete-assessment/${assessmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete assessment');
      }
      
      toast({
        title: "Assessment deleted",
        description: "The learning path has been deleted successfully.",
      });
      
      // Remove the deleted assessment from the state
      setAssessments(prevAssessments => 
        prevAssessments.filter(assessment => assessment.id !== assessmentId)
      );
      
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error deleting assessment",
        description: "There was a problem deleting this learning path.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Your Dashboard</h1>
                <p className="text-muted-foreground">Track your career development journey</p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline" onClick={handleRefreshAssessments}>
                  <Loader2 className="mr-2 h-4 w-4" />
                  Refresh Assessments
                </Button>
                <Button onClick={handleNewAssessment}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your assessments...</p>
              </div>
            ) : assessments.length === 0 ? (
              <Card className="p-12 text-center bg-gray-50">
                <CardContent className="flex flex-col items-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Assessments Yet</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Complete a skills assessment to get personalized learning paths and career recommendations.
                  </p>
                  <Button onClick={handleNewAssessment}>
                    Start Your First Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Your Learning Paths</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {assessments.map((assessment) => {
                    const targetRole = assessment.target_role;
                    const currentRole = assessment.current_role || 'Not specified';
                    const createdAt = new Date(assessment.created_at).toLocaleDateString();
                    
                    // Extract some stats from assessment data
                    const { analysis } = assessment.assessment_data;
                    const milestoneCount = analysis.milestones?.length || 0;
                    const skillGapCount = analysis.skill_gaps?.length || 0;
                    const resourceCount = analysis.resources?.length || 0;
                    
                    return (
                      <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            {targetRole}
                          </CardTitle>
                          <CardDescription>
                            From: {currentRole} • Created: {createdAt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <p className="text-sm text-blue-700 font-medium">{milestoneCount}</p>
                              <p className="text-xs text-blue-600">Milestones</p>
                            </div>
                            <div className="bg-amber-50 p-2 rounded text-center">
                              <p className="text-sm text-amber-700 font-medium">{skillGapCount}</p>
                              <p className="text-xs text-amber-600">Skill Gaps</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-center">
                              <p className="text-sm text-green-700 font-medium">{resourceCount}</p>
                              <p className="text-xs text-green-600">Resources</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-3">
                            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Target timeframe: {assessment.timeframe}
                            </span>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <School className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Experience level: {assessment.experience}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 py-3 flex flex-col gap-2">
                          <div className="flex w-full gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 justify-center"
                              onClick={() => handleViewRoadmap(assessment)}
                            >
                              <BarChart className="h-4 w-4 mr-2" />
                              Track Progress
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="flex-1 justify-center"
                              onClick={() => handleViewLearningPath(assessment.id)}
                            >
                              View Path
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleDeleteAssessment(assessment.id, e)}
                              title="Delete this learning path"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {assessment.progress !== undefined && (
                            <div className="w-full mt-1">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Overall Progress</span>
                                <span>{assessment.progress}%</span>
                              </div>
                              <Progress value={assessment.progress} className="h-1.5" />
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-6">
                <p className="text-red-800">{error}</p>
                <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Roadmap Progress Dialog */}
      <Dialog open={!!selectedAssessment} onOpenChange={(open) => !open && setSelectedAssessment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAssessment?.target_role} - Progress Roadmap
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Milestones</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Overall Progress:</span>
                <span className="font-medium">{calculateOverallProgress(milestones)}%</span>
              </div>
            </div>
            
            <Progress value={calculateOverallProgress(milestones)} className="h-2 mb-6" />
            
            {milestones.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No milestones found for this assessment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 p-3 flex justify-between items-center border-b">
                      <div className="flex items-center">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">
                          {index + 1}
                        </span>
                        <h4 className="font-medium">{milestone.milestone}</h4>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Target: {new Date(milestone.target_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">{milestone.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox 
                              checked={milestone.status === 'in_progress'} 
                              onCheckedChange={() => handleMilestoneStatusChange(milestone.id, 'in_progress')}
                            />
                            <span className="text-sm font-medium">In Progress</span>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox 
                              checked={milestone.status === 'completed'} 
                              onCheckedChange={() => handleMilestoneStatusChange(milestone.id, 'completed')}
                            />
                            <span className="text-sm font-medium">Completed</span>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          {milestone.status === 'not_started' && (
                            <span className="text-gray-500 flex items-center">
                              <Circle className="h-4 w-4 mr-1" />
                              Not Started
                            </span>
                          )}
                          {milestone.status === 'in_progress' && (
                            <span className="text-blue-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M2 12h20" />
                              </svg>
                              In Progress
                            </span>
                          )}
                          {milestone.status === 'completed' && (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
              Close
            </Button>
            <Button onClick={handleRefreshAssessments}>
              Refresh Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
