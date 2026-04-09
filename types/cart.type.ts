export interface CartItemCourse {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  star: string;
  status: string;
  user: {
    id: string;
    fullName: string;
    avatar: string;
  };
}

export interface CartItem {
  id: string;
  courseId: string;
  addedAt: string;
  course: CartItemCourse;
}

export interface CartResponse {
  message: string;
  data: {
    items: CartItem[];
    totalPrice: number;
    count: number;
  };
}

export interface AddToCartResponse {
  message: string;
  data: {
    added: number;
    skipped: number;
  };
}

export interface RemoveFromCartResponse {
  message: string;
  data: {
    removed: number;
  };
}

export interface PurchaseResponse {
  message: string;
  data: {
    invoiceId: string;
    amount: number;
    paymentUrl: string;
  };
}
