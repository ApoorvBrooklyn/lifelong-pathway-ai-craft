
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Calendar, ChartLine } from "lucide-react";

const features = [
  {
    title: "AI Skill Assessment",
    description: "Get a comprehensive analysis of your current skills and identify gaps relevant to your career aspirations.",
    icon: ChartLine,
  },
  {
    title: "Personalized Learning Paths",
    description: "Receive custom learning recommendations based on your skill profile and career objectives.",
    icon: GraduationCap,
  },
  {
    title: "Career Pathway Mapping",
    description: "Visualize potential career trajectories and understand the skills needed for each advancement step.",
    icon: Calendar,
  },
  {
    title: "Learning Progress Tracking",
    description: "Monitor your learning journey and celebrate milestone achievements as you develop new skills.",
    icon: BookOpen,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 feature-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How CareerPath AI Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform helps you build a strategic career plan with continuous learning opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
