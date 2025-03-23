
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatisticalAnalysis from "./StatisticalAnalysis";
import AdvancedChartView from "./AdvancedChartView";
import { Button } from "@/components/ui/button";
import { BarChartHorizontalIcon } from "lucide-react";

interface ChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Array<{ timestamp: string | number; value: number }>;
  title: string;
}

const ChartDialog: React.FC<ChartDialogProps> = ({
  open,
  onOpenChange,
  data,
  title,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [normalizedData, setNormalizedData] = useState<Array<{ timestamp: number; value: number }>>([]);
  
  // Ensure data is properly formatted for the charts
  useEffect(() => {
    if (data && data.length > 0) {
      const processed = data.map(item => ({
        timestamp: typeof item.timestamp === 'string' ? new Date(item.timestamp).getTime() : item.timestamp,
        value: item.value
      }));
      setNormalizedData(processed);
    }
  }, [data]);

  // Display different content based on the view mode
  const renderContent = () => {
    if (showAdvanced) {
      return (
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowAdvanced(false);
          }
          onOpenChange(isOpen);
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] h-[80vh] overflow-hidden">
            <DialogHeader className="flex flex-row justify-between items-center">
              <DialogTitle>Advanced Chart: {title}</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(false)}
                className="flex items-center gap-2"
              >
                Standard View
              </Button>
            </DialogHeader>
            <div className="flex-1 h-full">
              <AdvancedChartView 
                data={normalizedData} 
                title={title} 
                open={open} 
                onOpenChange={onOpenChange}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle>Statistical Analysis: {title}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(true)}
              className="flex items-center gap-2"
            >
              <BarChartHorizontalIcon className="h-4 w-4" />
              Advanced View
            </Button>
          </DialogHeader>
          <StatisticalAnalysis data={normalizedData} title={title} />
        </DialogContent>
      </Dialog>
    );
  };

  return renderContent();
};

export default ChartDialog;
