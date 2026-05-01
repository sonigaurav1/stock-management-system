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
import { AlertCircle, Mail, Phone, TrendingDown } from 'lucide-react';
import { HelpTooltip, SmartGuidance } from './HelpTooltip';

export const ChurnPrediction = () => {
  const [riskThreshold, setRiskThreshold] = useState(0.7);

  // Fetch churn predictions
  const churnData = useQuery(api.forecasting.getChurnPrediction, {
    riskThreshold
  });

  if (!churnData) {
    return <div className='py-8 text-center'>Loading churn analysis...</div>;
  }

  const highRiskCount =
    churnData.predictions?.filter((p: any) => p.riskScore >= 0.8).length || 0;

  const atRiskPercentage = churnData.predictions
    ? (
        (churnData.predictions.length / (churnData.totalCustomers || 1)) *
        100
      ).toFixed(1)
    : 0;

  const riskFactors = [
    { weight: '40%', factor: 'Days since last purchase' },
    { weight: '30%', factor: 'Purchase frequency decline' },
    { weight: '30%', factor: 'Engagement & value drop' }
  ];

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Churn Risk Analysis</h2>
        <p className='text-sm text-gray-600'>
          Identify customers at risk of leaving and take action before they go
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                At-Risk Customers
              </span>
              <p className='text-3xl font-bold text-red-600'>
                {churnData.predictions?.length || 0}
              </p>
              <p className='text-xs text-gray-500'>
                {atRiskPercentage}% of customer base
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                High Risk (80%+)
              </span>
              <p className='text-3xl font-bold text-orange-600'>
                {highRiskCount}
              </p>
              <p className='text-xs text-gray-500'>Needs immediate attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-sm font-semibold text-gray-600'>
                Risk Threshold
              </p>
              <div className='flex items-center gap-3'>
                <input
                  type='range'
                  min='0.5'
                  max='0.95'
                  step='0.05'
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
                  className='flex-1'
                />
                <span className='inline-block min-w-fit rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold'>
                  {(riskThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            {riskFactors.map(({ weight, factor }) => (
              <div key={factor} className='rounded-lg bg-gray-50 p-4'>
                <p className='text-2xl font-bold text-blue-600'>{weight}</p>
                <p className='text-sm text-gray-600'>{factor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='pb-3 text-left font-semibold text-gray-600'>
                    Customer
                  </th>
                  <th className='pb-3 text-left font-semibold text-gray-600'>
                    Risk Score
                  </th>
                  <th className='pb-3 text-left font-semibold text-gray-600'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {churnData.predictions
                  ?.slice(0, 10)
                  .map((customer: any, idx: number) => (
                    <tr key={idx} className='border-b border-gray-100'>
                      <td className='py-3'>
                        {customer.name || `Customer ${idx + 1}`}
                      </td>
                      <td className='py-3'>
                        <span className='font-semibold'>
                          {(customer.riskScore * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className='py-3'>
                        <button className='rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600'>
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
