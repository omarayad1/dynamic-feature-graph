
import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, Layers } from "lucide-react";

export type ChartType = "line" | "area" | "bar";

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onTypeChange: (type: ChartType) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ 
  selectedType, 
  onTypeChange 
}) => {
  return (
    <div className="bg-secondary/50 rounded-md p-0.5">
      <Button
        variant={selectedType === "line" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onTypeChange("line");
        }}
      >
        <LineChart className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedType === "area" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onTypeChange("area");
        }}
      >
        <Layers className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedType === "bar" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onTypeChange("bar");
        }}
      >
        <BarChart3 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChartTypeSelector;
