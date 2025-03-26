
import React, { useRef, useEffect } from "react";
import { IChartApi } from "lightweight-charts";
import { createLightweightChart, formatPriceData, formatVolumeData, getChartColors } from "@/lib/chart-utils";

interface AreaChartComponentProps {
  data: any[];
  timeRange: string;
  formatYAxis: (value: number) => string;
}

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  timeRange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartContainerRef.current && data && data.length > 0) {
      const colors = getChartColors();
      const formattedPriceData = formatPriceData(data);
      const hasVolume = data[0]?.volume !== undefined;
      const formattedVolumeData = hasVolume ? formatVolumeData(data) : [];
      
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
      
      // Add area series
      const areaSeries = chart.addAreaSeries({
        lineColor: colors.primary,
        topColor: `${colors.primary}40`, // 25% opacity
        bottomColor: `${colors.primary}05`, // 2% opacity
        lineWidth: 2,
        lastValueVisible: true,
        priceLineVisible: false,
      });
      areaSeries.setData(formattedPriceData);
      
      // Add volume series if available
      if (hasVolume && formattedVolumeData.length > 0) {
        const volumeSeries = chart.addHistogramSeries({
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
  }, [data, timeRange]);
  
  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default AreaChartComponent;
