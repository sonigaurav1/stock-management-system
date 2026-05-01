'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { DataTableSearch } from '@/components/ui/table/DataTableSearch';
import { useProductTableFilters } from './useProductTableFilters';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface ProductTableActionProps {
  filters: any;
  setFilters: (filters: any) => void;
  setPage: (page: number) => void;
}

const stockStatusOptions = [
  {
    value: 'in_stock',
    label: 'In Stock',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    value: 'low_stock',
    label: 'Low Stock',
    icon: AlertTriangle,
    color: 'text-yellow-500'
  },
  {
    value: 'out_of_stock',
    label: 'Out of Stock',
    icon: XCircle,
    color: 'text-red-500'
  }
];

export default function ProductTableAction({
  filters,
  setFilters,
  setPage
}: ProductTableActionProps) {
  const {
    categoriesFilter,
    setCategoriesFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setSearchQuery
  } = useProductTableFilters();

  const fetchedCategories = useQuery(api.categories.getAllCategories) ?? [];
  const fetchedProducts = useQuery(api.products.getAllProducts) ?? [];

  // Get unique brands
  const brands = [
    ...new Set(fetchedProducts.map((p) => p.brand).filter(Boolean))
  ];

  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>(
    []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const activeFiltersCount =
    (filters.category ? 1 : 0) +
    (filters.searchTerm ? 1 : 0) +
    selectedStockStatuses.length +
    selectedBrands.length;

  const handleStockStatusToggle = (status: string) => {
    const newStatuses = selectedStockStatuses.includes(status)
      ? selectedStockStatuses.filter((s) => s !== status)
      : [...selectedStockStatuses, status];

    setSelectedStockStatuses(newStatuses);
    setFilters({
      ...filters,
      stockStatus: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(newBrands);
    setFilters({
      ...filters,
      brand: newBrands.length > 0 ? newBrands : undefined
    });
  };

  const handleReset = () => {
    resetFilters();
    setSelectedStockStatuses([]);
    setSelectedBrands([]);
    setFilters({});
  };

  return (
    <div className='space-y-3'>
      {/* Top Row - Search */}
      <div className='flex flex-wrap items-center gap-2'>
        <div className='max-w-[280px] flex-1 md:mr-2'>
          <DataTableSearch
            searchKey='product name'
            searchQuery={searchQuery}
            setSearchQuery={(value) => {
              setSearchQuery(value);
              setFilters({ ...filters, searchTerm: value });
            }}
            setPage={setPage}
          />
        </div>

        {/* Filter Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2'>
              <Filter className='h-4 w-4' />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1 h-5 min-w-5 justify-center px-1.5 py-0'
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Stock Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={selectedStockStatuses.includes('in_stock')}
              onCheckedChange={() => handleStockStatusToggle('in_stock')}
            >
              <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
              In Stock
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStockStatuses.includes('low_stock')}
              onCheckedChange={() => handleStockStatusToggle('low_stock')}
            >
              <AlertTriangle className='mr-2 h-4 w-4 text-yellow-500' />
              Low Stock
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStockStatuses.includes('out_of_stock')}
              onCheckedChange={() => handleStockStatusToggle('out_of_stock')}
            >
              <XCircle className='mr-2 h-4 w-4 text-red-500' />
              Out of Stock
            </DropdownMenuCheckboxItem>

            {brands.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Brand</DropdownMenuLabel>
                {brands.map((brand: any) => (
                  <DropdownMenuCheckboxItem
                    key={brand}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  >
                    {brand}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => {
            setCategoriesFilter(e.target.value || '');
            setFilters({ ...filters, category: e.target.value || undefined });
          }}
          className='h-9 rounded-md border border-input bg-background px-3 py-1 text-sm'
        >
          <option value=''>All Categories</option>
          {fetchedCategories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleReset}
            className='gap-1 text-muted-foreground'
          >
            <RotateCcw className='h-4 w-4' />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {filters.searchTerm && (
            <Badge variant='secondary' className='gap-1'>
              Search: {filters.searchTerm}
              <XCircle
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ ...filters, searchTerm: undefined });
                }}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant='secondary' className='gap-1'>
              Category:{' '}
              {
                fetchedCategories.find((c: any) => c._id === filters.category)
                  ?.name
              }
              <XCircle
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setCategoriesFilter('');
                  setFilters({ ...filters, category: undefined });
                }}
              />
            </Badge>
          )}
          {selectedStockStatuses.map((status) => {
            const option = stockStatusOptions.find((o) => o.value === status);
            return (
              <Badge key={status} variant='secondary' className='gap-1'>
                {option?.label}
                <XCircle
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => handleStockStatusToggle(status)}
                />
              </Badge>
            );
          })}
          {selectedBrands.map((brand) => (
            <Badge key={brand} variant='secondary' className='gap-1'>
              {brand}
              <XCircle
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleBrandToggle(brand)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
