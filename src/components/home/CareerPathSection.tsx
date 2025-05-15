
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const careerPaths = [
  {
    id: 1,
    title: "Data Science & Analytics",
    skills: ["Python", "Statistical Analysis", "Machine Learning", "Data Visualization"],
    jobCount: 15000,
  },
  {
    id: 2,
    title: "Software Engineering",
    skills: ["JavaScript", "Cloud Services", "System Design", "DevOps"],
    jobCount: 28000,
  },
  {
    id: 3,
    title: "UX/UI Design",
    skills: ["User Research", "Wireframing", "Prototyping", "Visual Design"],
    jobCount: 9500,
  },
];

const CareerPathSection = () => {
  return (
    <section className="py-16 md:py-24 career-path-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Career Paths</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore in-demand career trajectories and understand what skills you need to develop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {careerPaths.map((path) => (
            <Card key={path.id} className="border border-border hover:shadow-lg transition-all overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">{path.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {path.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">{path.jobCount.toLocaleString()} open positions</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/paths/${path.id}`}>Explore Path</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/paths">View All Career Paths</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CareerPathSection;
