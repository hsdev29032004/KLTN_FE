import { Base } from '../base';
import type { InvoiceDetailParams, InvoiceDetailResponse } from '@/types/invoice.type';

export class InvoiceRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  getInvoiceDetails = async (params?: InvoiceDetailParams): Promise<InvoiceDetailResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set('courseId', params.courseId);
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.invoiceId) searchParams.set('invoiceId', params.invoiceId);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);
    const query = searchParams.toString();
    return this.request(`/api/invoice/details${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }
}

export const invoiceRequest = new InvoiceRequest();
