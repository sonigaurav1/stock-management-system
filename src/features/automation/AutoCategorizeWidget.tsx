'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Layers3, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function AutoCategorizeWidget() {
  const categorizeData = useQuery(api.automation.suggestTransactionCategories, {
    minConfidence: 50
  });
  const applyCategories = useMutation(api.automation.applyCategoriesToMultiple);
  const [applying, setApplying] = useState(false);

  const handleApplyAllHighConfidence = async () => {
    if (!categorizeData?.suggestions) return;

    setApplying(true);
    try {
      const highConfidenceItems = categorizeData.suggestions.filter(
        (s: any) => s.confidence > 75
      );
      await applyCategories({
        categorizations: highConfidenceItems.map((item: any) => ({
          transactionId: item.transactionId,
          category: item.suggestedCategory
        }))
      });
    } catch (error) {
      console.error('Failed to apply categories:', error);
    } finally {
      setApplying(false);
    }
  };

  if (categorizeData === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-green-600' />
      </div>
    );
  }

  const {
    suggestions = [],
    needsAttention = [],
    summary = {
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      uncategorized: 0
    }
  } = categorizeData || {};

  return (
    <div className='space-y-6'>
      {/* Categorization Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-green-600'>
                {summary?.highConfidence || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>
                High Confidence (&gt;80%)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-yellow-600'>
                {summary?.mediumConfidence || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>
                Medium Confidence (50-80%)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-orange-600'>
                {summary?.lowConfidence || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>
                Low Confidence (&lt;50%)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-red-600'>
                {summary?.uncategorized || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Uncategorized</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Confidence Suggestions */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle2 className='h-5 w-5 text-green-600' />
                High Confidence Suggestions
              </CardTitle>
              <CardDescription>
                {summary?.highConfidence || 0} transactions ready for automatic
                categorization
              </CardDescription>
            </div>
            {(summary?.highConfidence || 0) > 0 && (
              <Button
                onClick={handleApplyAllHighConfidence}
                disabled={applying}
                className='gap-2'
                variant='default'
              >
                {applying ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='h-4 w-4' />
                    Apply All
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {suggestions.filter((s: any) => s.confidence > 80).length === 0 ? (
            <p className='py-8 text-center text-gray-500'>
              No high confidence suggestions
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Suggested Category</TableHead>
                    <TableHead className='text-right'>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions
                    .filter((s: any) => s.confidence > 80)
                    .slice(0, 10)
                    .map((suggestion: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className='text-sm'>
                          {suggestion.description}
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          ₹{suggestion.amount}
                        </TableCell>
                        <TableCell>
                          <Badge className='bg-green-100 text-green-800'>
                            {suggestion.suggestedCategory}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right font-bold text-green-600'>
                          {suggestion.confidence}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medium Confidence Suggestions */}
      {(summary?.mediumConfidence || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-yellow-600' />
              Medium Confidence Suggestions
            </CardTitle>
            <CardDescription>
              Review and approve these categorizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Suggested Category</TableHead>
                    <TableHead className='text-right'>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions
                    .filter((s: any) => s.confidence > 50 && s.confidence <= 80)
                    .slice(0, 5)
                    .map((suggestion: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className='text-sm'>
                          {suggestion.description}
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          ₹{suggestion.amount}
                        </TableCell>
                        <TableCell>
                          <Badge className='bg-yellow-100 text-yellow-800'>
                            {suggestion.suggestedCategory}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right font-bold text-yellow-600'>
                          {suggestion.confidence}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uncategorized Items */}
      {(summary?.uncategorized || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Layers3 className='h-5 w-5 text-gray-600' />
              Uncategorized Transactions
            </CardTitle>
            <CardDescription>
              {summary?.uncategorized || 0} transactions need manual
              categorization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Current Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {needsAttention.slice(0, 5).map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='text-sm'>
                        {item.description}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        ₹{item.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='text-gray-600'>
                          {item.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className='border-green-200 bg-green-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertCircle className='h-5 w-5 text-green-600' />
            How Automatic Categorization Works
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white'>
              1
            </div>
            <p>System analyzes transaction descriptions</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white'>
              2
            </div>
            <p>Matches keywords against category patterns</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white'>
              3
            </div>
            <p>Assigns confidence score (0-100%) based on match quality</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white'>
              4
            </div>
            <p>High confidence items auto-applied, medium/low need review</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
