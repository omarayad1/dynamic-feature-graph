
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeatures, generateMockFeatureData, FeatureData } from "@/lib/api";
import FeatureCard from "./FeatureCard";
import { toast } from "sonner";
import { RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// The interval to fetch new data (in milliseconds)
const REFRESH_INTERVAL = 10000;

const Dashboard: React.FC = () => {
  const [useMockData, setUseMockData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query for fetching feature data
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['features'],
    queryFn: useMockData ? generateMockFeatureData : fetchFeatures,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: false,
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  // Effect to start with mock data and try real API after 1 second
  useEffect(() => {
    if (useMockData) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('/api/features');
          if (response.ok) {
            setUseMockData(false);
            toast.success("Connected to live API");
          }
        } catch (error) {
          console.log("API not available, using mock data");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [useMockData]);

  // Transform data to array for easier rendering
  const features = data ? Object.entries(data).map(([key, value]) => ({
    title: key,
    data: value
  })) : [];

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Feature Metrics</h1>
          <p className="text-muted-foreground">
            Real-time visualization of your system features and performance metrics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md transition-all",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              (isLoading || isRefreshing) && "opacity-70 cursor-not-allowed"
            )}
          >
            <RefreshCw size={16} className={cn(
              "transition-transform",
              isRefreshing && "animate-spin"
            )} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2 bg-muted px-3 py-1.5 rounded-md text-sm">
            <Activity size={14} className={cn(
              "text-primary",
              useMockData ? "animate-pulse" : ""
            )} />
            <span className="text-muted-foreground">
              {useMockData ? "Demo Mode" : "Live Data"}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div 
              key={`skeleton-${index}`} 
              className="h-[240px] rounded-lg bg-card/50 shimmer animate-pulse"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-destructive/20 bg-destructive/5 text-center">
          <h3 className="text-xl font-medium text-destructive mb-2">Failed to load data</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Feature Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ title, data }, index) => (
            <FeatureCard
              key={title}
              title={title}
              data={data}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Status Footer */}
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span>
          Next refresh in {Math.ceil(REFRESH_INTERVAL / 1000)}s
        </span>
        <span>
          {useMockData 
            ? "Using simulated data" 
            : "Connected to /api/features"}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
