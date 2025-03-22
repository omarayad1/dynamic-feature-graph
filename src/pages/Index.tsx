
import React from "react";
import Dashboard from "@/components/Dashboard";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container py-8 px-4 mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trading Bot Dashboard</h1>
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
