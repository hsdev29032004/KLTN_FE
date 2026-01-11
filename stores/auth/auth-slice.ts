import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authRequest } from './auth-request'

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
      const response = await authRequest.fetchMe()
      return response.user
    } catch (error) {
      return rejectWithValue('Fetch me failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authRequest.login(email, password)
      return response.user || response
    } catch (error) {
      return rejectWithValue('Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authRequest.register(data)
      return response.user || response
    } catch (error) {
      return rejectWithValue('Registration failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authRequest.logout()
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
        state.user = action.payload
      })
    
    // register
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload
      })
    
    // logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
