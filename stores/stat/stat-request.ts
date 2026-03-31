import { Base } from '../base';

export class StatRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async fetchRevenueByMonth(): Promise<{ data: any }> {
    return this.request(`/api/stat/lecturer`, {
      method: 'GET',
    });
  }
}

export const statRequest = new StatRequest();
