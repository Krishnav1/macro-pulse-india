import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useLiveMarketData } from "@/hooks/financial/useLiveMarketData";

export const QuickStatsBadge = () => {
  const { indices, isLive, loading } = useLiveMarketData();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
      >
        <Activity className="h-3 w-3 animate-pulse text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </motion.div>
    );
  }

  const nifty = indices.get("^NSEI");
  const change = nifty?.regularMarketChangePercent || 0;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
        isPositive 
          ? "bg-green-500/10 border-green-500/30 text-green-500" 
          : "bg-red-500/10 border-red-500/30 text-red-500"
      }`}
    >
      {isLive && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`h-2 w-2 rounded-full ${isPositive ? "bg-green-500" : "bg-red-500"}`}
        />
      )}
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span className="text-xs font-medium">
        NIFTY 50: {nifty?.regularMarketPrice?.toFixed(2) || "N/A"}
      </span>
      <span className={`text-xs font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? "+" : ""}{change.toFixed(2)}%
      </span>
    </motion.div>
  );
};
