export interface Topic {
  id: string
  name: string
  slug: string
}

export interface CourseTopic {
  id: string
  courseId: string
  topicId: string
  createdAt: string
  updatedAt: string
  topic: Topic
}

export interface UserSummary {
  id: string
  fullName: string
  avatar?: string | null
  email?: string | null
}

export type MaterialType = 'video' | 'img' | 'file' | string

export interface Material {
  id: string
  name: string
  type: MaterialType
  url: string
  isPreview: boolean
  status: string
  createdAt: string
}

export interface Lesson {
  id: string
  name: string
  status: string
  createdAt: string
  materials: Material[]
}

export interface CourseListItem {
  id: string
  name: string
  description?: string | null
  slug: string
  thumbnail: string
  price: number
  star: string | number
  status: string
  studentCount: number
  createdAt: string
  user: UserSummary
  courseTopics: CourseTopic[]
}

export interface CourseCount {
  reviews: number
  purchases: number
}
export interface ICourseReview {
  id: string,
  rating: number,
  content: string,
  createdAt: string,
  updatedAt: string,
  reviewer: {
    id: string,
    fullName: string,
    avatar: string
  }
}
export interface CourseDetailResponse {
  id: string
  name: string
  price: number
  thumbnail: string
  content?: string | null
  description?: string | null
  slug: string
  status: string
  studentCount: number
  star: string | number
  userId: string
  publishedBy?: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  publishedAt?: string | null
  user: UserSummary
  publisher?: UserSummary | null
  courseTopics: CourseTopic[]
  lessons: Lesson[]
  reviews: ICourseReview[]
  _count: CourseCount
}

export interface CourseListResponse {
  message: string
  data: CourseListItem[]
}

export interface CourseDetailResponse {
  message: string
  data: CourseDetailResponse
}

export type Course = CourseListItem | CourseDetailResponse

// ─── Approval System ────────────────────────────────────────────────────────

export type CourseStatus = 'draft' | 'pending' | 'published' | 'update' | 'rejected' | 'need_update'

export type LessonStatus = 'draft' | 'published' | 'outdated' | 'deleted'

export type MaterialStatus = 'draft' | 'published' | 'outdated' | 'deleted'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface CourseApproval {
  id: string
  courseId: string
  teacherId: string
  description: string
  status: ApprovalStatus
  reason?: string | null
  adminId?: string | null
  createdAt: string
  updatedAt: string
}
``