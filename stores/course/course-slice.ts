import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { courseRequest } from './course-request';
import type { CourseListItem, CourseDetailResponse, CourseSearchParams, CourseSearchMeta } from '@/types/course.type';

interface CourseState {
  list: CourseListItem[];
  selected: CourseDetailResponse | null;
  purchasedList: CourseListItem[];
  searchResults: CourseListItem[];
  searchMeta: CourseSearchMeta | null;
  loadingList: boolean;
  loadingSelected: boolean;
  loadingPurchasedList: boolean;
  loadingSearch: boolean;
  error?: string | null;
}

const initialState: CourseState = {
  list: [],
  selected: null,
  purchasedList: [],
  searchResults: [],
  searchMeta: null,
  loadingList: false,
  loadingSelected: false,
  loadingPurchasedList: false,
  loadingSearch: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (
    ids: string[] | undefined,
    { rejectWithValue },
  ): Promise<CourseListItem[] | ReturnType<typeof rejectWithValue>> => {
    try {
      const res = await courseRequest.getListCourses(ids);
      const payload = res.data;
      return payload as CourseListItem[];
    } catch (error) {
      return rejectWithValue('Fetch courses failed');
    }
  },
);

export const fetchCourseBySlug = createAsyncThunk(
  'course/fetchCourseBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await courseRequest.getCourseBySlugOrId(slug);
      const payload = res.data;
      return payload as CourseDetailResponse;
    } catch (error) {
      return rejectWithValue('Fetch course failed');
    }
  },
);

export const fetchPurchasedCourses = createAsyncThunk(
  'course/fetchPurchasedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await courseRequest.getPurchasedCourses();
      const payload = res.data;
      return payload as CourseListItem[];
    } catch (error) {
      return rejectWithValue('Fetch purchased courses failed');
    }
  },
);

export const fetchMaterialUrl = createAsyncThunk(
  'course/fetchMaterialUrl',
  async (materialId: string, { rejectWithValue }) => {
    try {
      const res = await courseRequest.getMaterialUrl(materialId);
      const payload = res.data.url;
      return payload as string;
    } catch (error) {
      return rejectWithValue('Fetch material url failed');
    }
  },
);

export const fetchCourseByUserId = createAsyncThunk(
  'course/fetchCourseByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await courseRequest.getCourseByUserId(userId);
      const payload = res.data;
      return payload as CourseListItem[];
    } catch (error) {
      return rejectWithValue('Fetch courses by user ID failed');
    }
  },
);

export const searchCourses = createAsyncThunk(
  'course/searchCourses',
  async (params: CourseSearchParams, { rejectWithValue }) => {
    try {
      const res = await courseRequest.searchCourses(params);
      return { data: res.data as CourseListItem[], meta: res.meta };
    } catch (error) {
      return rejectWithValue('Search courses failed');
    }
  },
);

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setList: (state, action: PayloadAction<CourseListItem[]>) => {
      state.list = action.payload;
    },
    setSelected: (
      state,
      action: PayloadAction<CourseDetailResponse | null>,
    ) => {
      state.selected = action.payload;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
    setPurchasedList: (state, action: PayloadAction<CourseListItem[]>) => {
      state.purchasedList = action.payload;
    },
    clearPurchasedList: (state) => {
      state.purchasedList = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchMeta = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCourses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(
        fetchCourses.fulfilled,
        (state, action: PayloadAction<CourseListItem[]>) => {
          state.loadingList = false;
          state.list = action.payload;
        },
      )
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loadingList = false;
        state.error = (action.payload as string) || 'Fetch courses failed';
      });

    // fetchCourseBySlug
    builder
      .addCase(fetchCourseBySlug.pending, (state) => {
        state.loadingSelected = true;
        state.error = null;
      })
      .addCase(
        fetchCourseBySlug.fulfilled,
        (state, action: PayloadAction<CourseDetailResponse>) => {
          state.loadingSelected = false;
          state.selected = action.payload;
        },
      )
      .addCase(fetchCourseBySlug.rejected, (state, action) => {
        state.loadingSelected = false;
        state.error = (action.payload as string) || 'Fetch course failed';
      });

    // fetchPurchasedCourses
    builder
      .addCase(fetchPurchasedCourses.pending, (state) => {
        state.loadingPurchasedList = true;
        state.error = null;
      })
      .addCase(
        fetchPurchasedCourses.fulfilled,
        (state, action: PayloadAction<CourseListItem[]>) => {
          state.loadingPurchasedList = false;
          state.purchasedList = action.payload;
        },
      )
      .addCase(fetchPurchasedCourses.rejected, (state, action) => {
        state.loadingPurchasedList = false;
        state.error =
          (action.payload as string) || 'Fetch purchased courses failed';
      });

    // searchCourses
    builder
      .addCase(searchCourses.pending, (state) => {
        state.loadingSearch = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loadingSearch = false;
        state.searchResults = action.payload.data;
        state.searchMeta = action.payload.meta;
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.loadingSearch = false;
        state.error = (action.payload as string) || 'Search courses failed';
      });
  },
});

export const {
  setList,
  setSelected,
  clearSelected,
  setPurchasedList,
  clearPurchasedList,
  clearSearchResults,
} = courseSlice.actions;
export default courseSlice.reducer;
