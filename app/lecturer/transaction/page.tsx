'use client';

import { TransactionTable } from '@/components/common/transaction-table';

export default function PaymentPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Lịch sử giao dịch</h1>
      <TransactionTable role="teacher" />
    </div>
  );
}
