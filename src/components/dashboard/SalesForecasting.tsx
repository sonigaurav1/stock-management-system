'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { HelpTooltip, SmartGuidance } from './HelpTooltip';

export const SalesForecasting = () => {
  const [monthsToForecast, setMonthsToForecast] = useState(3);

  // Fetch forecasts
  const forecasts = useQuery(api.forecasting.getSalesForecasts, {
    months: monthsToForecast,
    includeConfidence: true
  });

  // Fetch annual growth projections
  const growthProjections = useQuery(api.forecasting.getGrowthProjections);

  if (!forecasts || !growthProjections) {
    return <div className='py-8 text-center'>Loading forecast data...</div>;
  }

  const chartData = [
    {
      month: forecasts.lastActualMonth,
      revenue: forecasts.lastActualRevenue,
      type: 'Actual',
      confidence: 100
    },
    ...forecasts.forecasts.map((f: any) => ({
      month: f.month,
      revenue: f.forecastedRevenue,
      confidenceLow: f.confidenceLow,
      confidenceHigh: f.confidenceHigh,
      type: 'Forecast',
      confidence: f.confidence
    }))
  ];

  const totalForecastedRevenue = forecasts.forecasts.reduce(
    (sum: number, f: any) => sum + f.forecastedRevenue,
    0
  );

  const projectedAnnualRevenue = growthProjections.annualProjection;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>Sales Forecasting</h2>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-semibold'>Forecast months:</label>
            <select
              value={monthsToForecast}
              onChange={(e) => setMonthsToForecast(parseInt(e.target.value))}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm'
            >
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
        </div>
        <p className='text-sm text-gray-600'>
          AI-powered predictions based on 12-month sales history, seasonal
          patterns, and growth trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-gray-600'>
                  Next {monthsToForecast} Months
                </span>
                <HelpTooltip
                  title='Forecast Period'
                  content='Sum of predicted sales for the selected number of months ahead'
                />
              </div>
              <p className='text-3xl font-bold text-blue-600'>
                ₹
                {totalForecastedRevenue.toLocaleString('en-IN', {
                  maximumFractionDigits: 0
                })}
              </p>
              <p className='text-xs text-gray-500'>
                Avg: ₹
                {Math.round(
                  totalForecastedRevenue / monthsToForecast
                ).toLocaleString('en-IN')}
                /month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-gray-600'>
                  Growth Rate
                </span>
                <HelpTooltip
                  title='Monthly Growth'
                  content='Average month-over-month growth rate from historical data'
                />
              </div>
              <p
                className={`text-3xl font-bold ${
                  forecasts.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {forecasts.growthRate >= 0 ? '+' : ''}
                {forecasts.growthRate}%
              </p>
              <p className='text-xs text-gray-500'>Month over month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-gray-600'>
                  Seasonal Factor
                </span>
                <HelpTooltip
                  title='Seasonal Adjustment'
                  content='How this time of year compares to same period last year. 1.0 = no seasonal change'
                />
              </div>
              <p className='text-3xl font-bold text-purple-600'>
                {forecasts.forecasts[0]?.seasonalFactor}x
              </p>
              <p className='text-xs text-gray-500'>Year-over-year pattern</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-gray-600'>
            Forecast chart will display here
          </p>
        </CardContent>
      </Card>

      {/* Smart Guidance */}
      <SmartGuidance
        type='tip'
        message='<strong>Next step:</strong> Use our Scenario Planner to see how marketing investments could impact your revenue.'
      />
    </div>
  );
};
