import MyCoursesTabs from '@/components/my-courses-tabs'

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 16 }}>
      <MyCoursesTabs />
      <div className="mt-4">{children}</div>
    </div>
  )
}
