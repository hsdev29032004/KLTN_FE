"use client";

import { PaymentForm } from "@/components/payment/payment-form";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 py-12 px-4">
      <PaymentForm onCancel={() => router.back()} />
    </div>
  );
}
