export interface CourseReview {
    id: string;
    reviewerId: string;
    courseId: string;
    rating: number;
    content: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    reviewer?: {
        id: string;
        fullName: string;
        avatar?: string;
    };
}
