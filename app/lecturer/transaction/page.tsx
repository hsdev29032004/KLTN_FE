'use client';

import { useMemo, useState } from 'react';
import { TransactionTable } from '@/components/common/transaction-table';
import LecturerPayrollModal from '@/components/lecturer/payroll-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PaymentPage() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState<string>(defaultMonth);
  const [openPayroll, setOpenPayroll] = useState(false);

  const { fromDate, toDate } = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      fromDate: `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`,
      toDate: `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`,
    };
  }, [month]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lịch sử giao dịch</h1>

        <div className="flex items-center gap-3">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="max-w-[180px]"
          />
          <Button onClick={() => setOpenPayroll(true)}>Xuất bảng lương</Button>
        </div>
      </div>

      <TransactionTable role="teacher" />

      <LecturerPayrollModal open={openPayroll} onOpenChange={setOpenPayroll} fromDate={fromDate} toDate={toDate} />
    </div>
  );
}
