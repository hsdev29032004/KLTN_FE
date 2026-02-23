'use client';

import { Star, Users, BookOpen, Clock, Share2, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Course } from '@/types/course.type';
import { Lesson } from '@/types/lesson.type';
import { LessonMaterial } from '@/types/lesson-material.type';
import { CourseReview } from '@/types/course-review.type';
import { mockCourses } from '@/mock/courses';

interface CourseDetailProps {
    course: Course;
    lessons: Lesson[];
    materials: LessonMaterial[];
    reviews: CourseReview[];
    instructor: any;
    relatedCourses: Course[];
}

export function CourseDetail({
    course,
    lessons,
    materials,
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

    const getLessonMaterials = (lessonId: string) => {
        return materials.filter((m) => m.lessonId === lessonId);
    };

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

                        {/* Instructor */}
                        <div className="mb-8 border-t pt-6">
                            <h3 className="mb-4 text-lg font-semibold">Giảng viên</h3>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={instructor?.avatar} alt={instructor?.fullName} />
                                    <AvatarFallback>{instructor?.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{instructor?.fullName}</p>
                                    <p className="text-sm text-muted-foreground">Giảng viên hàng đầu</p>
                                </div>
                            </div>
                        </div>
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
                            {lessons.map((lesson) => {
                                const lessonMaterials = getLessonMaterials(lesson.id);
                                return (
                                    <Card key={lesson.id} className="cursor-pointer transition-all hover:shadow-md">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="mb-2 font-semibold">{lesson.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{lessonMaterials.length} tài liệu</span>
                                                        <Badge variant="secondary" className="capitalize">
                                                            {lesson.status}
                                                        </Badge>
                                                    </div>

                                                    {/* Materials Preview */}
                                                    {lessonMaterials.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {lessonMaterials.map((material) => (
                                                                <Badge key={material.id} variant="outline">
                                                                    {material.type === 'video' && '🎥'}
                                                                    {material.type === 'pdf' && '📄'}
                                                                    {material.type === 'img' && '🖼️'}
                                                                    {material.type === 'link' && '🔗'}
                                                                    {material.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
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
