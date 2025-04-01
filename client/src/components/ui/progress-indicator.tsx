import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  value: number;
  label: string;
  className?: string;
}

export default function ProgressIndicator({ value, label, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 rounded-full" 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
