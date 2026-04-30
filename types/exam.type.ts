import { LessonStatus } from './course.type'

// ─── Exam ─────────────────────────────────────────────────────────────────────

export interface Exam {
  id: string
  courseId: string
  name: string
  passPercent: number
  retryAfterDays: number
  numEasy: number,
  numNormal: number,
  numHard: number,
  questionCount: number
  duration: number
  status: LessonStatus
  createdAt: string
  _count?: { questions: number }
}

// ─── Exam Question ────────────────────────────────────────────────────────────

export interface ExamQuestion {
  id: string
  examId: string
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  difficulty?: 'easy' | 'normal' | 'hard'
  isDeleted: boolean
  createdAt?: string
}

// ─── Exam Detail (Teacher view) ───────────────────────────────────────────────

export interface ExamDetail extends Exam {
  course: { userId: string; name: string }
  questions: ExamQuestion[]
}

// ─── Exam Info (Student view) ─────────────────────────────────────────────────

export interface ExamInfo {
  id: string
  name: string
  passPercent: number
  duration: number
  questionCount: number
  numEasy?: number
  numNormal?: number
  numHard?: number
  totalQuestions: number
  courseName: string
  hasPassed: boolean
  canTakeExam: boolean
  retryAvailableAt: string | null
  inProgressAttemptId: string | null
}

// ─── Exam Attempt ─────────────────────────────────────────────────────────────

export interface ExamAttemptQuestion {
  questionId: string
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  selectedAnswer: string | null
}

export interface ExamAttemptStart {
  attemptId: string
  startedAt: string
  duration: number
  questions: ExamAttemptQuestion[]
}

// ─── Submit Result ────────────────────────────────────────────────────────────

export interface ExamSubmitResult {
  attemptId: string
  score: number
  isPassed: boolean
  correctCount: number
  totalQuestions: number
  passPercent: number
}

// ─── Attempt Result (Detail) ──────────────────────────────────────────────────

export interface ExamAttemptAnswer {
  questionId: string
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  selectedAnswer: string | null
  isCorrect: boolean
}

export interface ExamAttemptResult {
  attemptId: string
  examName: string
  courseName: string
  score: string
  isPassed: boolean
  passPercent: number
  startedAt: string
  submittedAt: string
  totalQuestions: number
  correctCount: number
  answers: ExamAttemptAnswer[]
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface ExamAttemptSummary {
  id: string
  score: string
  isPassed: boolean
  isCompleted: boolean
  startedAt: string
  submittedAt: string | null
  _count?: { answers: number }
}

export interface ExamHistory {
  exam: {
    id: string
    name: string
    passPercent: number
    duration: number
    questionCount: number
    courseName: string
  }
  attempts: ExamAttemptSummary[]
}

export interface CourseExamHistory {
  courseId: string
  courseName: string
  exams: Array<{
    id: string
    name: string
    passPercent: number
    duration: number
    questionCount: number
    createdAt: string
    attempts: ExamAttemptSummary[]
  }>
}

// ─── Create/Update DTOs ───────────────────────────────────────────────────────

export interface CreateExamDto {
  name: string
  passPercent: number
  retryAfterDays: number
  questionCount: number
  duration: number
  numEasy: number
  numNormal: number
  numHard: number
}

export interface UpdateExamDto {
  name?: string
  passPercent?: number
  retryAfterDays?: number
  questionCount?: number
  duration?: number
  numEasy?: number
  numNormal?: number
  numHard?: number
}

export interface CreateQuestionDto {
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  difficulty?: 'easy' | 'normal' | 'hard'
}

export interface UpdateQuestionDto {
  content?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer?: 'A' | 'B' | 'C' | 'D'
  difficulty?: 'easy' | 'normal' | 'hard'
}

export interface SubmitAnswerDto {
  questionId: string
  selectedAnswer: string
}
