'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { skeletonColumns } from '@/features/products/components/suppliers/suppliers-tables/columns';
import { supplierSkeletonData } from '@/features/products/constants/skeletonData.supplier';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeOptions?: number[];
  isLoading: boolean;
  isFetching: boolean;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function SupplierDataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  isLoading,
  isFetching,
  pagination
}: DataTableProps<TData, TValue>) {
  const { page, pageSize, totalPages, onPageChange } = pagination;

  const paginationState = {
    pageIndex: page - 1,
    pageSize: pageSize
  };

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(paginationState)
        : updaterOrValue;

    onPageChange(pagination.pageIndex + 1);
  };

  const supplierTableColumns = isFetching
    ? (skeletonColumns as ColumnDef<any>[])
    : columns;
  const supplierData = isFetching ? supplierSkeletonData : data;

  const table = useReactTable({
    data: supplierData as TData[],
    columns: supplierTableColumns,
    pageCount: totalPages,
    state: {
      pagination: paginationState
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true
  });

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <ScrollArea className='h-full'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>

      <div className='flex items-center justify-between gap-4'>
        <div className='text-sm text-muted-foreground'>
          {totalItems > 0 ? (
            <>
              Showing {paginationState.pageIndex * paginationState.pageSize + 1}{' '}
              to{' '}
              {Math.min(
                (paginationState.pageIndex + 1) * paginationState.pageSize,
                totalItems
              )}{' '}
              of {totalItems} entries
            </>
          ) : (
            'No entries found'
          )}
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium'>Rows per page</p>
            <Select
              value={`${paginationState.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={paginationState.pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <div className='text-sm font-medium'>
              Page {paginationState.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className='flex items-center gap-1'>
              <Button
                aria-label='Go to first page'
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <DoubleArrowLeftIcon className='h-4 w-4' />
              </Button>
              <Button
                aria-label='Go to previous page'
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className='h-4 w-4' />
              </Button>
              <Button
                aria-label='Go to next page'
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
              <Button
                aria-label='Go to last page'
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <DoubleArrowRightIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
