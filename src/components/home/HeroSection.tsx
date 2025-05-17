
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="hero-gradient pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Your AI Partner for <span className="text-primary">Lifelong</span> Career Growth
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Use AI to assess your skills, discover optimal career paths, and access personalized learning recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="text-base">
                <Link to="/assessment">Start Skill Assessment</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/career-paths">Explore VR based Career Paths</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute w-64 h-64 bg-secondary/20 rounded-full -top-10 -left-10 animate-pulse-slow"></div>
            <div className="absolute w-48 h-48 bg-primary/20 rounded-full bottom-10 right-0 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
            <img 
              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80" 
              alt="Professional using AI career guidance" 
              className="w-full h-auto rounded-lg shadow-lg relative z-10 animate-float"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
