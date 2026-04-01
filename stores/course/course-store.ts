import { useSelector } from 'react-redux';
import {
  fetchCourses,
  fetchCourseBySlug,
  fetchPurchasedCourses,
  setList,
  setSelected,
  clearSelected,
  setPurchasedList,
  clearPurchasedList,
  fetchMaterialUrl,
  fetchCourseByUserId,
} from './course-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import type { CourseListItem, CourseDetailResponse } from '@/types/course.type';

export function useCourseStore() {
  const dispatch = useAppDispatch();
  const list = useSelector((state: RootState) => state.course?.list);
  const selected = useSelector((state: RootState) => state.course?.selected);
  const purchasedList = useSelector(
    (state: RootState) => state.course?.purchasedList,
  );
  const loadingList = useSelector(
    (state: RootState) => state.course?.loadingList,
  );
  const loadingPurchasedList = useSelector(
    (state: RootState) => state.course?.loadingPurchasedList,
  );
  const error = useSelector((state: RootState) => state.course?.error);

  return {
    list,
    selected,
    loadingList,
    error,
    fetchCourses: (ids?: string[]) => dispatch(fetchCourses(ids)),
    fetchCourseBySlug: (slug: string) => dispatch(fetchCourseBySlug(slug)),
    fetchPurchasedCourses: () => dispatch(fetchPurchasedCourses()),
    fetchMaterialUrl: (materialId: string) =>
      dispatch(fetchMaterialUrl(materialId)),
    setList: (items: CourseListItem[]) => dispatch(setList(items)),
    setSelected: (c: CourseDetailResponse | null) => dispatch(setSelected(c)),
    clearSelected: () => dispatch(clearSelected()),
    purchasedList,
    loadingPurchasedList,
    setPurchasedList: (items: CourseListItem[]) =>
      dispatch(setPurchasedList(items)),
    clearPurchasedList: () => dispatch(clearPurchasedList()),
    fetchCourseByUserId: (userId: string) =>
      dispatch(fetchCourseByUserId(userId)),
  };
}
