import { notFound } from 'next/navigation';
import { CourseDetail } from '@/components/course-detail';
import { mockCourses } from '@/mock/courses';
import { mockLessons } from '@/mock/lessons';
import { mockLessonMaterials } from '@/mock/lesson-materials';
import { mockReviews } from '@/mock/course-reviews';

// Mock instructor data
const mockInstructor = {
    id: '1',
    fullName: 'Nguyễn Anh Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Giảng viên lập trình web hàng đầu với hơn 10 năm kinh nghiệm',
};

// Mock user data for instructors
const mockInstructors: Record<string, any> = {
    '1': { id: '1', fullName: 'Nguyễn Anh Tuấn', avatar: 'https://i.pravatar.cc/150?img=5' },
    '2': { id: '2', fullName: 'Trần Minh Châu', avatar: 'https://i.pravatar.cc/150?img=6' },
    '3': { id: '3', fullName: 'Lê Thành Hiệp', avatar: 'https://i.pravatar.cc/150?img=7' },
};

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Find course by slug
    const course = mockCourses.find((c) => c.slug === slug);

    if (!course) {
        notFound();
    }

    // Get lessons for this course
    const courseLessons = mockLessons.filter((l) => l.courseId === course.id);

    // Get materials for these lessons
    const courseMaterials = mockLessonMaterials.filter((m) =>
        courseLessons.some((l) => l.id === m.lessonId)
    );

    // Get reviews for this course
    const courseReviews = mockReviews.filter((r) => r.courseId === course.id);

    // Get instructor info
    const instructor = mockInstructors[course.userId] || mockInstructor;

    // Get related courses (same user or different)
    const relatedCourses = mockCourses.filter(
        (c) => c.id !== course.id && (Math.random() > 0.5 ? true : c.userId !== course.userId)
    );

    return (
        <CourseDetail
            course={course}
            lessons={courseLessons}
            materials={courseMaterials}
            reviews={courseReviews}
            instructor={instructor}
            relatedCourses={relatedCourses}
        />
    );
}
