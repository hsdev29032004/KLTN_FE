export interface LessonMaterial {
    id: string;
    lessonId: string;
    type: 'video' | 'pdf' | 'img' | 'link' | 'other';
    name: string;
    url: string;
    status: 'draft' | 'published' | 'outdated' | 'deleted';
    publisherId?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    publishedAt?: string | null;
}
