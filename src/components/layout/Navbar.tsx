
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 py-4 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">CareerPath AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary font-medium">Home</Link>
            <Link to="/assessment" className="text-foreground hover:text-primary font-medium">Skills Assessment</Link>
            <Link to="/paths" className="text-foreground hover:text-primary font-medium">Career Paths</Link>
            <Link to="/learning" className="text-foreground hover:text-primary font-medium">Learning</Link>
            <Button asChild variant="outline" className="ml-2">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-3 pb-3 pt-2">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary font-medium block px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/assessment" 
                className="text-foreground hover:text-primary font-medium block px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Skills Assessment
              </Link>
              <Link 
                to="/paths" 
                className="text-foreground hover:text-primary font-medium block px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Career Paths
              </Link>
              <Link 
                to="/learning" 
                className="text-foreground hover:text-primary font-medium block px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learning
              </Link>
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button 
                  asChild 
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
