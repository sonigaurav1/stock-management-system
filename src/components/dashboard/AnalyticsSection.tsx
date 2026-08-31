/**
 * Analytics Section Component
 * Inventory Health donut chart and Sales Trend area chart
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Sector
} from 'recharts';
import { Download, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { ChartSkeleton } from '@/components/skeletons';

// Sample data
const inventoryData = [
  { name: 'Healthy', value: 85, color: '#10b981', status: 'healthy' },
  { name: 'Low Stock', value: 10, color: '#f59e0b', status: 'low' },
  { name: 'Out of Stock', value: 5, color: '#f43f5e', status: 'out' }
];

const salesData7D = [
  { day: 'Mon', revenue: 4200, units: 45 },
  { day: 'Tue', revenue: 3800, units: 38 },
  { day: 'Wed', revenue: 5100, units: 52 },
  { day: 'Thu', revenue: 4600, units: 48 },
  { day: 'Fri', revenue: 6200, units: 65 },
  { day: 'Sat', revenue: 5800, units: 60 },
  { day: 'Sun', revenue: 4900, units: 50 }
];

const salesData30D = [
  { day: 'Week 1', revenue: 28500, units: 290 },
  { day: 'Week 2', revenue: 31200, units: 320 },
  { day: 'Week 3', revenue: 26800, units: 275 },
  { day: 'Week 4', revenue: 35400, units: 365 }
];

const salesData90D = [
  { day: 'Jan', revenue: 98000, units: 980 },
  { day: 'Feb', revenue: 112000, units: 1100 },
  { day: 'Mar', revenue: 105000, units: 1050 }
];

const salesData1Y = [
  { day: 'Q1', revenue: 315000, units: 3130 },
  { day: 'Q2', revenue: 342000, units: 3380 },
  { day: 'Q3', revenue: 298000, units: 2950 },
  { day: 'Q4', revenue: 385000, units: 3820 }
];

// Active shape for donut chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <defs>
        <filter id='dropShadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='0' stdDeviation='3' floodOpacity='0.3' />
        </filter>
      </defs>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter='url(#dropShadow)'
      />
    </g>
  );
};

interface InventoryDataItem {
  name: string;
  value: number;
  color: string;
  status: string;
}

interface SalesDataItem {
  day: string;
  revenue: number;
  units: number;
}

interface AnalyticsSectionProps {
  isLoading?: boolean;
  inventoryData?: InventoryDataItem[];
  totalSKUs?: number;
  salesData?: SalesDataItem[];
  onInventorySegmentClick?: (segment: string) => void;
}

export function AnalyticsSection({
  isLoading = false,
  inventoryData: propInventoryData,
  totalSKUs: propTotalSKUs,
  salesData: propSalesData,
  onInventorySegmentClick
}: AnalyticsSectionProps) {
  const [activePeriod, setActivePeriod] = useState('30D');
  const [activeInventoryIndex, setActiveInventoryIndex] = useState<
    number | null
  >(null);

  // Use provided data or fall back to sample data
  const inventoryData = propInventoryData || [
    { name: 'Healthy', value: 85, color: '#10b981', status: 'healthy' },
    { name: 'Low Stock', value: 10, color: '#f59e0b', status: 'low' },
    { name: 'Out of Stock', value: 5, color: '#f43f5e', status: 'out' }
  ];

  const totalSKUs =
    propTotalSKUs || inventoryData.reduce((acc, curr) => acc + curr.value, 0);

  const getSalesData = () => {
    if (propSalesData && propSalesData.length > 0) {
      return propSalesData;
    }

    switch (activePeriod) {
      case '7D':
        return salesData7D;
      case '30D':
        return salesData30D;
      case '90D':
        return salesData90D;
      case '1Y':
        return salesData1Y;
      default:
        return salesData30D;
    }
  };

  if (isLoading) {
    return (
      <div className='grid gap-6 lg:grid-cols-2'>
        <ChartSkeleton aspectRatio='video' />
        <ChartSkeleton aspectRatio='video' />
      </div>
    );
  }

  return (
    <motion.div
      className='grid gap-6 lg:grid-cols-2'
      variants={staggerContainer}
      initial='initial'
      animate='animate'
    >
      {/* Inventory Health Chart */}
      <motion.div variants={fadeInUp}>
        <Card className='overflow-hidden border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'>
                <Package className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Inventory Health
                </CardTitle>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  {totalSKUs} SKUs total
                </p>
              </div>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Download className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='flex items-center gap-8'>
              {/* Donut Chart */}
              <div className='relative h-48 w-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey='value'
                      onMouseEnter={(_, index) =>
                        setActiveInventoryIndex(index)
                      }
                      onMouseLeave={() => setActiveInventoryIndex(null)}
                      onClick={(_, index) => {
                        onInventorySegmentClick?.(inventoryData[index].status);
                      }}
                      activeIndex={activeInventoryIndex ?? undefined}
                      activeShape={renderActiveShape}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className='cursor-pointer transition-all duration-200 hover:opacity-80'
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='font-mono text-2xl font-bold text-slate-900 dark:text-slate-100'>
                    {totalSKUs}
                  </span>
                  <span className='text-xs text-slate-500 dark:text-slate-400'>
                    SKUs
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className='flex-1 space-y-3'>
                {inventoryData.map((item) => (
                  <div
                    key={item.name}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='h-3 w-3 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <span className='text-sm text-slate-700 dark:text-slate-300'>
                        {item.name}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='font-mono'>
                        {item.value}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sales Trend Chart */}
      <motion.div variants={fadeInUp}>
        <Card className='overflow-hidden border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'>
                <TrendingUp className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Sales Trend
                </CardTitle>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Revenue & Units Sold
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Tabs value={activePeriod} onValueChange={setActivePeriod}>
                <TabsList className='h-8'>
                  <TabsTrigger value='7D' className='px-2 text-xs'>
                    7D
                  </TabsTrigger>
                  <TabsTrigger value='30D' className='px-2 text-xs'>
                    30D
                  </TabsTrigger>
                  <TabsTrigger value='90D' className='px-2 text-xs'>
                    90D
                  </TabsTrigger>
                  <TabsTrigger value='1Y' className='px-2 text-xs'>
                    1Y
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <Download className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={getSalesData()}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id='colorRevenue'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#e2e8f0'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='day'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId='left'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) =>
                      `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                    }
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800'>
                            <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                              {label}
                            </p>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                              Revenue:{' '}
                              <span className='font-mono font-medium text-indigo-600'>
                                ${payload[0].value?.toLocaleString()}
                              </span>
                            </p>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                              Units:{' '}
                              <span className='font-mono font-medium text-emerald-600'>
                                {payload[1]?.value?.toLocaleString()}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    yAxisId='left'
                    type='monotone'
                    dataKey='revenue'
                    stroke='#6366f1'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorRevenue)'
                    animationDuration={1000}
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='units'
                    stroke='#10b981'
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: '#10b981',
                      strokeWidth: 2,
                      fill: '#fff'
                    }}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default AnalyticsSection;
