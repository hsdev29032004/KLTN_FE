import { Base } from '../base';
import type { CartResponse, AddToCartResponse, RemoveFromCartResponse, PurchaseResponse } from '@/types/cart.type';

export class CartRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  getCart = async (): Promise<CartResponse> => {
    return this.request('/api/cart', {
      method: 'GET',
    });
  };

  addToCart = async (courseIds: string[]): Promise<AddToCartResponse> => {
    return this.request('/api/cart', {
      method: 'POST',
      data: { courseIds },
    });
  };

  removeFromCart = async (courseIds: string[]): Promise<RemoveFromCartResponse> => {
    return this.request('/api/cart', {
      method: 'DELETE',
      data: { courseIds },
    });
  };

  purchaseCourses = async (courseIds: string[]): Promise<PurchaseResponse> => {
    return this.request('/api/course/purchased', {
      method: 'POST',
      data: courseIds,
    });
  };
}

export const cartRequest = new CartRequest();
