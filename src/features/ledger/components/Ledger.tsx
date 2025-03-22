'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { CalendarIcon, ListFilter, Hash, Trash2, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

interface Transaction {
  id: string;
  date: Date | null;
  particular: string;
  drAmount: number | null;
  crAmount: number | null;
  balance: number;
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
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [firm, setFirm] = useState<Firm | null>(null);

  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: '',
    date: null,
    particular: '',
    drAmount: null,
    crAmount: null,
    balance: 0
  });

  const addTransaction = useMutation(api.ledger.addTransaction);
  const transactionsQuery = useQuery(api.ledger.getTransactionsByFirm, {
    firmId: selectedFirm._id
  });
  const getTransactionsByFirm = useMemo(
    () => transactionsQuery ?? [],
    [transactionsQuery]
  );
  const deleteTransaction = useMutation(api.ledger.deleteTransaction);

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
          balance: transaction.balance
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
      setSelectedTransactions([]);
    }
  }, [getTransactionsByFirm, selectedFirm]);

  const handleAddTransaction = () => {
    setIsAddingTransaction(true);
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
  };

  const handleSaveTransaction = async () => {
    if (!newTransaction.particular) {
      alert('Please enter a particular');
      return;
    }

    // Calculate the new balance
    const previousBalance =
      transactions.length > 0 ? transactions[0].balance : 0;
    const drAmount = newTransaction.drAmount || 0;
    const crAmount = newTransaction.crAmount || 0;
    const newBalance = previousBalance + crAmount - drAmount;

    const updatedTransaction = {
      id: Date.now().toString(), // Generate a unique ID for the frontend
      firmId: selectedFirm._id,
      date: newTransaction.date || new Date(), // Ensure the date is a Date object
      particular: newTransaction.particular,
      drAmount: newTransaction.drAmount || 0,
      crAmount: newTransaction.crAmount || 0,
      balance: newBalance
    };

    try {
      // Exclude the `id` field when sending data to the backend
      await addTransaction({
        firmId: updatedTransaction.firmId,
        date: updatedTransaction.date.getTime(), // Convert to timestamp for backend
        particular: updatedTransaction.particular,
        drAmount: updatedTransaction.drAmount,
        crAmount: updatedTransaction.crAmount,
        balance: updatedTransaction.balance
      });

      // Add the new transaction to the table
      setTransactions([updatedTransaction, ...transactions]);

      // Reset the form and close the add transaction mode
      setIsAddingTransaction(false);
      setNewTransaction({
        id: '',
        date: null,
        particular: '',
        drAmount: null,
        crAmount: null,
        balance: 0
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleCancelTransaction = () => {
    setIsAddingTransaction(false);
    setNewTransaction({
      id: '',
      date: null,
      particular: '',
      drAmount: null,
      crAmount: null,
      balance: 0
    });
  };

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setNewTransaction({
      ...newTransaction,
      [field]: value
    });
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) return;

    setTransactions((prev) =>
      prev.filter(
        (transaction) => !selectedTransactions.includes(transaction.id)
      )
    );
    await deleteTransaction({ transactionId: selectedTransactions[0] });
    setSelectedTransactions([]);
  };

  // Calculate totals
  const totalDebit = transactions.reduce(
    (sum, transaction) => sum + (transaction.drAmount || 0),
    0
  );

  const totalCredit = transactions.reduce(
    (sum, transaction) => sum + (transaction.crAmount || 0),
    0
  );

  const netBalance = transactions.length > 0 ? transactions[0].balance : 0;

  if (!firm) {
    return null;
  }

  return (
    <div className='mx-auto w-full max-w-6xl overflow-hidden rounded-lg border bg-white'>
      {/* Firm section with profile pic, business name, owner name, and call button */}
      <div className='flex items-center justify-between bg-blue-500 p-4 text-white'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 text-xl font-bold text-blue-900'>
            {selectedFirm.name.charAt(0)}
          </div>
          <div>
            <h1 className='text-xl font-bold'>{selectedFirm.name}</h1>
            <p className='text-sm opacity-80'>{selectedFirm.owner}</p>
          </div>
        </div>
        <Button variant='ghost' size='icon' className='text-white'>
          <Link href={`tel:${selectedFirm.phone}`}>
            <Phone className='h-6 w-6' />
          </Link>
        </Button>
      </div>

      {/* Transaction History section */}
      <div className='flex items-center justify-between border-b bg-white p-4'>
        <h2 className='text-xl font-bold'>Transaction History</h2>
        <Button onClick={handleAddTransaction} disabled={isAddingTransaction}>
          Add Transaction
        </Button>
      </div>

      {/* Summary section with Total Debit, Total Credit, and Net Balance */}
      <div className='border-b bg-gray-50 p-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card className='border shadow-sm'>
            <CardContent className='p-4'>
              <p className='text-sm text-gray-500'>Total Debit(-)</p>
              <p className='text-xl font-bold text-red-600'>
                ₹{totalDebit.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className='border shadow-sm'>
            <CardContent className='p-4'>
              <p className='text-sm text-gray-500'>Total Credit(+)</p>
              <p className='text-xl font-bold text-green-600'>
                ₹{totalCredit.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className='border shadow-sm'>
            <CardContent className='p-4'>
              <p className='text-sm text-gray-500'>Net Balance</p>
              <p className='text-xl font-bold text-red-600'>
                ₹{netBalance.toLocaleString()} Dr
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete selected button */}
      {selectedTransactions.length > 0 && (
        <div className='flex items-center justify-between bg-gray-100 p-2'>
          <p>{selectedTransactions.length} item(s) selected</p>
          <Button
            variant='destructive'
            size='sm'
            onClick={handleDeleteSelected}
            className='flex items-center gap-1'
          >
            <Trash2 className='h-4 w-4' /> Delete
          </Button>
        </div>
      )}

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[150px]'>
                <div className='flex items-center gap-2'>
                  <CalendarIcon className='h-4 w-4' />
                  Date
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center gap-2'>
                  <ListFilter className='h-4 w-4' />
                  Particular
                </div>
              </TableHead>
              <TableHead className='bg-red-50'>
                <div className='flex items-center gap-2 text-red-600'>
                  Dr Amount
                </div>
              </TableHead>
              <TableHead className='bg-green-50'>
                <div className='flex items-center gap-2 text-green-600'>
                  <Hash className='h-4 w-4' />
                  Cr Amount
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center gap-2'>
                  <Hash className='h-4 w-4' />
                  Balance
                </div>
              </TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAddingTransaction && (
              <TableRow>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !newTransaction.date && 'text-muted-foreground'
                        )}
                      >
                        {newTransaction.date
                          ? format(newTransaction.date, 'PPP')
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={newTransaction.date || undefined}
                        onSelect={(date) => handleInputChange('date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Input
                    autoFocus
                    placeholder='Enter description'
                    value={newTransaction.particular}
                    onChange={(e) =>
                      handleInputChange('particular', e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className='bg-red-50'>
                  <Input
                    type='number'
                    placeholder='0.00'
                    className='no-spinner'
                    min={0}
                    value={newTransaction.drAmount || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'drAmount',
                        e.target.value
                          ? Number.parseFloat(e.target.value)
                          : null
                      )
                    }
                  />
                </TableCell>
                <TableCell className='bg-green-50'>
                  <Input
                    type='number'
                    min={0}
                    placeholder='0.00'
                    className='no-spinner'
                    value={newTransaction.crAmount || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'crAmount',
                        e.target.value
                          ? Number.parseFloat(e.target.value)
                          : null
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={handleSaveTransaction}>
                      Save
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleCancelTransaction}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}

            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
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
                <TableCell>{transaction.balance.toLocaleString()}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => handleCheckboxChange(transaction.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
