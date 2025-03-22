
import React from "react";
import Dashboard from "@/components/Dashboard";
import NavBar from "@/components/NavBar";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <NavBar />
      <main className="container py-8 px-4 mx-auto">
        <Dashboard />
      </main>
      <footer className="container mx-auto p-4 text-center text-sm text-muted-foreground">
        <p>
          Trading Bot Dashboard © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default Index;
