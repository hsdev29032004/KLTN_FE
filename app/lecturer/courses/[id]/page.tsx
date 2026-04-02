import { useSdk } from "@/hooks/use-my-cookies";
import { CourseManagement } from "@/components/lecturer/course-management";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const sdk = await useSdk();
  const { data } = await sdk.getCourseBySlugOrId((await params).id);

  return (
    <div className="p-6">
      <CourseManagement course={data} />
    </div>
  );
}