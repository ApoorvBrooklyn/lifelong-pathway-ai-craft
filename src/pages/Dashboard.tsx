import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CareerProgressCard from "@/components/dashboard/CareerProgressCard";
import CourseCard from "@/components/dashboard/CourseCard";
import SkillsRadarChart from "@/components/dashboard/SkillsRadarChart";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/providers/SessionProvider";
import { getUserProfile, getRecommendedCourses, getUserSkills, getCareerProgress } from "@/integrations/supabase/api";
import { 
  Loader2,
  ChevronRight,
  PlusCircle,
  Briefcase,
  Target,
  Clock,
  School
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
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSession();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(fallbackSkillsData);
  const [courses, setCourses] = useState(fallbackCourses);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if user is available
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch user profile
          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
          
          // Fetch skills data
          const skillsData = await getUserSkills(user.id);
          if (skillsData && skillsData.length > 0) {
            const formattedSkills = skillsData.map(skill => ({
              name: skill.name,
              value: skill.value,
              color: skill.color || "#3182CE" // Fallback color
            }));
            setSkills(formattedSkills);
          }
          
          // Fetch recommended courses
          const coursesData = await getRecommendedCourses(user.id);
          if (coursesData && coursesData.length > 0) {
            setCourses(coursesData);
          }
          
          // Fetch career paths
          const careerData = await getCareerProgress(user.id);
          if (careerData) {
            setCareerPaths(careerData);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          toast({
            title: "Error loading data",
            description: "There was a problem loading your dashboard data.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [user, toast]);

  useEffect(() => {
    const fetchAssessments = async () => {
      // Get user ID from local storage
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        setLoading(false);
        return; // No assessments to fetch
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/get-assessments/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }
        
        const data = await response.json();
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
              <Button className="mt-4 md:mt-0" onClick={handleNewAssessment}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
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
                        <CardFooter className="bg-slate-50 py-3">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-between"
                            onClick={() => handleViewLearningPath(assessment.id)}
                          >
                            View Learning Path
                            <ChevronRight className="h-4 w-4" />
                          </Button>
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
    </div>
  );
};

export default Dashboard;
