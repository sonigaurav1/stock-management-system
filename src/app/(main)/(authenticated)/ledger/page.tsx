'use client';

import FirmSidebar from '@/features/ledger/components/FirmSidebar';
import LedgerComponent from '@/features/ledger/components/Ledger';
import { useState } from 'react';

export default function Home() {
  const [selectedFirm, setSelectedFirm] = useState<{
    _id: string;
    name: string;
    owner: string;
    address: string;
    phone: string;
    createdAt: number;
    updatedAt: number | null;
    isDeleted: boolean;
  } | null>(null);

  return (
    <section className='flex min-h-screen bg-background text-foreground'>
      <FirmSidebar
        onSelectFirm={setSelectedFirm}
        selectedFirmId={selectedFirm ? selectedFirm._id : null}
      />
      <div className='w-full overflow-auto md:flex-1 md:p-6'>
        {selectedFirm ? (
          <LedgerComponent selectedFirm={selectedFirm} />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='rounded-lg border p-8 text-center shadow-sm'>
              <h2 className='mb-2 text-xl font-bold'>No Firm Selected</h2>
              <p className='text-gray-500'>
                Please select a firm from the sidebar to view its ledger.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
