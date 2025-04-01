import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  colorScheme?: "deepfake" | "authentic" | "neutral";
}

export default function ConfidenceMeter({ 
  value, 
  className, 
  size = "md",
  colorScheme = "neutral"
}: ConfidenceMeterProps) {
  // Determine meter height based on size
  const heightClass = size === "sm" ? "h-2" : size === "md" ? "h-2.5" : "h-3";
  
  // Determine color based on confidence value and scheme
  const getValueColor = () => {
    if (colorScheme === "deepfake") {
      return "bg-secondary";
    } else if (colorScheme === "authentic") {
      return value > 80 ? "bg-success" : value > 50 ? "bg-warning" : "bg-secondary";
    } else {
      // neutral colorScheme
      return value > 80 ? "bg-primary" : value > 50 ? "bg-warning" : "bg-gray-400";
    }
  };
  
  const valueColor = getValueColor();
  
  return (
    <div className={cn("w-full rounded-full bg-gray-200 overflow-hidden", heightClass, className)}>
      <div 
        className={cn("h-full rounded-full transition-all duration-500", valueColor)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
