'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Trophy,
  RotateCcw,
  History,
  FileQuestion,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import SDK from '@/stores/sdk'
import { toast } from 'sonner'
import type {
  ExamInfo,
  ExamAttemptStart,
  ExamAttemptQuestion,
  ExamSubmitResult,
  ExamAttemptResult,
  ExamHistory,
  ExamAttemptSummary,
} from '@/types/exam.type'

// ─── Exam Info Card ───────────────────────────────────────────────────────────

export function ExamInfoCard({
  examId,
  onStartExam,
}: {
  examId: string
  onStartExam: () => void
}) {
  const [info, setInfo] = useState<ExamInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sdk = SDK.getInstance()
    sdk.getExamInfo(examId)
      .then((res) => setInfo(res.data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [examId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Đang tải thông tin đề thi...
        </CardContent>
      </Card>
    )
  }

  if (!info) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Không tìm thấy thông tin đề thi
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-blue-500" />
          {info.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Thời gian: <strong>{info.duration} phút</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
            <span>
              Số câu: <strong>{typeof info.numEasy !== 'undefined' || typeof info.numNormal !== 'undefined' || typeof info.numHard !== 'undefined' ? (
                <span>Dễ {info.numEasy ?? 0} / Thường {info.numNormal ?? 0} / Khó {info.numHard ?? 0}</span>
              ) : null}</strong>

            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>Điểm đạt: <strong>{info.passPercent}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
            <span>Ngân hàng: <strong>{info.totalQuestions} câu</strong></span>
          </div>
        </div>

        {info.hasPassed && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Bạn đã vượt qua đề thi này!</span>
          </div>
        )}

        {!info.hasPassed && !info.canTakeExam && info.retryAvailableAt && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            <span>
              Bạn có thể làm lại vào{' '}
              <strong>{new Date(info.retryAvailableAt).toLocaleDateString('vi-VN')}</strong>
            </span>
          </div>
        )}

        {info.inProgressAttemptId && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-700 dark:text-blue-400">
            <Clock className="h-5 w-5" />
            <span>Bạn có bài thi đang làm dở</span>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={info.hasPassed || !info.canTakeExam}
          onClick={onStartExam}
        >
          {info.inProgressAttemptId ? (
            <><RotateCcw className="mr-2 h-4 w-4" /> Tiếp tục làm bài</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Bắt đầu làm bài</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Exam Taker (Main exam taking UI) ─────────────────────────────────────────

export function ExamTaker({
  examId,
  onFinished,
  onBack,
}: {
  examId: string
  onFinished: (result: ExamSubmitResult) => void
  onBack: () => void
}) {
  const sdk = SDK.getInstance()
  const [attempt, setAttempt] = useState<ExamAttemptStart | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start exam
  useEffect(() => {
    sdk.startExam(examId)
      .then((res) => {
        const data = res.data
        setAttempt(data)
        // Restore selected answers
        const restored: Record<string, string> = {}
        data.questions.forEach((q) => {
          if (q.selectedAnswer) restored[q.questionId] = q.selectedAnswer
        })
        setAnswers(restored)
        // Calculate remaining time
        const elapsed = (Date.now() - new Date(data.startedAt).getTime()) / 1000
        const remaining = Math.max(0, data.duration * 60 - elapsed)
        setTimeLeft(Math.floor(remaining))
      })
      .catch(() => { toast.error('Không thể bắt đầu bài thi') })
      .finally(() => setLoading(false))
  }, [examId])

  // Timer
  useEffect(() => {
    if (!attempt || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [attempt])

  const handleSubmit = useCallback(async (auto = false) => {
    if (!attempt || submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const answerList = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }))
      const res = await sdk.submitExam(attempt.attemptId, answerList)
      if (auto) toast.info('Hết giờ - Bài thi đã được nộp tự động')
      onFinished(res.data)
    } catch {
      toast.error('Nộp bài thất bại')
      setSubmitting(false)
    }
  }, [attempt, answers, submitting])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Đang tải câu hỏi...</p>
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Không thể tải bài thi</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    )
  }

  const questions = attempt.questions
  const current = questions[currentIdx]
  const answered = Object.keys(answers).length
  const total = questions.length

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selectAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [current.questionId]: answer }))
  }

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(current.questionId)) next.delete(current.questionId)
      else next.add(current.questionId)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Header with timer */}
      <div className="flex items-center justify-between rounded-lg border p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
          </Button>
          <span className="text-sm text-muted-foreground">
            Câu {currentIdx + 1}/{total}
          </span>
          <span className="text-sm text-muted-foreground">
            Đã trả lời: {answered}/{total}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : timeLeft < 300 ? 'text-yellow-500' : ''}`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setConfirmSubmitOpen(true)}
            disabled={submitting}
          >
            <Send className="mr-1 h-4 w-4" />
            Nộp bài
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Question panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Câu {currentIdx + 1}
                  {flagged.has(current.questionId) && (
                    <Flag className="inline ml-2 h-4 w-4 text-yellow-500" />
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={toggleFlag}>
                  <Flag className={`mr-1 h-4 w-4 ${flagged.has(current.questionId) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  {flagged.has(current.questionId) ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base">{current.content}</p>
              <div className="space-y-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const optionKey = `option${letter}` as keyof ExamAttemptQuestion
                  const text = current[optionKey] as string
                  const isSelected = answers[current.questionId] === letter
                  return (
                    <button
                      key={letter}
                      onClick={() => selectAnswer(letter)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${isSelected
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'hover:bg-muted/50'
                        }`}
                    >
                      <span className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                        {letter}
                      </span>
                      {text}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Câu trước
            </Button>
            <Button
              variant="outline"
              disabled={currentIdx === total - 1}
              onClick={() => setCurrentIdx((i) => i + 1)}
            >
              Câu sau <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question navigator sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Danh sách câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.questionId]
                  const isFlagged = flagged.has(q.questionId)
                  const isCurrent = idx === currentIdx
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors ${isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isAnswered
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500" />
                      )}
                    </button>
                  )
                })}
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-green-100 dark:bg-green-900/30" /> Đã trả lời ({answered})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-muted" /> Chưa trả lời ({total - answered})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-yellow-100" /> Đánh dấu ({flagged.size})
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm submit dialog */}
      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Đã trả lời: <strong>{answered}/{total}</strong> câu</p>
            {total - answered > 0 && (
              <p className="text-yellow-600">
                <AlertTriangle className="inline mr-1 h-4 w-4" />
                Còn {total - answered} câu chưa trả lời
              </p>
            )}
            <p>Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong></p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSubmitOpen(false)}>Tiếp tục làm</Button>
            <Button onClick={() => { setConfirmSubmitOpen(false); handleSubmit() }} disabled={submitting}>
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Exam Result Display ──────────────────────────────────────────────────────

export function ExamResultCard({
  result,
  onViewDetail,
  onRetry,
  onBack,
}: {
  result: ExamSubmitResult
  onViewDetail: () => void
  onRetry?: () => void
  onBack: () => void
}) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="p-8 text-center space-y-6">
        {result.isPassed ? (
          <div className="space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">Chúc mừng!</h2>
            <p className="text-muted-foreground">Bạn đã vượt qua đề thi</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Chưa đạt</h2>
            <p className="text-muted-foreground">Hãy cố gắng lần sau nhé!</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-4xl font-bold">{result.score}%</div>
          <Progress value={result.score} className="h-3" />
          <div className="flex justify-center gap-6 text-sm">
            <span>Đúng: <strong className="text-green-600">{result.correctCount}</strong></span>
            <span>Sai: <strong className="text-red-600">{result.totalQuestions - result.correctCount}</strong></span>
            <span>Tổng: <strong>{result.totalQuestions}</strong></span>
          </div>
          <p className="text-sm text-muted-foreground">Cần đạt: {result.passPercent}%</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
          </Button>
          <Button variant="outline" onClick={onViewDetail}>
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Exam Result Detail ───────────────────────────────────────────────────────

export function ExamResultDetail({
  attemptId,
  onBack,
}: {
  attemptId: string
  onBack: () => void
}) {
  const [result, setResult] = useState<ExamAttemptResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sdk = SDK.getInstance()
    sdk.getAttemptResult(attemptId)
      .then((res) => setResult(res.data))
      .catch(() => toast.error('Không thể tải kết quả'))
      .finally(() => setLoading(false))
  }, [attemptId])

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Đang tải kết quả...</div>
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Không tìm thấy kết quả</p>
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
          </Button>
          <h2 className="text-2xl font-bold">{result.examName}</h2>
          <p className="text-sm text-muted-foreground">{result.courseName}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {result.score}%
          </div>
          <Badge variant={result.isPassed ? 'default' : 'destructive'}>
            {result.isPassed ? 'Đạt' : 'Chưa đạt'}
          </Badge>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Điểm đạt</p>
              <p className="font-medium">{result.passPercent}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Đúng / Tổng</p>
              <p className="font-medium">{result.correctCount}/{result.totalQuestions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bắt đầu</p>
              <p className="font-medium">{new Date(result.startedAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nộp bài</p>
              <p className="font-medium">{new Date(result.submittedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-4">
        {result.answers.map((a, idx) => (
          <Card key={a.questionId} className={a.isCorrect ? 'border-green-200' : 'border-red-200'}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  <span className="text-muted-foreground mr-1">Câu {idx + 1}:</span>
                  {a.content}
                </p>
                {a.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const optionKey = `option${letter}` as keyof typeof a
                  const text = a[optionKey] as string
                  const isCorrect = letter === a.correctAnswer
                  const isSelected = letter === a.selectedAnswer
                  let className = 'rounded px-3 py-2 '
                  if (isCorrect) className += 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400'
                  else if (isSelected && !isCorrect) className += 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  else className += 'bg-muted'

                  return (
                    <div key={letter} className={className}>
                      <span className="font-medium mr-1">{letter}.</span>
                      {text}
                      {isCorrect && <CheckCircle2 className="inline ml-1 h-3 w-3" />}
                      {isSelected && !isCorrect && <XCircle className="inline ml-1 h-3 w-3" />}
                    </div>
                  )
                })}
              </div>
              {!a.selectedAnswer && (
                <p className="text-sm text-yellow-600">
                  <AlertTriangle className="inline mr-1 h-3 w-3" /> Không trả lời
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Exam History ─────────────────────────────────────────────────────────────

export function ExamHistoryView({
  examId,
  onViewResult,
  onBack,
}: {
  examId: string
  onViewResult: (attemptId: string) => void
  onBack: () => void
}) {
  const [history, setHistory] = useState<ExamHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sdk = SDK.getInstance()
    sdk.getExamHistory(examId)
      .then((res) => setHistory(res.data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [examId])

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Đang tải lịch sử...</div>
  }

  if (!history) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
          </Button>
          <h2 className="text-xl font-bold">{history.exam.name}</h2>
          <p className="text-sm text-muted-foreground">{history.exam.courseName}</p>
        </div>
      </div>

      {history.attempts.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Chưa có lần thi nào</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {history.attempts.map((a, idx) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => a.isCompleted && onViewResult(a.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Lần {history.attempts.length - idx}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.score}%</span>
                      <Badge variant={a.isPassed ? 'default' : 'destructive'} className="text-xs">
                        {a.isPassed ? 'Đạt' : 'Chưa đạt'}
                      </Badge>
                      {!a.isCompleted && <Badge variant="secondary" className="text-xs">Đang làm</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(a.startedAt).toLocaleString('vi-VN')}
                      {a.submittedAt && ` — ${new Date(a.submittedAt).toLocaleString('vi-VN')}`}
                    </p>
                  </div>
                </div>
                {a.isCompleted && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Full Exam Page (combines info → taking → result) ─────────────────────────

export function ExamPage({
  examId,
  courseSlug,
}: {
  examId: string
  courseSlug?: string
}) {
  const router = useRouter()
  type View = 'info' | 'taking' | 'result' | 'detail' | 'history'
  const [view, setView] = useState<View>('info')
  const [submitResult, setSubmitResult] = useState<ExamSubmitResult | null>(null)
  const [viewAttemptId, setViewAttemptId] = useState<string | null>(null)

  const goBack = () => {
    if (courseSlug) router.push(`/study/${courseSlug}`)
    else router.back()
  }

  const handleFinished = (result: ExamSubmitResult) => {
    setSubmitResult(result)
    setView('result')
  }

  switch (view) {
    case 'info':
      return (
        <div className="mx-auto max-w-2xl space-y-4 py-8 px-4">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại khóa học
          </Button>
          <ExamInfoCard examId={examId} onStartExam={() => setView('taking')} />
          <Button variant="outline" className="w-full" onClick={() => setView('history')}>
            <History className="mr-2 h-4 w-4" /> Xem lịch sử thi
          </Button>
        </div>
      )

    case 'taking':
      return (
        <div className="mx-auto max-w-5xl py-4 px-4">
          <ExamTaker
            examId={examId}
            onFinished={handleFinished}
            onBack={() => setView('info')}
          />
        </div>
      )

    case 'result':
      return (
        <div className="mx-auto max-w-2xl py-8 px-4">
          <ExamResultCard
            result={submitResult!}
            onViewDetail={() => {
              setViewAttemptId(submitResult!.attemptId)
              setView('detail')
            }}
            onBack={() => setView('info')}
          />
        </div>
      )

    case 'detail':
      return (
        <div className="mx-auto max-w-3xl py-8 px-4">
          <ExamResultDetail
            attemptId={viewAttemptId!}
            onBack={() => setView(submitResult ? 'result' : 'history')}
          />
        </div>
      )

    case 'history':
      return (
        <div className="mx-auto max-w-2xl py-8 px-4">
          <ExamHistoryView
            examId={examId}
            onViewResult={(id) => { setViewAttemptId(id); setView('detail') }}
            onBack={() => setView('info')}
          />
        </div>
      )
  }
}
