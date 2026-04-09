export interface InvoiceDetailCourse {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  user: {
    id: string;
    fullName: string;
    avatar: string;
  };
}

export interface InvoiceDetailInvoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  users: {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
  };
}

export interface InvoiceDetail {
  id: string;
  price: number;
  commissionRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  courses: InvoiceDetailCourse;
  invoices: InvoiceDetailInvoice;
}

export interface InvoiceDetailMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceDetailParams {
  courseId?: string;
  userId?: string;
  invoiceId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price';
  order?: 'asc' | 'desc';
}

export interface InvoiceDetailResponse {
  message: string;
  data: InvoiceDetail[];
  meta: InvoiceDetailMeta;
}

// --- User-facing invoice types (GET /invoice/my) ---

export interface MyInvoiceCourse {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  user?: {
    id: string;
    fullName: string;
    avatar: string;
  };
}

export interface MyInvoiceDetailItem {
  id: string;
  price: number;
  commissionRate: number;
  status: string;
  createdAt?: string;
  courses: MyInvoiceCourse;
}

export interface MyInvoice {
  id: string;
  amount: number;
  status: 'pending' | 'purchased' | 'failed' | 'refund_requested' | 'refunded';
  createdAt: string;
  updatedAt: string;
  detail_invoices: MyInvoiceDetailItem[];
}

export interface MyInvoiceListParams {
  status?: 'pending' | 'purchased' | 'failed' | 'refund_requested' | 'refunded';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface MyInvoiceListResponse {
  message: string;
  data: MyInvoice[];
  meta: InvoiceDetailMeta;
}

export interface MyInvoiceDetailResponse {
  message: string;
  data: MyInvoice;
}
