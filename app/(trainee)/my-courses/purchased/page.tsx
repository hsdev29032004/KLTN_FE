import { useSdk } from "@/hooks/use-my-cookies";
import { CourseCard } from "@/components/landing/course-card";

export default async function PurchasedPage() {
  const sdk = await useSdk();
  let myCourse;
  try {
    myCourse = await sdk.getPurchasedCourses();
  } catch (error) {
    console.error("Failed to fetch purchased courses:", error);
  }
  const courses = myCourse?.data || [];

  return (
    <div style={{ padding: 16 }}>
      <div className="mt-4">
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
              href={`/study/${course.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
