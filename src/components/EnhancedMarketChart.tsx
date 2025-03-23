
import React, { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart as LineChartIcon, Layers, BarChartHorizontalIcon } from "lucide-react";
import { formatTimestamp, formatValue } from "@/lib/api";
import ChartDialog from "./ChartDialog";

const timeRanges = [
  { label: "1H", value: "1h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "All", value: "all" }
];

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
  const [chartType, setChartType] = useState<"line" | "area" | "bar">(type === "candlestick" ? "bar" : type);
  const [timeRange, setTimeRange] = useState<string>("1d");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter data based on timeRange (mock implementation)
  const filteredData = data;

  // Chart config
  const config = {
    price: { 
      theme: { light: "#2563eb", dark: "#3b82f6" },
      label: "Price"
    },
    volume: { 
      theme: { light: "#8b5cf6", dark: "#a78bfa" },
      label: "Volume"
    }
  };

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const handleChartClick = () => {
    setDialogOpen(true);
  };

  // Function to render the appropriate chart based on type
  const renderChart = () => {
    if (chartType === "line") {
      return (
        <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => formatTimestamp(time, timeRange)}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            width={60}
          />
          {data[0]?.volume && (
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={formatYAxis}
              stroke="var(--accent)"
              tickLine={false}
              axisLine={false}
              width={60}
              opacity={0.7}
            />
          )}
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glassmorphism rounded-lg p-2 text-sm">
                    <p className="font-medium">{formatTimestamp(label)}</p>
                    <p className="text-primary font-medium">
                      ${Number(payload[0].value).toLocaleString()}
                    </p>
                    {payload[1] && (
                      <p className="text-accent font-medium">
                        Vol: {Number(payload[1].value).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Price"
            stroke="var(--primary)" 
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            strokeWidth={2}
          />
          {data[0]?.volume && (
            <Line 
              type="monotone" 
              dataKey="volume" 
              name="Volume"
              stroke="var(--accent)" 
              dot={false}
              strokeWidth={1.5}
              opacity={0.7}
              yAxisId="right"
            />
          )}
        </LineChart>
      );
    } else if (chartType === "area") {
      return (
        <AreaChart data={filteredData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="75%" stopColor="var(--primary)" stopOpacity={0.05} />
            </linearGradient>
            {data[0]?.volume && (
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="75%" stopColor="var(--accent)" stopOpacity={0.05} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => formatTimestamp(time, timeRange)}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            width={60}
          />
          {data[0]?.volume && (
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={formatYAxis}
              stroke="var(--accent)"
              tickLine={false}
              axisLine={false}
              width={60}
              opacity={0.7}
            />
          )}
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glassmorphism rounded-lg p-2 text-sm">
                    <p className="font-medium">{formatTimestamp(label)}</p>
                    <p className="text-primary font-medium">
                      ${Number(payload[0].value).toLocaleString()}
                    </p>
                    {payload[1] && (
                      <p className="text-accent font-medium">
                        Vol: {Number(payload[1].value).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Price"
            stroke="var(--primary)"
            fill="url(#colorPrice)"
            activeDot={{ r: 5, strokeWidth: 0 }}
            strokeWidth={2}
          />
          {data[0]?.volume && (
            <Area
              type="monotone"
              dataKey="volume"
              name="Volume"
              stroke="var(--accent)"
              fill="url(#colorVolume)"
              strokeWidth={1.5}
              opacity={0.8}
              yAxisId="right"
            />
          )}
        </AreaChart>
      );
    } else {
      return (
        <BarChart data={filteredData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => formatTimestamp(time, timeRange)}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            width={60}
          />
          {data[0]?.volume && (
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={formatYAxis}
              stroke="var(--accent)"
              tickLine={false}
              axisLine={false}
              width={60}
              opacity={0.7}
            />
          )}
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glassmorphism rounded-lg p-2 text-sm">
                    <p className="font-medium">{formatTimestamp(label)}</p>
                    <p className="text-primary font-medium">
                      ${Number(payload[0].value).toLocaleString()}
                    </p>
                    {payload[1] && (
                      <p className="text-accent font-medium">
                        Vol: {Number(payload[1].value).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            name="Price"
            fill="var(--primary)" 
            radius={[4, 4, 0, 0]}
            barSize={timeRange === '1h' ? 4 : timeRange === '1d' ? 8 : 12}
          />
          {data[0]?.volume && (
            <Bar 
              dataKey="volume" 
              name="Volume"
              fill="var(--accent)" 
              radius={[4, 4, 0, 0]}
              opacity={0.7}
              barSize={timeRange === '1h' ? 4 : timeRange === '1d' ? 8 : 12}
              yAxisId="right"
            />
          )}
        </BarChart>
      );
    }
  };

  return (
    <>
      <Card className="w-full cursor-pointer group" onClick={handleChartClick}>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex space-x-2">
              <div className="bg-secondary/50 rounded-md p-0.5">
                <Button
                  variant={chartType === "line" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChartType("line")
                  }}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "area" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChartType("area")
                  }}
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "bar" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChartType("bar")
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <div className="flex bg-secondary/50 rounded-md p-0.5">
              {timeRanges.map(range => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeRange(range.value)
                  }}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: height }} className="relative">
            <div className="absolute right-2 top-2 p-1 bg-background/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <BarChartHorizontalIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-full">
              {renderChart()}
            </div>
          </div>
        </CardContent>
      </Card>

      <ChartDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        data={data.map(item => ({ timestamp: item.timestamp, value: item.value }))} 
        title={title}
      />
    </>
  );
};

export default EnhancedMarketChart;
