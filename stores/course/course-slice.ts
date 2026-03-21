import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { courseRequest } from './course-request'
import type {
  CourseListItem,
  CourseDetailResponse,
} from '@/types/course.type'

interface CourseState {
  list: CourseListItem[]
  selected: CourseDetailResponse | null
  loadingList: boolean
  loadingSelected: boolean
  error?: string | null
}

const initialState: CourseState = {
  list: [],
  selected: null,
  loadingList: false,
  loadingSelected: false,
  error: null,
}

export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await courseRequest.getListCourses()
      const payload = res.data
      return payload as CourseListItem[]
    } catch (error) {
      return rejectWithValue('Fetch courses failed')
    }
  }
)

export const fetchCourseBySlug = createAsyncThunk(
  'course/fetchCourseBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await courseRequest.getCourseBySlug(slug)
      const payload = res.data
      return payload as CourseDetailResponse
    } catch (error) {
      return rejectWithValue('Fetch course failed')
    }
  }
)

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setList: (state, action: PayloadAction<CourseListItem[]>) => {
      state.list = action.payload
    },
    setSelected: (state, action: PayloadAction<CourseDetailResponse | null>) => {
      state.selected = action.payload
    },
    clearSelected: (state) => {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    // fetchCourses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<CourseListItem[]>) => {
        state.loadingList = false
        state.list = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload as string || 'Fetch courses failed'
      })

    // fetchCourseBySlug
    builder
      .addCase(fetchCourseBySlug.pending, (state) => {
        state.loadingSelected = true
        state.error = null
      })
      .addCase(fetchCourseBySlug.fulfilled, (state, action: PayloadAction<CourseDetailResponse>) => {
        state.loadingSelected = false
        state.selected = action.payload
      })
      .addCase(fetchCourseBySlug.rejected, (state, action) => {
        state.loadingSelected = false
        state.error = action.payload as string || 'Fetch course failed'
      })
  },
})

export const { setList, setSelected, clearSelected } = courseSlice.actions
export default courseSlice.reducer
