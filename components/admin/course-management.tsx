'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import SDK from '@/stores/sdk';
import { toast } from 'sonner';
import type { CourseApproval } from '@/types/course.type';
import MediaModal from '@/components/media-modal';
import { useCourseStore } from '@/stores/course/course-store';
import { useAppStore } from '@/stores/app/app-store';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: string;
}

interface Lesson {
  id: string;
  name: string;
  status: string;
  materials: Material[];
}

interface CourseItem {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  status: string;
  star: string | number;
  studentCount: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string | null;
    email?: string | null;
  };
}

interface ExamItem {
  id: string;
  name: string;
  passPercent: number;
  retryAfterDays: number;
  questionCount: number;
  duration: number;
  status: string;
  createdAt: string;
  _count?: { questions: number };
}

interface CourseDetail {
  id: string;
  name: string;
  status: string;
  thumbnail: string;
  content?: string | null;
  description?: string | null;
  price: number;
  lessons: Lesson[];
  exams?: ExamItem[];
  user: {
    id: string;
    fullName: string;
    avatar?: string | null;
    email?: string | null;
  };
}

// ─── Status Helpers ──────────────────────────────────────────────────────────

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
  deleted: {
    label: 'Đã xóa',
    className: 'bg-red-100 text-red-500 border-red-300',
  },
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'update', label: 'Chờ duyệt cập nhật' },
  { value: 'published', label: 'Đã duyệt' },
  { value: 'draft', label: 'Nháp' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'need_update', label: 'Cần cập nhật' },
];

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

function formatCurrency(v: number) {
  return v.toLocaleString('vi-VN') + ' ₫';
}

const MATERIAL_ICON: Record<string, string> = {
  video: '🎥',
  img: '🖼️',
  pdf: '📄',
  file: '📎',
  link: '🔗',
};

