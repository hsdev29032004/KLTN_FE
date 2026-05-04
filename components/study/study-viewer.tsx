"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CourseDetailResponse, CourseExam, Lesson, Material } from "@/types/course.type";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourseStore } from "@/stores/course/course-store";
import { useAppStore } from "@/stores/app/app-store";
import { HlsVideoPlayer } from "@/components/common/hls-video-player";
import SDK from "@/stores/sdk";
import { toast } from "sonner";
import { Lock, FileQuestion, CheckCircle2 } from "lucide-react";
import type { ExamInfo } from "@/types/exam.type";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResolvedMedia {
  material: Material;
  lesson: Lesson;
  url: string;
  encryptUrl: string;
}

type ContentItem =
  | (Lesson & { _type: "lesson" })
  | (CourseExam & { _type: "exam" });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MATERIAL_ICON: Record<string, string> = {
  video: "🎬",
  img: "🖼️",
  pdf: "📄",
  word: "📄",
};

const CLOUD_BASE = process.env.NEXT_PUBLIC_CLOUD_URL ?? "http://localhost:3002";

function getPdfSource(u: string) {
  if (!u) return "";
  if (u.startsWith("blob:")) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${CLOUD_BASE}${u}`;
  return `${CLOUD_BASE}/api/pdfs/${u}`;
}

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
        key={`${process.env.NEXT_PUBLIC_CLOUD_URL}/api/videos/${media.url}/index.m3u8`}
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

  if (media.material.type === "pdf") {
    return (
      <iframe
        src={getPdfSource(media.url)}
        title={media.material.name}
        className="w-full h-[60vh] border-0 bg-white"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-white/60">
      Tài liệu không hỗ trợ xem trực tiếp
    </div>
  );
}

// ─── Content List (Lessons + Exams) ───────────────────────────────────────────

interface ContentListProps {
  content: ContentItem[];
  examInfoMap: Record<string, ExamInfo>;
  lockedItemIds: Set<string>;
  selectedMaterialId: string | null;
  loading: boolean;
  onSelectMaterial: (lesson: Lesson, material: Material) => void;
  onGoToExam: (examId: string) => void;
}

function ContentList({
  content,
  examInfoMap,
  lockedItemIds,
  selectedMaterialId,
  loading,
  onSelectMaterial,
  onGoToExam,
}: ContentListProps) {
  return (
    <div className="space-y-4">
      {content.length === 0 && (
        <p className="text-sm text-muted-foreground">Chưa có nội dung</p>
      )}
      {content.map((item) => {
        if (item._type === "exam") {
          const info = examInfoMap[item.id];
          const passed = info?.hasPassed ?? false;
          const isLocked = lockedItemIds.has(item.id);
          return (
            <div key={item.id} className={`rounded-lg border p-3 space-y-2 ${isLocked ? "opacity-50 pointer-events-none select-none" : ""}`}>
              <div className="flex items-center gap-2">
                {isLocked
                  ? <Lock className="h-4 w-4 text-muted-foreground" />
                  : <FileQuestion className="h-4 w-4 text-blue-500" />}
                <span className="font-semibold text-sm flex-1">{item.name}</span>
                {isLocked ? (
                  <Badge variant="outline" className="text-xs">🔒 Bị khóa</Badge>
                ) : passed ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Đã đạt
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Đề thi</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{item.questionCount} câu</span>
                <span>{item.duration} phút</span>
                <span>Đạt: {item.passPercent}%</span>
              </div>
              {isLocked ? (
                <p className="text-xs text-muted-foreground">🔒 Hoàn thành đề thi trước để mở khóa</p>
              ) : (
                <Button
                  size="sm"
                  variant={passed ? "outline" : "default"}
                  className="w-full"
                  onClick={() => onGoToExam(item.id)}
                >
                  {passed ? "Xem lại" : "Làm bài thi"}
                </Button>
              )}
            </div>
          );
        }

        // Lesson
        const isLocked = lockedItemIds.has(item.id);
        return (
          <div key={item.id} className={isLocked ? "opacity-60" : ""}>
            <div className="flex items-center gap-2 mb-2">
              {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
              <p className="font-semibold text-sm">{item.name}</p>
            </div>
            {isLocked ? (
              <p className="text-xs text-muted-foreground ml-5">
                🔒 Hoàn thành đề thi trước để mở khóa
              </p>
            ) : (
              <ul className="ml-2 space-y-1">
                {item.materials && item.materials.length > 0 ? (
                  item.materials.map((material) => {
                    const isSelected = selectedMaterialId === material.id;
                    return (
                      <li key={material.id}>
                        <Button
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          disabled={(isSelected && loading) || isLocked}
                          className="w-full justify-start text-left"
                          onClick={() => onSelectMaterial(item, material)}
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
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudyViewer({ courseDetail }: { courseDetail: CourseDetailResponse }) {
  const { lessons = [], exams = [] } = courseDetail;
  const courseStore = useCourseStore();
  const appStore = useAppStore();
  const router = useRouter();

  const [media, setMedia] = useState<ResolvedMedia | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [examInfoMap, setExamInfoMap] = useState<Record<string, ExamInfo>>({});

  // Merge lessons + exams sorted by createdAt
  const courseContent = useMemo<ContentItem[]>(() => {
    return [
      ...lessons.map((l) => ({ ...l, _type: "lesson" as const })),
      ...(exams || []).filter((e) => e.status === "published").map((e) => ({ ...e, _type: "exam" as const })),
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [lessons, exams]);

  // Load exam info for each published exam
  useEffect(() => {
    if (!exams || exams.length === 0) return;
    const sdk = SDK.getInstance();
    const published = exams.filter((e) => e.status === "published");
    Promise.all(
      published.map((e) =>
        sdk.getExamInfo(e.id).then((res) => ({ id: e.id, info: res.data })).catch(() => null)
      )
    ).then((results) => {
      const map: Record<string, ExamInfo> = {};
      results.forEach((r) => { if (r) map[r.id] = r.info; });
      setExamInfoMap(map);
    });
  }, [exams]);

  // Compute locked items: everything AFTER an unpassed exam (lessons and subsequent exams)
  const lockedItemIds = useMemo(() => {
    const locked = new Set<string>();
    let blocked = false;
    for (const item of courseContent) {
      if (blocked) {
        locked.add(item.id);
      }
      if (item._type === "exam") {
        const info = examInfoMap[item.id];
        if (!info?.hasPassed) blocked = true;
      }
    }
    return locked;
  }, [courseContent, examInfoMap]);

  const handleSelect = async (lesson: Lesson, material: Material) => {
    if (lockedItemIds.has(lesson.id)) {
      toast.error("Bạn cần hoàn thành đề thi trước khi xem nội dung này");
      return;
    }

    if (material.type === "word" || material.type === "other") {
      window.open(material.url, "_blank");
      return;
    }

    setSelectedMaterialId(material.id);
    setLoading(true);

    try {
      const res: any = await courseStore.fetchMaterialUrl(material.id);
      const payload = res?.payload ?? res;
      const url = payload?.url ?? payload;
      const token = payload?.token ?? "";

      appStore.setEncryptUrl(token);
      setMedia({ material, lesson, url, encryptUrl: token });
    } catch (e: any) {
      // Handle 403 exam gate
      if (e?.response?.status === 403) {
        toast.error("Bạn cần hoàn thành đề thi trước khi xem tài liệu này");
      } else {
        console.error("fetch material url error:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToExam = (examId: string) => {
    if (lockedItemIds.has(examId)) {
      toast.error('Hoàn thành đề thi trước để mở khóa đề thi này');
      return;
    }
    const slug = (courseDetail as any).slug ?? courseDetail.id;
    router.push(`/study/exam/${examId}?course=${slug}`);
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

      {/* Right: content list */}
      <div className="max-h-[70vh] w-full overflow-y-auto rounded-lg bg-background p-4 shadow md:w-[350px]">
        <h2 className="mb-4 text-xl font-bold">Nội dung khóa học</h2>
        <ContentList
          content={courseContent}
          examInfoMap={examInfoMap}
          lockedItemIds={lockedItemIds}
          selectedMaterialId={selectedMaterialId}
          loading={loading}
          onSelectMaterial={handleSelect}
          onGoToExam={handleGoToExam}
        />
      </div>
    </div>
  );
}