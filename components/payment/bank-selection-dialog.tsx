"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bank } from "@/types/bank.type";

interface BankSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBank: (bank: Bank) => void;
  banks: Bank[];
  selectedBankId?: string;
  loading?: boolean;
}

export function BankSelectionDialog({
  open,
  onOpenChange,
  onSelectBank,
  banks,
  selectedBankId,
  loading,
}: BankSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chọn phương thức thanh toán
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
              Đang tải danh sách ngân hàng...
            </div>
          ) : banks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
              Không có ngân hàng nào
            </div>
          ) : (
            banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => {
                  onSelectBank(bank);
                  onOpenChange(false);
                }}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedBankId === bank.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-xl sm:text-2xl">🏦</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-xs sm:text-sm line-clamp-1">
                    {bank.bankName}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {bank.bankNumber}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {bank.recipient}
                  </p>
                </div>
                {selectedBankId === bank.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
