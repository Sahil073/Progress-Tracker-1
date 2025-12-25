import { motion } from "framer-motion";

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full bg-secondary/50 rounded-full h-4 overflow-hidden shadow-inner border border-border/50">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-accent relative"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "circOut" }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
      </motion.div>
    </div>
  );
}
