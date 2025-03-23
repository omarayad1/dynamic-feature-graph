
import React, { useState } from "react";
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

  if (showAdvanced) {
    return (
      <AdvancedChartView 
        open={open} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowAdvanced(false);
          }
          onOpenChange(isOpen);
        }}
        data={data} 
        title={title} 
      />
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
        <StatisticalAnalysis data={data} title={title} />
      </DialogContent>
    </Dialog>
  );
};

export default ChartDialog;
