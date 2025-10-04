import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MenuColumnProps {
  title: string;
  color: "blue" | "green";
  children: ReactNode;
  index: number;
}

const colorClasses = {
  blue: {
    border: "border-l-blue-500",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  green: {
    border: "border-l-green-500",
    text: "text-green-500",
    bg: "bg-green-500/10",
  },
};

export const MenuColumn = ({ title, color, children, index }: MenuColumnProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      className="flex-1 min-w-[280px]"
    >
      <div className={`border-l-4 ${colors.border} pl-4 mb-4`}>
        <h3 className={`text-lg font-bold ${colors.text} mb-1`}>{title}</h3>
        <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-transparent"></div>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </motion.div>
  );
};
