import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "./ui/skeleton";

export const description = "Grafik Interaktif Tren Setoran";

interface ChartDataPoint {
    date: string;
    kopra: number;
    sabut: number;
}

const chartConfig = {
  volume: {
    label: "Volume (kg)",
  },
  kopra: {
    label: "Kopra",
    color: "hsl(var(--chart-1, 142.1 76.2% 36.3%))", // Hijau
  },
  sabut: {
    label: "Sabut",
    color: "hsl(var(--chart-2, 38 92% 50%))", // Oranye
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ chartData }: { chartData: ChartDataPoint[] | null }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("kopra");


  const filteredData = React.useMemo(() => {
    if (!chartData) return [];
    
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysToSubtract);
    
    return chartData.filter(item => {
        const date = new Date(item.date);
        return date >= startDate && date <= now;
    });

  }, [chartData, timeRange]);

  if (!chartData) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-5 w-72 mt-1" />
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <Skeleton className="h-[250px] w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Volume Setoran Komoditas</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total setoran harian (kg) dalam periode waktu terpilih
          </span>
          <span className="@[540px]/card:hidden">Setoran Harian (kg)</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d");
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 Bulan</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Hari</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Hari</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value);
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih Periode Waktu"
            >
              <SelectValue placeholder="3 Bulan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 Bulan
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 Hari
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 Hari
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillKopra" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-kopra)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-kopra)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSabut" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sabut)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sabut)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sabut"
              type="natural"
              fill="url(#fillSabut)"
              stroke="var(--color-sabut)"
              stackId="a"
            />
            <Area
              dataKey="kopra"
              type="natural"
              fill="url(#fillKopra)"
              stroke="var(--color-kopra)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
