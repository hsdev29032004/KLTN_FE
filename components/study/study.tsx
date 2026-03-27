"use client";

import { CourseDetailResponse } from "@/types/course.type";
import StudyViewer from "./study-viewer";


export default function StudyPage({ courseDetail }: { courseDetail: CourseDetailResponse }) {
  if (!courseDetail) {
    return <div className="text-center text-muted-foreground py-12">Không tìm thấy dữ liệu khóa học.</div>;
  }
  return <StudyViewer courseDetail={courseDetail} />;
}