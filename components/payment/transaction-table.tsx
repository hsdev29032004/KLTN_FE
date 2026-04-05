'use client';

import { useEffect, useState } from 'react';
import { usePaymentStore } from '@/stores/payment/payment-store';
import { GetTransactionsParams } from '@/types/transaction.type';
import { formatMoney } from '@/helpers/format.helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Hoàn tất', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
  rejected: { label: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
};

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Nạp tiền',
  withdrawal: 'Rút tiền',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionTable() {
  const { transactions, transactionsLoading, totalPages, fetchTransactions } =
    usePaymentStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [type, setType] = useState<'deposit' | 'withdrawal' | 'all'>('all');
  const [status, setStatus] = useState<
    'pending' | 'completed' | 'failed' | 'approved' | 'rejected' | 'all'
  >('all');

  useEffect(() => {
    const params: GetTransactionsParams = { page: currentPage, limit: 10 };
    if (type !== 'all') params.type = type;
    if (status !== 'all') params.status = status;
    fetchTransactions(params);
  }, [currentPage, status, type]);

  const handleTypeChange = (value: string) => {
    setType(value as any);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as any);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="deposit">Nạp tiền</SelectItem>
            <SelectItem value="withdrawal">Rút tiền</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="completed">Hoàn tất</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="rejected">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không có giao dịch nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngân hàng</TableHead>
                    <TableHead>Tài khoản</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {TYPE_LABELS[transaction.type]}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMoney(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.bankName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {transaction.accountNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_LABELS[transaction.status]?.color || ''}>
                          {STATUS_LABELS[transaction.status]?.label || transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
