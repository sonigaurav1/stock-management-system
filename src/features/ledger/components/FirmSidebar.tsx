'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddFirmDialog } from './AddFirmDialog';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface FirmSidebarProps {
  onSelectFirm: (
    firm: {
      _id: string;
      name: string;
      owner: string;
      address: string;
      phone: string;
      createdAt: number;
      updatedAt: number | null;
      isDeleted: boolean;
    } | null
  ) => void;
  selectedFirmId: string | null;
}

// const NO_FIRMS_FOUND = 'No firms found';
// const DELETE_FIRM_TITLE = 'Delete Firm';

export default function FirmSidebar({
  onSelectFirm,
  selectedFirmId
}: FirmSidebarProps) {
  const getAllFirms = useQuery(api.ledger.getAllFirms) ?? [];
  const deleteFirm = useMutation(api.ledger.deleteFirm);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddFirmDialogOpen, setIsAddFirmDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Firm Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [firmToDelete, setFirmToDelete] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (
    firm: { _id: string; name: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setFirmToDelete(firm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (firmToDelete) {
      try {
        await deleteFirm({ firmId: firmToDelete._id });
        setFirmToDelete(null);
        setIsDeleteDialogOpen(false);
        toast.success('Firm deleted successfully');
        onSelectFirm(null);
      } catch (error) {
        toast.error('Failed to delete firm. Please try again.');
        // eslint-disable-next-line no-console
        console.error('Failed to delete firm:', error);
      }
    }
  };

  const handleTrashClick = useCallback(
    (e: React.MouseEvent, firm: { _id: string; name: string }) => {
      e.stopPropagation();
      handleDeleteClick(firm, e);
    },
    []
  );

  // Filter firms based on search query
  const filteredFirms = (getAllFirms ?? []).filter(
    (firm) =>
      firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close sidebar on mobile when a firm is selected
  useEffect(() => {
    if (selectedFirmId && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [selectedFirmId]);

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/30 md:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant='outline'
        size='icon'
        className='fixed left-4 top-4 z-50 md:hidden'
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className='h-5 w-5' />
        ) : (
          <Menu className='h-5 w-5' />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 border-r bg-white transition-transform duration-300 ease-in-out md:sticky',
          'md:z-0 md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Sidebar header */}
          <div className='border-b p-4'>
            <h2 className='mb-4 text-xl font-bold'>Firms</h2>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Search firms...'
                className='pl-8'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Firms list */}
          <ScrollArea className='h-[calc(100dvh-250px)]'>
            <div className='flex-1 p-2'>
              {filteredFirms.length > 0 ? (
                <ul className='space-y-1'>
                  {filteredFirms.map((firm: any) => (
                    <li key={firm._id}>
                      <button
                        className={cn(
                          'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left',
                          selectedFirmId === firm._id
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        )}
                        onClick={() => onSelectFirm(firm)}
                      >
                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800'>
                          {firm.name.charAt(0)}
                        </div>
                        <div className='overflow-hidden'>
                          <div className='truncate font-medium'>
                            {firm.name}
                          </div>
                          <div className='truncate text-xs text-gray-500'>
                            {firm.owner}
                          </div>
                        </div>
                        <Trash
                          onClick={(e) => handleTrashClick(e, firm)}
                          className='ml-auto hidden size-6 hover:text-red-600 group-hover:block'
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='p-4 text-center text-gray-500'>
                  No firms found
                </div>
              )}
            </div>
          </ScrollArea>
          {/* Add new firm button */}
          <div className='border-t p-4'>
            <Button
              onClick={() => setIsAddFirmDialogOpen(true)}
              className='flex w-full items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add New Firm
            </Button>
          </div>
        </div>
      </div>

      <AddFirmDialog
        isOpen={isAddFirmDialogOpen}
        onConfirm={() => setIsAddFirmDialogOpen(false)}
        onCancel={() => setIsAddFirmDialogOpen(false)}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Trash
            onClick={(e) => e.stopPropagation()}
            className='ml-auto hidden size-6 hover:text-red-600 group-hover:block'
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Firm</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the firm &quot;
              {firmToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-500 text-white hover:bg-white hover:text-red-600'
              onClick={async (e) => {
                e.stopPropagation();
                handleDeleteConfirm();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
