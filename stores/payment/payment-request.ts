import { Base } from "../base";
import { GetTransactionsResponse, GetTransactionsParams } from "@/types/transaction.type";

export interface CreatePaymentUrlResponse {
  message: string;
  data: {
    url: string;
    transactionId: string;
  };
}

export class PaymentRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async createPaymentUrl(amount: number): Promise<CreatePaymentUrlResponse> {
    return this.request("/api/payment/create-payment-url", {
      method: "POST",
      data: { amount },
    });
  }

  async getTransactions(params?: GetTransactionsParams): Promise<GetTransactionsResponse> {
    const queryString = new URLSearchParams();
    if (params?.type) queryString.append('type', params.type);
    if (params?.status) queryString.append('status', params.status);
    if (params?.page) queryString.append('page', params.page.toString());
    if (params?.limit) queryString.append('limit', params.limit.toString());

    const url = `/api/payment/transactions${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return this.request(url, {
      method: "GET",
    });
  }
}

export const paymentRequest = new PaymentRequest();
