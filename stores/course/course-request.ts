import { CourseDetailResponse, CourseListItem, CourseApproval, Lesson, Material, CourseSearchParams, CourseSearchResponse } from '@/types/course.type';
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

  async searchCourses(params: CourseSearchParams): Promise<CourseSearchResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    return this.request(`/api/course/search?${searchParams.toString()}`, {
      method: 'GET',
    });
  }

  // ── Topics ─────────────────────────────────────────────────────────────
  async getAllTopics(): Promise<{ data: { id: string; name: string; slug: string }[] }> {
    return this.request('/api/topic', {
      method: 'GET',
    });
  }

  // ── Course CRUD ──────────────────────────────────────────────────────────

  async createCourse(data: FormData | {
    name: string;
    price: number;
    thumbnail: string;
    content: string;
    description: string;
    commissionRate: number;
  }): Promise<{ data: any }> {
    const options: any = {
      method: 'POST',
      data,
    };
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      options.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return this.request('/api/course', options);
  }

  async updateCourse(courseId: string, data: FormData | {
    name?: string;
    price?: number;
    thumbnail?: string;
    content?: string;
    description?: string;
    commissionRate?: number;
  }): Promise<{ data: any }> {
    const options: any = {
      method: 'PUT',
      data,
    };
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      options.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return this.request(`/api/course/${courseId}`, options);
  }

  async deleteCourse(courseId: string): Promise<any> {
    return this.request(`/api/course/${courseId}`, {
      method: 'DELETE',
    });
  }

  async reopenCourse(courseId: string): Promise<any> {
    return this.request(`/api/course/${courseId}/reopen`, {
      method: 'POST',
    });
  }

  async submitForReview(courseId: string, data: { description: string }): Promise<any> {
    return this.request(`/api/course/${courseId}/submit-review`, {
      method: 'POST',
      data,
    });
  }

  // ── Admin Actions ────────────────────────────────────────────────────────

  async publishCourse(courseId: string): Promise<any> {
    return this.request(`/api/course/${courseId}/publish`, {
      method: 'POST',
    });
  }

  async rejectCourse(courseId: string, data: { reason: string }): Promise<any> {
    return this.request(`/api/course/${courseId}/reject`, {
      method: 'POST',
      data,
    });
  }

  async getAllCoursesAdmin(): Promise<{ data: CourseListItem[] }> {
    return this.request('/api/course/admin/all', {
      method: 'GET',
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

  async createMaterial(lessonId: string, data: FormData | { name: string; url: string; type?: string }): Promise<{ data: Material }> {
    const options: any = {
      method: 'POST',
      data,
    };
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      options.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return this.request(`/api/course/lesson/${lessonId}/material`, options);
  }

  async updateMaterial(materialId: string, data: FormData | { name?: string; url?: string; type?: string }): Promise<{ data: Material }> {
    const options: any = {
      method: 'PUT',
      data,
    };
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      options.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return this.request(`/api/course/material/${materialId}`, options);
  }

  async deleteMaterial(materialId: string): Promise<any> {
    return this.request(`/api/course/material/${materialId}`, {
      method: 'DELETE',
    });
  }

  // ── Cloud Upload ─────────────────────────────────────────────────────────

  async uploadPdf(file: File): Promise<string> {
    const cloudBase = process.env.NEXT_PUBLIC_CLOUD_URL ?? 'http://localhost:3002';
    const formData = new FormData();
    formData.append('pdf', file);
    const res = await fetch(`${cloudBase}/api/pdfs`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message ?? 'Upload thất bại');
    }
    const data = await res.json();
    return data.lessonId;
  }
}

export const courseRequest = new CourseRequest();
