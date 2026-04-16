"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bank } from "@/types/bank.type";
import { Loader2 } from "lucide-react";

interface BankSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: Bank[];
  loading?: boolean;
  depositing?: boolean;
  /** Called when a bank is selected in selection-only mode */
  onSelectBank?: (bankId: string) => void;
  /** If true, dialog works as "select bank only" (no amount input) */
  selectOnly?: boolean;
}


export function BankSelectionDialog({
  open,
  onOpenChange,
  banks,
  loading,
  depositing,
  onSelectBank,
  selectOnly = false,
}: BankSelectionDialogProps) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!depositing) {
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="max-w-[90vw] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Nạp tiền qua VNPay
          </DialogTitle>
        </DialogHeader>

        {/* Bank List (display only / selection) */}
        <div className="space-y-2">
          {selectOnly ? (
            <label className="text-sm font-medium text-muted-foreground">Chọn ngân hàng để thanh toán</label>
          ) : (
            <label className="text-sm font-medium text-muted-foreground">
              Thanh toán qua cổng VNPay — Hỗ trợ các ngân hàng:
            </label>
          )}
          <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground text-xs sm:text-sm">
                Đang tải danh sách ngân hàng...
              </div>
            ) : banks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs sm:text-sm">
                Không có ngân hàng nào
              </div>
            ) : (
              banks.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => selectOnly && !depositing && setSelectedBankId(bank.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer`}
                >
                  <span className="text-xl sm:text-2xl">🏦</span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-xs sm:text-sm line-clamp-1">
                      {bank.bankName}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {bank.bankNumber} — {bank.recipient}
                    </p>
                  </div>
                  {selectOnly && selectedBankId === bank.id && (
                    <div className="text-sm text-primary font-semibold">Đã chọn</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        {selectOnly ? (
          <Button
            className="w-full"
            disabled={!selectedBankId || depositing}
            onClick={() => {
              if (selectedBankId) {
                onSelectBank?.(selectedBankId);
              }
            }}
          >
            {depositing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>Chọn ngân hàng và tiếp tục</>
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={depositing}
          >
            {depositing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>Nạp tiền qua VNPay</>
            )}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
