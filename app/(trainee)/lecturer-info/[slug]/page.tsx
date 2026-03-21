'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { mockLecturer } from '@/mock/lecturer';

export default function LecturerInfoPage() {
  const lecturer = mockLecturer;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card className="mb-8">
        <CardContent className="flex items-center gap-6 p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={lecturer.avatar} alt={lecturer.fullName} />
            <AvatarFallback>{lecturer.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold mb-2">{lecturer.fullName}</h1>
            <p className="text-muted-foreground mb-2">{lecturer.introduction}</p>
            <p className="text-sm text-muted-foreground">{lecturer.email}</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-6">Các khóa học của giảng viên</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {lecturer.courses.map((course) => (
          <Card key={course.id} className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
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
                <span className="ml-2">{course.studentCount} học viên</span>
              </div>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(course.price)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}