// ─── Reject Dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  open,
  onClose,
  onReject,
  courseName,
}: {
  open: boolean;
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
  courseName: string;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setLoading(true);
    try {
      await onReject(reason.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối khóa học</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Từ chối khóa học &quot;{courseName}&quot;
        </p>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Lý do từ chối</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối để giảng viên biết cần sửa gì..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            <XCircle className="mr-1 h-4 w-4" />
            {loading ? 'Đang xử lý...' : 'Từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Course Detail Dialog ─────────────────────────────────────────────────────

function CourseDetailDialog({
  open,
  onClose,
  courseId,
  onApprove,
  onReject,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [approvals, setApprovals] = useState<CourseApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const courseStore = useCourseStore();
  const appStore = useAppStore();
  const [media, setMedia] = useState<{
    open: boolean;
    type: string;
    url: string;
    title: string;
  }>({ open: false, type: '', url: '', title: '' });

  const handleViewMaterial = async (material: Material) => {
    if (material.type !== 'img' && material.type !== 'video') {
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

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const sdk = SDK.getInstance();
    Promise.all([
      sdk.getCourseBySlugOrId(courseId),
      sdk.getCourseApprovals(courseId).catch(() => ({ data: [] })),
    ])
      .then(([courseRes, appRes]) => {
        const courseData = (courseRes as any).data || courseRes;
        setCourse(courseData);
        const appData = (appRes as any).data || appRes;
        if (Array.isArray(appData)) setApprovals(appData);
      })
      .catch(() => toast.error('Không thể tải thông tin khóa học'))
      .finally(() => setLoading(false));
  }, [courseId, open]);

  const canApprove = course?.status === 'pending' || course?.status === 'update';
  const latestPendingApproval = approvals.find((a) => a.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết khóa học</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !course ? (
          <p className="text-center text-muted-foreground py-8">
            Không tìm thấy khóa học
          </p>
        ) : (
          <div className="space-y-4">
            {/* Course Info */}
            <div className="flex gap-4">
              {course.thumbnail && (
                <div className="aspect-video w-60 overflow-hidden rounded-lg border shrink-0">
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{course.name}</h3>
                  <StatusBadge status={course.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Giảng viên: {course.user.fullName}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(course.price)}
                </p>
              </div>
            </div>

            {/* Latest Pending Approval Description */}
            {latestPendingApproval && (
              <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                    Mô tả thay đổi từ giảng viên:
                  </p>
                  <p className="text-sm">
                    {latestPendingApproval.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            {course.content && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Nội dung khóa học</CardTitle>
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

            {/* Lessons */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Bài học ({course.lessons.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.lessons.map((lesson) => (
                  <Collapsible key={lesson.id}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 cursor-pointer">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {lesson.name}
                          </span>
                          <StatusBadge status={lesson.status} />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {lesson.materials.length} tài liệu
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-4 space-y-1 pb-2">
                        {lesson.materials.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-muted/30"
                          >
                            <span>{MATERIAL_ICON[m.type] ?? '📄'}</span>
                            <span className="truncate flex-1">{m.name}</span>
                            <StatusBadge status={m.status} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              title="Xem học liệu"
                              onClick={() => handleViewMaterial(m)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        {lesson.materials.length === 0 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            Chưa có tài liệu
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                {course.lessons.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Chưa có bài học
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Exams */}
            {course.exams && course.exams.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Đề thi ({course.exams.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {course.exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">📝</span>
                        <span className="text-sm font-medium truncate">{exam.name}</span>
                        <StatusBadge status={exam.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span>{exam.questionCount} câu</span>
                        <span>{exam.duration} phút</span>
                        <span>{exam.passPercent}% đạt</span>
                        {exam._count && <span>{exam._count.questions} trong ngân hàng</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Approval History */}
            {approvals.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lịch sử phê duyệt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {approvals.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-start gap-3 rounded-lg border p-2 text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge
                              status={
                                a.status === 'approved'
                                  ? 'published'
                                  : a.status === 'rejected'
                                    ? 'rejected'
                                    : 'pending'
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {new Date(a.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="mt-1">{a.description}</p>
                          {a.reason && (
                            <p className="text-red-600 dark:text-red-400 mt-1">
                              <span className="font-medium">Lý do từ chối:</span>{' '}
                              {a.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Actions */}
        {canApprove && !loading && (
          <DialogFooter>
            <Button variant="destructive" onClick={onReject}>
              <XCircle className="mr-1 h-4 w-4" />
              Từ chối
            </Button>
            <Button onClick={onApprove}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Phê duyệt
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      {/* Media Modal — rendered outside DialogContent to avoid z-index issues */}
      <MediaModal
        open={media.open}
        onOpenChange={(open) => setMedia((prev) => ({ ...prev, open }))}
        type={media.type as any}
        url={media.url}
        encryptUrl={appStore.encryptUrl}
        title={media.title}
      />
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminCourseManagement() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    courseId: string;
    courseName: string;
  }>({ open: false, courseId: '', courseName: '' });

  const fetchCourses = async () => {
    try {
      const sdk = SDK.getInstance();
      const res = await sdk.getAllCoursesAdmin();
      const data = (res as any).data || res;
      if (Array.isArray(data)) setCourses(data);
    } catch {
      /* interceptor */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.fullName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = courses.filter(
    (c) => c.status === 'pending' || c.status === 'update',
  ).length;

  const handleApprove = async (courseId: string) => {
    try {
      const sdk = SDK.getInstance();
      await sdk.publishCourse(courseId);
      setSelectedCourseId(null);
      await fetchCourses();
    } catch {
      /* interceptor */
    }
  };

  const handleReject = async (courseId: string, reason: string) => {
    try {
      const sdk = SDK.getInstance();
      await sdk.rejectCourse(courseId, { reason });
      setSelectedCourseId(null);
      await fetchCourses();
    } catch {
      /* interceptor */
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý khóa học</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Có <span className="font-medium text-yellow-600">{pendingCount}</span> khóa
              học đang chờ duyệt
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khóa học hoặc giảng viên..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Table */}
      <Card>
        <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-2 opacity-50" />
                <p>Không có khóa học nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Giảng viên</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const canApprove =
                      course.status === 'pending' || course.status === 'update';
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {course.thumbnail && (
                              <img
                                src={course.thumbnail}
                                alt=""
                                className="h-10 w-16 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="font-medium truncate max-w-50">
                              {course.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {course.user.fullName}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(course.price)}</TableCell>
                        <TableCell>{course.studentCount}</TableCell>
                        <TableCell>
                          <StatusBadge status={course.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Xem chi tiết"
                              onClick={() => setSelectedCourseId(course.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canApprove && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  title="Phê duyệt"
                                  onClick={() => handleApprove(course.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  title="Từ chối"
                                  onClick={() =>
                                    setRejectDialog({
                                      open: true,
                                      courseId: course.id,
                                      courseName: course.name,
                                    })
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      {/* Course Detail Dialog */}
      {selectedCourseId && (
        <CourseDetailDialog
          key={selectedCourseId}
          open={!!selectedCourseId}
          onClose={() => setSelectedCourseId(null)}
          courseId={selectedCourseId}
          onApprove={() => handleApprove(selectedCourseId)}
          onReject={() => {
            const c = courses.find((c) => c.id === selectedCourseId);
            setRejectDialog({
              open: true,
              courseId: selectedCourseId,
              courseName: c?.name ?? '',
            });
          }}
        />
      )}

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog((prev) => ({ ...prev, open: false }))}
        onReject={(reason) => handleReject(rejectDialog.courseId, reason)}
        courseName={rejectDialog.courseName}
      />
    </div>
  );
}
