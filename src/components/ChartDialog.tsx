
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatisticalAnalysis from "./StatisticalAnalysis";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Statistical Analysis: {title}</DialogTitle>
        </DialogHeader>
        <StatisticalAnalysis data={data} title={title} />
      </DialogContent>
    </Dialog>
  );
};

export default ChartDialog;
