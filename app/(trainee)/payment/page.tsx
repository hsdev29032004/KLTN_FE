'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useInvoiceStore } from '@/stores/invoice/invoice-store';
import { formatMoney } from '@/helpers/format.helper';

const VNPAY_ERROR_MESSAGES: Record<string, string> = {
  '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ/Tài khoản bị khóa.',
  '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Khách hàng hủy giao dịch.',
  '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Lỗi không xác định. Vui lòng thử lại sau.',
};

function PaymentResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceStore = useInvoiceStore();

  const status = searchParams.get('status');
  const invoiceId = searchParams.get('invoiceId');
  const code = searchParams.get('code');

  useEffect(() => {
    if (status === 'success' && invoiceId) {
      invoiceStore.fetchMyInvoiceDetail(invoiceId);
    }
  }, [status, invoiceId]);

  if (status === 'success') {
    const invoice = invoiceStore.selectedInvoice;
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader />
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-green-600">
                Thanh toán thành công!
              </h2>
              {invoice && (
                <div className="w-full space-y-3">
                  <p className="text-2xl font-bold">
                    {formatMoney(invoice.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.detail_invoices.length} khóa học đã được thêm vào tài khoản
                  </p>
                  <div className="space-y-2 mt-4 text-left">
                    {invoice.detail_invoices.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <img
                          src={item.courses.thumbnail}
                          alt={item.courses.name}
                          className="w-12 h-8 rounded object-cover"
                        />
                        <span className="text-sm font-medium flex-1 line-clamp-1">
                          {item.courses.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatMoney(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {invoiceStore.selectedInvoiceLoading && (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => router.push('/my-courses/purchased')} className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Xem khóa học đã mua
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'fail') {
    const errorMessage = code
      ? VNPAY_ERROR_MESSAGES[code] || `Lỗi không xác định (mã: ${code})`
      : 'Giao dịch thất bại.';

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader />
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-bold text-destructive">
                Thanh toán thất bại
              </h2>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              {code && (
                <p className="text-xs text-muted-foreground">Mã lỗi: {code}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => router.push('/cart')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại giỏ hàng
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default / loading
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}
