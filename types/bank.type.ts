export interface Bank {
  id: string;
  bankNumber: string;
  bankName: string;
  recipient: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInfo {
  phone: string;
  amount: string;
  message: string;
  bankId: string;
  bank?: Bank;
}

export interface QRGeneratorResponse {
  qrUrl: string;
  displayUrl: string;
  accountName?: string;
}
