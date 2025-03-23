
import React, { useState, useEffect } from "react";
import { ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChartHorizontalIcon } from "lucide-react";
import ChartDialog from "./ChartDialog";
import TimeRangeSelector from "./charts/TimeRangeSelector";
import ChartTypeSelector, { ChartType } from "./charts/ChartTypeSelector";
import LineChartComponent from "./charts/LineChartComponent";
import AreaChartComponent from "./charts/AreaChartComponent";
import BarChartComponent from "./charts/BarChartComponent";

interface EnhancedMarketChartProps {
  title: string;
  data: any[];
  type?: "line" | "area" | "bar" | "candlestick";
  height?: number;
}

const EnhancedMarketChart: React.FC<EnhancedMarketChartProps> = ({
  title,
  data,
  type = "line",
  height = 300
}) => {
  const [chartType, setChartType] = useState<ChartType>(type === "candlestick" ? "bar" : type as ChartType);
  const [timeRange, setTimeRange] = useState<string>("1d");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const processed = data.map(item => ({
        ...item,
        timestamp: typeof item.timestamp === 'string' ? new Date(item.timestamp).getTime() : item.timestamp
      }));
      setProcessedData(processed);
    }
  }, [data]);

  const filteredData = processedData;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const handleCardClick = () => {
    setDialogOpen(true);
  };

  const renderChart = () => {
    if (filteredData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    if (chartType === "line") {
      return (
        <LineChartComponent 
          data={filteredData} 
          timeRange={timeRange} 
          formatYAxis={formatYAxis} 
        />
      );
    } else if (chartType === "area") {
      return (
        <AreaChartComponent 
          data={filteredData} 
          timeRange={timeRange} 
          formatYAxis={formatYAxis} 
        />
      );
    } else {
      return (
        <BarChartComponent 
          data={filteredData} 
          timeRange={timeRange} 
          formatYAxis={formatYAxis} 
        />
      );
    }
  };

  return (
    <>
      <Card className="w-full cursor-pointer group" onClick={handleCardClick}>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle className="text-xl">{title}</CardTitle>
            <ChartTypeSelector selectedType={chartType} onTypeChange={setChartType} />
          </div>
          
          <div className="flex justify-end mt-2">
            <TimeRangeSelector selectedRange={timeRange} onRangeChange={setTimeRange} />
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: height }} className="relative">
            <div className="absolute right-2 top-2 p-1 bg-background/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <BarChartHorizontalIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChartDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        data={processedData.map(item => ({ timestamp: item.timestamp, value: item.value }))} 
        title={title}
      />
    </>
  );
};

export default EnhancedMarketChart;
