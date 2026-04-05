'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useInvoiceStore } from '@/stores/invoice/invoice-store';
import { MyInvoice, MyInvoiceListParams } from '@/types/invoice.type';
import { formatMoney } from '@/helpers/format.helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const INVOICE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  purchased: { label: 'Đã mua', color: 'bg-green-100 text-green-800' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-orange-100 text-orange-800' },
};

function InvoiceDetailDialog({
  invoiceId,
  open,
  onOpenChange,
}: {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { selectedInvoice, selectedInvoiceLoading, fetchMyInvoiceDetail, clearSelectedInvoice } =
    useInvoiceStore();

  useEffect(() => {
    if (open && invoiceId) {
      fetchMyInvoiceDetail(invoiceId);
    }
    if (!open) {
      clearSelectedInvoice();
    }
  }, [open, invoiceId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết hóa đơn</DialogTitle>
        </DialogHeader>

        {selectedInvoiceLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : selectedInvoice ? (
          <div className="space-y-4">
            {/* Invoice header */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-mono">{selectedInvoice.id}</p>
                <p className="text-xs text-muted-foreground">{formatDate(selectedInvoice.createdAt)}</p>
              </div>
              <div className="text-right space-y-1">
                <Badge className={INVOICE_STATUS_LABELS[selectedInvoice.status]?.color}>
                  {INVOICE_STATUS_LABELS[selectedInvoice.status]?.label || selectedInvoice.status}
                </Badge>
                <p className="text-lg font-bold">{formatMoney(selectedInvoice.amount)}</p>
              </div>
            </div>

            {/* Course list */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Khóa học đã mua ({selectedInvoice.detail_invoices.length})</p>
              {selectedInvoice.detail_invoices.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="relative w-20 h-14 shrink-0 rounded overflow-hidden bg-muted">
                    {item.courses.thumbnail ? (
                      <Image
                        src={item.courses.thumbnail}
                        alt={item.courses.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium text-sm line-clamp-2">{item.courses.name}</p>
                    {item.courses.user && (
                      <p className="text-xs text-muted-foreground">
                        Giảng viên: {item.courses.user.fullName}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`text-xs ${INVOICE_STATUS_LABELS[item.status]?.color || ''}`}
                      >
                        {INVOICE_STATUS_LABELS[item.status]?.label || item.status}
                      </Badge>
                      <span className="text-sm font-semibold">{formatMoney(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t font-semibold">
              <span>Tổng cộng</span>
              <span className="text-lg">{formatMoney(selectedInvoice.amount)}</span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function UserInvoiceTable() {
  const { myInvoices, myInvoicesLoading, myInvoicesMeta, fetchMyInvoices } = useInvoiceStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<'purchased' | 'refunded' | 'all'>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const params: MyInvoiceListParams = { page: currentPage, limit: 10 };
    if (status !== 'all') params.status = status;
    fetchMyInvoices(params);
  }, [currentPage, status]);

  const handleStatusChange = (value: string) => {
    setStatus(value as any);
    setCurrentPage(1);
  };

  const handleViewDetail = (id: string) => {
    setSelectedInvoiceId(id);
    setDialogOpen(true);
  };

  const totalPages = myInvoicesMeta?.totalPages || 0;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="purchased">Đã mua</SelectItem>
            <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {myInvoicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : myInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không có hóa đơn nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hóa đơn</TableHead>
                    <TableHead>Số khóa học</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày mua</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-35 truncate">
                        {invoice.id}
                      </TableCell>
                      <TableCell>
                        {invoice.detail_invoices.length} khóa học
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMoney(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={INVOICE_STATUS_LABELS[invoice.status]?.color || ''}
                        >
                          {INVOICE_STATUS_LABELS[invoice.status]?.label || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invoice.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(invoice.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
      {myInvoices.length > 0 && (
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

      <InvoiceDetailDialog
        invoiceId={selectedInvoiceId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
