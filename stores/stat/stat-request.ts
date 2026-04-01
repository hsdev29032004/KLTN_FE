import { Base } from '../base';

export class StatRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async fetchStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: any }> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return this.request(`/api/stat/lecturer${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }
}

export const statRequest = new StatRequest();
