'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserInvoiceTable } from '@/components/payment/user-invoice-table';

export default function TransactionHistoryPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử mua hàng</h1>
          <p className="text-muted-foreground mt-2">
            Xem chi tiết tất cả hóa đơn mua khóa học của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hóa đơn</CardTitle>
            <CardDescription>
              Theo dõi toàn bộ lịch sử mua khóa học trong tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserInvoiceTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}