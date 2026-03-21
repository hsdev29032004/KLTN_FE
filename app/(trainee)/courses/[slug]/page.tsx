import { notFound } from 'next/navigation';
import { CourseDetail } from '@/components/course-detail';
import { useSdk } from '@/hooks/use-my-cookies';
import { CourseDetailResponse } from '@/types/course.type';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sdk = await useSdk();
  let course: CourseDetailResponse | null = null;
  try {
    const courseResponse = await sdk.getCourseBySlug(slug);
    course = courseResponse?.data;

  } catch (err) {
    course = null;
  }
  if (!course) {
    notFound();
  }
  return (
    <CourseDetail
      course={course}
      lessons={course.lessons || []}
      reviews={course.reviews || []}
      instructor={course.user || {}}
      relatedCourses={[]}
    />
  );
}
