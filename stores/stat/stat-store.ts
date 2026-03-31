import { useSelector } from 'react-redux';
import { fetchRevenueByMonth, clearStat } from './stat-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

export function useStatStore() {
  const dispatch = useAppDispatch();

  const revenueByMonth = useSelector(
    (state: RootState) => state.stat?.revenueByMonth,
  );
  const loading = useSelector((state: RootState) => state.stat?.loading);
  const error = useSelector((state: RootState) => state.stat?.error);

  return {
    revenueByMonth,
    loading,
    error,
    fetchRevenueByMonth: () => dispatch(fetchRevenueByMonth()),
    clearStat: () => dispatch(clearStat()),
  };
}
