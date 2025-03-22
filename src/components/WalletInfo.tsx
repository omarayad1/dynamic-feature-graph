
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchWalletData, generateMockWalletData } from "@/lib/api";

interface WalletInfoProps {
  useMockData: boolean;
  index: number;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ useMockData, index }) => {
  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      delay: index * 0.05,
    }
  };

  // Query for fetching wallet data
  const { 
    data: wallet, 
    isLoading: isLoadingWallet,
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: useMockData ? generateMockWalletData : fetchWalletData,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });

  if (isLoadingWallet) {
    return (
      <Card className="col-span-3 animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Wallet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={variants.transition}
      className="col-span-3"
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Wallet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/30 p-4 rounded-lg flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-semibold">${wallet?.balance.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-secondary/30 p-4 rounded-lg flex items-center space-x-4">
              <div className="p-2 rounded-full bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-semibold">${wallet?.available.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-secondary/30 p-4 rounded-lg flex items-center space-x-4">
              <div className={cn(
                "p-2 rounded-full",
                wallet?.profitLoss && wallet.profitLoss > 0 
                  ? "bg-green-500/10" 
                  : "bg-destructive/10"
              )}>
                <TrendingUp className={cn(
                  "h-6 w-6",
                  wallet?.profitLoss && wallet.profitLoss > 0 
                    ? "text-green-500" 
                    : "text-destructive"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's P&L</p>
                <p className={cn(
                  "text-2xl font-semibold flex items-center",
                  wallet?.profitLoss && wallet.profitLoss > 0 
                    ? "text-green-500" 
                    : "text-destructive"
                )}>
                  {wallet?.profitLoss && wallet.profitLoss > 0 && "+"}
                  ${wallet?.profitLoss.toLocaleString()}
                  {wallet?.profitLossPercentage && (
                    <span className="text-sm ml-2">
                      ({wallet.profitLossPercentage > 0 ? "+" : ""}
                      {wallet.profitLossPercentage.toFixed(2)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Last updated: {wallet?.lastUpdated}
            </span>
            <a 
              href="/transactions" 
              className="text-primary flex items-center hover:underline"
            >
              View transactions
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WalletInfo;
