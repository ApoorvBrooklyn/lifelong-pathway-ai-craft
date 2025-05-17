import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SkillsAssessmentResultsProps {
  analysisData: any;
}

const SkillsAssessmentResults: React.FC<SkillsAssessmentResultsProps> = ({ analysisData }) => {
  // If no analysis data or error, show a message
  if (!analysisData || analysisData.error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-red-600">Analysis Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{analysisData?.error || "No analysis data available"}</p>
          {analysisData?.raw_response && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md overflow-auto max-h-96">
              <h3 className="font-medium mb-2">Raw Response:</h3>
              <pre className="text-sm">{analysisData.raw_response}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Destructure the analysis data
  const { analysis } = analysisData;

  // Process sections into appropriate categories for tabs
  const requiredSkills = analysis.required_skills || [];
  const skillGaps = analysis.skill_gaps || [];
  const learningPath = analysis.learning_path || [];
  const milestones = analysis.milestones || [];
  const resources = analysis.resources || [];
  const riskAssessment = analysis.risk_assessment || [];
  const summary = analysis.summary || {
    title: 'Career Path Analysis',
    overview: 'Analysis of your career path based on your skills and goals.',
    key_findings: []
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle>{summary.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
            <TabsTrigger value="path">Learning Path</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Career Overview</h3>
                <p className="text-gray-700 mb-4">{summary.overview}</p>
                
                {summary.key_findings && summary.key_findings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Key Findings:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {summary.key_findings.map((finding: string, idx: number) => (
                        <li key={idx} className="text-gray-700">{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Risk Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskAssessment.map((risk: any, idx: number) => (
                    <div key={idx} className="bg-red-50 p-4 rounded-md">
                      <h4 className="font-medium text-red-800">{risk.risk}</h4>
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">Mitigation:</span> {risk.mitigation_strategy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Skills Analysis Tab */}
          <TabsContent value="skills" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {requiredSkills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Skill Gaps Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b border-gray-200">
                        <h4 className="font-medium">{gap.skill}</h4>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Current Level</span>
                          <span className="text-sm font-medium">{gap.current_level}</span>
                        </div>
                        <Progress 
                          value={(gap.current_level / gap.target_level) * 100} 
                          className="h-2 mb-3"
                        />
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Target Level</span>
                          <span className="text-sm font-medium">{gap.target_level}</span>
                        </div>
                        <Progress value={100} className="h-2 mb-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="path" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Learning Path</h3>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                  
                  {/* Timeline Items */}
                  <div className="space-y-6 pl-12">
                    {learningPath.map((phase: any, idx: number) => (
                      <div key={idx} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-32px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                          <h4 className="font-medium text-lg">{phase.phase}</h4>
                          <p className="text-gray-600 text-sm mt-1">Duration: {phase.duration} months</p>
                          
                          {phase.skills && phase.skills.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-2">Skills to Learn:</h5>
                              <div className="flex flex-wrap gap-2">
                                {phase.skills.map((skill: string, skillIdx: number) => (
                                  <Badge key={skillIdx} variant="outline" className="bg-blue-50">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-3">Milestones</h3>
                <div className="space-y-3">
                  {milestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-24 text-sm font-medium text-gray-600">
                        {milestone.target_date}
                      </div>
                      <div className="flex-grow p-3 bg-green-50 rounded-md">
                        {milestone.milestone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="p-6">
            <h3 className="text-xl font-semibold mb-3">Recommended Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <h4 className="font-medium text-blue-700 mb-2">{resource.resource}</h4>
                    <p className="text-gray-600 text-sm italic mb-3">{resource.type}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={resource.cost === 'free' ? 'success' : 
                              (resource.cost === 'low' ? 'secondary' : 'default')}>
                        {resource.cost === 'free' ? 'Free' : 
                         resource.cost === 'low' ? 'Low Cost' : 
                         resource.cost === 'medium' ? 'Medium Cost' : 'High Cost'}
                      </Badge>
                      
                      {resource.interactive && (
                        <Badge variant="outline" className="bg-purple-50">
                          Interactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Debug Panel - Collapsible Raw Data */}
        <details className="border-t border-gray-200 p-4 text-sm">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
            View Raw Analysis Data
          </summary>
          <pre className="mt-2 p-3 bg-gray-50 rounded-md overflow-auto max-h-96 text-xs">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default SkillsAssessmentResults; 