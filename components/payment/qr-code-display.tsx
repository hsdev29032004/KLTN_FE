"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface QRCodeDisplayProps {
  qrUrl: string;
  displayUrl: string;
  bankName: string;
  bankNumber: string;
  recipient: string;
  phone?: string;
  amount?: string;
  message?: string;
  type?: "deposit" | "withdrawal";
}

export function QRCodeDisplay({
  qrUrl,
  displayUrl,
  bankName,
  bankNumber,
  recipient,
  message,
  type = "deposit",
}: QRCodeDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Lỗi sao chép:", error);
    }
  };

  return (
    <Card
      className={`w-full p-3 sm:p-6 bg-gradient-to-br ${
        type === "withdrawal"
          ? "from-orange-50 to-orange-100"
          : "from-slate-50 to-slate-100"
      }`}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg">
          <div>
            <p className="text-xs text-slate-700 font-semibold">Ngân hàng</p>
            <p className="font-semibold text-xs sm:text-sm text-black">
              {bankName}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-700 font-semibold">Số tài khoản</p>
            <p className="font-semibold text-xs sm:text-sm font-mono text-black break-all">
              {bankNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-700 font-semibold">
              Chủ tài khoản
            </p>
            <p className="font-semibold text-xs sm:text-sm text-black">
              {recipient}
            </p>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-6 bg-white rounded-lg border-2 border-dashed border-primary/20">
          {qrUrl ? (
            <>
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-48 h-48 sm:w-72 sm:h-72 border-3 border-primary rounded-lg p-2 bg-white"
              />
              <p className="text-xs sm:text-sm text-slate-700 mt-3 sm:mt-4 text-center font-medium">
                {type === "withdrawal"
                  ? "Quét mã QR này để rút tiền"
                  : "Quét mã QR này để thanh toán"}
              </p>
            </>
          ) : (
            <div className="w-48 h-48 sm:w-72 sm:h-72 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-slate-700 font-medium text-xs sm:text-sm">
                Đang tạo QR...
              </p>
            </div>
          )}
        </div>

        {/* Payment Message */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 rounded-lg">
            <p className="text-xs text-slate-700 font-semibold">
              Nội dung thanh toán
            </p>
            <p className="font-mono text-xs sm:text-sm text-black font-bold mt-1 break-all">
              {message}
            </p>
          </div>
        )}

        {/* Copy Button */}
        {displayUrl && !displayUrl.startsWith("momo://") && (
          <Button
            onClick={handleCopyLink}
            variant={isCopied ? "default" : "outline"}
            className={`w-full text-xs sm:text-sm ${isCopied ? "text-white" : "text-black"}`}
          >
            {isCopied ? "Đã sao chép!" : "Sao chép liên kết"}
          </Button>
        )}
      </div>
    </Card>
  );
}
