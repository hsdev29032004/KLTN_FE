import SDK from '@/stores/sdk';
import { cookies } from 'next/headers';

export async function useSdk() {
  const cookieStore = await cookies();
  const access_token = cookieStore.get('access_token')?.value || '';
  const refresh_token = cookieStore.get('refresh_token')?.value || '';
  const sdk = new SDK(access_token, refresh_token)
  return sdk;
}