import { CourseCard } from '@/components/landing/course-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Award, Users } from 'lucide-react';
import { useSdk } from '@/hooks/use-my-cookies'

export default async function Home() {
  const sdk = await useSdk()
  const coursesRes = await sdk.getListCourses()
  const courses = coursesRes?.data || []

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Học tập không giới hạn <br />
              <span className="text-primary">cùng ONLEARN</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Khám phá hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu.
              Học mọi lúc, mọi nơi theo tốc độ của bạn.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2">
                Khám phá ngay
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Dùng thử miễn phí
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b py-12">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">50+</h3>
              <p className="text-muted-foreground">Học viên tích cực</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">10+</h3>
              <p className="text-muted-foreground">Khóa học chất lượng</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">98%</h3>
              <p className="text-muted-foreground">Hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold">Khóa học nổi bật</h2>
            <p className="text-muted-foreground">
              Các khóa học được yêu thích nhất hiện nay
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline">
              Xem tất cả khóa học
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
