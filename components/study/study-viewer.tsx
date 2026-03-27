"use client";

import { useState } from "react";
import { CourseDetailResponse, Lesson, Material } from "@/types/course.type";
import { Button } from "@/components/ui/button";
import { useCourseStore } from "@/stores/course/course-store";
import { useAppStore } from "@/stores/app/app-store";
import { HlsVideoPlayer } from "@/components/common/hls-video-player";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResolvedMedia {
  material: Material;
  lesson: Lesson;
  url: string;        // url thực sau khi fetch (không phải UUID)
  encryptUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MATERIAL_ICON: Record<string, string> = {
  video: "🎬",
  img: "🖼️",
  pdf: "📄",
  word: "📄",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MediaViewer({ media }: { media: ResolvedMedia | null }) {
  if (!media) {
    return (
      <div className="flex h-full items-center justify-center text-white/60">
        Chọn một tài liệu để xem
      </div>
    );
  }

  if (media.material.type === "video") {
    return (
      <HlsVideoPlayer
        key={`${process.env.NEXT_PUBLIC_CLOUD_URL}/api/videos/${media.url}/index.m3u8`}   // key thay đổi → remount → HLS reinit với url mới
        url={`${process.env.NEXT_PUBLIC_CLOUD_URL}/api/videos/${media.url}/index.m3u8`}
        className="max-h-[60vh] w-full bg-black"
      />
    );
  }

  if (media.material.type === "img") {
    return (
      <img
        src={media.url}
        alt={media.material.name}
        className="mx-auto max-h-[60vh] max-w-full object-contain"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-white/60">
      Tài liệu không hỗ trợ xem trực tiếp
    </div>
  );
}

interface LessonListProps {
  lessons: Lesson[];
  selectedMaterialId: string | null;
  loading: boolean;
  onSelect: (lesson: Lesson, material: Material) => void;
}

function LessonList({ lessons, selectedMaterialId, loading, onSelect }: LessonListProps) {
  return (
    <div className="space-y-4">
      {lessons.length === 0 && (
        <p className="text-sm text-muted-foreground">Chưa có bài học</p>
      )}
      {lessons.map((lesson) => (
        <div key={lesson.id}>
          <p className="mb-2 font-semibold">{lesson.name}</p>
          <ul className="ml-2 space-y-1">
            {lesson.materials && lesson.materials.length > 0 ? (
              lesson.materials.map((material) => {
                const isSelected = selectedMaterialId === material.id;
                return (
                  <li key={material.id}>
                    <Button
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      disabled={isSelected && loading}
                      className="w-full justify-start text-left"
                      onClick={() => onSelect(lesson, material)}
                    >
                      <span className="mr-2">{MATERIAL_ICON[material.type] ?? "📎"}</span>
                      <span className="flex-1 truncate">{material.name}</span>
                      {isSelected && loading && (
                        <span className="ml-2 text-xs opacity-60">Đang tải...</span>
                      )}
                    </Button>
                  </li>
                );
              })
            ) : (
              <li className="text-sm text-muted-foreground">Chưa có tài liệu</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudyViewer({ courseDetail }: { courseDetail: CourseDetailResponse }) {
  const { lessons = [] } = courseDetail;
  const courseStore = useCourseStore();
  const appStore = useAppStore();

  const [media, setMedia] = useState<ResolvedMedia | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (lesson: Lesson, material: Material) => {
    // PDF / Word → mở tab mới, không đổi viewer
    if (material.type === "pdf" || material.type === "word") {
      window.open(material.url, "_blank");
      return;
    }

    setSelectedMaterialId(material.id);
    setLoading(true);

    try {
      // Fetch url thực — giống CourseDetail.handlePreview
      const res: any = await courseStore.fetchMaterialUrl(material.id);
      const payload = res?.payload ?? res;
      const url = payload?.url ?? payload;
      const token = payload?.token ?? "";

      appStore.setEncryptUrl(token);
      setMedia({ material, lesson, url, encryptUrl: token });
    } catch (e) {
      console.error("fetch material url error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-6 md:flex-row">
      {/* Left: inline media viewer */}
      <div className="relative flex min-h-[360px] flex-1 items-center justify-center rounded-lg bg-black">
        {loading ? (
          <div className="text-white/60">Đang tải...</div>
        ) : (
          <MediaViewer media={media} />
        )}
      </div>

      {/* Right: lesson list */}
      <div className="max-h-[70vh] w-full overflow-y-auto rounded-lg bg-background p-4 shadow md:w-[350px]">
        <h2 className="mb-4 text-xl font-bold">Danh sách bài học</h2>
        <LessonList
          lessons={lessons}
          selectedMaterialId={selectedMaterialId}
          loading={loading}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}