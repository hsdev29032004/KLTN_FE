import { Base } from "../base";

export class ReviewRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getReviewsByCourseId(courseId: string): Promise<{ data: any[] }> {
    return this.request(`/api/review/${courseId}`, {
      method: 'GET',
    });
  }
}

export const reviewRequest = new ReviewRequest();