"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bank } from "@/types/bank.type";
import { useQRGenerator } from "@/hooks/use-qr-generator";
import { useBankStore } from "@/stores/bank/bank-store";
import { useAuthStore } from "@/stores/auth/auth-store";
import { BankSelectionDialog } from "./bank-selection-dialog";
import { QRCodeDisplay } from "./qr-code-display";

type PaymentType = "deposit" | "withdrawal";

interface PaymentFormProps {
  type?: PaymentType;
  onCancel?: () => void;
}

export function PaymentForm({ type = "deposit", onCancel }: PaymentFormProps) {
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const { list: banks, loading, fetchBanks } = useBankStore();
  const authStore = useAuthStore();
  const { generateQR } = useQRGenerator();

  // Create payment message with user ID
  const paymentMessage = authStore.user?.id
    ? `ONLEARN_${authStore.user.id}`
    : "ONLEARN";

  // Fetch banks on mount
  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setShowBankDialog(false);
  };

  const qrData = selectedBank ? generateQR(selectedBank, paymentMessage) : null;

  return (
    <>
      {selectedBank && qrData ? (
        <div className="w-full max-w-full sm:max-w-2xl mx-auto px-4 sm:px-0">
          <Card
            className={`w-full p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br ${
              type === "withdrawal"
                ? "from-orange-50 to-orange-100"
                : "from-slate-50 to-slate-100"
            }`}
          >
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-black">
                {type === "withdrawal" ? "Mã QR Rút Tiền" : "Mã QR Thanh Toán"}
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm">
                {selectedBank.bankName}
              </p>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => setShowBankDialog(true)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-black border-2 border-primary rounded-lg hover:bg-primary/5 transition-all"
                >
                  Đổi ngân hàng
                </button>
                <button
                  onClick={onCancel}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all ${
                    type === "withdrawal"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Huỷ
                </button>
              </div>
            </div>

            <QRCodeDisplay
              qrUrl={qrData.qrUrl}
              displayUrl={qrData.displayUrl}
              bankName={selectedBank.bankName}
              bankNumber={selectedBank.bankNumber}
              recipient={selectedBank.recipient}
              phone=""
              amount=""
              message={paymentMessage}
              type={type}
            />
          </Card>
        </div>
      ) : (
        <Card
          className={`w-full max-w-full sm:max-w-2xl mx-auto p-4 sm:p-6 bg-gradient-to-br px-4 sm:px-0 ${
            type === "withdrawal"
              ? "from-orange-50 to-orange-100"
              : "from-slate-50 to-slate-100"
          }`}
        >
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-black">
              {type === "withdrawal"
                ? "Chọn Phương Thức Rút Tiền"
                : "Chọn Phương Thức Thanh Toán"}
            </h2>
            <p className="text-center text-slate-700 text-xs sm:text-sm mb-6">
              Vui lòng chọn ngân hàng để xem mã QR
            </p>
            {loading ? (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Đang tải danh sách...
              </p>
            ) : (
              <button
                onClick={() => setShowBankDialog(true)}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm text-white rounded-lg font-semibold transition-all ${
                  type === "withdrawal"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                Chọn Ngân Hàng
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Bank Selection Dialog */}
      <BankSelectionDialog
        open={showBankDialog}
        onOpenChange={setShowBankDialog}
        onSelectBank={handleSelectBank}
        banks={banks || []}
        selectedBankId={selectedBank?.id}
        loading={loading}
      />
    </>
  );
}
