import { CourseDetailResponse, CourseListItem } from "@/types/course.type";
import { Base } from "../base";

export class CourseRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getListCourses(ids?: string[]): Promise<{ data: CourseListItem[] }> {
    const params =
      ids && ids.length > 0
        ? { ids: ids.join(',') }
        : undefined


    return this.request('/api/course', {
      method: 'GET',
      params,
    })
  }

  async getCourseBySlugOrId(slugOrId: string): Promise<{ data: CourseDetailResponse, canAccess: boolean }> {
    return this.request(`/api/course/${slugOrId}`, {
      method: "GET",
    });
  }

  async getPurchasedCourses(): Promise<{ data: CourseListItem[] }> {
    return this.request("/api/course/purchased", {
      method: "GET",
    });
  }

  async getMaterialUrl(materialId: string): Promise<{ data: { url: string } }> {
    return this.request(`/api/course/material/${materialId}`, {
      method: "GET",
    });
  }
}

export const courseRequest = new CourseRequest();
