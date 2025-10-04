import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  description?: string;
  onNavigate: () => void;
}

export const MenuItem = ({ icon: Icon, label, path, description, onNavigate }: MenuItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
    onNavigate();
  };

  return (
    <motion.button
      onClick={handleClick}
      className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 border border-transparent hover:border-primary/20"
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          className="mt-0.5"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon className="h-5 w-5 text-primary group-hover:text-primary-glow transition-colors" />
        </motion.div>
        <div className="flex-1">
          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
            {label}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5 group-hover:text-muted-foreground/80">
              {description}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};
