'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Users, BookOpen, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { userRequest } from '@/stores/user/user-request';
import { LecturerProfile, LecturerCourse } from '@/types/user.type';
import { formatMoney } from '@/helpers/format.helper';
import Link from 'next/link';

const LIMIT = 12;

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

function CourseCard({ course }: { course: LecturerCourse }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg h-full">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <BookOpen className="h-10 w-10" />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary leading-snug">
            {course.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">{Number(course.star).toFixed(1)}</span>
            <span className="ml-1">({course._count.reviews} đánh giá)</span>
            <span className="ml-2">{course.studentCount.toLocaleString('vi-VN')} học viên</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course._count.lessons} bài học</span>
          </div>
          <p className="text-lg font-bold mt-auto">
            {course.price === 0 ? 'Miễn phí' : formatMoney(course.price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LecturerInfoPage() {
  const { slug } = useParams<{ slug: string }>();

  const [lecturer, setLecturer] = useState<LecturerProfile | null>(null);
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    userRequest
      .getLecturerProfile(slug, { page: 1, limit: LIMIT })
      .then((res) => {
        setLecturer(res.data);
        setCourses(res.data.courses);
        setMeta(res.meta);
      })
      .catch(() => setError('Không tìm thấy thông tin giảng viên.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const loadPage = async (page: number) => {
    if (!slug) return;
    setCoursesLoading(true);
    try {
      const res = await userRequest.getLecturerProfile(slug, { page, limit: LIMIT });
      setCourses(res.data.courses);
      setMeta(res.meta);
    } finally {
      setCoursesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card className="mb-8">
          <CardContent className="flex items-center gap-6 p-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !lecturer) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <p className="text-muted-foreground text-lg">{error ?? 'Không tìm thấy giảng viên.'}</p>
      </div>
    );
  }

  const joinedDate = new Date(lecturer.createdAt).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Profile card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage src={lecturer.avatar ?? ''} alt={lecturer.fullName} />
              <AvatarFallback className="text-2xl">{lecturer.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-3xl font-bold">{lecturer.fullName}</h1>
                {lecturer.role?.name === 'teacher' && (
                  <Badge variant="secondary">Giảng viên</Badge>
                )}
              </div>
              {lecturer.introduce && (
                <p className="text-muted-foreground mb-3">{lecturer.introduce}</p>
              )}
              {/* Stats row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {lecturer.stats.totalCourses} khóa học
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {lecturer.stats.totalStudents.toLocaleString('vi-VN')} học viên
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{Number(lecturer.stats.avgRating).toFixed(1)}</span>
                  &nbsp;({lecturer.stats.totalReviews} đánh giá)
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {lecturer.stats.totalReviews} đánh giá
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Tham gia {joinedDate}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Các khóa học của giảng viên</h2>
        <span className="text-sm text-muted-foreground">{meta.total} khóa học</span>
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">Chưa có khóa học nào.</p>
      ) : (
        <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${coursesLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadPage(meta.page - 1)}
            disabled={meta.page <= 1 || coursesLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            let page: number;
            if (meta.totalPages <= 5) {
              page = i + 1;
            } else if (meta.page <= 3) {
              page = i + 1;
            } else if (meta.page >= meta.totalPages - 2) {
              page = meta.totalPages - 4 + i;
            } else {
              page = meta.page - 2 + i;
            }
            return (
              <Button
                key={page}
                variant={page === meta.page ? 'default' : 'outline'}
                size="icon"
                onClick={() => loadPage(page)}
                disabled={coursesLoading}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => loadPage(meta.page + 1)}
            disabled={meta.page >= meta.totalPages || coursesLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
