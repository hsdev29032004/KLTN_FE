export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'completed' | 'failed' | 'approved' | 'rejected';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GetTransactionsParams {
  type?: 'deposit' | 'withdrawal';
  status?: 'pending' | 'completed' | 'failed' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

export interface GetTransactionsResponse {
  message: string;
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
