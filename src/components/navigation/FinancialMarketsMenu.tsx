import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Target, Wallet, LineChart, Users } from "lucide-react";
import { MenuColumn } from "./MenuColumn";
import { MenuItem } from "./MenuItem";
import { QuickStatsBadge } from "./QuickStatsBadge";

interface FinancialMarketsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialMarketsMenu = ({ isOpen, onClose }: FinancialMarketsMenuProps) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 30-second timeout to navigate to default page
  useEffect(() => {
    if (isOpen) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for 30 seconds
      timeoutRef.current = setTimeout(() => {
        navigate("/financial-markets");
        onClose();
      }, 30000); // 30 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, navigate, onClose]);

  const handleNavigate = () => {
    // Clear timeout when user makes a selection
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  // Close menu when clicking outside
  const handleBackdropClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  // Keyboard navigation - ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={handleBackdropClick}
          />

          {/* Mega Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-0 z-50"
            role="dialog"
            aria-label="Financial Markets Navigation Menu"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-primary/10 p-6">
                {/* Header with Quick Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                      Financial Markets
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explore equity markets, mutual funds, and investor insights
                    </p>
                  </div>
                  <QuickStatsBadge />
                </div>

                {/* Menu Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Equity Markets Column */}
                  <MenuColumn title="Equity Markets" color="blue" index={0}>
                    <MenuItem
                      icon={BarChart3}
                      label="Equity Markets"
                      path="/financial-markets/equity-markets"
                      description="Live indices, sectoral performance & market breadth"
                      onNavigate={handleNavigate}
                    />
                    <MenuItem
                      icon={TrendingUp}
                      label="FII/DII Activity"
                      path="/financial-markets/fii-dii-activity"
                      description="Foreign & domestic institutional investor flows"
                      onNavigate={handleNavigate}
                    />
                    <MenuItem
                      icon={Target}
                      label="IPO & Primary Market"
                      path="/financial-markets/ipo-markets"
                      description="Upcoming IPOs, listings & primary market data"
                      onNavigate={handleNavigate}
                    />
                  </MenuColumn>

                  {/* Mutual Funds & AMC Column */}
                  <MenuColumn title="Mutual Funds & AMC" color="green" index={1}>
                    <MenuItem
                      icon={Wallet}
                      label="Mutual Funds"
                      path="/financial-markets/mutual-funds"
                      description="AMC overview, schemes & performance analysis"
                      onNavigate={handleNavigate}
                    />
                    <MenuItem
                      icon={LineChart}
                      label="Industry Trends"
                      path="/financial-markets/industry-trends"
                      description="Quarterly AUM trends & category distribution"
                      onNavigate={handleNavigate}
                    />
                    <MenuItem
                      icon={Users}
                      label="Investor Behavior"
                      path="/financial-markets/investor-behavior"
                      description="Age-wise holdings, asset allocation & risk patterns"
                      onNavigate={handleNavigate}
                    />
                  </MenuColumn>
                </div>

                {/* Timeout Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-4 border-t border-border"
                >
                  <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <span>Auto-navigate to Financial Markets in 30 seconds if no selection</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
