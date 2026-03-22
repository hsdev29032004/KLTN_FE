import { CourseDetailResponse, CourseListItem } from "@/types/course.type";
import { Base } from "../base";

export class CourseRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getListCourses(): Promise<{ data: CourseListItem[] }> {
    return this.request("/api/course", {
      method: "GET",
    });
  }

  async getCourseBySlug(slug: string): Promise<{ data: CourseDetailResponse }> {
    return this.request(`/api/course/${slug}`, {
      method: "GET",
    });
  }

  async getPurchasedCourses(): Promise<{ data: CourseListItem[] }> {
    return this.request("/api/course/my-courses", {
      method: "GET",
    });
  }
}

export const courseRequest = new CourseRequest();
