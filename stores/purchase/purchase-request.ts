import { Base } from "../base";

export class PurchaseRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  purchaseCourse = async (courseIds: string[]) => {
    try {
      const response = await this.request('/api/course/purchased', {
        method: 'POST',
        data: courseIds,
      });
      return response;
    } catch (error: any) {
      return error.response;
    }
  }
}

export const purchaseRequest = new PurchaseRequest();
