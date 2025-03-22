
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchFeatures, generateMockFeatureData, FeatureData,
  fetchPosition, generateMockPositionData,
  fetchOrders, generateMockOrdersData,
  fetchStrategyConfig, generateMockStrategyConfig
} from "@/lib/api";
import FeatureCard from "./FeatureCard";
import PositionPanel from "./PositionPanel";
import OrdersPanel from "./OrdersPanel";
import StrategyPanel from "./StrategyPanel";
import { toast } from "sonner";
import { RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

// The interval to fetch new data (in milliseconds)
const REFRESH_INTERVAL = 10000;

const Dashboard: React.FC = () => {
  const [useMockData, setUseMockData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query for fetching feature data
  const { 
    data: featureData, 
    isLoading: isLoadingFeatures, 
    error: featureError, 
    isError: isFeatureError, 
    refetch: refetchFeatures 
  } = useQuery({
    queryKey: ['features'],
    queryFn: useMockData ? generateMockFeatureData : fetchFeatures,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: false,
  });

  // Query for fetching position data
  const { 
    data: positionData, 
    isLoading: isLoadingPosition,
    refetch: refetchPosition
  } = useQuery({
    queryKey: ['position'],
    queryFn: useMockData ? generateMockPositionData : fetchPosition,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: false,
  });

  // Query for fetching orders data
  const { 
    data: ordersData, 
    isLoading: isLoadingOrders,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: useMockData ? generateMockOrdersData : fetchOrders,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: false,
  });

  // Query for fetching strategy config
  const { 
    data: strategyData, 
    isLoading: isLoadingStrategy,
    refetch: refetchStrategy
  } = useQuery({
    queryKey: ['strategy'],
    queryFn: useMockData ? generateMockStrategyConfig : fetchStrategyConfig,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: false,
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchFeatures(),
      refetchPosition(),
      refetchOrders(),
      refetchStrategy()
    ]);
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

  // Transform feature data to array for easier rendering
  const features = featureData ? Object.entries(featureData).map(([key, value]) => ({
    title: key,
    data: value
  })) : [];

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Trading Bot Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your trading bot metrics and performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoadingFeatures || isRefreshing}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md transition-all",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              (isLoadingFeatures || isRefreshing) && "opacity-70 cursor-not-allowed"
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
      {isLoadingFeatures && !featureData && (
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
      {isFeatureError && (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-destructive/20 bg-destructive/5 text-center">
          <h3 className="text-xl font-medium text-destructive mb-2">Failed to load data</h3>
          <p className="text-muted-foreground mb-4">
            {featureError instanceof Error ? featureError.message : "An unknown error occurred"}
          </p>
          <button
            onClick={() => refetchFeatures()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Dashboard Layout */}
      {featureData && (
        <ResizablePanelGroup direction="vertical" className="min-h-[85vh] rounded-lg border">
          {/* Trading Metrics Section */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Trading Metrics</h2>
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
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Trading Information Section */}
          <ResizablePanel defaultSize={60}>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Trading Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PositionPanel 
                  position={positionData} 
                  loading={isLoadingPosition}
                  index={0}
                />
                <OrdersPanel 
                  orders={ordersData || []} 
                  loading={isLoadingOrders}
                  index={1}
                />
                <StrategyPanel 
                  strategy={strategyData} 
                  loading={isLoadingStrategy}
                  index={2}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {/* Status Footer */}
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span>
          Next refresh in {Math.ceil(REFRESH_INTERVAL / 1000)}s
        </span>
        <span>
          {useMockData 
            ? "Using simulated data" 
            : "Connected to API endpoints"}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
