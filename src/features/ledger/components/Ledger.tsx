'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  CalendarIcon,
  ListFilter,
  Hash,
  Trash2,
  Phone,
  Download,
  Edit2,
  X,
  Image as ImageIcon,
  Check,
  Share2,
  ExternalLink,
  Link2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import PageContainer from '@/components/layout/PageContainer';
import { useUser } from '@clerk/nextjs';
import { useEdgeStore } from '@/lib/edgestore';

interface Transaction {
  id: string;
  date: Date | null;
  particular: string;
  drAmount: number | null;
  crAmount: number | null;
  balance: number;
  imageUrl?: string;
}

interface Firm {
  id: string;
  name: string;
  owner: string;
  transactions: Transaction[];
}

interface LedgerComponentProps {
  selectedFirm: {
    _id: string;
    name: string;
    owner: string;
    address: string;
    phone: string;
  };
}

export default function LedgerComponent({
  selectedFirm
}: LedgerComponentProps) {
  const { user } = useUser();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const [viewerImageMeta, setViewerImageMeta] = useState<{
    particular: string;
    date: Date | null;
  } | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeDate, setShowChangeDate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk' | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { edgestore } = useEdgeStore();

  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: '',
    date: null,
    particular: '',
    drAmount: null,
    crAmount: null,
    balance: 0,
    imageUrl: undefined
  });

  const addTransaction = useMutation(api.ledger.addTransaction);
  const updateTransaction = useMutation(api.ledger.updateTransaction);
  const transactionsQuery = useQuery(api.ledger.getTransactionsByFirm, {
    firmId: selectedFirm._id
  });
  const getTransactionsByFirm = useMemo(
    () => transactionsQuery ?? [],
    [transactionsQuery]
  );
  const deleteTransaction = useMutation(api.ledger.deleteTransaction);
  const company = useQuery(
    api.companies.getCompany,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Load firm data when firmId changes
  useEffect(() => {
    if (selectedFirm && getTransactionsByFirm) {
      // Map the fetched data to match the Transaction interface
      const transactionsData = getTransactionsByFirm.map(
        (transaction: any) => ({
          id: transaction._id,
          date: transaction.date ? new Date(transaction.date) : null,
          particular: transaction.particular,
          drAmount: transaction.drAmount || null,
          crAmount: transaction.crAmount || null,
          balance: transaction.balance,
          imageUrl: transaction.imageUrl
        })
      );

      // Avoid unnecessary state updates by checking if the data has changed
      setFirm((prevFirm) => {
        if (
          prevFirm &&
          prevFirm.id === selectedFirm._id &&
          JSON.stringify(prevFirm.transactions) ===
            JSON.stringify(transactionsData)
        ) {
          return prevFirm; // No changes, skip update
        }
        return {
          id: selectedFirm._id,
          name: selectedFirm.name,
          owner: selectedFirm.owner,
          transactions: transactionsData
        };
      });

      setTransactions(transactionsData);
    }
  }, [getTransactionsByFirm, selectedFirm]);

  const handleAddTransaction = () => {
    setShowAddModal(true);
    setShowChangeDate(false);
    setEditingId(null);
    setSelectedImageFile(null);
    setImagePreview(null);
    // Initialize the new transaction with a default balance based on the latest transaction
    const latestBalance = transactions.length > 0 ? transactions[0].balance : 0;
    setNewTransaction({
      id: Date.now().toString(),
      date: new Date(),
      particular: '',
      drAmount: null,
      crAmount: null,
      balance: latestBalance
    });
    setIsAddingTransaction(true);
  };

  const handleSaveTransaction = async () => {
    if (!newTransaction.particular) {
      alert('Please enter a particular');
      return;
    }

    setIsSavingTransaction(true);

    // Calculate the new balance
    const previousBalance =
      transactions.length > 0 ? transactions[0].balance : 0;
    const drAmount = newTransaction.drAmount || 0;
    const crAmount = newTransaction.crAmount || 0;
    const newBalance =
      editingId && transactions.find((t) => t.id === editingId)
        ? (transactions.find((t) => t.id === editingId)?.balance ?? 0) +
          (crAmount - drAmount) -
          ((transactions.find((t) => t.id === editingId)?.crAmount || 0) -
            (transactions.find((t) => t.id === editingId)?.drAmount || 0))
        : previousBalance + crAmount - drAmount;

    let imageUrl = newTransaction.imageUrl;

    if (selectedImageFile) {
      const uploadResult = await edgestore.publicFiles.upload({
        file: selectedImageFile
      });
      imageUrl = uploadResult?.url || imageUrl;
    }

    const updatedTransaction = {
      id: editingId || Date.now().toString(), // Generate a unique ID for the frontend
      firmId: selectedFirm._id,
      date: newTransaction.date || new Date(), // Ensure the date is a Date object
      particular: newTransaction.particular,
      drAmount: newTransaction.drAmount || 0,
      crAmount: newTransaction.crAmount || 0,
      balance: newBalance,
      imageUrl
    };

    try {
      if (editingId) {
        await updateTransaction({
          transactionId: editingId,
          date: updatedTransaction.date.getTime(),
          particular: updatedTransaction.particular,
          drAmount: updatedTransaction.drAmount,
          crAmount: updatedTransaction.crAmount,
          balance: updatedTransaction.balance,
          imageUrl: updatedTransaction.imageUrl
        });

        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === editingId ? updatedTransaction : transaction
          )
        );
      } else {
        const insertedId = await addTransaction({
          firmId: updatedTransaction.firmId,
          date: updatedTransaction.date.getTime(), // Convert to timestamp for backend
          particular: updatedTransaction.particular,
          drAmount: updatedTransaction.drAmount,
          crAmount: updatedTransaction.crAmount,
          balance: updatedTransaction.balance,
          imageUrl: updatedTransaction.imageUrl
        });

        // Add the new transaction to the table
        setTransactions([
          {
            ...updatedTransaction,
            id: String(insertedId)
          },
          ...transactions
        ]);
      }

      // Reset the form and close the add transaction mode
      setIsAddingTransaction(false);
      setShowAddModal(false);
      setShowChangeDate(false);
      setEditingId(null);
      setSelectedImageFile(null);
      setImagePreview(null);
      setNewTransaction({
        id: '',
        date: null,
        particular: '',
        drAmount: null,
        crAmount: null,
        balance: 0,
        imageUrl: undefined
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleCancelTransaction = () => {
    setIsAddingTransaction(false);
    setShowAddModal(false);
    setShowChangeDate(false);
    setEditingId(null);
    setSelectedImageId(null);
    setSelectedImageFile(null);
    setImagePreview(null);
    setNewTransaction({
      id: '',
      date: null,
      particular: '',
      drAmount: null,
      crAmount: null,
      balance: 0,
      imageUrl: undefined
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setShowAddModal(true);
    setShowChangeDate(false);
    setIsAddingTransaction(true);
    setEditingId(transaction.id);
    setNewTransaction({ ...transaction });
    setImagePreview(transaction.imageUrl || null);
    setSelectedImageFile(null);
  };

  const handleDeleteIndividualTransaction = async (id: string) => {
    setDeleteTargetId(id);
    setDeleteType('single');
    setShowDeleteConfirm(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!acceptedFormats.includes(file.type)) {
        alert('Please upload a valid image file (jpeg, png, webp)');
        return;
      }

      const maxSizeInMB = 5;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert(`File size should be less than ${maxSizeInMB}MB`);
        return;
      }

      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewTransaction({
          ...newTransaction,
          imageUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenImageDialog = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingId(transaction.id);
      setNewTransaction({ ...transaction });
      setImagePreview(transaction.imageUrl || null);
    } else {
      setImagePreview(newTransaction.imageUrl || null);
    }
    setSelectedImageFile(null);
    setSelectedImageId(id);
    setImageDialogOpen(true);
  };

  const handleOpenImageViewer = (
    url?: string,
    meta?: { particular: string; date: Date | null }
  ) => {
    if (!url) return;
    setViewerImageUrl(url);
    setViewerImageMeta(meta ?? null);
    setImageViewerOpen(true);
  };

  const handleDownloadImage = async () => {
    if (!viewerImageUrl) return;

    const safeParticular =
      viewerImageMeta?.particular
        ?.trim()
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '') || 'receipt';
    const safeDate = viewerImageMeta?.date
      ? format(viewerImageMeta.date, 'yyyyMMdd')
      : 'undated';

    try {
      const response = await fetch(viewerImageUrl);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${safeParticular}_${safeDate}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert('Download failed. Please try again.');
    }
  };

  const handleCopyImageLink = async () => {
    if (!viewerImageUrl) return;

    try {
      await navigator.clipboard.writeText(viewerImageUrl);
      alert('Receipt image link copied to clipboard.');
    } catch {
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleShareImage = async () => {
    if (!viewerImageUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Receipt Image',
          url: viewerImageUrl
        });
        return;
      }

      await navigator.clipboard.writeText(viewerImageUrl);
      alert('Receipt image link copied to clipboard.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      alert('Failed to share image. Please try again.');
    }
  };

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setNewTransaction({
      ...newTransaction,
      [field]: value
    });
  };

  // Filtered transactions based on selected date range and search term
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        const endOfDay = new Date(dateRange.to || new Date());
        endOfDay.setHours(23, 59, 59, 999);
        return (
          (!dateRange.from || t.date >= dateRange.from) &&
          (!dateRange.to || t.date <= endOfDay)
        );
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.particular.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [transactions, dateRange, searchTerm]);

  const handleClearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setActiveQuickFilter(null);
  };

  const handleQuickDateFilter = (
    type: 'today' | 'week' | 'month' | 'quarter' | 'year'
  ) => {
    // If clicking the same filter, toggle it off
    if (activeQuickFilter === type) {
      setDateRange({ from: undefined, to: undefined });
      setActiveQuickFilter(null);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from = new Date(today);

    switch (type) {
      case 'today':
        setDateRange({ from: new Date(today), to: new Date(today) });
        break;
      case 'week':
        from.setDate(today.getDate() - today.getDay());
        setDateRange({ from, to: new Date(today) });
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({ from, to: new Date(today) });
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1);
        setDateRange({ from, to: new Date(today) });
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        setDateRange({ from, to: new Date(today) });
        break;
    }

    setActiveQuickFilter(type);
  };

  const handleSelectAll = () => {
    if (
      selectedTransactions.size === filteredTransactions.length &&
      filteredTransactions.length > 0
    ) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleBulkDelete = async () => {
    setDeleteType('bulk');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'single' && deleteTargetId) {
        await deleteTransaction({ transactionId: deleteTargetId });
        setTransactions((prev) => prev.filter((t) => t.id !== deleteTargetId));
      } else if (deleteType === 'bulk') {
        for (const id of Array.from(selectedTransactions)) {
          await deleteTransaction({ transactionId: id });
        }
        setTransactions((prev) =>
          prev.filter((t) => !selectedTransactions.has(t.id))
        );
        setSelectedTransactions(new Set());
      }
      setShowDeleteConfirm(false);
      setDeleteType(null);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Particular', 'Dr Amount', 'Cr Amount', 'Balance'];
    const rows = filteredTransactions.map((t) => [
      t.date ? format(t.date, 'yyyy-MM-dd') : '',
      t.particular,
      t.drAmount || '',
      t.crAmount || '',
      t.balance
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            if (
              typeof cell === 'string' &&
              (cell.includes(',') || cell.includes('"'))
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `ledger_${selectedFirm.name.replace(/[^a-z0-9]/gi, '_')}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/ledger-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company
            ? {
                companyName: company.name,
                companyAddress: company.address,
                phone: company.phone.join(', '),
                email: company.email,
                vatNumber: company.taxNumber
              }
            : null,
          firm: {
            name: selectedFirm.name,
            owner: selectedFirm.owner,
            phone: selectedFirm.phone
          },
          from: dateRange.from ? dateRange.from.toISOString() : null,
          to: dateRange.to ? dateRange.to.toISOString() : null,
          transactions: filteredTransactions.map((t) => ({
            date: t.date ? t.date.toISOString() : null,
            particular: t.particular,
            drAmount: t.drAmount || 0,
            crAmount: t.crAmount || 0,
            balance: t.balance
          }))
        })
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const rangePart =
        dateRange.from && dateRange.to
          ? `${format(dateRange.from, 'yyyyMMdd')}-${format(dateRange.to, 'yyyyMMdd')}`
          : 'all';
      a.href = url;
      a.download = `${selectedFirm.name.replace(/[^a-z0-9]/gi, '_')}_ledger_${rangePart}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate totals
  const totalDebit = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.drAmount || 0),
    0
  );

  const totalCredit = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.crAmount || 0),
    0
  );
  // Ending balance is the balance after the last transaction in the filtered range
  const endingBalance =
    filteredTransactions.length > 0 ? filteredTransactions[0].balance : 0;

  if (!firm) {
    return null;
  }

  const imageTransaction = editingId
    ? transactions.find((t) => t.id === editingId)
    : selectedImageId
      ? transactions.find((t) => t.id === selectedImageId)
      : null;

  return (
    <PageContainer scrollable>
      <div className='no-scrollbar w-full overflow-hidden rounded-lg pb-10 md:mx-auto md:w-full md:max-w-6xl'>
        {/* Firm section with profile pic, business name, owner name, and call button */}
        <div className='flex items-center justify-between bg-blue-500 p-3 text-white sm:p-4'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-blue-900 sm:h-12 sm:w-12 sm:text-xl'>
              {selectedFirm.name.charAt(0)}
            </div>
            <div>
              <h1 className='max-w-[180px] truncate text-lg font-bold sm:max-w-none sm:text-xl'>
                {selectedFirm.name}
              </h1>
              <p className='max-w-[180px] truncate text-xs opacity-80 sm:max-w-none sm:text-sm'>
                {selectedFirm.owner}
              </p>
            </div>
          </div>
          <Button variant='ghost' size='icon' className='text-white'>
            <Link href={`tel:${selectedFirm?.phone}`}>
              <Phone className='h-6 w-6' />
            </Link>
          </Button>
        </div>

        {/* Transaction History section */}
        <div className='flex flex-col gap-3 border-b p-3 sm:p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 className='text-lg font-bold sm:text-xl'>
              Transaction History
            </h2>
            <Button
              onClick={handleAddTransaction}
              className='px-2 text-xs sm:px-4 sm:text-sm'
            >
              Add Transaction
            </Button>
          </div>

          {/* Search Bar */}
          <div className='flex gap-2'>
            <Input
              placeholder='Search transactions...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-9 flex-1 text-sm'
            />
          </div>

          {/* Quick Filters and Action Buttons */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex flex-wrap gap-1'>
              <Button
                variant={activeQuickFilter === 'today' ? 'default' : 'outline'}
                size='sm'
                className='h-8 text-xs'
                onClick={() => handleQuickDateFilter('today')}
              >
                Today
              </Button>
              <Button
                variant={activeQuickFilter === 'week' ? 'default' : 'outline'}
                size='sm'
                className='h-8 text-xs'
                onClick={() => handleQuickDateFilter('week')}
              >
                This Week
              </Button>
              <Button
                variant={activeQuickFilter === 'month' ? 'default' : 'outline'}
                size='sm'
                className='h-8 text-xs'
                onClick={() => handleQuickDateFilter('month')}
              >
                This Month
              </Button>
              <Button
                variant={
                  activeQuickFilter === 'quarter' ? 'default' : 'outline'
                }
                size='sm'
                className='h-8 text-xs'
                onClick={() => handleQuickDateFilter('quarter')}
              >
                Q{Math.floor(new Date().getMonth() / 3) + 1}
              </Button>
              <Button
                variant={activeQuickFilter === 'year' ? 'default' : 'outline'}
                size='sm'
                className='h-8 text-xs'
                onClick={() => handleQuickDateFilter('year')}
              >
                This Year
              </Button>
            </div>

            <div className='ml-auto flex flex-wrap gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex h-8 items-center gap-2 text-xs'
                  >
                    <CalendarIcon className='h-3.5 w-3.5' />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, 'dd MMM')} - ${format(dateRange.to, 'dd MMM')}`
                      : 'Custom'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-auto p-2'>
                  <Calendar
                    mode='range'
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range)}
                    numberOfMonths={1}
                    initialFocus
                  />
                  <div className='mt-2 flex gap-2'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={handleClearDateRange}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {selectedTransactions.size > 0 && (
                <div className='flex items-center gap-2 rounded bg-blue-50 px-2 text-xs text-blue-900 dark:bg-blue-950 dark:text-blue-100'>
                  <span>{selectedTransactions.size} selected</span>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-6 px-2 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className='mr-1 h-3.5 w-3.5' />
                    Delete
                  </Button>
                </div>
              )}

              <Button
                variant='secondary'
                size='sm'
                disabled={filteredTransactions.length === 0}
                onClick={handleExportCSV}
                className='flex h-8 items-center gap-1 text-xs'
              >
                <Download className='h-3.5 w-3.5' />
                CSV
              </Button>

              <Button
                variant='secondary'
                size='sm'
                disabled={isDownloading || filteredTransactions.length === 0}
                onClick={handleDownloadPdf}
                className='flex h-8 items-center gap-1 text-xs'
              >
                <Download className='h-3.5 w-3.5' />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Summary section with Total Debit, Total Credit, and Net Balance */}
        <div className='border-b p-4'>
          <div className='grid grid-cols-3 gap-4'>
            <Card className='border shadow-sm'>
              <CardContent className='p-3 sm:p-4'>
                <p className='text-xs text-gray-500 sm:text-sm'>
                  Total Debit(-)
                </p>
                <p className='text-base font-bold text-red-600 sm:text-xl'>
                  ₹{totalDebit.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className='border shadow-sm'>
              <CardContent className='p-3 sm:p-4'>
                <p className='text-xs text-gray-500 sm:text-sm'>
                  Total Credit(+)
                </p>
                <p className='text-base font-bold text-green-600 sm:text-xl'>
                  ₹{totalCredit.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className='border shadow-sm'>
              <CardContent className='p-3 sm:p-4'>
                <p className='text-xs text-gray-500 sm:text-sm'>
                  Ending Balance
                </p>
                <p
                  className={cn(
                    'text-base font-bold sm:text-xl',
                    endingBalance >= 0 ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  ₹{Math.abs(endingBalance).toLocaleString()}{' '}
                  {endingBalance >= 0 ? 'Dr' : 'Cr'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Responsive Table/Card View */}
        <div className='mt-4'>
          {/* Mobile Card View */}
          <div className='block space-y-4 sm:px-4 md:hidden'>
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className='border shadow-sm'>
                <CardContent className='p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='text-sm font-medium'>
                      {transaction.date ? format(transaction.date, 'PPP') : ''}
                    </div>
                    <div
                      className='flex gap-2'
                      onMouseEnter={() => setHoveredId(transaction.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <Edit2 className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() =>
                          handleDeleteIndividualTransaction(transaction.id)
                        }
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </div>

                  <div className='flex w-full gap-4'>
                    <div className='mb-3 w-1/4'>
                      <div className='text-xs text-gray-500'>Particular</div>
                      <div className='font-medium'>
                        {transaction.particular}
                      </div>
                    </div>

                    <div className='w-1/4'>
                      {transaction.drAmount ? (
                        <div>
                          <div className='text-xs text-gray-500'>Dr Amount</div>
                          <div className='font-medium text-red-600'>
                            ₹{transaction.drAmount.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>

                    <div className='w-1/4'>
                      {transaction.crAmount ? (
                        <div>
                          <div className='text-xs text-gray-500'>Cr Amount</div>
                          <div className='font-medium text-green-600'>
                            ₹{transaction.crAmount.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>

                    <div className='w-1/4'>
                      <div className='text-xs text-gray-500'>Balance</div>
                      <div className='font-medium'>
                        ₹{transaction.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {transaction.imageUrl && (
                    <div className='mt-3'>
                      <img
                        src={transaction.imageUrl}
                        alt='Receipt'
                        className='h-20 w-full cursor-zoom-in rounded object-cover'
                        onClick={() =>
                          handleOpenImageViewer(transaction.imageUrl, {
                            particular: transaction.particular,
                            date: transaction.date
                          })
                        }
                      />
                    </div>
                  )}

                  <div className='mt-3 flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1'
                      onClick={() =>
                        transaction.imageUrl
                          ? handleOpenImageViewer(transaction.imageUrl, {
                              particular: transaction.particular,
                              date: transaction.date
                            })
                          : handleOpenImageDialog(transaction.id)
                      }
                    >
                      <ImageIcon className='mr-2 h-3.5 w-3.5' />
                      {transaction.imageUrl ? 'View Receipt' : 'Attach Receipt'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className='hidden overflow-x-auto md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40px]'>
                    <Checkbox
                      checked={
                        selectedTransactions.size ===
                          filteredTransactions.length &&
                        filteredTransactions.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      <span>Date</span>
                    </div>
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <ListFilter className='h-4 w-4' />
                      <span>Particular</span>
                    </div>
                  </TableHead>
                  <TableHead className='whitespace-nowrap bg-red-50 dark:bg-red-200'>
                    <div className='flex items-center gap-2 text-red-600'>
                      Dr Amount
                    </div>
                  </TableHead>
                  <TableHead className='whitespace-nowrap bg-green-50 dark:bg-green-200'>
                    <div className='flex items-center gap-2 text-green-600'>
                      <Hash className='h-4 w-4' />
                      Cr Amount
                    </div>
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <Hash className='h-4 w-4' />
                      Balance
                    </div>
                  </TableHead>
                  <TableHead className='w-[60px]'>Receipt</TableHead>
                  <TableHead className='w-[120px] text-center'>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className='group'>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.has(transaction.id)}
                        onCheckedChange={() =>
                          handleToggleSelect(transaction.id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.date ? format(transaction.date, 'PPP') : ''}
                    </TableCell>
                    <TableCell>{transaction.particular}</TableCell>
                    <TableCell
                      className={cn(
                        'bg-red-50',
                        transaction.drAmount ? 'font-medium text-red-600' : ''
                      )}
                    >
                      {transaction.drAmount?.toLocaleString() || ''}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'bg-green-50',
                        transaction.crAmount ? 'font-medium text-green-600' : ''
                      )}
                    >
                      {transaction.crAmount?.toLocaleString() || ''}
                    </TableCell>
                    <TableCell>
                      {transaction.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {transaction.imageUrl && (
                        <img
                          src={transaction.imageUrl}
                          alt='Receipt'
                          className='h-12 w-12 cursor-zoom-in rounded object-cover'
                          onClick={() =>
                            handleOpenImageViewer(transaction.imageUrl, {
                              particular: transaction.particular,
                              date: transaction.date
                            })
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div
                        className='flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'
                        onMouseEnter={() => setHoveredId(transaction.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() =>
                            transaction.imageUrl
                              ? handleOpenImageViewer(transaction.imageUrl, {
                                  particular: transaction.particular,
                                  date: transaction.date
                                })
                              : handleOpenImageDialog(transaction.id)
                          }
                          title={
                            transaction.imageUrl
                              ? 'View receipt'
                              : 'Attach receipt'
                          }
                        >
                          <ImageIcon className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit2 className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() =>
                            handleDeleteIndividualTransaction(transaction.id)
                          }
                        >
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Date Display with Change Option */}
            <div className='flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
              <div>
                <p className='text-xs text-blue-600 dark:text-blue-400'>
                  Transaction Date
                </p>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  {newTransaction.date
                    ? format(newTransaction.date, 'PPP')
                    : 'Today'}
                </p>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setShowChangeDate(!showChangeDate)}
                className='h-8'
              >
                Change
              </Button>
            </div>

            {/* Date Picker (shown when "Change" is clicked) */}
            {showChangeDate && (
              <div className='rounded-lg border p-3'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full'>
                      Select Different Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={newTransaction.date || undefined}
                      onSelect={(date) => {
                        handleInputChange('date', date);
                        setShowChangeDate(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Particular */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Description</label>
              <Input
                autoFocus
                placeholder='e.g., Cash payment, Invoice #123'
                value={newTransaction.particular}
                onChange={(e) =>
                  handleInputChange('particular', e.target.value)
                }
              />
            </div>

            {/* Dr and Cr Amounts */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-red-600'>
                  Debit (Dr)
                </label>
                <Input
                  type='number'
                  placeholder='0.00'
                  className='no-spinner'
                  min={0}
                  value={newTransaction.drAmount || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'drAmount',
                      e.target.value ? Number.parseFloat(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-green-600'>
                  Credit (Cr)
                </label>
                <Input
                  type='number'
                  placeholder='0.00'
                  className='no-spinner'
                  min={0}
                  value={newTransaction.crAmount || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'crAmount',
                      e.target.value ? Number.parseFloat(e.target.value) : null
                    )
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-4'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={handleCancelTransaction}
                disabled={isSavingTransaction}
              >
                Cancel
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleOpenImageDialog(newTransaction.id)}
                className='text-muted-foreground'
                title='Attach receipt image'
              >
                <ImageIcon className='h-4 w-4' />
              </Button>
              <Button
                className='flex-1'
                onClick={handleSaveTransaction}
                disabled={isSavingTransaction}
              >
                {isSavingTransaction
                  ? 'Saving...'
                  : editingId
                    ? 'Update'
                    : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Add Receipt Image</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {imagePreview && (
              <div className='relative rounded-lg border border-border bg-muted p-4'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='max-h-64 w-full rounded object-cover'
                />
                <Button
                  size='icon'
                  variant='destructive'
                  className='absolute right-2 top-2 h-8 w-8'
                  onClick={() => {
                    setImagePreview(null);
                    setNewTransaction({
                      ...newTransaction,
                      imageUrl: undefined
                    });
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            )}
            <div className='flex flex-col gap-3'>
              <label className='flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:border-primary hover:bg-muted'>
                <ImageIcon className='mb-2 h-8 w-8 text-muted-foreground' />
                <span className='text-sm font-medium text-foreground'>
                  Click to upload
                </span>
                <span className='text-xs text-muted-foreground'>
                  PNG, JPG up to 5MB
                </span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageSelect}
                  className='hidden'
                />
              </label>
            </div>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => {
                  setImageDialogOpen(false);
                  setSelectedImageId(null);
                }}
              >
                Close
              </Button>
              <Button
                className='flex-1'
                onClick={() => {
                  setImageDialogOpen(false);
                  setSelectedImageId(null);
                }}
              >
                <Check className='mr-2 h-4 w-4' />
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Receipt Viewer */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className='h-[88vh] w-[88vw] max-w-5xl overflow-hidden border-white/20 bg-white/5 p-0 backdrop-blur-xl sm:rounded-2xl [&>button]:hidden'>
          <div className='flex h-full flex-col bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90'>
            <div className='flex items-center justify-between border-b border-white/15 px-4 py-3 text-white'>
              <DialogTitle className='text-sm font-semibold'>
                Receipt Preview
              </DialogTitle>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={handleCopyImageLink}
                >
                  <Link2 className='mr-2 h-4 w-4' />
                  Copy Link
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={handleShareImage}
                >
                  <Share2 className='mr-2 h-4 w-4' />
                  Share
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={handleDownloadImage}
                >
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() =>
                    viewerImageUrl && window.open(viewerImageUrl, '_blank')
                  }
                >
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Open
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => setImageViewerOpen(false)}
                >
                  <X className='mr-2 h-4 w-4' />
                  Close
                </Button>
              </div>
            </div>
            <div className='flex min-h-0 flex-1 items-center justify-center p-4'>
              {viewerImageUrl ? (
                <div className='rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md'>
                  <img
                    src={viewerImageUrl}
                    alt='Receipt Fullscreen'
                    className='h-auto max-h-[82vh] w-auto max-w-[92vw] rounded-xl object-contain'
                  />
                </div>
              ) : (
                <p className='text-sm text-white/70'>No image selected.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-600'>
              <Trash2 className='h-5 w-5' />
              Delete Transaction{deleteType === 'bulk' ? 's' : ''}?
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Warning Message */}
            <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
              <p className='mb-1 text-sm font-medium text-red-900 dark:text-red-100'>
                This action cannot be undone.
              </p>
              <p className='text-xs text-red-700 dark:text-red-200'>
                {deleteType === 'single'
                  ? 'This transaction will be permanently deleted from the ledger.'
                  : `${selectedTransactions.size} transaction${selectedTransactions.size > 1 ? 's will be' : ' will be'} permanently deleted from the ledger.`}
              </p>
            </div>

            {/* Delete Count Info */}
            {deleteType === 'bulk' && (
              <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950'>
                <p className='text-xs font-medium text-amber-900 dark:text-amber-100'>
                  Deleting {selectedTransactions.size} transaction
                  {selectedTransactions.size > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-2 pt-4'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteType(null);
                  setDeleteTargetId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                className='flex-1 gap-2'
                onClick={confirmDelete}
              >
                <Trash2 className='h-4 w-4' />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
