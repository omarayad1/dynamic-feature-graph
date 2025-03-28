
import React, { useState, useEffect, useRef } from "react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { cn } from "@/lib/utils";
import { FeatureDataPoint } from "@/lib/api";
import { formatTimestamp, formatValue } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChartDialog from "./ChartDialog";
import { BarChartIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  data: FeatureDataPoint[];
  index: number;
}

const CustomTooltip = ({ active, payload, label, feature }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="glassmorphism rounded-lg p-2 shadow-sm text-sm animate-fade-in">
        <p className="font-medium">{formatTimestamp(new Date(dataPoint.timestamp).getTime())}</p>
        <p className="text-primary font-medium">{formatValue(feature, dataPoint.value)}</p>
      </div>
    );
  }
  return null;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ title, data, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const prevDataRef = useRef<FeatureDataPoint[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [processedData, setProcessedData] = useState<Array<{timestamp: number; value: number}>>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // Process data to ensure timestamps are numbers for charts
      const processed = data.map(point => ({
        ...point,
        timestamp: typeof point.timestamp === 'string' ? new Date(point.timestamp).getTime() : point.timestamp
      }));
      setProcessedData(processed);
    }
  }, [data]);

  useEffect(() => {
    // Check if data has been updated
    if (
      prevDataRef.current.length &&
      JSON.stringify(prevDataRef.current) !== JSON.stringify(data)
    ) {
      setIsDataUpdated(true);
      const timeout = setTimeout(() => setIsDataUpdated(false), 1000);
      return () => clearTimeout(timeout);
    }
    prevDataRef.current = data;
  }, [data]);

  // Calculate min and max values for Y axis
  const minValue = Math.min(...data.map(d => d.value)) * 0.9;
  const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
  
  // Calculate the current value and its change from previous
  const currentValue = data.length ? data[data.length - 1].value : 0;
  const previousValue = data.length > 1 ? data[data.length - 2].value : currentValue;
  const changeValue = currentValue - previousValue;
  const changePercent = previousValue !== 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;

  // Determine if the current trend is increasing or decreasing
  const trend = changeValue > 0 ? "increase" : changeValue < 0 ? "decrease" : "stable";

  // Get gradient IDs
  const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const strokeColor = title.includes('Response') || title.includes('Error') 
    ? "hsl(var(--destructive))" 
    : "hsl(var(--primary))";

  const handleCardClick = () => {
    setDialogOpen(true);
  };

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    return formatValue(title, value);
  };

  // Format X-axis ticks
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Card 
        ref={cardRef}
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out card-hover-effect cursor-pointer",
          isDataUpdated && "animate-data-pulse",
          "border border-border/40 bg-card/80 backdrop-blur-sm"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <Badge 
              variant={trend === "increase" ? "destructive" : trend === "decrease" ? "default" : "secondary"}
              className={cn(
                "transition-all duration-300",
                isDataUpdated && "animate-pulse-soft"
              )}
            >
              {changeValue !== 0 ? (
                <>
                  {changeValue > 0 ? "+" : ""}
                  {formatValue(title, changeValue)} ({changePercent.toFixed(1)}%)
                </>
              ) : (
                "Stable"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold">
              {formatValue(title, currentValue)}
            </span>
            <span className="text-xs text-muted-foreground">
              {data.length > 0 && `Updated ${formatTimestamp(new Date(data[data.length - 1].timestamp).getTime())}`}
            </span>
          </div>
          
          <div className="h-[140px] w-full mt-2 relative group">
            <div className="absolute right-2 top-2 p-1 bg-background/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={processedData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                    <stop offset="75%" stopColor={strokeColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="timestamp"
                  tick={{ fontSize: 10 }}
                  tickFormatter={formatXAxis}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[minValue, maxValue]}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 10 }}
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  content={<CustomTooltip feature={title} />}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <ChartDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        data={processedData} 
        title={title}
      />
    </>
  );
};

export default FeatureCard;
