'use client';

import { TransactionTable } from '@/components/common/transaction-table';

export default function TransactionsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Doanh thu</h1>
      <TransactionTable role="admin" />
    </div>
  );
}