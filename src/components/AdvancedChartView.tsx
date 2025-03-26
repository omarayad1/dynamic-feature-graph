
import React, { useState, useRef, useEffect } from "react";
import { IChartApi, SeriesType } from "lightweight-charts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimestamp, formatValue } from "@/lib/api";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LineChart as LineChartIcon,
  Layers,
  BarChart3,
} from "lucide-react";
import StatisticalAnalysis from "./StatisticalAnalysis";
import { createLightweightChart, formatPriceData, formatVolumeData, getChartColors, addSeriesWithType } from "@/lib/chart-utils";

export interface AdvancedChartViewProps {
  data: Array<{ timestamp: string | number; value: number; [key: string]: any }>;
  title: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AdvancedChartView: React.FC<AdvancedChartViewProps> = ({
  data,
  title,
}) => {
  // Chart state
  const [chartType, setChartType] = useState<SeriesType>('Line');
  const [dataRange, setDataRange] = useState<number[]>([0, data.length - 1]);
  const [visibleData, setVisibleData] = useState(data);
  const [activeTab, setActiveTab] = useState<string>("chart");
  
  // Refs for chart
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
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
  
  // Create and update chart
  useEffect(() => {
    if (chartContainerRef.current && visibleData && visibleData.length > 0) {
      const colors = getChartColors();
      const formattedPriceData = formatPriceData(visibleData);
      const hasVolume = visibleData[0]?.volume !== undefined;
      const formattedVolumeData = hasVolume ? formatVolumeData(visibleData) : [];
      
      // Clear previous chart if it exists
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      
      // Create new chart
      const chart = createLightweightChart(chartContainerRef.current, {
        height: chartContainerRef.current.clientHeight,
        width: chartContainerRef.current.clientWidth,
      });
      chartRef.current = chart;
      
      let mainSeries;
      
      // Add appropriate series based on chart type
      if (chartType === 'Line') {
        mainSeries = addSeriesWithType(chart, 'Line', {
          color: colors.primary,
          lineWidth: 2,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
          priceLineVisible: true,
        });
      } else if (chartType === 'Area') {
        mainSeries = addSeriesWithType(chart, 'Area', {
          lineColor: colors.primary,
          topColor: `${colors.primary}40`, // 25% opacity
          bottomColor: `${colors.primary}05`, // 2% opacity
          lineWidth: 2,
          lastValueVisible: true,
          priceLineVisible: true,
        });
      } else {
        mainSeries = addSeriesWithType(chart, 'Histogram', {
          color: colors.primary,
          priceFormat: {
            type: 'price',
            precision: 2,
          },
          lastValueVisible: true,
        });
      }
      
      mainSeries.setData(formattedPriceData);
      
      // Add volume series if available
      if (hasVolume && formattedVolumeData.length > 0) {
        const volumeSeries = addSeriesWithType(chart, 'Histogram', {
          color: colors.accent,
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
        });
        
        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
          visible: false,
        });
        
        volumeSeries.setData(formattedVolumeData);
      }
      
      // Fit content
      chart.timeScale().fitContent();
      
      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            height: chartContainerRef.current.clientHeight,
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    }
  }, [visibleData, chartType]);
  
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
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };
  
  const handleChartTypeChange = (type: SeriesType) => {
    setChartType(type);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="chart" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="w-full mx-auto grid grid-cols-2">
          <TabsTrigger value="chart">Interactive Chart</TabsTrigger>
          <TabsTrigger value="stats">Statistical Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="flex-1 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="bg-secondary/50 rounded-md p-0.5 mr-2">
              <Button
                variant={chartType === 'Line' ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleChartTypeChange('Line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'Area' ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleChartTypeChange('Area')}
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'Histogram' ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleChartTypeChange('Histogram')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
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
                ref={chartContainerRef}
                className="h-full w-full"
              />
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
    </div>
  );
};

export default AdvancedChartView;
