import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PurchaseState {
  courseSelected: string[]
}

const initialState: PurchaseState = {
  courseSelected: [],
}

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    setCourseSelected: (state, action: PayloadAction<string[]>) => {
      state.courseSelected = action.payload
    },
    addCourseSelected: (state, action: PayloadAction<string>) => {
      if (!state.courseSelected.includes(action.payload)) {
        state.courseSelected.push(action.payload)
      }
    },
    removeCourseSelected: (state, action: PayloadAction<string>) => {
      state.courseSelected = state.courseSelected.filter((id) => id !== action.payload)
    },
    clearCourseSelected: (state) => {
      state.courseSelected = []
    },
  },
})

export const { setCourseSelected, addCourseSelected, removeCourseSelected, clearCourseSelected } = purchaseSlice.actions
export default purchaseSlice.reducer

