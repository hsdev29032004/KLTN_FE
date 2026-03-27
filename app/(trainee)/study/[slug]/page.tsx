import StudyPage from "@/components/study/study";
import { useSdk } from "@/hooks/use-my-cookies";
import { redirect } from "next/navigation";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sdk = await useSdk();
  let courseDetail = null;
  try {
    const res = await sdk.getCourseBySlugOrId(slug);
    courseDetail = res.data;

    if (!res.canAccess) {
      redirect(`/`);
    }
    return <StudyPage courseDetail={courseDetail} />;
  } catch (error) {
    redirect(`/`);
  }
}