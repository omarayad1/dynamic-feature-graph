
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Settings, Home } from "lucide-react";

const NavBar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-lg">Trading Bot</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant={location.pathname === "/strategy" ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/strategy">
                  <Settings className="mr-2 h-4 w-4" />
                  Strategy Settings
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
