import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  encryptUrl: string | null;
}

const initialState: AppState = {
  encryptUrl: null,
};


export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setEncryptUrl: (state, action) => {
      state.encryptUrl = action.payload
    }
  }
})

export const { setEncryptUrl } = appSlice.actions
export default appSlice.reducer