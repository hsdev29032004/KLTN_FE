import { useSelector } from 'react-redux'
import { fetchCourses, fetchCourseBySlug, setList, setSelected, clearSelected } from './course-slice'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import type { CourseListItem, CourseDetail } from '@/types/course.type'

export function useCourseStore() {
  const dispatch = useAppDispatch()
  const list = useSelector((state: RootState) => state.course?.list)
  const selected = useSelector((state: RootState) => state.course?.selected)
  const loadingList = useSelector((state: RootState) => state.course?.loadingList)
  const error = useSelector((state: RootState) => state.course?.error)

  return {
    list,
    selected,
    loadingList,
    error,
    fetchCourses: () => dispatch(fetchCourses()),
    fetchCourseBySlug: (slug: string) => dispatch(fetchCourseBySlug(slug)),
    setList: (items: CourseListItem[]) => dispatch(setList(items)),
    setSelected: (c: CourseDetail | null) => dispatch(setSelected(c)),
    clearSelected: () => dispatch(clearSelected()),
  }
}
