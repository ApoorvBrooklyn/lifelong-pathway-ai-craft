import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const roadmapList = [
  {
    id: "data-science",
    title: "Data Science & Analytics",
    description: "A comprehensive roadmap for becoming a proficient data scientist",
    icon: "📊",
    skills: ["Python", "Statistical Analysis", "Machine Learning", "Data Visualization"],
    color: "#7B1FA2",
  },
  {
    id: "software-eng",
    title: "Software Engineering",
    description: "A guided pathway to becoming a well-rounded software engineer",
    icon: "💻",
    skills: ["JavaScript", "Cloud Services", "System Design", "DevOps"],
    color: "#E64A19",
  },
  {
    id: "ux-design",
    title: "UX/UI Design",
    description: "A structured path for becoming a skilled UX/UI designer",
    icon: "🎨",
    skills: ["User Research", "Wireframing", "Prototyping", "Visual Design"],
    color: "#00796B",
  },
  {
    id: "web-dev",
    title: "Web Development",
    description: "Master full-stack web development from frontend to backend",
    icon: "🌐",
    skills: ["HTML/CSS", "JavaScript", "React", "Node.js"],
    color: "#1976D2",
  },
  {
    id: "cyber-security",
    title: "Cyber Security",
    description: "Protect systems and networks from digital attacks",
    icon: "🔒",
    skills: ["Network Security", "Ethical Hacking", "Cryptography", "Security Analysis"],
    color: "#C62828",
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing",
    description: "Build and manage applications in the cloud",
    icon: "☁️",
    skills: ["AWS/Azure/GCP", "Containers", "Serverless", "Microservices"],
    color: "#0277BD",
  },
];

const StandardRoadmaps = () => {
  return (
    <div>
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Standard Career Roadmaps</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore our curated collection of career roadmaps to help you navigate your professional journey.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roadmapList.map((roadmap) => (
                <Card 
                  key={roadmap.id} 
                  className="overflow-hidden transition-all hover:shadow-lg"
                >
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: roadmap.color }}
                  ></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div 
                        className="flex items-center justify-center text-2xl w-10 h-10 rounded-full mr-3"
                        style={{ backgroundColor: `${roadmap.color}20` }}
                      >
                        {roadmap.icon}
                      </div>
                      <h2 className="text-xl font-semibold">{roadmap.title}</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {roadmap.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {roadmap.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button asChild>
                        <Link to={`/standard-roadmap/${roadmap.id}`}>
                          Explore Roadmap
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StandardRoadmaps; 