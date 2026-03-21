export interface ILessonSchema {
    id: string;
    courseId: string;
    name: string;
    status: 'draft' | 'pending' | 'published';
    publisherId?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    publishedAt?: string | null;
}