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
  CardDescription 
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
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  milestone: string;
  target_date: string;
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

const LearningPath = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  
  // Calculate overall progress
  const calculateProgress = () => {
    if (!progress.length) return 0;
    const completed = progress.filter(item => item.status === 'completed').length;
    return Math.round((completed / progress.length) * 100);
  };

  // Update progress status
  const updateProgressStatus = async (progressId: string, newStatus: 'not_started' | 'in_progress' | 'completed', notes: string = '') => {
    try {
      const response = await fetch('http://localhost:5000/api/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress_id: progressId,
          status: newStatus,
          notes: notes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      // Update local state
      setProgress(prev => 
        prev.map(item => 
          item.id === progressId 
            ? { ...item, status: newStatus, notes: notes, completed_at: newStatus === 'completed' ? new Date().toISOString() : null } 
            : item
        )
      );
      
      toast({
        title: "Progress updated",
        description: `Milestone marked as ${newStatus.replace('_', ' ')}.`,
      });
      
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Failed to update progress",
        description: "There was a problem updating your progress.",
        variant: "destructive"
      });
    }
  };

  // Fetch assessment and progress data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No assessment ID provided");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/get-assessment/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assessment data');
        }
        
        const data = await response.json();
        setAssessment(data.assessment);
        setProgress(data.progress);
        
      } catch (error) {
        console.error('Error fetching assessment:', error);
        setError("Failed to load learning path data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading your learning path...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div>
        <Navbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error || "Failed to load learning path"}</p>
                <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const assessmentData = assessment.assessment_data;
  const analysis = assessmentData.analysis;
  const targetRole = assessment.target_role;
  const overallProgress = calculateProgress();
  
  const milestones: Milestone[] = analysis.milestones || [];
  const learningPath: LearningPathPhase[] = analysis.learning_path || [];
  const resources: LearningPathResource[] = analysis.resources || [];

  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">{targetRole} Learning Path</h1>
                <p className="text-muted-foreground">Created on {new Date(assessment.created_at).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button variant="outline" className="mr-2" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  Track your learning journey towards becoming a {targetRole}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall completion</span>
                    <span className="text-sm font-medium">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="mr-4 bg-blue-100 p-3 rounded-full">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target Timeframe</p>
                          <p className="text-xl font-semibold">{assessment.timeframe}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="mr-4 bg-green-100 p-3 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Completed Milestones</p>
                          <p className="text-xl font-semibold">
                            {progress.filter(p => p.status === 'completed').length} / {progress.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="mr-4 bg-purple-100 p-3 rounded-full">
                          <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Learning Resources</p>
                          <p className="text-xl font-semibold">{resources.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="milestones" className="mb-8">
              <TabsList className="grid grid-cols-3 w-full mb-8">
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="path">Learning Path</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="milestones">
                <h2 className="text-2xl font-bold mb-6">Key Milestones</h2>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => {
                    const progressItem = progress.find(p => p.milestone_id === milestone.milestone.replace(' ', '_').toLowerCase());
                    const status = progressItem ? progressItem.status : 'not_started';
                    
                    return (
                      <Card key={index} className={`border-l-4 ${
                        status === 'completed' ? 'border-l-green-500' : 
                        status === 'in_progress' ? 'border-l-blue-500' : 
                        'border-l-gray-300'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start space-x-3">
                              {status === 'completed' && (
                                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                              )}
                              {status === 'in_progress' && (
                                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                              )}
                              {status === 'not_started' && (
                                <Circle className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                              )}
                              
                              <div>
                                <h3 className="text-lg font-medium">{milestone.milestone}</h3>
                                <p className="text-muted-foreground flex items-center mt-1">
                                  <CalendarClock className="h-4 w-4 mr-1" />
                                  Target: {milestone.target_date}
                                </p>
                                {progressItem?.notes && (
                                  <p className="mt-2 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                    {progressItem.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 flex space-x-2">
                              {status !== 'completed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() => progressItem && updateProgressStatus(progressItem.id, 'completed')}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              
                              {status !== 'in_progress' && status !== 'completed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600"
                                  onClick={() => progressItem && updateProgressStatus(progressItem.id, 'in_progress')}
                                >
                                  Start
                                </Button>
                              )}
                              
                              {status === 'completed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-gray-600"
                                  onClick={() => progressItem && updateProgressStatus(progressItem.id, 'in_progress')}
                                >
                                  Mark Incomplete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="path">
                <h2 className="text-2xl font-bold mb-6">Learning Path Phases</h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                  
                  {/* Timeline Items */}
                  <div className="space-y-8 pl-12 md:pl-16">
                    {learningPath.map((phase, index) => (
                      <div key={index} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-32px] md:left-[-40px] top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>{phase.phase}</CardTitle>
                            <CardDescription>Duration: {phase.duration} months</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <h4 className="font-medium mb-2">Skills to Learn:</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.skills.map((skill, skillIdx) => (
                                <Badge key={skillIdx} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Related Milestones:</h4>
                              <ul className="space-y-2">
                                {milestones
                                  .filter(m => m.target_date.includes(`Month ${index * phase.duration + phase.duration}`))
                                  .map((milestone, midx) => {
                                    const progressItem = progress.find(p => p.milestone_id === milestone.milestone.replace(' ', '_').toLowerCase());
                                    const status = progressItem ? progressItem.status : 'not_started';
                                    
                                    return (
                                      <li key={midx} className="flex items-center">
                                        {status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />}
                                        {status === 'in_progress' && <Clock className="h-4 w-4 text-blue-600 mr-2" />}
                                        {status === 'not_started' && <Circle className="h-4 w-4 text-gray-400 mr-2" />}
                                        <span>{milestone.milestone}</span>
                                      </li>
                                    );
                                  })}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resources">
                <h2 className="text-2xl font-bold mb-6">Recommended Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource, index) => (
                    <Card key={index} className="overflow-hidden h-full">
                      <div className={`h-2 ${
                        resource.type.includes('course') ? 'bg-blue-500' :
                        resource.type.includes('book') ? 'bg-purple-500' :
                        resource.type.includes('practice') ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">{resource.resource}</h3>
                        <div className="flex items-center mb-3">
                          <Badge variant="outline" className="mr-2">
                            {resource.type}
                          </Badge>
                          <Badge variant={
                            resource.cost === 'free' ? 'secondary' :
                            resource.cost === 'low' ? 'outline' :
                            'default'
                          } className={
                            resource.cost === 'free' ? 'bg-green-100 text-green-800' :
                            resource.cost === 'low' ? 'bg-blue-100 text-blue-800' :
                            resource.cost === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {resource.cost === 'free' ? 'Free' :
                             resource.cost === 'low' ? 'Low Cost' :
                             resource.cost === 'medium' ? 'Medium Cost' : 'High Cost'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          {resource.interactive ? (
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                              Interactive
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-500 mr-1" />
                              Self-paced
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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