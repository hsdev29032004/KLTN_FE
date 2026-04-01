import { useSelector } from 'react-redux';
import { setReviews, pushReview, clearReviews, createReview } from './review-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import type { ICourseReview } from '@/types/course.type';

export function useReviewStore() {
  const dispatch = useAppDispatch();

  const reviews = useSelector((state: RootState) => state.review.reviews);
  const loading = useSelector((state: RootState) => state.review.loading);
  const creating = useSelector((state: RootState) => state.review.creating);
  const error = useSelector((state: RootState) => state.review.error);

  return {
    reviews,
    loading,
    creating,
    error,
    setReviews: (items: ICourseReview[]) => dispatch(setReviews(items)),
    pushReview: (review: ICourseReview) => dispatch(pushReview(review)),
    clearReviews: () => dispatch(clearReviews()),
    createReview: (payload: { courseId: string; rating: number; content: string }) =>
      dispatch(createReview(payload)),
  };
}
