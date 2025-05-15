
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CareerProgressCard from "@/components/dashboard/CareerProgressCard";
import CourseCard from "@/components/dashboard/CourseCard";
import SkillsRadarChart from "@/components/dashboard/SkillsRadarChart";

// Mock data for radar chart
const skillsData = [
  { name: "Technical Skills", value: 75, color: "#3182CE" },
  { name: "Communication", value: 60, color: "#38B2AC" },
  { name: "Leadership", value: 45, color: "#4C51BF" },
  { name: "Problem Solving", value: 80, color: "#2C7A7B" },
  { name: "Creativity", value: 55, color: "#2B6CB0" },
];

// Mock courses data
const recommendedCourses = [
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
  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-8">
            <h1 className="text-3xl font-bold">Your Career Dashboard</h1>
            <p className="text-muted-foreground">Last updated: May 15, 2025</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Career Progress</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Skill Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillsRadarChart data={skillsData} />
                <div className="mt-6 text-center">
                  <Button asChild variant="outline" size="sm">
                    <a href="/assessment">Update Skills Assessment</a>
                  </Button>
                </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendedCourses.map((course) => (
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
