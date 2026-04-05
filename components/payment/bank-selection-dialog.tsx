"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bank } from "@/types/bank.type";
import { formatMoney } from "@/helpers/format.helper";
import { Loader2 } from "lucide-react";

interface BankSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeposit: (amount: number) => void;
  banks: Bank[];
  loading?: boolean;
  depositing?: boolean;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export function BankSelectionDialog({
  open,
  onOpenChange,
  onDeposit,
  banks,
  loading,
  depositing,
}: BankSelectionDialogProps) {
  const [amount, setAmount] = useState<string>("");

  const parsedAmount = parseInt(amount) || 0;
  const isValidAmount = parsedAmount >= 10000;

  const handleDeposit = () => {
    if (isValidAmount && !depositing) {
      onDeposit(parsedAmount);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!depositing) {
          onOpenChange(v);
          if (!v) setAmount("");
        }
      }}
    >
      <DialogContent className="max-w-[90vw] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Nạp tiền qua VNPay
          </DialogTitle>
        </DialogHeader>

        {/* Amount Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Số tiền nạp (VNĐ)</label>
          <Input
            type="number"
            min={10000}
            placeholder="Nhập số tiền (tối thiểu 10,000đ)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={depositing}
          />
          {amount && !isValidAmount && (
            <p className="text-xs text-destructive">
              Số tiền tối thiểu là 10,000đ
            </p>
          )}

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((qa) => (
              <Button
                key={qa}
                variant={parsedAmount === qa ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setAmount(qa.toString())}
                disabled={depositing}
              >
                {formatMoney(qa)}
              </Button>
            ))}
          </div>
        </div>

        {/* Bank List (display only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Thanh toán qua cổng VNPay — Hỗ trợ các ngân hàng:
          </label>
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
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deposit Button */}
        <Button
          className="w-full"
          disabled={!isValidAmount || depositing}
          onClick={handleDeposit}
        >
          {depositing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              Nạp {isValidAmount ? formatMoney(parsedAmount) : "tiền"} qua VNPay
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
