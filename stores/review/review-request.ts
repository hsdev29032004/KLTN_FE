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

  async createReview(payload: { courseId: string; rating: number; content: string }): Promise<{ data: any }> {
    return this.request(`/api/review`, {
      method: 'POST',
      data: payload,
    });
  }
}

export const reviewRequest = new ReviewRequest();