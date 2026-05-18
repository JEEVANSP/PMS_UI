import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@shared/lib/cn";

export type ChartData = Record<string, string | number>;

export type LineChartProps = {
  data: ChartData[];
  xKey: string;
  yKey: string;
  height?: number;
  stroke?: string;
  className?: string;
};

export function LineChart({
  data,
  xKey,
  yKey,
  height = 300,
  stroke = "#2563eb",
  className,
}: LineChartProps) {
  return (
    <div
      className={cn(
        "w-full border rounded-lg shadow-sm p-4 bg-white",
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={stroke}
            strokeWidth={2}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export type BarChartProps = {
  data: ChartData[];
  xKey: string;
  yKey: string;
  height?: number;
  fill?: string;
  className?: string;
};

export function BarChart({
  data,
  xKey,
  yKey,
  height = 300,
  fill = "#16a34a",
  className,
}: BarChartProps) {
  return (
    <div
      className={cn(
        "w-full border rounded-lg shadow-sm p-4 bg-white",
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey={yKey} fill={fill} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type ChartProps = {
  data: ChartData[];
  xKey: string;
  yKey: string;
  type?: "line" | "bar";
  height?: number;
  className?: string;
};

export default function Chart({
  data,
  xKey,
  yKey,
  type = "line",
  height = 300,
  className,
}: ChartProps) {
  if (type === "line") {
    return (
      <LineChart
        data={data}
        xKey={xKey}
        yKey={yKey}
        height={height}
        className={className}
      />
    );
  }

  return (
    <BarChart
      data={data}
      xKey={xKey}
      yKey={yKey}
      height={height}
      className={className}
    />
  );
}
