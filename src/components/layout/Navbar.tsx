import { useState , useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, User, Box, MessageSquareText } from "lucide-react";
import { useSession } from "@/providers/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [webXRSupported, setWebXRSupported] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr')
        .then((supported: boolean) => setWebXRSupported(supported))
        .catch(() => setWebXRSupported(false));
    }
  }, []);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  const launchCareerPaths = (e) => {
    e.preventDefault();
    navigate("/career-paths");
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

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
            <Link to="/assessment" className="text-foreground hover:text-primary font-medium">Skills and Gap Analysis</Link> 
           <Button 
              onClick={launchCareerPaths} 
              variant="ghost" 
              className="flex items-center font-medium"
            >
              <Box className="h-4 w-4 mr-1" />
              VR Career path
            </Button>

            <Link to="/learning" className="text-foreground hover:text-primary font-medium">Self Assessment</Link>
            
            <Link to="/learn-with-ai" className="text-foreground hover:text-primary font-medium flex items-center">
              <MessageSquareText className="h-4 w-4 mr-1" />
              Learn With AI
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="outline" className="ml-2">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
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
              <Button
                onClick={(e) => {
                  launchCareerPaths(e);
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="text-foreground hover:text-primary font-medium flex items-center justify-start px-3 py-2 w-full"
              >
                <Box className="h-4 w-4 mr-1" />
                Career Paths
              </Button>
              <Link 
                to="/learning" 
                className="text-foreground hover:text-primary font-medium block px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learning
              </Link>
              <Link 
                to="/learn-with-ai" 
                className="text-foreground hover:text-primary font-medium flex items-center px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquareText className="h-4 w-4 mr-1" />
                Learn With AI
              </Link>
              <div className="flex flex-col space-y-2 px-3 pt-2">
                {user ? (
                  <>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
