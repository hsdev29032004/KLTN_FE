import { useSelector } from 'react-redux';
import {
  fetchCart,
  addToCart,
  removeFromCart,
  purchaseCourses,
  syncLocalCartToServer,
  initLocalCart,
  addToLocalCart,
  removeFromLocalCart,
  clearLocalCartState,
  clearCart,
} from './cart-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

export function useCartStore() {
  const dispatch = useAppDispatch();
  const items = useSelector((state: RootState) => state.cart?.items);
  const totalPrice = useSelector((state: RootState) => state.cart?.totalPrice);
  const count = useSelector((state: RootState) => state.cart?.count);
  const loading = useSelector((state: RootState) => state.cart?.loading);
  const purchasing = useSelector((state: RootState) => state.cart?.purchasing);
  const error = useSelector((state: RootState) => state.cart?.error);
  const localCartIds = useSelector((state: RootState) => state.cart?.localCartIds);

  return {
    items,
    totalPrice,
    count,
    loading,
    purchasing,
    error,
    localCartIds,
    fetchCart: () => dispatch(fetchCart()),
    addToCart: (courseIds: string[]) => dispatch(addToCart(courseIds)),
    removeFromCart: (courseIds: string[]) => dispatch(removeFromCart(courseIds)),
    purchaseCourses: (courseIds: string[]) => dispatch(purchaseCourses(courseIds)),
    syncLocalCartToServer: () => dispatch(syncLocalCartToServer()),
    initLocalCart: () => dispatch(initLocalCart()),
    addToLocalCart: (id: string) => dispatch(addToLocalCart(id)),
    removeFromLocalCart: (id: string) => dispatch(removeFromLocalCart(id)),
    clearLocalCartState: () => dispatch(clearLocalCartState()),
    clearCart: () => dispatch(clearCart()),
  };
}
