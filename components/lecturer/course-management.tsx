'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Eye,
  Pencil,
  Trash2,
  Send,
  Plus,
  X,
  Save,
  RotateCcw,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MediaModal from '@/components/media-modal';
import {
  RichTextEditor,
  RichTextEditorRef,
} from '@/components/common/rich-text-editor';
import { useCourseStore } from '@/stores/course/course-store';
import { useAppStore } from '@/stores/app/app-store';
import SDK from '@/stores/sdk';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { CourseApproval } from '@/types/course.type';
import { Textarea } from '@/components/ui/textarea';
import { ExamDetailPanel, ExamDialog } from '@/components/lecturer/exam-management';
import { TopicMultiSelect } from '@/components/common/topic-multi-select';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  name: string;
  type: string;
  url?: string;
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

interface CourseData {
  id: string;
  name: string;
  status: string;
  thumbnail: string;
  content?: string | null;
  description?: string | null;
  price: number;
  commissionRate?: number | string | null;
  newCommissionRate?: number | string | null;
  lessons: Lesson[];
  exams?: any[];
  approvals?: CourseApproval[];
  courseTopics?: { topicId: string }[];
}

interface CourseManagementProps {
  course: CourseData;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  published: {
    label: 'Đã duyệt',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  draft: {
    label: 'Nháp',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  outdated: {
    label: 'Outdated',
    className: 'bg-gray-100 text-gray-600 border-gray-300',
  },
  update: {
    label: 'Chờ duyệt cập nhật',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  rejected: {
    label: 'Bị từ chối',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  need_update: {
    label: 'Cần cập nhật',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  stopped: {
    label: 'Ngừng kinh doanh',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  deleted: {
    label: 'Đã xóa',
    className: 'bg-red-100 text-red-500 border-red-300',
  },
};

const MATERIAL_ICON: Record<string, string> = {
  video: '🎥',
  img: '🖼️',
  pdf: '📄',
  file: '📎',
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return (
    <Badge variant="outline" className={`text-xs ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Course Dialog ───────────────────────────────────────────────────────

function EditCourseDialog({
  open,
  onClose,
  course,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  course: CourseData;
  onSaved: (data: any) => void;
}) {
  const [name, setName] = useState(course.name);
  const [price, setPrice] = useState(String(course.price));
  const [commissionRate, setCommissionRate] = useState(String(course.commissionRate ?? ''));
  const [thumbnail, setThumbnail] = useState(course.thumbnail);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [topicIds, setTopicIds] = useState<string[]>(
    course.courseTopics?.map((ct) => ct.topicId) ?? [],
  );
  const [contentParts, setContentParts] = useState<string[]>(
    course.content ? course.content.split('|') : [''],
  );
  const descRef = useRef<RichTextEditorRef>(null);
  const [loading, setLoading] = useState(false);

  // Sync state whenever the dialog opens (in case course data updated since last mount)
  useEffect(() => {
    if (open) {
      setName(course.name);
      setPrice(String(course.price));
      setCommissionRate(String(course.commissionRate ?? ''));
      setThumbnail(course.thumbnail);
      setThumbnailFile(null);
      setTopicIds(course.courseTopics?.map((ct) => ct.topicId) ?? []);
      setContentParts(course.content ? course.content.split('|') : ['']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addContentPart = () => setContentParts((prev) => [...prev, '']);
  const removeContentPart = (idx: number) =>
    setContentParts((prev) => prev.filter((_, i) => i !== idx));
  const updateContentPart = (idx: number, value: string) =>
    setContentParts((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Tên khóa học không được trống');
      return;
    }
    setLoading(true);
    try {
      const content = contentParts.filter((p) => p.trim()).join('|');
      const description = descRef.current?.getContent() ?? '';
      const sdk = SDK.getInstance();
      let res;
      if (thumbnailFile) {
        const form = new FormData();
        form.append('thumbnail', thumbnailFile);
        form.append('name', name.trim());
        form.append('price', String(Number(price)));
        if (commissionRate !== '') {
          const cr = Number(commissionRate);
          if (!Number.isNaN(cr)) form.append('commissionRate', String(cr));
        }
        form.append('content', content);
        form.append('description', description);
        topicIds.forEach((id) => form.append('topicIds', id));
        res = await (sdk as any).updateCourse(course.id, form);
      } else {
        const payload: any = {
          name: name.trim(),
          price: Number(price),
          thumbnail: thumbnail.trim(),
          content,
          description,
          topicIds,
        };
        if (commissionRate !== '') {
          const cr = Number(commissionRate);
          if (!Number.isNaN(cr)) payload.commissionRate = cr;
        }
        res = await sdk.updateCourse(course.id, payload);
      }
      const data = (res as any).data || res;
      toast.success('Đã cập nhật khóa học');
      onSaved(data);
      onClose();
    } catch {
      /* interceptor */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} modal={false} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Tên khóa học</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Giá (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Tỷ lệ hoa hồng (%)</Label>
              <Input type="number" min={0} max={100} step="0.1" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
              {course.newCommissionRate != null && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Hoa hồng {course.newCommissionRate}% đang chờ admin duyệt
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label>Thumbnail</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              <div className="flex gap-2 items-center">
                {(thumbnailFile || thumbnail) && (
                  <div className="ml-2">
                    <img
                      src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnail}
                      alt="preview"
                      className="h-16 w-28 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Nội dung (content)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContentPart}
              >
                <Plus className="mr-1 h-3 w-3" /> Thêm mục
              </Button>
            </div>
            <div className="space-y-2">
              {contentParts.map((part, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={part}
                    onChange={(e) => updateContentPart(idx, e.target.value)}
                    placeholder={`Nội dung ${idx + 1}`}
                  />
                  {contentParts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeContentPart(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Chủ đề</Label>
            <TopicMultiSelect value={topicIds} onChange={setTopicIds} />
          </div>
          <div className="grid gap-1.5">
            <Label>Mô tả</Label>
            <RichTextEditor
              ref={descRef}
              initialValue={course.description ?? ''}
              height={250}
              placeholder="Nhập mô tả khóa học..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Lesson Dialog (create / edit) ────────────────────────────────────────────

function LessonDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: { id: string; name: string };
  onSave: (name: string, id?: string) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Tên bài học không được trống');
      return;
    }
    setLoading(true);
    try {
      await onSave(name.trim(), initial?.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Sửa bài học' : 'Thêm bài học'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Tên bài học</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên bài học"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Material Dialog (create / edit) ──────────────────────────────────────────

type MaterialType = 'link' | 'video' | 'img' | 'pdf' | 'file';

const TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'link', label: '🔗 Link' },
  { value: 'video', label: '🎥 Video' },
  { value: 'img', label: '🖼️ Hình ảnh' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'file', label: '📎 File khác' },
];

const URL_PLACEHOLDER: Record<MaterialType, string> = {
  link: 'https://example.com/trang-web',
  img: '',
  pdf: '',
  file: '',
  video: '',
};

const FILE_ACCEPT: Record<MaterialType, string> = {
  link: '',
  video: 'video/*',
  img: 'image/*',
  pdf: 'application/pdf',
  file: '*/*',
};

const FILE_LABEL: Record<MaterialType, string> = {
  link: '',
  video: 'Chọn file video',
  img: 'Chọn hình ảnh',
  pdf: 'Chọn file PDF',
  file: 'Chọn file',
};

const CLOUD_BASE = process.env.NEXT_PUBLIC_CLOUD_URL ?? 'http://localhost:3002';

function MaterialDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: {
    id: string;
    name: string;
    url?: string;
    type?: string;
    isPreview?: boolean;
  };
  onSave: (
    data: FormData | { name: string; url: string; type: string; isPreview: boolean },
    id?: string,
  ) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [type, setType] = useState<MaterialType>(
    (initial?.type as MaterialType) ?? 'link',
  );
  const [file, setFile] = useState<File | null>(null);
  const [isPreview, setIsPreview] = useState(initial?.isPreview ?? false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const hlsRef = useRef<Hls | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const courseStore = useCourseStore();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (v: MaterialType) => {
    setType(v);
    setFile(null);
    setUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPreviewUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name.trim()) setName(f.name);
  };

  // Update preview URL when file or url/type changes
  useEffect(() => {
    if (file) {
      const obj = URL.createObjectURL(file);
      setPreviewUrl(obj);
      return () => URL.revokeObjectURL(obj);
    }
    if (type === 'link' && url) {
      setPreviewUrl(url);
      return;
    }
    // If editing an existing material that has an id, try fetching the accessible URL
    if (initial?.id && !file && (type === 'img' || type === 'video' || type === 'pdf' || type === 'file')) {
      (async () => {
        try {
          const res: any = await courseStore.fetchMaterialUrl(initial.id);
          const payload = res?.payload ?? res;
          const u = payload?.url ?? payload;
          setPreviewUrl(u ?? initial?.url ?? '');
          if (!url) setUrl(u ?? initial?.url ?? '');
        } catch (e) {
          setPreviewUrl(initial?.url ?? '');
        }
      })();
      return;
    }
    setPreviewUrl(initial?.url ?? '');
  }, [file, url, type, initial?.url]);

  const getVideoSource = (u: string) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u) || u.startsWith('/')) return u;
    return `${CLOUD_BASE}/api/videos/${u}/index.m3u8`;
  };

  const getPdfSource = (u: string) => {
    if (!u) return '';
    if (u.startsWith('blob:')) return u;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('/')) return `${CLOUD_BASE}${u}`;
    return `${CLOUD_BASE}/api/pdfs/${u}`;
  };

  const initHls = useCallback((video: HTMLVideoElement | null, source: string) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (!video || !source) return;
    videoElRef.current = video;
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup(xhr) {
          xhr.withCredentials = true;
          xhr.setRequestHeader('x-url', source);
        },
      });
      hlsRef.current = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS error:', data);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoElRef.current) {
        videoElRef.current.pause();
        videoElRef.current.removeAttribute('src');
        videoElRef.current.load();
        videoElRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Tên tài liệu không được trống');
      return;
    }

    let finalUrl = url.trim();

    if (type === 'link') {
      if (!finalUrl) {
        toast.error('Vui lòng nhập đường dẫn');
        return;
      }
    } else {
      // If user selected a new file, upload it. Otherwise, if editing an existing material, allow updating metadata without re-upload.
      if (file) {
        setUploading(true);
        try {
          if (type === 'pdf') {
            const sdk = SDK.getInstance();
            const lessonId = await sdk.uploadPdf(file);
            await onSave({ name: name.trim(), url: lessonId, type, isPreview }, initial?.id);
          } else {
            const form = new FormData();
            form.append('file', file);
            form.append('name', name.trim());
            form.append('type', type);
            form.append('isPreview', String(isPreview));
            await onSave(form, initial?.id);
          }
          onClose();
          return;
        } catch (e: any) {
          toast.error(e?.message ?? 'Upload thất bại');
          return;
        } finally {
          setUploading(false);
        }
      }
      // no file selected
      if (initial?.id) {
        // use existing previewUrl or initial.url as the final URL when updating
        const existingUrl = previewUrl || initial?.url || '';
        setLoading(true);
        try {
          await onSave({ name: name.trim(), url: existingUrl, type, isPreview }, initial?.id);
          onClose();
          return;
        } catch {
          /* handled by interceptor */
        } finally {
          setLoading(false);
        }
      }
      return;
    }
    setLoading(true);
    try {
      await onSave({ name: name.trim(), url: finalUrl, type, isPreview }, initial?.id);
      onClose();
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  };

  const isBusy = uploading || loading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? 'Sửa tài liệu' : 'Thêm tài liệu'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Type */}
          <div className="grid gap-1.5">
            <Label>Loại tài liệu</Label>
            <Select
              value={type}
              onValueChange={(v) => handleTypeChange(v as MaterialType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="grid gap-1.5">
            <Label>Tên tài liệu</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên tài liệu"
            />
          </div>

          {/* Link: URL input */}
          {type === 'link' && (
            <div className="grid gap-1.5">
              <Label>Đường dẫn</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={URL_PLACEHOLDER.link}
              />
            </div>
          )}

          {/* File-based types: file picker */}
          {type !== 'link' && (
            <div className="grid gap-1.5">
              <Label>{FILE_LABEL[type]}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT[type]}
                onChange={handleFileChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              {file && (
                <p className="text-xs text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
              {uploading && (
                <p className="text-xs text-blue-500 animate-pulse">
                  Đang tải lên server, vui lòng chờ...
                </p>
              )}

              {previewUrl && (
                <div className="mt-2">
                  {type === 'img' ? (
                    <img
                      src={previewUrl}
                      alt={name}
                      className="max-h-40 w-full object-contain rounded-md border"
                    />
                  ) : type === 'video' ? (
                    <video
                      ref={(node) => {
                        if (node) {
                          const source = getVideoSource(previewUrl);
                          initHls(node, source);
                        }
                      }}
                      controls
                      className="max-h-48 w-full rounded-md border"
                    />
                  ) : type === 'pdf' ? (
                    <iframe
                      src={getPdfSource(previewUrl)}
                      title={name}
                      className="w-full h-64 border rounded-md"
                    />
                  ) : (
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                      Xem tài liệu
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Link preview */}
          {type === 'link' && previewUrl && (
            <div className="mt-2">
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(previewUrl) ? (
                <img src={previewUrl} alt={name} className="max-h-40 w-full object-contain rounded-md border" />
              ) : (
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                  Xem liên kết
                </a>
              )}
            </div>
          )}
        </div>

        {/* isPreview */}
        <div className="flex items-center gap-3">
          <Switch
            id="isPreview"
            checked={isPreview}
            onCheckedChange={setIsPreview}
          />
          <Label htmlFor="isPreview">Cho xem trước</Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isBusy}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isBusy}>
            <Save className="mr-1 h-4 w-4" />
            {uploading ? 'Đang upload...' : loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Material Item ────────────────────────────────────────────────────────────

function MaterialItem({
  material,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: {
  material: Material;
  onView: (material: Material) => void;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onRestore: (material: Material) => void;
}) {
  const isOutdated = material.status === 'outdated';

  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 bg-muted/40">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base">{MATERIAL_ICON[material.type] ?? '📄'}</span>

        <span
          className={`text-sm truncate ${isOutdated ? 'line-through text-muted-foreground' : ''}`}
        >
          {material.name}
        </span>
        <StatusBadge status={material.status} />
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onView(material)}
          title="Xem"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {!isOutdated && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(material)}
            title="Sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        {isOutdated ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-blue-500 hover:text-blue-600"
            onClick={() => onRestore(material)}
            title="Khôi phục"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(material)}
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Item ─────────────────────────────────────────────────────────────

function LessonItem({
  lesson,
  defaultOpen,
  onView,
  onEditLesson,
  onDeleteLesson,
  onRestoreLesson,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onRestoreMaterial,
}: {
  lesson: Lesson;
  defaultOpen?: boolean;
  onView: (material: Material) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onRestoreLesson: (lesson: Lesson) => void;
  onAddMaterial: (lessonId: string) => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (material: Material) => void;
  onRestoreMaterial: (material: Material) => void;
}) {
  const isOutdated = lesson.status === 'outdated';
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {open ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
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
                title="Thêm tài liệu"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMaterial(lesson.id);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Sửa"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditLesson(lesson);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {isOutdated ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-blue-500 hover:text-blue-600"
                  title="Khôi phục"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestoreLesson(lesson);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  title="Xóa"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLesson(lesson);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t p-3 space-y-2">
            {lesson.materials.length > 0 ? (
              lesson.materials.map((m) => (
                <MaterialItem
                  key={m.id}
                  material={m}
                  onView={onView}
                  onEdit={onEditMaterial}
                  onDelete={onDeleteMaterial}
                  onRestore={onRestoreMaterial}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-1">
                Chưa có tài liệu
              </p>
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

export function CourseManagement({
  course: initialCourse,
}: CourseManagementProps) {
  const courseStore = useCourseStore();
  const appStore = useAppStore();
  const router = useRouter();
  const sdk = SDK.getInstance();

  const [course, setCourse] = useState<CourseData>(initialCourse);
  const [exams, setExams] = useState<any[]>(initialCourse.exams ?? []);
  const [createExamOpen, setCreateExamOpen] = useState(false);
  const [media, setMedia] = useState<MediaState>({
    open: false,
    type: '',
    url: '',
    title: '',
  });

  // Dialog states
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean;
    lesson?: Lesson;
  }>({ open: false });
  const [materialDialog, setMaterialDialog] = useState<{
    open: boolean;
    lessonId?: string;
    material?: Material;
  }>({ open: false });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: async () => { },
  });

  // ── Exam state & merged content ─────────────────────────────────────────

  const mergedContent = useMemo(() => [
    ...course.lessons.map((l) => ({ ...l, _type: 'lesson' as const })),
    ...exams.map((e) => ({ ...e, _type: 'exam' as const })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [course.lessons, exams]);

  const handleExamUpdated = (updated: any) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
  };

  const handleExamDeleted = (examId: string) => {
    setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, status: 'outdated' } : e)));
  };

  const handleCreateExam = async (data: any) => {
    const res = await sdk.createExam(course.id, data);
    setExams((prev) => [...prev, (res as any).data]);
    toast.success('Đã tạo đề thi');
  };

  // ── View Material ────────────────────────────────────────────────────────

  const handleView = async (material: Material) => {
    if (material.type !== 'img' && material.type !== 'video' && material.type !== 'pdf') {
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

  // ── Course actions ───────────────────────────────────────────────────────

  const handleCourseSaved = async (_data: any) => {
    try {
      const res = await sdk.getCourseBySlugOrId(course.id);
      const fresh = (res as any).data || res;
      setCourse((prev) => ({ ...prev, ...fresh }));
      setApprovals(fresh.approvals ?? []);
    } catch {
      setCourse((prev) => ({ ...prev, ..._data }));
    }
  };

  const handleDeleteCourse = () => {
    setConfirmDialog({
      open: true,
      title: 'Ngừng kinh doanh',
      description: `Bạn có chắc chắn muốn ngừng kinh doanh khóa học "${course.name}"? Khóa học sẽ vẫn giữ dữ liệu nhưng sẽ không hiển thị trên trang công khai.`,
      onConfirm: async () => {
        await sdk.deleteCourse(course.id);
        setCourse((prev) => ({ ...prev, status: 'stopped' }));
        toast.success('Cập nhật trạng thái khóa học thành "Ngừng kinh doanh" thành công');
      },
    });
  };

  const handleRepublishCourse = async () => {
    try {
      await (sdk as any).reopenCourse(course.id);
      setCourse((prev) => ({ ...prev, status: 'published' }));
      toast.success('Mở bán khóa học thành công');
    } catch (e) {
      /* interceptor */
    }
  };

  // ── Submit Review Dialog ──────────────────────────────────────────────
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const [approvals, setApprovals] = useState<CourseApproval[]>(initialCourse.approvals ?? []);

  const canSubmitReview = ['draft', 'rejected', 'published', 'need_update'].includes(course.status);
  // Có ít nhất 1 bài học và trong các bài học có ít nhất 1 học liệu
  const hasContentForReview = Boolean(
    course.lessons && course.lessons.length > 0 && course.lessons.some((l) => (l.materials && l.materials.length > 0)),
  );
  const isWaitingApproval = ['pending', 'update'].includes(course.status);
  const latestRejection = approvals.find((a) => a.status === 'rejected');

  const handleSubmitReview = async (description: string) => {
    try {
      await sdk.submitForReview(course.id, { description });
      const res = await sdk.getCourseBySlugOrId(course.id);
      const data = (res as any).data || res;
      setCourse((prev) => ({ ...prev, ...data }));
    } catch {
      /* interceptor */
    }
  };

  // ── Lesson actions ───────────────────────────────────────────────────────

  const handleSaveLesson = async (name: string, id?: string) => {
    if (id) {
      const res = await sdk.updateLesson(id, { name });
      const data = (res as any).data || res;
      setCourse((prev) => ({
        ...prev,
        lessons: prev.lessons.map((l) => (l.id === id ? { ...l, ...data } : l)),
      }));
      toast.success('Đã cập nhật bài học');
    } else {
      const res = await sdk.createLesson(course.id, { name });
      const data = (res as any).data || res;
      setCourse((prev) => ({
        ...prev,
        lessons: [...prev.lessons, { ...data, materials: [] }],
      }));
      toast.success('Đã thêm bài học');
    }
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setConfirmDialog({
      open: true,
      title: 'Xóa bài học',
      description: `Bạn có chắc chắn muốn xóa bài học "${lesson.name}"?`,
      onConfirm: async () => {
        await sdk.deleteLesson(lesson.id);
        setCourse((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lesson.id ? { ...l, status: 'outdated' } : l,
          ),
        }));
        toast.success('Đã xóa bài học');
      },
    });
  };

  // ── Material actions ─────────────────────────────────────────────────────

  const handleSaveMaterial = async (
    data: FormData | { name: string; url: string; type?: string },
    id?: string,
  ) => {
    // Support FormData (file upload) or object payload
    if (id) {
      // find lesson containing this material
      const lesson = course.lessons.find((ls) => ls.materials.some((m) => m.id === id));
      const existing = lesson?.materials.find((m) => m.id === id);
      // If editing a draft, update in-place
      if (existing?.status === 'draft') {
        if (typeof FormData !== 'undefined' && (data as any) instanceof FormData) {
          await (sdk as any).updateMaterial(id, data as FormData);
        } else {
          const res = await sdk.updateMaterial(id, data as any);
          const updated = (res as any).data || res;
          // refresh lessons from backend to get canonical data
          const courseRes = await sdk.getCourseBySlugOrId(course.id);
          const courseData = (courseRes as any).data || courseRes;
          setCourse((prev) => ({
            ...prev,
            lessons: courseData.lessons ?? prev.lessons,
          }));
        }
        toast.success('Đã cập nhật tài liệu');
        return;
      }

      // Otherwise (editing published/non-draft): create a NEW material as draft, keep old one but mark outdated
      if (!lesson) {
        toast.error('Không tìm thấy bài học chứa tài liệu');
        return;
      }
      // create the new material on same lesson
      if (typeof FormData !== 'undefined' && (data as any) instanceof FormData) {
        const res = await (sdk as any).createMaterial(lesson.id, data as FormData);
        const created = (res as any).data || res;
        const createdToAdd = created.status === 'draft' ? { ...created, url: undefined } : created;
        // update state: add created, mark old as outdated
        setCourse((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lesson.id
              ? {
                ...l,
                materials: l.materials.map((m) => (m.id === id ? { ...m, status: 'outdated' } : m)).concat([createdToAdd]),
              }
              : l,
          ),
        }));
      } else {
        const res = await sdk.createMaterial(lesson.id, data as any);
        const created = (res as any).data || res;
        const createdToAdd = created.status === 'draft' ? { ...created, url: undefined } : created;
        setCourse((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lesson.id
              ? {
                ...l,
                materials: l.materials.map((m) => (m.id === id ? { ...m, status: 'outdated' } : m)).concat([createdToAdd]),
              }
              : l,
          ),
        }));
      }
      // mark old material outdated in backend
      try {
        await sdk.deleteMaterial(id);
      } catch {
        // ignore
      }
      toast.success('Đã tạo phiên bản mới của tài liệu (draft)');
      return;
    }

    // create new material (no id provided)
    if (materialDialog.lessonId) {
      if (typeof FormData !== 'undefined' && (data as any) instanceof FormData) {
        const res = await (sdk as any).createMaterial(materialDialog.lessonId, data as FormData);
        const created = (res as any).data || res;
        const createdToAdd = created.status === 'draft' ? { ...created, url: undefined } : created;
        setCourse((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === materialDialog.lessonId
              ? { ...l, materials: [...l.materials, createdToAdd] }
              : l,
          ),
        }));
      } else {
        const res = await sdk.createMaterial(materialDialog.lessonId, data as any);
        const created = (res as any).data || res;
        const createdToAdd = created.status === 'draft' ? { ...created, url: undefined } : created;
        setCourse((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === materialDialog.lessonId
              ? { ...l, materials: [...l.materials, createdToAdd] }
              : l,
          ),
        }));
      }
      toast.success('Đã thêm tài liệu');
    }
  };

  const handleRestoreLesson = (_lesson: Lesson) => {
    toast.info('Chức năng khôi phục đang được phát triển');
  };

  const handleRestoreMaterial = (_material: Material) => {
    toast.info('Chức năng khôi phục đang được phát triển');
  };

  const handleDeleteMaterial = (material: Material) => {
    setConfirmDialog({
      open: true,
      title: 'Xóa tài liệu',
      description: `Bạn có chắc chắn muốn xóa tài liệu "${material.name}"?`,
      onConfirm: async () => {
        await sdk.deleteMaterial(material.id);
        setCourse((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) => ({
            ...l,
            materials: l.materials
              .map((m) => (m.id === material.id ? m : m))
              .filter((m) => {
                if (m.id !== material.id) return true;
                // if the material being deleted was a draft, remove it from list
                if (material.status === 'draft') return false;
                // otherwise keep it but mark outdated
                return true;
              })
              .map((m) => (m.id === material.id ? { ...m, status: 'outdated' } : m)),
          })),
        }));
        toast.success('Đã xóa tài liệu');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <StatusBadge status={course.status} />
            {course.commissionRate != null && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span>Hoa hồng:</span>
                <span className={course.newCommissionRate != null ? 'line-through opacity-60' : ''}>
                  {course.commissionRate}%
                </span>
                {course.newCommissionRate != null && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-400 text-xs">
                    {course.newCommissionRate}% chờ duyệt
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditCourseOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Sửa
          </Button>
          {course.status !== 'stopped' && !['draft', 'rejected'].includes(course.status) && (
            <Button variant="destructive" size="sm" onClick={handleDeleteCourse}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Ngừng kinh doanh
            </Button>
          )}
          {course.status === 'stopped' && (
            <Button size="sm" onClick={handleRepublishCourse}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Mở bán trở lại
            </Button>
          )}
          {canSubmitReview && (
            <Button
              size="sm"
              onClick={() => setSubmitReviewOpen(true)}
              disabled={!hasContentForReview}
              title={!hasContentForReview ? 'Cần ít nhất 1 bài học có tài liệu để gửi xét duyệt' : undefined}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Gửi xét duyệt
            </Button>
          )}
          {isWaitingApproval && (
            <Button size="sm" variant="secondary" disabled>
              <History className="h-4 w-4 mr-1.5" />
              Đang chờ duyệt
            </Button>
          )}
        </div>
      </div>

      {/* Rejection / Need Update Alert */}
      {(course.status === 'rejected' || course.status === 'need_update') && latestRejection && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                {course.status === 'rejected' ? 'Khóa học bị từ chối' : 'Cập nhật bị từ chối'}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                <span className="font-medium">Lý do:</span> {latestRejection.reason}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(latestRejection.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {/* Thumbnail */}
        {course.thumbnail && (
          <div className="aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
            <img
              src={course.thumbnail}
              alt={course.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        {course.content && (
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nội dung khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1">
                {course.content
                  .split('|')
                  .filter(Boolean)
                  .map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Nội dung khóa học (lessons + exams sorted by createdAt) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Nội dung khóa học</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLessonDialog({ open: true })}
              >
                <Plus className="mr-1 h-4 w-4" /> Thêm bài học
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateExamOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> Thêm đề thi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mergedContent.length > 0 ? (
            mergedContent.map((item, idx) =>
              item._type === 'lesson' ? (
                <LessonItem
                  key={item.id}
                  lesson={item}
                  defaultOpen={idx === 0}
                  onView={handleView}
                  onEditLesson={(l) => setLessonDialog({ open: true, lesson: l })}
                  onDeleteLesson={handleDeleteLesson}
                  onRestoreLesson={handleRestoreLesson}
                  onAddMaterial={(lessonId) =>
                    setMaterialDialog({ open: true, lessonId })
                  }
                  onEditMaterial={(m) =>
                    setMaterialDialog({ open: true, material: m })
                  }
                  onDeleteMaterial={handleDeleteMaterial}
                  onRestoreMaterial={handleRestoreMaterial}
                />
              ) : (
                <ExamDetailPanel
                  key={item.id}
                  exam={item}
                  onExamUpdated={handleExamUpdated}
                  onExamDeleted={handleExamDeleted}
                />
              )
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có nội dung
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mô tả</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="[&_*]:revert"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(course.description || ''),
            }}
          />
        </CardContent>
      </Card>
      {/* Approval History */}
      {approvals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Lịch sử phê duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvals.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={a.status === 'approved' ? 'published' : a.status === 'rejected' ? 'rejected' : 'pending'} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{a.description}</p>
                    {a.reason && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        <span className="font-medium">Lý do từ chối:</span> {a.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div id="toolbar-container"></div>
      {/* ── Dialogs ────────────────────────────────────────────────────── */}
      <MediaModal
        open={media.open}
        onOpenChange={(open) => setMedia((prev) => ({ ...prev, open }))}
        type={media.type as any}
        url={media.url}
        encryptUrl={appStore.encryptUrl}
        title={media.title}
      />

      {editCourseOpen && (
        <EditCourseDialog
          open={editCourseOpen}
          onClose={() => setEditCourseOpen(false)}
          course={course}
          onSaved={handleCourseSaved}
        />
      )}

      {lessonDialog.open && (
        <LessonDialog
          key={lessonDialog.lesson?.id ?? 'new-lesson'}
          open={lessonDialog.open}
          onClose={() => setLessonDialog({ open: false })}
          initial={
            lessonDialog.lesson
              ? { id: lessonDialog.lesson.id, name: lessonDialog.lesson.name }
              : undefined
          }
          onSave={handleSaveLesson}
        />
      )}

      {materialDialog.open && (
        <MaterialDialog
          key={materialDialog.material?.id ?? 'new-material'}
          open={materialDialog.open}
          onClose={() => setMaterialDialog({ open: false })}
          initial={
            materialDialog.material
              ? {
                id: materialDialog.material.id,
                name: materialDialog.material.name,
                url: materialDialog.material.url,
                type: materialDialog.material.type,
                isPreview: materialDialog.material.isPreview ?? false,
              }
              : undefined
          }
          onSave={handleSaveMaterial}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />

      {submitReviewOpen && (
        <SubmitReviewDialog
          open={submitReviewOpen}
          onClose={() => setSubmitReviewOpen(false)}
          onSubmit={handleSubmitReview}
          courseStatus={course.status}
        />
      )}

      {createExamOpen && (
        <ExamDialog
          open={createExamOpen}
          onClose={() => setCreateExamOpen(false)}
          onSave={handleCreateExam}
        />
      )}
    </div>
  );
}

// ─── Submit Review Dialog ─────────────────────────────────────────────────────

function SubmitReviewDialog({
  open,
  onClose,
  onSubmit,
  courseStatus,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
  courseStatus: string;
}) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isResend = courseStatus === 'rejected' || courseStatus === 'need_update';

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả thay đổi');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(description.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isResend ? 'Gửi lại xét duyệt' : 'Gửi xét duyệt khóa học'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Mô tả thay đổi</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết các thay đổi để admin xem xét..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Send className="mr-1 h-4 w-4" />
            {loading ? 'Đang gửi...' : 'Gửi xét duyệt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
