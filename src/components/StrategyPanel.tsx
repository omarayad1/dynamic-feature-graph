
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StrategyConfig, formatDate } from "@/lib/api";
import { Settings, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStaggeredAnimation } from "@/lib/animations";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface StrategyPanelProps {
  strategy: StrategyConfig | null;
  loading: boolean;
  index: number;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategy, loading, index }) => {
  if (loading) {
    return (
      <Card className="h-[350px] animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Strategy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-4/5"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Strategy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
            <Settings className="h-12 w-12 mb-2 opacity-50" />
            <p>No strategy configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div {...getStaggeredAnimation(index)}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">{strategy.name}</CardTitle>
              <CardDescription>{strategy.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span 
                className={cn(
                  "flex items-center text-sm font-medium",
                  strategy.enabled ? "text-green-500" : "text-red-500"
                )}
              >
                {strategy.enabled ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(strategy.parameters).map(([key, param]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium">
                      {param.type === "boolean" ? (
                        param.value ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )
                      ) : (
                        param.value.toString()
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                </div>
              ))}
            </div>

            <Separator className="my-2" />

            <div className="text-xs text-muted-foreground">
              Last updated: {formatDate(strategy.lastUpdated)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StrategyPanel;
