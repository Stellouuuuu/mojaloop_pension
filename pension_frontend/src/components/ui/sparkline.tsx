import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: "primary" | "destructive" | "accent";
  className?: string;
  height?: number;
}

const colorMap = {
  primary: "hsl(var(--primary))",
  destructive: "hsl(var(--destructive))",
  accent: "hsl(var(--accent))",
};

export function Sparkline({ 
  data, 
  color = "primary", 
  className,
  height = 30 
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const strokeColor = colorMap[color];

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
