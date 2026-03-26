'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Users, BookOpen, Clock, Heart, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Course, ICourseReview, Lesson } from '@/types/course.type';
import { usePurchaseStore } from '@/stores/purchase/purchase-store';
import { useCourseStore } from '@/stores/course/course-store';
import { useAppStore } from '@/stores/app/app-store';
import MediaModal from '@/components/media-modal';
import { LessonItem } from './lesson-item';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseDetailProps {
  course: Course;
  lessons: Lesson[];
  reviews: ICourseReview[];
  instructor: any;
  relatedCourses: Course[];
}

interface MediaState {
  open: boolean;
  type: string;
  url: string;
  title: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const parseContentItems = (content?: string | null): string[] => {
  if (!content) return [];
  return content.split('|').map((s) => s.trim()).filter(Boolean);
};

const calcAvgRating = (reviews: ICourseReview[]): string =>
  reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating, size = 5 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-${size} w-${size} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
        />
      ))}
    </div>
  );
}

function RatingSummary({ avgRating, total }: { avgRating: string; total: number }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="mb-2 text-5xl font-bold">{avgRating}</div>
        <div className="mb-4 flex justify-center">
          <StarRow rating={Math.round(parseFloat(avgRating))} size={5} />
        </div>
        <p className="text-muted-foreground">{total} đánh giá</p>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review }: { review: ICourseReview }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.reviewer?.avatar} alt={review.reviewer?.fullName} />
              <AvatarFallback>{review.reviewer?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold">{review.reviewer?.fullName}</p>
          </div>
          <StarRow rating={review.rating} size={4} />
        </div>
        <p className="text-sm text-muted-foreground">{review.content}</p>
      </CardContent>
    </Card>
  );
}

function RelatedCourseCard({ course }: { course: Course }) {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
          {course.name}
        </h3>
        <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-foreground">{course.star}</span>
        </div>
        <p className="text-lg font-bold">{formatVND(course.price)}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CourseDetail({
  course,
  lessons,
  reviews,
  instructor,
  relatedCourses,
}: CourseDetailProps) {
  const router = useRouter();
  const purchaseStore = usePurchaseStore();
  const courseStore = useCourseStore();
  const appStore = useAppStore();

  const [media, setMedia] = useState<MediaState>({
    open: false,
    type: '',
    url: '',
    title: '',
  });

  const contentItems = parseContentItems((course as any).content);
  const avgRating = calcAvgRating(reviews);
  const courseLessons: any[] = (course as any).lessons ?? [];

  const handleBuy = async () => {
    await purchaseStore.addCourseSelected(course.id);
    router.push('/payment/checkout');
  };

  const handlePreview = async (material: any) => {
    try {
      const res: any = await courseStore.fetchMaterialUrl(material.id);
      const payload = res?.payload ?? res;
      const url = payload?.url ?? payload;
      const token = payload?.token;

      appStore.setEncryptUrl(token ?? '');
      setMedia({ open: true, type: material.type, url, title: material.name });
    } catch (e) {
      console.error('preview error', e);
    }
  };

  const closeMedia = () => setMedia((prev) => ({ ...prev, open: false }));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="bg-muted py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">

          {/* Left: course info */}
          <div className="md:col-span-2">
            <h1 className="mb-4 text-4xl font-bold">{course.name}</h1>
            <p className="mb-6 text-lg text-muted-foreground">{course.description}</p>

            <div className="mb-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.star}</span>
                <span className="text-muted-foreground">({avgRating} từ đánh giá)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{course.studentCount.toLocaleString('vi-VN')} học viên</span>
              </div>
            </div>

            {contentItems.length > 0 && (
              <div className="mb-8 border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Kiến thức đạt được</h3>
                <ul className="space-y-2">
                  {contentItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-1 text-primary">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: purchase card */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-6 aspect-video overflow-hidden rounded-lg">
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <p className="mb-1 text-3xl font-bold">{formatVND(course.price)}</p>
                <p className="mb-6 text-sm text-muted-foreground">Giá hiện tại</p>

                <Button onClick={handleBuy} className="mb-3 w-full gap-2" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Mua ngay
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Heart className="h-5 w-5" />
                  Yêu thích
                </Button>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{lessons.length} bài giảng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Trọn đời truy cập</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl space-y-16">

          {/* Lessons */}
          <div>
            <h2 className="mb-6 text-3xl font-bold">Nội dung khóa học</h2>
            {courseLessons.length > 0 ? (
              <div className="space-y-3">
                {courseLessons.map((lesson, idx) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    defaultOpen={idx === 0}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  Chưa có bài học
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="mb-6 text-3xl font-bold">Đánh giá</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <RatingSummary avgRating={avgRating} total={reviews.length} />
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div className="border-t pt-8">
            <h2 className="mb-6 text-3xl font-bold">Giảng viên</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={instructor?.avatar} alt={instructor?.fullName} />
                    <AvatarFallback>{instructor?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/lecturer-info/${instructor.slug}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {instructor?.fullName}
                    </Link>
                    <p className="text-sm text-muted-foreground">Giảng viên hàng đầu</p>
                    {instructor?.email && (
                      <p className="mt-1 text-sm text-muted-foreground">{instructor.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div>
              <h2 className="mb-6 text-3xl font-bold">Khóa học liên quan</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedCourses.slice(0, 4).map((c) => (
                  <RelatedCourseCard key={c.id} course={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Media modal (single instance) ── */}
      <MediaModal
        open={media.open}
        onOpenChange={closeMedia}
        type={media.type as any}
        url={media.url}
        encryptUrl={appStore.encryptUrl}
        title={media.title}
      />
    </div>
  );
}