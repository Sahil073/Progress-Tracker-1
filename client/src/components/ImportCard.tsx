import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ImportCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function ImportCard({
  title,
  description,
  icon,
  onClick,
  className,
  active,
}: ImportCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all duration-300",
        "bg-card hover:shadow-xl hover:-translate-y-1",
        active ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]" : "border-border shadow-sm",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className={cn(
          "p-4 rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20",
          active && "bg-primary text-primary-foreground"
        )}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold font-display text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
