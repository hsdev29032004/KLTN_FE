import { useSdk } from "@/hooks/use-my-cookies";
import { CourseCard } from "@/components/landing/course-card";

export default async function MyCoursesPage() {
  const sdk = await useSdk();
  const myCourse = await sdk.getPurchasedCourses();
  const courses = myCourse?.data || [];

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {courses.map((course: any) => (
          <CourseCard
            key={course.id}
            course={course}
            href={`/my-courses/${course.slug || course.id}`}
          />
        ))}
      </div>
    </div>
  );
}
