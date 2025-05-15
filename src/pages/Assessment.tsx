
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import SkillsRadarChart from "@/components/dashboard/SkillsRadarChart";

// Mock data for radar chart
const skillsData = [
  { name: "Technical Skills", value: 75, color: "#3182CE" },
  { name: "Communication", value: 60, color: "#38B2AC" },
  { name: "Leadership", value: 45, color: "#4C51BF" },
  { name: "Problem Solving", value: 80, color: "#2C7A7B" },
  { name: "Creativity", value: 55, color: "#2B6CB0" },
];

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
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
                          />
                        </div>
                        <div>
                          <label htmlFor="experience" className="block text-sm font-medium mb-1">
                            Years of Experience
                          </label>
                          <select
                            id="experience"
                            className="w-full p-2 border border-border rounded-md"
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
                            className="w-full p-2 border border-border rounded-md"
                            rows={3}
                            placeholder="List your technical skills (e.g. JavaScript, React, SQL)"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Soft Skills
                          </label>
                          <textarea
                            className="w-full p-2 border border-border rounded-md"
                            rows={3}
                            placeholder="List your soft skills (e.g. Communication, Problem-solving)"
                          ></textarea>
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
                          />
                        </div>
                        <div>
                          <label htmlFor="timeframe" className="block text-sm font-medium mb-1">
                            Target Timeframe
                          </label>
                          <select
                            id="timeframe"
                            className="w-full p-2 border border-border rounded-md"
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
                            What interests you most about this role?
                          </label>
                          <textarea
                            className="w-full p-2 border border-border rounded-md"
                            rows={3}
                            placeholder="Describe what attracts you to this career path"
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
                              <input type="radio" name="learning-style" className="mr-2" />
                              <span>Visual Learning</span>
                            </label>
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input type="radio" name="learning-style" className="mr-2" />
                              <span>Reading/Writing</span>
                            </label>
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input type="radio" name="learning-style" className="mr-2" />
                              <span>Interactive/Hands-on</span>
                            </label>
                            <label className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                              <input type="radio" name="learning-style" className="mr-2" />
                              <span>Audio/Video</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Weekly Time Commitment
                          </label>
                          <select
                            className="w-full p-2 border border-border rounded-md"
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
                            className="w-full p-2 border border-border rounded-md"
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
                    <Button onClick={handleNext}>
                      {currentStep < totalSteps ? "Next" : "Submit"}
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
                            <SkillsRadarChart data={skillsData} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-3">Assessment Summary</h3>
                            <p className="text-muted-foreground mb-4">
                              Based on your profile, you have strong technical skills particularly in frontend development. 
                              Your problem-solving abilities are excellent, but there are opportunities to develop leadership 
                              and strategic communication skills to reach your career goals.
                            </p>
                            <h4 className="font-medium mb-2">Recommended Focus Areas:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Team leadership and management</li>
                              <li>Technical communication with non-technical stakeholders</li>
                              <li>Advanced React patterns and architecture</li>
                            </ul>
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
