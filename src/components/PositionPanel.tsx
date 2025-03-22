
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Position } from "@/lib/api";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/api";

interface PositionPanelProps {
  position: Position | null;
  loading: boolean;
  index: number;
}

const PositionPanel: React.FC<PositionPanelProps> = ({ position, loading, index }) => {
  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      delay: index * 0.05,
    }
  };

  if (loading) {
    return (
      <Card className="h-[240px] animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Current Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/5"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!position) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Current Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
            <Wallet className="h-12 w-12 mb-2 opacity-50" />
            <p>No active position</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProfitable = position.pnl > 0;

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={variants.transition}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Current Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-medium">{position.symbol}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium">{position.quantity}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="font-medium">${position.entryPrice.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-medium">${position.currentPrice.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">P&L</span>
              <div className="flex items-center">
                {isProfitable ? (
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "font-semibold",
                  isProfitable ? "text-green-500" : "text-red-500"
                )}>
                  ${Math.abs(position.pnl).toLocaleString()} ({position.pnlPercentage > 0 ? "+" : ""}{position.pnlPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              Last updated: {formatDate(position.timestamp)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PositionPanel;
