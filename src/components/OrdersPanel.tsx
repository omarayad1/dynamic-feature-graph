
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, formatDate } from "@/lib/api";
import { ArrowDownUp, CircleDot } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OrdersPanelProps {
  orders: Order[];
  loading: boolean;
  index: number;
}

const OrdersPanel: React.FC<OrdersPanelProps> = ({ orders, loading, index }) => {
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
      <Card className="h-[350px] animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded w-full"></div>
            ))}
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
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
              <ArrowDownUp className="h-12 w-12 mb-2 opacity-50" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="relative max-h-[350px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Side</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className={cn(
                        "font-medium",
                        order.side === "buy" ? "text-green-500" : "text-red-500"
                      )}>
                        {order.side.toUpperCase()}
                      </TableCell>
                      <TableCell className="capitalize">{order.type}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CircleDot className={cn(
                            "h-3 w-3 mr-1",
                            order.status === "filled" ? "text-green-500" : 
                            order.status === "open" ? "text-blue-500" : 
                            order.status === "canceled" ? "text-yellow-500" : "text-red-500"
                          )} />
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(order.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrdersPanel;
