'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function DepositResult() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  const code = searchParams.get('code');
  const reason = searchParams.get('reason');
  const transactionId = searchParams.get('transactionId');

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <CardTitle className="text-xl text-green-600">
              Nạp tiền thành công!
            </CardTitle>
            <p className="text-2xl font-bold">
              {amount ? formatMoney(Number(amount)) : ''}
            </p>
            {transactionId && (
              <p className="text-sm text-muted-foreground">
                Mã giao dịch: {transactionId}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Số dư đã được cập nhật vào tài khoản của bạn.
            </p>
          </div>
        );

      case 'fail':
        const errorMessage = code
          ? VNPAY_ERROR_MESSAGES[code] || `Lỗi không xác định (mã: ${code})`
          : reason === 'invalid_order'
          ? 'Đơn hàng không hợp lệ.'
          : 'Giao dịch thất bại.';

        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-16 w-16 text-destructive" />
            <CardTitle className="text-xl text-destructive">
              Nạp tiền thất bại
            </CardTitle>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {code && (
              <p className="text-xs text-muted-foreground">Mã lỗi: {code}</p>
            )}
          </div>
        );

      case 'already_processed':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
            <CardTitle className="text-xl text-yellow-600">
              Giao dịch đã được xử lý
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Giao dịch này đã được xử lý trước đó. Vui lòng kiểm tra lịch sử
              giao dịch.
            </p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
            <CardTitle className="text-xl">Đang xử lý...</CardTitle>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader />
        <CardContent className="space-y-6">
          {renderContent()}
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => router.push('/')}>
              Về trang chủ
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/transactions/history')}
            >
              Xem lịch sử giao dịch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DepositResult />
    </Suspense>
  );
}
