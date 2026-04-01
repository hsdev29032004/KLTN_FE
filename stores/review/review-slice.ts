import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reviewRequest } from './review-request';
import type { ICourseReview } from '@/types/course.type';

interface ReviewState {
  reviews: ICourseReview[];
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  creating: false,
  error: null,
};

export const createReview = createAsyncThunk(
  'review/createReview',
  async (
    payload: { courseId: string; rating: number; content: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await reviewRequest.createReview(payload);
      return res.data as ICourseReview;
    } catch (error) {
      return rejectWithValue('Tạo đánh giá thất bại');
    }
  },
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    setReviews(state, action: PayloadAction<ICourseReview[]>) {
      state.reviews = action.payload;
    },
    pushReview(state, action: PayloadAction<ICourseReview>) {
      state.reviews.unshift(action.payload);
    },
    clearReviews(state) {
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.creating = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setReviews, pushReview, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
