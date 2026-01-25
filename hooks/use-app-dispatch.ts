import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';

export const useAppDispatch = () => {
  const dispatch = useDispatch<AppDispatch>();

  return async (action: any) => {
    const result = dispatch(action);
    if (result && typeof result.then === 'function') {
      return result.unwrap();
    }
    return result;
  };
};