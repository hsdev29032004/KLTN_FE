import { Base } from '../base'
import type {
  Exam,
  ExamDetail,
  ExamInfo,
  ExamAttemptStart,
  ExamSubmitResult,
  ExamAttemptResult,
  ExamHistory,
  CourseExamHistory,
  CreateExamDto,
  UpdateExamDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  SubmitAnswerDto,
  ExamQuestion,
} from '@/types/exam.type'

export class ExamRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken)
  }

  // ── Teacher: Exam CRUD ──────────────────────────────────────────────────────

  async createExam(courseId: string, data: CreateExamDto): Promise<{ message: string; data: Exam }> {
    return this.request(`/api/exam/course/${courseId}`, {
      method: 'POST',
      data,
    })
  }

  async updateExam(examId: string, data: UpdateExamDto): Promise<{ message: string; data: Exam }> {
    return this.request(`/api/exam/${examId}`, {
      method: 'PUT',
      data,
    })
  }

  async deleteExam(examId: string): Promise<{ message: string }> {
    return this.request(`/api/exam/${examId}`, {
      method: 'DELETE',
    })
  }

  async getExamDetail(examId: string): Promise<{ message: string; data: ExamDetail }> {
    return this.request(`/api/exam/${examId}/detail`, {
      method: 'GET',
    })
  }

  // ── Teacher: Question CRUD ──────────────────────────────────────────────────

  async addQuestion(examId: string, data: CreateQuestionDto): Promise<{ message: string; data: ExamQuestion }> {
    return this.request(`/api/exam/${examId}/question`, {
      method: 'POST',
      data,
    })
  }

  async addQuestions(examId: string, data: CreateQuestionDto[]): Promise<{ message: string; data: ExamQuestion[] }> {
    return this.request(`/api/exam/${examId}/questions`, {
      method: 'POST',
      data,
    })
  }

  async updateQuestion(questionId: string, data: UpdateQuestionDto): Promise<{ message: string; data: ExamQuestion }> {
    return this.request(`/api/exam/question/${questionId}`, {
      method: 'PUT',
      data,
    })
  }

  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    return this.request(`/api/exam/question/${questionId}`, {
      method: 'DELETE',
    })
  }

  // ── Student: Exam Info & Taking ─────────────────────────────────────────────

  async getExamInfo(examId: string): Promise<{ message: string; data: ExamInfo }> {
    return this.request(`/api/exam/${examId}/info`, {
      method: 'GET',
    })
  }

  async startExam(examId: string): Promise<{ message: string; data: ExamAttemptStart }> {
    return this.request(`/api/exam/${examId}/start`, {
      method: 'POST',
    })
  }

  async submitExam(attemptId: string, answers: SubmitAnswerDto[]): Promise<{ message: string; data: ExamSubmitResult }> {
    return this.request(`/api/exam/attempt/${attemptId}/submit`, {
      method: 'POST',
      data: { answers },
    })
  }

  async getAttemptResult(attemptId: string): Promise<{ message: string; data: ExamAttemptResult }> {
    return this.request(`/api/exam/attempt/${attemptId}/result`, {
      method: 'GET',
    })
  }

  // ── Student: History ────────────────────────────────────────────────────────

  async getExamHistory(examId: string): Promise<{ message: string; data: ExamHistory }> {
    return this.request(`/api/exam/${examId}/history`, {
      method: 'GET',
    })
  }

  async getCourseExamHistory(courseId: string): Promise<{ message: string; data: CourseExamHistory }> {
    return this.request(`/api/exam/course/${courseId}/history`, {
      method: 'GET',
    })
  }
}

export const examRequest = new ExamRequest()
