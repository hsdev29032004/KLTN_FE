'use client';

import { Star, Users, BookOpen, Clock, Share2, Heart, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Course, ICourseReview, Lesson } from '@/types/course.type';
import { useState } from 'react';
import Link from 'next/link';

interface CourseDetailProps {
  course: Course;
  lessons: Lesson[];
  reviews: ICourseReview[];
  instructor: any;
  relatedCourses: Course[];
}

export function CourseDetail({
  course,
  lessons,
  reviews,
  instructor,
  relatedCourses,
}: CourseDetailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const parseContent = (content?: string | null) => {
    if (!content) return [];
    return content.split('|').map((item) => item.trim()).filter(Boolean);
  };

  const contentItems = parseContent((course as any).content);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-muted py-12">
        <div className="mx-auto grid max-w-7xl gap-8 grid-cols-1 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2">
            <h1 className="mb-4 text-4xl font-bold">{course.name}</h1>
            <p className="mb-6 text-lg text-muted-foreground">{course.description}</p>

            {/* Stats */}
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

            {/* Content Items */}
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

          {/* Sidebar - Purchase Card */}
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

                <div className="mb-6">
                  <p className="mb-2 text-3xl font-bold">{formatPrice(course.price)}</p>
                  <p className="text-sm text-muted-foreground">Giá hiện tại</p>
                </div>

                <Button className="mb-3 w-full gap-2" size="lg">
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

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl">
          {/* Lessons */}
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-bold">Nội dung khóa học</h2>
            <div className="space-y-3">
              {(course as any).lessons && (course as any).lessons.length > 0 ? (
                (course as any).lessons.map((lesson: any, idx: number) => {
                  const lessonMaterials = lesson.materials || [];
                  const [openLesson, setOpenLesson] = useState(idx === 0);
                  return (
                    <Collapsible key={lesson.id} defaultOpen={openLesson} onOpenChange={setOpenLesson}>
                      <Card className="overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:shadow-md">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="mb-2 font-semibold">{lesson.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{lessonMaterials.length} tài liệu</span>
                                  <Badge variant="secondary" className="capitalize">
                                    {lesson.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                {openLesson ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="p-4 border-t">
                            {lessonMaterials.length > 0 ? (
                              <div className="mt-1 flex flex-col gap-2">
                                {lessonMaterials.map((material: any) => {
                                  const typeIcon: Record<string, string> = {
                                    'video': '🎥',
                                    'img': '🖼️',
                                    'pdf': '📄',
                                    'file': '📎',
                                  };
                                  const icon = typeIcon[material.type] || '📄';
                                  return (
                                    <div
                                      key={material.id}
                                      className="flex justify-between items-center"
                                    >
                                      <div>
                                        {icon} {material.name}
                                      </div>
                                      {
                                        material.isPreview && <span className="ml-1 text-xs text-blue-500 cursor-pointer">Xem trước</span>
                                      }
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">Không có tài liệu</div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    Chưa có bài học
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-bold">Đánh giá</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Rating Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-2 text-5xl font-bold">{avgRating}</div>
                    <div className="mb-4 flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(parseFloat(avgRating as string))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{reviews.length} đánh giá</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={review.reviewer?.avatar}
                              alt={review.reviewer?.fullName}
                            />
                            <AvatarFallback>
                              {review.reviewer?.fullName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{review.reviewer?.fullName}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor Section - After Reviews */}
          <div className="mb-16 border-t pt-8">
            <h2 className="mb-6 text-3xl font-bold">Giảng viên</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={instructor?.avatar} alt={instructor?.fullName} />
                    <AvatarFallback>{instructor?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/lecturer-info/${instructor.slug}`} className="font-semibold text-lg">{instructor?.fullName}</Link>
                    <p className="text-sm text-muted-foreground">Giảng viên hàng đầu</p>
                    {instructor?.email && (
                      <p className="text-sm text-muted-foreground mt-1">{instructor.email}</p>
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
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {relatedCourses.slice(0, 4).map((relatedCourse) => (
                  <Card key={relatedCourse.id} className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={relatedCourse.thumbnail}
                        alt={relatedCourse.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                        {relatedCourse.name}
                      </h3>
                      <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-foreground">{relatedCourse.star}</span>
                      </div>
                      <p className="text-lg font-bold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(relatedCourse.price)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
