
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error handling auth callback:", error);
        navigate("/login");
        return;
      }
      
      navigate("/dashboard");
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we complete the sign in process.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
