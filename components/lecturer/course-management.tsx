'use client';

import { useState } from 'react';
import { Eye, Pencil, Trash2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MediaModal from '@/components/media-modal';
import { useCourseStore } from '@/stores/course/course-store';
import { useAppStore } from '@/stores/app/app-store';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  name: string;
  type: string;
  isPreview: boolean;
  status: string;
  createdAt: string;
}

interface Lesson {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  materials: Material[];
}

interface CourseManagementProps {
  course: {
    id: string;
    name: string;
    status: string;
    thumbnail: string;
    description?: string | null;
    lessons: Lesson[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  published:      { label: 'Đã duyệt',      className: 'bg-green-100 text-green-700 border-green-300' },
  pending:        { label: 'Chờ duyệt',     className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  draft:          { label: 'Nháp',           className: 'bg-orange-100 text-orange-700 border-orange-300' },
  'delete-pending': { label: 'Chờ xóa',     className: 'bg-red-100 text-red-700 border-red-300' },
};

const MATERIAL_ICON: Record<string, string> = {
  video: '🎥',
  img:   '🖼️',
  pdf:   '📄',
  file:  '📎',
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
  return (
    <Badge variant="outline" className={`text-xs ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

// ─── Material Item ────────────────────────────────────────────────────────────

function MaterialItem({
  material,
  onView,
}: {
  material: Material;
  onView: (material: Material) => void;
}) {
  const isDeleted = material.status === 'delete-pending';

  return (
    <div
      className={`flex items-center justify-between rounded-md px-3 py-2 bg-muted/40 ${
        isDeleted ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base">{MATERIAL_ICON[material.type] ?? '📄'}</span>
        <span className="text-sm truncate">{material.name}</span>
        <StatusBadge status={material.status} />
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isDeleted}
          onClick={() => !isDeleted && onView(material)}
          title="Xem"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isDeleted}
          title="Sửa"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          disabled={isDeleted}
          title="Xóa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Lesson Item ─────────────────────────────────────────────────────────────

function LessonItem({
  lesson,
  defaultOpen,
  onView,
}: {
  lesson: Lesson;
  defaultOpen?: boolean;
  onView: (material: Material) => void;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const isDeleted = lesson.status === 'delete-pending';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={`overflow-hidden ${isDeleted ? 'opacity-50' : ''}`}>
        <CollapsibleTrigger asChild>
          <div
            className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${
              isDeleted ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={(e) => isDeleted && e.preventDefault()}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              <div className="min-w-0">
                <p className="font-medium truncate">{lesson.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lesson.materials.length} tài liệu
                </p>
              </div>
              <StatusBadge status={lesson.status} />
            </div>
            <div className="flex items-center gap-1 ml-3 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isDeleted}
                title="Sửa"
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                disabled={isDeleted}
                title="Xóa"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t p-3 space-y-2">
            {lesson.materials.length > 0 ? (
              lesson.materials.map((m) => (
                <MaterialItem key={m.id} material={m} onView={onView} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-1">Chưa có tài liệu</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MediaState {
  open: boolean;
  type: string;
  url: string;
  title: string;
}

export function CourseManagement({ course }: CourseManagementProps) {
  const courseStore = useCourseStore();
  const appStore = useAppStore();
  const [media, setMedia] = useState<MediaState>({ open: false, type: '', url: '', title: '' });

  const handleView = async (material: Material) => {
    if (material.type !== 'img' && material.type !== 'video') {
      // Open other types in new tab
      try {
        const res: any = await courseStore.fetchMaterialUrl(material.id);
        const payload = res?.payload ?? res;
        const url = payload?.url ?? payload;
        window.open(url, '_blank');
      } catch (e) {
        console.error('view error', e);
      }
      return;
    }

    try {
      const res: any = await courseStore.fetchMaterialUrl(material.id);
      const payload = res?.payload ?? res;
      const url = payload?.url ?? payload;
      const token = payload?.token;
      appStore.setEncryptUrl(token ?? '');
      setMedia({ open: true, type: material.type, url, title: material.name });
    } catch (e) {
      console.error('view error', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <StatusBadge status={course.status} />
          </div>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-1.5" />
            Sửa
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-1.5" />
            Gửi xét duyệt
          </Button>
        </div>
      </div>

      {/* Thumbnail */}
      {course.thumbnail && (
        <div className="aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
          <img src={course.thumbnail} alt={course.name} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Lessons */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Nội dung khóa học</CardTitle>
            <Button size="sm" variant="outline">
              + Thêm bài học
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {course.lessons.length > 0 ? (
            course.lessons.map((lesson, idx) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                defaultOpen={idx === 0}
                onView={handleView}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Chưa có bài học nào</p>
          )}
        </CardContent>
      </Card>

      {/* Media dialog */}
      <MediaModal
        open={media.open}
        onOpenChange={(open) => setMedia((prev) => ({ ...prev, open }))}
        type={media.type as any}
        url={media.url}
        encryptUrl={appStore.encryptUrl}
        title={media.title}
      />
    </div>
  );
}
