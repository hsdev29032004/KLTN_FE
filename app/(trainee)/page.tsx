import Link from 'next/link'
import { CourseCard } from '@/components/landing/course-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, TrendingUp, Users } from 'lucide-react'
import { useSdk } from '@/hooks/use-my-cookies'
import { HomeCourse, HomeTopicCourses } from '@/types/stat.type'
import { CourseListItem } from '@/types/course.type'

function formatStat(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function TopicSection({ group }: { group: HomeTopicCourses }) {
  const { topic, courses } = group
  return (
    <section className="py-6">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{topic.name}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/search?topicId=${topic.id}&page=1`} className="gap-1">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {courses.map((course: HomeCourse) => (
            <CourseCard
              key={course.id}
              course={course as unknown as CourseListItem}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function Home() {
  const sdk = await useSdk()
  const res = await sdk.getHomeDashboard()
  const { stats, topicCourses } = res.data

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20">
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
              <Button size="lg" asChild>
                <Link href="/courses" className="gap-2">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">Đăng ký miễn phí</Link>
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
              <h3 className="mb-2 text-3xl font-bold">{formatStat(stats.totalStudents)}</h3>
              <p className="text-muted-foreground">Học viên tích cực</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">{formatStat(stats.totalPublishedCourses)}</h3>
              <p className="text-muted-foreground">Khóa học chất lượng</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">98%</h3>
              <p className="text-muted-foreground">Học viên hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Topic Course Sections */}
      {topicCourses.map((group) => (
        <TopicSection key={group.topic.id} group={group} />
      ))}
    </div>
  )
}

