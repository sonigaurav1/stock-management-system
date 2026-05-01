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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle, Zap } from 'lucide-react';
import { HelpTooltip, SmartGuidance } from './HelpTooltip';

export const ScenarioPlanner = () => {
  const [baselineRevenue, setBaselineRevenue] = useState(100000);
  const [marketingIncrease, setMarketingIncrease] = useState(10);
  const [priceIncrease, setPriceIncrease] = useState(5);
  const [volumeIncrease, setVolumeIncrease] = useState(8);
  const [months, setMonths] = useState(6);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Fetch scenario results
  const scenario = useQuery(api.forecasting.runScenario, {
    baselineRevenue,
    marketingIncrease,
    priceIncrease,
    volumeIncrease,
    months
  });

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    switch (preset) {
      case 'growth-hacking':
        setMarketingIncrease(30);
        setPriceIncrease(0);
        setVolumeIncrease(25);
        break;
      case 'premium':
        setMarketingIncrease(15);
        setPriceIncrease(15);
        setVolumeIncrease(5);
        break;
      case 'balanced':
        setMarketingIncrease(15);
        setPriceIncrease(8);
        setVolumeIncrease(12);
        break;
    }
  };

  if (!scenario) {
    return <div className='py-8 text-center'>Loading scenario analysis...</div>;
  }

  const currentROI =
    scenario.projectedRevenue > baselineRevenue
      ? (
          ((scenario.projectedRevenue - baselineRevenue) / baselineRevenue) *
          100
        ).toFixed(1)
      : 0;

  const chartData = scenario.monthlyBreakdown.map((month: any) => ({
    month: month.month,
    baseline: baselineRevenue,
    projected: month.revenue
  }));

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Scenario Planner</h2>
        <p className='text-sm text-gray-600'>
          Model different business strategies and see projected impact on
          revenue
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        {[
          {
            id: 'growth-hacking',
            label: 'Growth Hacking',
            desc: 'Maximum marketing spend'
          },
          { id: 'premium', label: 'Premium Strategy', desc: 'Higher prices' },
          { id: 'balanced', label: 'Balanced Growth', desc: 'Steady expansion' }
        ].map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              activePreset === preset.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className='font-semibold text-gray-900'>{preset.label}</p>
            <p className='text-xs text-gray-600'>{preset.desc}</p>
          </button>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Adjust Strategy Parameters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Marketing Investment */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='font-semibold text-gray-900'>
                Marketing Investment
              </label>
              <HelpTooltip
                title='Marketing Impact'
                content='Expected to drive 4x return on investment'
              />
            </div>
            <div className='flex items-center gap-4'>
              <input
                type='range'
                min='0'
                max='50'
                value={marketingIncrease}
                onChange={(e) => {
                  setMarketingIncrease(parseFloat(e.target.value));
                  setActivePreset(null);
                }}
                className='flex-1'
              />
              <span className='inline-block min-w-fit rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold'>
                +{marketingIncrease}%
              </span>
            </div>
            <p className='mt-1 text-xs text-gray-600'>
              Expected revenue impact: +{(marketingIncrease * 4).toFixed(1)}%
            </p>
          </div>

          {/* Price Increase */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='font-semibold text-gray-900'>
                Price Increase
              </label>
              <HelpTooltip
                title='Price Elasticity'
                content='Higher prices reduce volume by 2x the price increase'
              />
            </div>
            <div className='flex items-center gap-4'>
              <input
                type='range'
                min='0'
                max='30'
                value={priceIncrease}
                onChange={(e) => {
                  setPriceIncrease(parseFloat(e.target.value));
                  setActivePreset(null);
                }}
                className='flex-1'
              />
              <span className='inline-block min-w-fit rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold'>
                +{priceIncrease}%
              </span>
            </div>
            <p className='mt-1 text-xs text-gray-600'>
              Volume impact: -{(priceIncrease * 2).toFixed(1)}%
            </p>
          </div>

          {/* Volume Increase */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='font-semibold text-gray-900'>
                Volume Increase Potential
              </label>
              <HelpTooltip
                title='Sales Volume'
                content='Additional units or transactions you could achieve'
              />
            </div>
            <div className='flex items-center gap-4'>
              <input
                type='range'
                min='0'
                max='40'
                value={volumeIncrease}
                onChange={(e) => {
                  setVolumeIncrease(parseFloat(e.target.value));
                  setActivePreset(null);
                }}
                className='flex-1'
              />
              <span className='inline-block min-w-fit rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold'>
                +{volumeIncrease}%
              </span>
            </div>
          </div>

          {/* Forecast Duration */}
          <div>
            <label className='mb-2 block font-semibold text-gray-900'>
              Projection Duration
            </label>
            <div className='flex gap-2'>
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                    months === m
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {m} months
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-sm font-semibold text-gray-600'>
                Projected Revenue
              </p>
              <p className='text-3xl font-bold text-blue-600'>
                ₹
                {scenario.projectedRevenue.toLocaleString('en-IN', {
                  maximumFractionDigits: 0
                })}
              </p>
              <p className='text-xs text-gray-500'>
                vs Baseline: ₹{baselineRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-sm font-semibold text-gray-600'>
                ROI Improvement
              </p>
              <p
                className={`text-3xl font-bold ${
                  Number(currentROI) > 0 ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                +{currentROI}%
              </p>
              <p className='text-xs text-gray-500'>
                Revenue increase over baseline
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-sm font-semibold text-gray-600'>Risk Level</p>
              <p className='text-3xl font-bold text-orange-600'>
                {scenario.riskLevel || 'Medium'}
              </p>
              <p className='text-xs text-gray-500'>
                Based on strategy aggressiveness
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-gray-600'>
            Trajectory chart will display here
          </p>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <SmartGuidance
        type={Number(currentROI) > 20 ? 'success' : 'tip'}
        message={
          Number(currentROI) > 20
            ? '<strong>Excellent strategy!</strong> This scenario shows strong potential.'
            : '<strong>Consider adjusting:</strong> Try increasing marketing investment for better results.'
        }
      />
    </div>
  );
};
