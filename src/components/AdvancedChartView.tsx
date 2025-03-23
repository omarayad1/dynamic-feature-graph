
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimestamp, formatValue } from "@/lib/api";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  PencilLine,
  LineChart as LineChartIcon,
  Layers,
  BarChart3,
  Crosshair,
  Ruler,
  MinusSquare,
  PlusSquare,
  RotateCcw,
  Maximize,
  Minimize,
  BarChartHorizontalIcon,
} from "lucide-react";
import StatisticalAnalysis from "./StatisticalAnalysis";

// Types for our trend lines and annotations
interface TrendLine {
  id: string;
  startIndex: number;
  endIndex: number;
  label?: string;
  color: string;
}

interface Annotation {
  id: string;
  index: number;
  value: number;
  label: string;
  color: string;
}

interface AdvancedChartViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Array<{ timestamp: string | number; value: number; [key: string]: any }>;
  title: string;
}

const AdvancedChartView: React.FC<AdvancedChartViewProps> = ({
  open,
  onOpenChange,
  data,
  title,
}) => {
  // Chart state
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");
  const [dataRange, setDataRange] = useState<number[]>([0, data.length - 1]);
  const [visibleData, setVisibleData] = useState(data);
  const [refAreas, setRefAreas] = useState<TrendLine[]>([]);
  const [refLines, setRefLines] = useState<Annotation[]>([]);
  const [activeTab, setActiveTab] = useState<string>("chart");
  
  // Interaction modes
  const [mode, setMode] = useState<"view" | "pan" | "zoom" | "draw">("view");
  const [drawingType, setDrawingType] = useState<"trendline" | "horizontal" | "vertical">("trendline");
  
  // Refs for drawing
  const chartRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{index: number; value: number} | null>(null);
  const [tempLine, setTempLine] = useState<TrendLine | null>(null);
  
  // Calculate domain based on visible data
  const valueMin = Math.min(...visibleData.map(d => d.value)) * 0.95;
  const valueMax = Math.max(...visibleData.map(d => d.value)) * 1.05;
  
  // Update visible data when data range changes
  useEffect(() => {
    if (data.length > 1) {
      setVisibleData(data.slice(dataRange[0], dataRange[1] + 1));
    }
  }, [data, dataRange]);
  
  // Reset view when data changes
  useEffect(() => {
    if (data.length > 1) {
      setDataRange([0, data.length - 1]);
    }
  }, [data]);
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    if (dataRange[1] - dataRange[0] <= 2) return; // Prevent zooming too far
    
    const rangeSize = dataRange[1] - dataRange[0];
    const newRangeSize = Math.max(2, Math.floor(rangeSize * 0.7));
    const midPoint = Math.floor((dataRange[0] + dataRange[1]) / 2);
    
    const newStart = Math.max(0, midPoint - Math.floor(newRangeSize / 2));
    const newEnd = Math.min(data.length - 1, newStart + newRangeSize);
    
    setDataRange([newStart, newEnd]);
  };
  
  const handleZoomOut = () => {
    const rangeSize = dataRange[1] - dataRange[0];
    const newRangeSize = Math.min(data.length - 1, Math.floor(rangeSize * 1.5));
    const midPoint = Math.floor((dataRange[0] + dataRange[1]) / 2);
    
    const newStart = Math.max(0, midPoint - Math.floor(newRangeSize / 2));
    const newEnd = Math.min(data.length - 1, newStart + newRangeSize);
    
    setDataRange([newStart, newEnd]);
  };
  
  const handleReset = () => {
    setDataRange([0, data.length - 1]);
    setRefAreas([]);
    setRefLines([]);
  };
  
  // Drawing functions
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "draw") return;
    
    // Get chart DOM element position and size
    const chartElement = chartRef.current;
    if (!chartElement) return;
    
    const rect = chartElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to data coordinates (approximate)
    const xRatio = x / rect.width;
    const yRatio = 1 - (y / rect.height);
    
    const indexValue = Math.floor(xRatio * (visibleData.length - 1)) + dataRange[0];
    const valueAtPoint = valueMin + yRatio * (valueMax - valueMin);
    
    setStartPoint({ index: indexValue, value: valueAtPoint });
    setDrawing(true);
    
    if (drawingType === "trendline") {
      setTempLine({
        id: `trend-${Date.now()}`,
        startIndex: indexValue,
        endIndex: indexValue,
        color: "#ff0000"
      });
    } else if (drawingType === "horizontal") {
      setRefLines([...refLines, {
        id: `h-line-${Date.now()}`,
        index: 0,
        value: valueAtPoint,
        label: formatValue(title, valueAtPoint),
        color: "#ff0000"
      }]);
      setDrawing(false);
    } else if (drawingType === "vertical") {
      setRefLines([...refLines, {
        id: `v-line-${Date.now()}`,
        index: indexValue,
        value: 0, // not used for vertical lines
        label: formatTimestamp(
          typeof visibleData[indexValue - dataRange[0]]?.timestamp === 'number' 
            ? visibleData[indexValue - dataRange[0]]?.timestamp as number
            : Date.now()
        ),
        color: "#ff0000"
      }]);
      setDrawing(false);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing || !startPoint || mode !== "draw" || drawingType !== "trendline") return;
    
    const chartElement = chartRef.current;
    if (!chartElement) return;
    
    const rect = chartElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Convert to data coordinates
    const xRatio = x / rect.width;
    const indexValue = Math.floor(xRatio * (visibleData.length - 1)) + dataRange[0];
    
    if (tempLine) {
      setTempLine({
        ...tempLine,
        endIndex: indexValue
      });
    }
  };
  
  const handleMouseUp = () => {
    if (!drawing || !startPoint || mode !== "draw" || drawingType !== "trendline") return;
    
    if (tempLine && tempLine.startIndex !== tempLine.endIndex) {
      setRefAreas([...refAreas, tempLine]);
    }
    
    setDrawing(false);
    setStartPoint(null);
    setTempLine(null);
  };
  
  // Clear all drawings
  const handleClearDrawings = () => {
    setRefAreas([]);
    setRefLines([]);
  };
  
  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    return formatValue(title, value);
  };
  
  // Determine the color theme for the chart
  const chartConfig = {
    price: { 
      theme: { light: "#2563eb", dark: "#3b82f6" },
      label: "Price"
    }
  };
  
  // Helper function to safely convert timestamp to number
  const getNumericTimestamp = (timestamp: string | number): number => {
    if (typeof timestamp === 'number') return timestamp;
    if (timestamp && !isNaN(Date.parse(timestamp))) return Date.parse(timestamp);
    return Date.now();
  };
  
  // Helper function to safely get segment coordinates
  const getSegmentCoordinates = (startIndex: number, endIndex: number) => {
    const startItem = visibleData[startIndex - dataRange[0]];
    const endItem = visibleData[endIndex - dataRange[0]];
    
    if (!startItem || !endItem) return null;
    
    return [
      { 
        x: startItem.timestamp, 
        y: startItem.value 
      },
      { 
        x: endItem.timestamp, 
        y: endItem.value 
      }
    ];
  };
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    const chartProps = {
      data: visibleData,
      margin: { top: 5, right: 20, bottom: 20, left: 40 }
    };
    
    if (chartType === "line") {
      return (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => formatTimestamp(time)}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[valueMin, valueMax]}
            tickFormatter={formatYAxis}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-md text-sm">
                    <p className="font-medium">{formatTimestamp(label)}</p>
                    <p className="text-primary font-medium">
                      {formatValue(title, Number(payload[0].value))}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name={title}
            stroke="var(--primary)" 
            dot={visibleData.length < 30}
            activeDot={{ r: 5, strokeWidth: 0 }}
            strokeWidth={2}
          />
          
          {/* Render trend lines */}
          {refAreas.map(line => {
            const segment = getSegmentCoordinates(line.startIndex, line.endIndex);
            return segment ? (
              <ReferenceLine 
                key={line.id}
                segment={segment}
                stroke={line.color}
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ) : null;
          })}
          
          {/* Render horizontal and vertical lines */}
          {refLines.map(line => {
            if (line.id.startsWith('h-line')) {
              return (
                <ReferenceLine
                  key={line.id}
                  y={line.value}
                  stroke={line.color}
                  strokeDasharray="3 3"
                  label={{ value: line.label, position: "right", fill: line.color }}
                />
              );
            } else if (line.id.startsWith('v-line')) {
              const dataPoint = visibleData[line.index - dataRange[0]];
              const xValue = dataPoint?.timestamp;
              return xValue ? (
                <ReferenceLine
                  key={line.id}
                  x={xValue}
                  stroke={line.color}
                  strokeDasharray="3 3"
                  label={{ value: line.label, position: "top", fill: line.color }}
                />
              ) : null;
            }
            return null;
          })}
          
          {/* Render temp line while drawing */}
          {tempLine && (
            <ReferenceLine 
              segment={getSegmentCoordinates(tempLine.startIndex, tempLine.endIndex) || undefined}
              stroke={tempLine.color}
              strokeWidth={2}
              ifOverflow="extendDomain"
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      );
    } else if (chartType === "area") {
      return (
        <AreaChart {...chartProps}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="75%" stopColor="var(--primary)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => formatTimestamp(time)}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[valueMin, valueMax]}
            tickFormatter={formatYAxis}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-md text-sm">
                    <p className="font-medium">{formatTimestamp(label)}</p>
                    <p className="text-primary font-medium">
                      {formatValue(title, Number(payload[0].value))}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={title}
            stroke="var(--primary)"
            fill="url(#colorValue)"
            activeDot={{ r: 5, strokeWidth: 0 }}
            strokeWidth={2}
          />
          
          {/* Render trend lines and annotations (same as line chart) */}
          {refAreas.map(line => {
            const segment = getSegmentCoordinates(line.startIndex, line.endIndex);
            return segment ? (
              <ReferenceLine 
                key={line.id}
                segment={segment}
                stroke={line.color}
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ) : null;
          })}
          
          {refLines.map(line => {
            if (line.id.startsWith('h-line')) {
              return (
                <ReferenceLine
                  key={line.id}
                  y={line.value}
                  stroke={line.color}
                  strokeDasharray="3 3"
                  label={{ value: line.label, position: "right", fill: line.color }}
                />
              );
            } else if (line.id.startsWith('v-line')) {
              const dataPoint = visibleData[line.index - dataRange[0]];
              const xValue = dataPoint?.timestamp;
              return xValue ? (
                <ReferenceLine
                  key={line.id}
                  x={xValue}
                  stroke={line.color}
                  strokeDasharray="3 3"
                  label={{ value: line.label, position: "top", fill: line.color }}
                />
              ) : null;
            }
            return null;
          })}
          
          {tempLine && (
            <ReferenceLine 
              segment={getSegmentCoordinates(tempLine.startIndex, tempLine.endIndex) || undefined}
              stroke={tempLine.color}
              strokeWidth={2}
              ifOverflow="extendDomain"
              strokeDasharray="3 3"
            />
          )}
        </AreaChart>
      );
    } else {
      return (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => formatTimestamp(time)}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[valueMin, valueMax]}
            tickFormatter={formatYAxis}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-md text-sm">
                    <p className="font-medium">{formatTimestamp(label)}</p>
                    <p className="text-primary font-medium">
                      {formatValue(title, Number(payload[0].value))}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            name={title}
            fill="var(--primary)" 
            radius={[4, 4, 0, 0]}
            barSize={visibleData.length < 60 ? 8 : 4}
          />
          
          {/* Render trend lines and annotations (same as other charts) */}
          {refAreas.map(line => {
            const segment = getSegmentCoordinates(line.startIndex, line.endIndex);
            return segment ? (
              <ReferenceLine 
                key={line.id}
                segment={segment}
                stroke={line.color}
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ) : null;
          })}
          
          {refLines.map(line => {
            if (line.id.startsWith('h-line')) {
              return (
                <ReferenceLine
                  key={line.id}
                  y={line.value}
                  stroke={line.color}
                  strokeDasharray="3 3"
                  label={{ value: line.label, position: "right", fill: line.color }}
                />
              );
            } else if (line.id.startsWith('v-line')) {
              const dataPoint = visibleData[line.index - dataRange[0]];
              const xValue = dataPoint?.timestamp;
              return xValue ? (
                <ReferenceLine
                  key={line.id}
                  x={xValue}
                  stroke={line.color}
                  strokeDasharray="3 3"
                  label={{ value: line.label, position: "top", fill: line.color }}
                />
              ) : null;
            }
            return null;
          })}
        </BarChart>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title} Analysis</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="chart" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
          <TabsList className="w-full mx-auto grid grid-cols-2">
            <TabsTrigger value="chart">Interactive Chart</TabsTrigger>
            <TabsTrigger value="stats">Statistical Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="flex-1 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="bg-secondary/50 rounded-md p-0.5 mr-2">
                <Button
                  variant={chartType === "line" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setChartType("line")}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "area" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setChartType("area")}
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "bar" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-secondary/50 rounded-md p-0.5 mr-2">
                <Button
                  variant={mode === "view" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMode("view")}
                  title="Normal view"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button
                  variant={mode === "pan" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMode("pan")}
                  title="Pan (not implemented)"
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant={mode === "zoom" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMode("zoom")}
                  title="Zoom"
                >
                  <Crosshair className="h-4 w-4" />
                </Button>
                <Button
                  variant={mode === "draw" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMode("draw")}
                  title="Draw"
                >
                  <PencilLine className="h-4 w-4" />
                </Button>
              </div>
              
              {mode === "draw" && (
                <div className="bg-secondary/50 rounded-md p-0.5 mr-2">
                  <Button
                    variant={drawingType === "trendline" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDrawingType("trendline")}
                    title="Trend Line"
                  >
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={drawingType === "horizontal" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDrawingType("horizontal")}
                    title="Horizontal Line"
                  >
                    <MinusSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={drawingType === "vertical" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDrawingType("vertical")}
                    title="Vertical Line"
                  >
                    <Ruler className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClearDrawings}
                    title="Clear All Lines"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="bg-secondary/50 rounded-md p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleReset}
                  title="Reset View"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Card className="flex-1 relative">
              <CardContent className="p-2 h-full">
                <div 
                  ref={chartRef}
                  className="relative h-full w-full" 
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    if (drawing) {
                      handleMouseUp();
                    }
                  }}
                >
                  {renderChart()}
                  
                  {/* Instruction text when drawing */}
                  {mode === "draw" && (
                    <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm text-xs p-2 rounded shadow-md border border-border">
                      {drawingType === "trendline" && "Click and drag to draw a trend line"}
                      {drawingType === "horizontal" && "Click to add a horizontal line"}
                      {drawingType === "vertical" && "Click to add a vertical line"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-2">
              <CardContent className="p-2">
                <Slider
                  defaultValue={[0, 100]}
                  value={[
                    (dataRange[0] / (data.length - 1)) * 100,
                    (dataRange[1] / (data.length - 1)) * 100
                  ]}
                  max={100}
                  step={1}
                  onValueChange={(newValues) => {
                    const start = Math.floor((newValues[0] / 100) * (data.length - 1));
                    const end = Math.floor((newValues[1] / 100) * (data.length - 1));
                    setDataRange([start, end]);
                  }}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTimestamp(
                    typeof data[0]?.timestamp === 'number' 
                      ? data[0]?.timestamp as number
                      : Date.now()
                  )}</span>
                  <span>{formatTimestamp(
                    typeof data[data.length - 1]?.timestamp === 'number' 
                      ? data[data.length - 1]?.timestamp as number
                      : Date.now()
                  )}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 overflow-auto pt-2">
            <ScrollArea className="h-full pr-4">
              <StatisticalAnalysis data={data} title={title} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedChartView;
