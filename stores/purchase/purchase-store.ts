import { useSelector } from 'react-redux'
import { setCourseSelected, addCourseSelected, removeCourseSelected, clearCourseSelected } from './purchase-slice'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'

export function usePurchaseStore() {
  const dispatch = useAppDispatch()
  const courseSelected = useSelector((state: RootState) => state.purchase?.courseSelected)

  return {
    courseSelected,
    setCourseSelected: (ids: string[]) => dispatch(setCourseSelected(ids)),
    addCourseSelected: (id: string) => dispatch(addCourseSelected(id)),
    removeCourseSelected: (id: string) => dispatch(removeCourseSelected(id)),
    clearCourseSelected: () => dispatch(clearCourseSelected()),
  }
}
