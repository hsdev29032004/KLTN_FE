'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionTable } from '@/components/payment/transaction-table';
import { UserInvoiceTable } from '@/components/payment/user-invoice-table';
import { ArrowLeftRight, BookOpen } from 'lucide-react';

export default function TransactionHistoryPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử giao dịch</h1>
          <p className="text-muted-foreground mt-2">
            Xem chi tiết tất cả các giao dịch tài chính và hóa đơn mua khóa học của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Giao dịch & Hóa đơn</CardTitle>
            <CardDescription>
              Theo dõi toàn bộ hoạt động tài chính trong tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Nạp / Rút tiền
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Mua khóa học
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="mt-6">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="invoices" className="mt-6">
                <UserInvoiceTable />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}