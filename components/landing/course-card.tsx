import { Card, CardContent } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';
import { Course } from '@/constants/mock-courses';
import { formatPrice, formatStudentCount } from '@/helpers/format.helper';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
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
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>
        <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">{course.star}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{formatStudentCount(course.studentCount)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">
            {formatPrice(course.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
