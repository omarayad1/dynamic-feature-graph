
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className={cn(
        "text-center glassmorphism p-8 rounded-xl shadow-glass",
        "transform transition-all animate-scale-in"
      )}>
        <h1 className="text-5xl font-semibold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          The page you're looking for doesn't exist
        </p>
        <a 
          href="/" 
          className={cn(
            "inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors duration-300",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
