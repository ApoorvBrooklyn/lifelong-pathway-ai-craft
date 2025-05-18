import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  FileText,
  BookOpen,
  CalendarClock,
  Loader2,
  ChevronLeft,
  ExternalLink,
  Trophy,
  Target,
  Calendar,
  Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface ProgressItem {
  id: string;
  assessment_id: string;
  milestone_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes: string;
  completed_at: string | null;
  created_at: string;
}

interface Milestone {
  id: string;
  milestone: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dependencies?: string[];
}

interface LearningPathResource {
  resource: string;
  type: string;
  cost: string;
  interactive: boolean;
}

interface LearningPathPhase {
  phase: string;
  duration: number;
  skills: string[];
}

interface Resource {
  title: string;
  type: string;
  url: string;
  description: string;
  difficulty: string;
  estimated_time: string;
}

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

const LearningPath = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!assessmentId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/get-assessment/${assessmentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment data (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        // Set assessment data
        setAssessment(data.assessment);
        
        // Set progress/milestones
        setMilestones(data.progress || []);
        
        // Set learning path
        setLearningPath(data.learning_path || []);
        
        // Set skill gaps
        setSkillGaps(data.skill_gaps || []);
        
        // Set resources (combine resources from all sources)
        const allResources = [];
        if (data.assessment?.assessment_data?.analysis?.resources) {
          allResources.push(...data.assessment.assessment_data.analysis.resources);
        }
        setResources(allResources);
        
        // Calculate overall progress
        if (data.overall_progress !== undefined) {
          setOverallProgress(data.overall_progress);
        } else if (data.progress && data.progress.length > 0) {
          const completed = data.progress.filter((m: any) => m.status === 'completed').length;
          const inProgress = data.progress.filter((m: any) => m.status === 'in_progress').length;
          const calculatedProgress = (completed + (inProgress * 0.5)) / data.progress.length * 100;
          setOverallProgress(Math.round(calculatedProgress));
        }
        
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setError(`Error loading learning path data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast({
          title: "Error loading learning path",
          description: "There was a problem fetching your learning path data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, [assessmentId, toast]);

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
      
      // Recalculate overall progress
      const updatedMilestones = milestones.map(m => 
        m.id === milestoneId ? { ...m, status } : m
      );
      const completed = updatedMilestones.filter(m => m.status === 'completed').length;
      const inProgress = updatedMilestones.filter(m => m.status === 'in_progress').length;
      const newProgress = updatedMilestones.length > 0 
        ? Math.round((completed + (inProgress * 0.5)) / updatedMilestones.length * 100)
        : 0;
      setOverallProgress(newProgress);
      
      toast({
        title: "Progress updated",
        description: "Your milestone progress has been saved.",
      });
      
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast({
        title: "Error updating progress",
        description: "There was a problem saving your progress.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePath = async () => {
    if (!assessmentId) return;
    
    if (!confirm("Are you sure you want to delete this learning path? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/delete-assessment/${assessmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete learning path (Status: ${response.status})`);
      }
      
      toast({
        title: "Learning path deleted",
        description: "Your learning path has been deleted successfully.",
      });
      
      // Navigate back to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error deleting learning path:', error);
      toast({
        title: "Error deleting learning path",
        description: "There was a problem deleting your learning path.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your learning path...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <div className="mt-4">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                  onClick={handleDeletePath}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Learning Path
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-3xl font-bold">Learning Path: {assessment?.target_role}</h1>
                  <p className="text-muted-foreground">From {assessment?.current_role || 'Current Role'} to {assessment?.target_role}</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className="mr-4">
                    <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                    <div className="flex items-center">
                      <Progress value={overallProgress} className="w-40 h-2 mr-2" />
                      <span className="font-medium">{overallProgress}%</span>
                    </div>
                  </div>
                  
                  <Badge variant={
                    overallProgress < 25 ? "outline" : 
                    overallProgress < 50 ? "secondary" : 
                    overallProgress < 75 ? "default" : 
                    "success"
                  }>
                    {overallProgress < 25 ? "Just Started" : 
                     overallProgress < 50 ? "In Progress" : 
                     overallProgress < 75 ? "Well Underway" : 
                     "Almost Complete"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="milestones" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="milestones">
                  <Trophy className="mr-2 h-4 w-4" />
                  Milestones
                </TabsTrigger>
                <TabsTrigger value="skills">
                  <Target className="mr-2 h-4 w-4" />
                  Skill Gaps
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Resources
                </TabsTrigger>
              </TabsList>
              
              {/* Milestones Tab */}
              <TabsContent value="milestones">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Career Milestones</CardTitle>
                    <CardDescription>Track your progress through key achievements on your path to {assessment?.target_role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {milestones.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No milestones found for this learning path.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {milestones.map((milestone, index) => (
                          <div key={milestone.id} className="border rounded-lg overflow-hidden">
                            <div className="bg-slate-50 p-3 flex justify-between items-center border-b">
                              <div className="flex items-center">
                                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">
                                  {index + 1}
                                </span>
                                <h3 className="font-medium">{milestone.milestone}</h3>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                                <span className="text-sm text-muted-foreground">
                                  {new Date(milestone.target_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <p className="text-gray-600 mb-4">{milestone.description}</p>
                              
                              <div className="flex flex-wrap justify-between items-center">
                                <div className="space-x-4 mb-2 md:mb-0">
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
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Skill Gaps Tab */}
              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Gaps Analysis</CardTitle>
                    <CardDescription>Key skills to develop on your journey to {assessment?.target_role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {skillGaps.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No skill gaps analysis found for this learning path.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skillGaps.map((gap, index) => (
                          <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                            <div className="bg-gray-50 p-3 border-b border-gray-200">
                              <h3 className="font-medium">{gap.skill}</h3>
                              <p className="text-sm text-gray-600 mt-1">{gap.gap}</p>
                            </div>
                            <div className="p-4">
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-500">Current Level</span>
                                  <span className="text-sm font-medium">{gap.current_score}%</span>
                                </div>
                                <Progress value={gap.current_score} className="h-2 mb-3" />
                                
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-500">Target Level</span>
                                  <span className="text-sm font-medium">{gap.target_score}%</span>
                                </div>
                                <Progress value={gap.target_score} className="h-2" />
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <Badge variant={gap.priority === 'high' ? "default" : "secondary"}>
                                  {gap.priority === 'high' ? 'High Priority' : 
                                   gap.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                </Badge>
                                
                                <span className="text-sm text-muted-foreground">
                                  {gap.target_score - gap.current_score}% gap
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Resources Tab */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Learning Resources</CardTitle>
                    <CardDescription>Curated resources to help you develop the necessary skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resources.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No resources found for this learning path.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.map((resource, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4">
                              <h3 className="font-medium text-blue-700 mb-2">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-900 flex items-center"
                                >
                                  {resource.title}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </h3>
                              <p className="text-gray-600 text-sm italic mb-2">{resource.type}</p>
                              <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-auto">
                                <Badge variant="secondary">
                                  {resource.difficulty}
                                </Badge>
                                <Badge variant="outline" className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {resource.estimated_time}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t p-4 bg-slate-50">
                    <p className="text-sm text-muted-foreground">
                      Resources are curated based on your skills assessment and target role.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LearningPath; 