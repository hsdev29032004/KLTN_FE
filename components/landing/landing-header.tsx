'use client';

import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Bell, Wallet, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth/auth-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useBankStore } from '@/stores/bank/bank-store';
import { useQRGenerator } from '@/hooks/use-qr-generator';
import { Bank } from '@/types/bank.type';
import { BankSelectionDialog } from '../payment/bank-selection-dialog';
import { QRCodeDisplay } from '../payment/qr-code-display';
import { formatMoney } from '@/helpers/format.helper';

export function LandingHeader() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const authStore = useAuthStore();
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const { list: banks, loading, fetchBanks } = useBankStore();
  const { generateQR } = useQRGenerator();

  const user = authStore.user;

  const paymentMessage = user?.id ? `ONLEARN_${user.id}` : 'ONLEARN';
  const qrData = selectedBank ? generateQR(selectedBank, paymentMessage) : null;

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setShowBankDialog(false);
    setShowQRDialog(true);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await authStore.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-2 md:px-4 lg:px-8">
      <div className="flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">ONLEARN</span>
        </Link>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-9"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <>
              {/* Wallet Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                      {formatMoney(user.availableAmount || 0)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTimeout(() => setShowBankDialog(true), 0)}>
                    Nạp tiền
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/withdrawal-demo")}
                  >
                    Rút tiền
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Giỏ hàng</span>
                </Link>
              </Button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || "/avatars/01.png"}
                        alt={user.fullName}
                      />
                      <AvatarFallback>
                        {user.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-courses">Khóa học của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/transactions/history">Lịch sử giao dịch</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Cài đặt tài khoản</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <BankSelectionDialog
        open={showBankDialog}
        onOpenChange={setShowBankDialog}
        onSelectBank={handleSelectBank}
        banks={banks || []}
        selectedBankId={selectedBank?.id}
        loading={loading}
      />

      {/* QR Code Dialog */}
      <Dialog
        open={showQRDialog}
        onOpenChange={(open) => {
          setShowQRDialog(open);
          if (!open) setSelectedBank(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBank && qrData && (
            <div>
              <QRCodeDisplay
                qrUrl={qrData.qrUrl}
                displayUrl={qrData.displayUrl}
                bankName={selectedBank.bankName}
                bankNumber={selectedBank.bankNumber}
                recipient={selectedBank.recipient}
                phone=""
                amount=""
                message={paymentMessage}
                type="deposit"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
