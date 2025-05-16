import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CareerProgressCard from "@/components/dashboard/CareerProgressCard";
import CourseCard from "@/components/dashboard/CourseCard";
import SkillsRadarChart from "@/components/dashboard/SkillsRadarChart";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/providers/SessionProvider";
import { getUserProfile, getRecommendedCourses, getUserSkills, getCareerProgress } from "@/integrations/supabase/api";

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

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useSession();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(fallbackSkillsData);
  const [courses, setCourses] = useState(fallbackCourses);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-8">
            <h1 className="text-3xl font-bold">Your Career Dashboard</h1>
            <p className="text-muted-foreground">Last updated: {getFormattedDate()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Career Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : careerPaths.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {careerPaths.map((path, index) => (
                      <CareerProgressCard
                        key={index}
                        title={path.title}
                        currentLevel={path.current_level}
                        nextLevel={path.next_level}
                        progress={path.progress}
                        skillsNeeded={path.skills_needed}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CareerProgressCard
                      title="Frontend Development"
                      currentLevel="Mid-Level Developer"
                      nextLevel="Senior Developer"
                      progress={65}
                      skillsNeeded={["Advanced React Patterns", "System Architecture", "Team Leadership"]}
                    />
                    <CareerProgressCard
                      title="Technical Leadership"
                      currentLevel="Individual Contributor"
                      nextLevel="Tech Lead"
                      progress={40}
                      skillsNeeded={["Mentoring", "Project Planning", "Cross-team Communication"]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Skill Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <SkillsRadarChart data={skills} />
                    <div className="mt-6 text-center">
                      <Button asChild variant="outline" size="sm">
                        <a href="/assessment">Update Skills Assessment</a>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Learning Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="courses">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="mentors">Mentorship</TabsTrigger>
                </TabsList>
                <TabsContent value="courses">
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {courses.map((course) => (
                          <CourseCard
                            key={course.id}
                            title={course.title}
                            provider={course.provider}
                            duration={course.duration}
                            level={course.level}
                            image={course.image}
                            url={course.url}
                            match={course.match}
                          />
                        ))}
                      </div>
                      <div className="mt-6 text-center">
                        <Button variant="outline">View All Recommendations</Button>
                      </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="projects">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-3">Complete your skills assessment to get project recommendations</p>
                    <Button asChild>
                      <a href="/assessment">Take Skills Assessment</a>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="mentors">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-3">Mentorship matching coming soon!</p>
                    <Button disabled>Join Waitlist</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-3">Start a course to track your learning progress</p>
                <Button asChild>
                  <a href="#courses">Browse Courses</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
