'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

// Define chart colors that will be used dynamically
const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

// Base chart config
const baseChartConfig = {
  totalSold: {
    label: 'Total Sold'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const getTopSellingProducts = useQuery(api.dashboard.getTopSellingProducts);

  // Dynamically create chart config based on available products
  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color?: string }> = {
      ...baseChartConfig
    };

    if (getTopSellingProducts) {
      getTopSellingProducts.forEach((product, index) => {
        const productName = product.name || 'Unknown Product';
        config[productName] = {
          label: productName,
          color: chartColors[index % chartColors.length]
        };
      });
    }

    return config;
  }, [getTopSellingProducts]);

  const chartData = React.useMemo(() => {
    if (!getTopSellingProducts) return [];

    return getTopSellingProducts.map((product, index) => {
      const productName = product.name || 'Unknown Product';
      return {
        name: productName,
        totalSold: product.totalSold,
        fill: chartColors[index % chartColors.length]
      };
    });
  }, [getTopSellingProducts]);

  const totalSold = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.totalSold, 0);
  }, [chartData]);

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Pie Chart - Top Selling Products</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[360px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='totalSold'
              nameKey='name'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalSold.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Total Sold
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 font-medium leading-none'>
          Trending up by % this month <TrendingUp className='h-4 w-4' />
        </div>
        <div className='leading-none text-muted-foreground'>
          Showing top-selling products
          {/* for the last 6 months */}
        </div>
      </CardFooter>
    </Card>
  );
}
