import { CourseDetailResponse, CourseListItem, Lesson, Material } from '@/types/course.type';
import { Base } from '../base';

export class CourseRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getListCourses(ids?: string[]): Promise<{ data: CourseListItem[] }> {
    const params = ids && ids.length > 0 ? { ids: ids.join(',') } : undefined;

    return this.request('/api/course', {
      method: 'GET',
      params,
    });
  }

  async getCourseBySlugOrId(
    slugOrId: string,
  ): Promise<{ data: CourseDetailResponse; canAccess: boolean }> {
    return this.request(`/api/course/${slugOrId}`, {
      method: 'GET',
    });
  }

  async getPurchasedCourses(): Promise<{ data: CourseListItem[] }> {
    return this.request('/api/course/purchased', {
      method: 'GET',
    });
  }

  async getMaterialUrl(materialId: string): Promise<{ data: { url: string } }> {
    return this.request(`/api/course/material/${materialId}`, {
      method: 'GET',
    });
  }

  async getCourseByUserId(userId: string): Promise<{ data: CourseListItem[] }> {
    return this.request(`/api/course/user/${userId}`, {
      method: 'GET',
    });
  }

  // ── Course CRUD ──────────────────────────────────────────────────────────

  async createCourse(data: {
    name: string;
    price: number;
    thumbnail: string;
    content: string;
    description: string;
  }): Promise<{ data: any }> {
    return this.request('/api/course', {
      method: 'POST',
      data,
    });
  }

  async updateCourse(courseId: string, data: Record<string, any>): Promise<{ data: any }> {
    return this.request(`/api/course/${courseId}`, {
      method: 'PUT',
      data,
    });
  }

  async deleteCourse(courseId: string): Promise<any> {
    return this.request(`/api/course/${courseId}`, {
      method: 'DELETE',
    });
  }

  async submitForReview(courseId: string): Promise<any> {
    return this.request(`/api/course/${courseId}/submit-review`, {
      method: 'POST',
    });
  }

  // ── Lesson CRUD ──────────────────────────────────────────────────────────

  async createLesson(courseId: string, data: { name: string }): Promise<{ data: Lesson }> {
    return this.request(`/api/course/${courseId}/lesson`, {
      method: 'POST',
      data,
    });
  }

  async updateLesson(lessonId: string, data: { name?: string }): Promise<{ data: Lesson }> {
    return this.request(`/api/course/lesson/${lessonId}`, {
      method: 'PUT',
      data,
    });
  }

  async deleteLesson(lessonId: string): Promise<any> {
    return this.request(`/api/course/lesson/${lessonId}`, {
      method: 'DELETE',
    });
  }

  // ── Material CRUD ────────────────────────────────────────────────────────

  async createMaterial(lessonId: string, data: { name: string; url: string; type?: string }): Promise<{ data: Material }> {
    return this.request(`/api/course/lesson/${lessonId}/material`, {
      method: 'POST',
      data,
    });
  }

  async updateMaterial(materialId: string, data: { name?: string; url?: string; type?: string }): Promise<{ data: Material }> {
    return this.request(`/api/course/material/${materialId}`, {
      method: 'PUT',
      data,
    });
  }

  async deleteMaterial(materialId: string): Promise<any> {
    return this.request(`/api/course/material/${materialId}`, {
      method: 'DELETE',
    });
  }
}

export const courseRequest = new CourseRequest();
