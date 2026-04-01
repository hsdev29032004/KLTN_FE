import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import SDK from '../sdk'

interface AuthState {
  user: any
}

const initialState: AuthState = {
  user: null,
}

// Async thunks
export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await SDK.getInstance().fetchMe()
      return response.data
    } catch (error) {
      return rejectWithValue('Fetch me failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await SDK.getInstance().login(email, password)
      return response
    } catch (error) {
      return rejectWithValue('Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string; role: "User" | "Teacher" }, { rejectWithValue }) => {
    try {
      const response = await SDK.getInstance().register(data)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await SDK.getInstance().logout()
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      await SDK.getInstance().refreshToken()
      return true
    } catch (error) {
      return rejectWithValue('Refresh token failed')
    }
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    // fetchMe
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
      })

    // login
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload?.data?.user || action.payload
      })

    // register
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload?.data?.user || action.payload
      })

    // logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })

    // refreshToken - không cần update state vì token đã được set vào cookies
    builder
      .addCase(refreshToken.fulfilled, (state) => {
        // Token đã được refresh thành công
      })
      .addCase(refreshToken.rejected, (state) => {
        // Refresh thất bại, có thể logout user
        state.user = null
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
