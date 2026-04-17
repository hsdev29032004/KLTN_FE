import { Base } from '../base';

export interface PayrollQueryParams {
  fromDate?: string;
  toDate?: string;
}

export interface PayrollResponse {
  message: string;
  data: any[];
}

export class PayrollRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getPayroll(params?: PayrollQueryParams): Promise<PayrollResponse> {
    const queryString = new URLSearchParams();
    if (params?.fromDate) queryString.append('fromDate', params.fromDate);
    if (params?.toDate) queryString.append('toDate', params.toDate);

    const url = `/api/invoice/payroll${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return this.request(url, { method: 'GET' });
  }
}

export const payrollRequest = new PayrollRequest();
