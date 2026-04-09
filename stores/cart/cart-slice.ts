import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartRequest } from './cart-request';
import type { CartItem } from '@/types/cart.type';

const CART_STORAGE_KEY = 'onlearn_cart';

function getLocalCart(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCart(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(ids));
}

function clearLocalCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  count: number;
  loading: boolean;
  purchasing: boolean;
  error: string | null;
  // localStorage cart for unauthenticated users
  localCartIds: string[];
}

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  count: 0,
  loading: false,
  purchasing: false,
  error: null,
  localCartIds: [],
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartRequest.getCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi tải giỏ hàng');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (courseIds: string[], { rejectWithValue }) => {
    try {
      const response = await cartRequest.addToCart(courseIds);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (courseIds: string[], { rejectWithValue }) => {
    try {
      const response = await cartRequest.removeFromCart(courseIds);
      return { courseIds, result: response.data };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi xóa khỏi giỏ hàng');
    }
  }
);

export const purchaseCourses = createAsyncThunk(
  'cart/purchaseCourses',
  async (courseIds: string[], { rejectWithValue }) => {
    try {
      const response = await cartRequest.purchaseCourses(courseIds);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  }
);

export const syncLocalCartToServer = createAsyncThunk(
  'cart/syncLocalCartToServer',
  async (_, { rejectWithValue }) => {
    try {
      const localIds = getLocalCart();
      if (localIds.length > 0) {
        await cartRequest.addToCart(localIds);
        clearLocalCart();
      }
      const response = await cartRequest.getCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi đồng bộ giỏ hàng');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initLocalCart: (state) => {
      state.localCartIds = getLocalCart();
      state.count = state.localCartIds.length;
    },
    addToLocalCart: (state, action: PayloadAction<string>) => {
      if (!state.localCartIds.includes(action.payload)) {
        state.localCartIds.push(action.payload);
        state.count = state.localCartIds.length;
        setLocalCart(state.localCartIds);
      }
    },
    removeFromLocalCart: (state, action: PayloadAction<string>) => {
      state.localCartIds = state.localCartIds.filter(id => id !== action.payload);
      state.count = state.localCartIds.length;
      setLocalCart(state.localCartIds);
    },
    clearLocalCartState: (state) => {
      state.localCartIds = [];
      clearLocalCart();
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.count = action.payload.count;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // addToCart
      .addCase(addToCart.fulfilled, (state) => {
        // Will refetch cart after adding
      })
      // removeFromCart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const removedIds = action.payload.courseIds;
        state.items = state.items.filter(item => !removedIds.includes(item.courseId));
        state.totalPrice = state.items.reduce((sum, item) => sum + item.course.price, 0);
        state.count = state.items.length;
      })
      // purchaseCourses
      .addCase(purchaseCourses.pending, (state) => {
        state.purchasing = true;
        state.error = null;
      })
      .addCase(purchaseCourses.fulfilled, (state) => {
        state.purchasing = false;
      })
      .addCase(purchaseCourses.rejected, (state, action) => {
        state.purchasing = false;
        state.error = action.payload as string;
      })
      // syncLocalCartToServer
      .addCase(syncLocalCartToServer.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncLocalCartToServer.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.count = action.payload.count;
        state.localCartIds = [];
      })
      .addCase(syncLocalCartToServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  initLocalCart,
  addToLocalCart,
  removeFromLocalCart,
  clearLocalCartState,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
