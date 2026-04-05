export interface ILessonSchema {
    id: string;
    courseId: string;
    name: string;
    status: 'draft' | 'published' | 'outdated' | 'deleted';
    publisherId?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    publishedAt?: string | null;
}