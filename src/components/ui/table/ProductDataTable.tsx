'use client';

import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  // getPaginationRowModel,
  PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useSidebar } from '../sidebar';

interface DataTableProps<TData extends { _id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeOptions?: number[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export function DataTable<TData extends { _id: string }, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [5, 7, 10, 15, 20],
  pagination
}: DataTableProps<TData, TValue>) {
  const { page, pageSize, totalPages, onPageChange, onPageSizeChange } =
    pagination;

  const { state } = useSidebar();

  // eslint-disable-next-line no-console
  console.log('state', state);

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

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination: paginationState
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true
  });

  return (
    <div
      className={cn(
        'flex max-w-[95vw] flex-col space-y-4 sm:max-w-[96vw] md:max-w-[89vw] md:flex-1',
        state === 'collapsed' ? 'lg:max-w-full' : 'lg:max-w-[77vw]'
      )}
    >
      <div className='relative rounded-md border'>
        <div className='overflow-x-auto'>
          <Table className=''>
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
        </div>
      </div>

      <div className='flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between'>
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

        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium'>Rows per page</p>
            <Select
              value={`${paginationState.pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                table.setPageSize(newPageSize);
                table.setPageIndex(0);
                // onPageChange(1);
                onPageSizeChange(newPageSize);
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

          <div className='flex items-center justify-between gap-2'>
            <div className='text-sm font-medium'>
              Page {paginationState.pageIndex + 1} of{' '}
              {Math.max(1, table.getPageCount())}
            </div>
            <div className='flex items-center space-x-1'>
              <Button
                aria-label='Go to first page'
                variant='outline'
                className='hidden h-8 w-8 p-0 sm:flex'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <DoubleArrowLeftIcon className='h-4 w-4' aria-hidden='true' />
              </Button>
              <Button
                aria-label='Go to previous page'
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className='h-4 w-4' aria-hidden='true' />
              </Button>
              <Button
                aria-label='Go to next page'
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className='h-4 w-4' aria-hidden='true' />
              </Button>
              <Button
                aria-label='Go to last page'
                variant='outline'
                className='hidden h-8 w-8 p-0 sm:flex'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <DoubleArrowRightIcon className='h-4 w-4' aria-hidden='true' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
