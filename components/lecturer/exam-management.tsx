'use client'

import { useState } from 'react'
import {
  Pencil,
  Trash2,
  Plus,
  Save,
  Clock,
  Percent,
  Hash,
  CalendarClock,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import SDK from '@/stores/sdk'
import { toast } from 'sonner'
import type { Exam, ExamDetail, ExamQuestion, CreateExamDto, CreateQuestionDto } from '@/types/exam.type'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  published: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700 border-green-300' },
  draft: { label: 'Nháp', className: 'bg-orange-100 text-orange-700 border-orange-300' },
  outdated: { label: 'Outdated', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  deleted: { label: 'Đã xóa', className: 'bg-red-100 text-red-500 border-red-300' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' }
  return (
    <Badge variant="outline" className={`text-xs ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open, onClose, onConfirm, title, description,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  description: string
}) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    try { await onConfirm(); onClose() } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Exam Dialog (Create / Edit) ──────────────────────────────────────────────

export function ExamDialog({
  open, onClose, initial, onSave,
}: {
  open: boolean
  onClose: () => void
  initial?: Exam
  onSave: (data: CreateExamDto, id?: string) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [passPercent, setPassPercent] = useState(String(initial?.passPercent ?? 70))
  const [retryAfterDays, setRetryAfterDays] = useState(String(initial?.retryAfterDays ?? 3))
  const [questionCount, setQuestionCount] = useState(String(initial?.questionCount ?? 10))
  const [duration, setDuration] = useState(String(initial?.duration ?? 30))
  const [numEasy, setNumEasy] = useState(String(initial?.numEasy ?? 0))
  const [numNormal, setNumNormal] = useState(String(initial?.numNormal ?? 0))
  const [numHard, setNumHard] = useState(String(initial?.numHard ?? 0))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Tên đề thi không được trống'); return }
    if (Number(passPercent) < 1 || Number(passPercent) > 100) { toast.error('Phần trăm đạt phải từ 1-100'); return }
    if (Number(questionCount) < 1) { toast.error('Số câu hỏi phải lớn hơn 0'); return }
    if (Number(retryAfterDays) < 0) { toast.error('Số ngày chờ thi lại phải lớn hơn hoặc bằng 0'); return }
    if (Number(duration) < 1) { toast.error('Thời gian làm bài phải lớn hơn 0'); return }
    if (Number(numEasy) < 0 || Number(numNormal) < 0 || Number(numHard) < 0) { toast.error('Số câu theo độ khó không được âm'); return }

    setLoading(true)
    try {
      await onSave({
        name: name.trim(),
        passPercent: Number(passPercent),
        retryAfterDays: Number(retryAfterDays),
        questionCount: Number(questionCount),
        duration: Number(duration),
        numEasy: Number(numEasy),
        numNormal: Number(numNormal),
        numHard: Number(numHard),
      }, initial?.id)
      onClose()
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Tên đề thi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Kiểm tra giữa kỳ" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>% đạt (pass)</Label>
              <Input type="number" min={1} max={100} value={passPercent} onChange={(e) => setPassPercent(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Thời gian (phút)</Label>
              <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Chờ thi lại (ngày)</Label>
              <Input type="number" min={0} value={retryAfterDays} onChange={(e) => setRetryAfterDays(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label>Số câu dễ</Label>
              <Input type="number" min={0} value={numEasy} onChange={(e) => setNumEasy(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Số câu bình thường</Label>
              <Input type="number" min={0} value={numNormal} onChange={(e) => setNumNormal(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Số câu khó</Label>
              <Input type="number" min={0} value={numHard} onChange={(e) => setNumHard(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Question Dialog (Create / Edit) ──────────────────────────────────────────

function QuestionDialog({
  open, onClose, initial, onSave,
}: {
  open: boolean
  onClose: () => void
  initial?: ExamQuestion
  onSave: (data: CreateQuestionDto, id?: string) => Promise<void>
}) {
  const [content, setContent] = useState(initial?.content ?? '')
  const [optionA, setOptionA] = useState(initial?.optionA ?? '')
  const [optionB, setOptionB] = useState(initial?.optionB ?? '')
  const [optionC, setOptionC] = useState(initial?.optionC ?? '')
  const [optionD, setOptionD] = useState(initial?.optionD ?? '')
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>(initial?.correctAnswer ?? 'A')
  const [difficulty, setDifficulty] = useState<string>(initial?.difficulty ?? 'normal')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Nội dung câu hỏi không được trống'); return }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      toast.error('Phải nhập đủ 4 đáp án'); return
    }
    setLoading(true)
    try {
      await onSave({
        content: content.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        difficulty: difficulty as any,
      }, initial?.id)
      onClose()
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Nội dung câu hỏi</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung câu hỏi..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Đáp án A</Label>
              <Input value={optionA} onChange={(e) => setOptionA(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Đáp án B</Label>
              <Input value={optionB} onChange={(e) => setOptionB(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Đáp án C</Label>
              <Input value={optionC} onChange={(e) => setOptionC(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Đáp án D</Label>
              <Input value={optionD} onChange={(e) => setOptionD(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Đáp án đúng</Label>
            <Select value={correctAnswer} onValueChange={(v) => setCorrectAnswer(v as 'A' | 'B' | 'C' | 'D')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Độ khó</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="normal">Bình thường</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Bulk Question Dialog ─────────────────────────────────────────────────────

function BulkQuestionDialog({
  open, onClose, onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (questions: CreateQuestionDto[]) => Promise<void>
}) {
  const [rows, setRows] = useState<CreateQuestionDto[]>([
    { content: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'normal' },
  ])
  const [loading, setLoading] = useState(false)

  const addRow = () => setRows((prev) => [...prev, { content: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'normal' }])
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx))
  const updateRow = (idx: number, field: keyof CreateQuestionDto | 'difficulty', value: string) =>
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))

  const handleSubmit = async () => {
    const valid = rows.filter((r) => r.content.trim() && r.optionA.trim() && r.optionB.trim() && r.optionC.trim() && r.optionD.trim())
    if (valid.length === 0) { toast.error('Cần ít nhất 1 câu hỏi hợp lệ'); return }
    setLoading(true)
    try { await onSave(valid); onClose() } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm nhiều câu hỏi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {rows.map((row, idx) => (
            <Card key={idx}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Câu {idx + 1}</span>
                  {rows.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeRow(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={row.content}
                  onChange={(e) => updateRow(idx, 'content', e.target.value)}
                  placeholder="Nội dung câu hỏi"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={row.optionA} onChange={(e) => updateRow(idx, 'optionA', e.target.value)} placeholder="Đáp án A" />
                  <Input value={row.optionB} onChange={(e) => updateRow(idx, 'optionB', e.target.value)} placeholder="Đáp án B" />
                  <Input value={row.optionC} onChange={(e) => updateRow(idx, 'optionC', e.target.value)} placeholder="Đáp án C" />
                  <Input value={row.optionD} onChange={(e) => updateRow(idx, 'optionD', e.target.value)} placeholder="Đáp án D" />
                </div>
                <div className="flex gap-2 items-center">
                  <Select value={row.correctAnswer} onValueChange={(v) => updateRow(idx, 'correctAnswer', v)}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Đáp án đúng" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={row.difficulty ?? 'normal'} onValueChange={(v) => updateRow(idx, 'difficulty', v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="normal">Bình thường</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addRow} className="w-full">
            <Plus className="mr-1 h-4 w-4" /> Thêm câu hỏi
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang lưu...' : `Lưu ${rows.length} câu`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Question Item ────────────────────────────────────────────────────────────

function QuestionItem({
  question, index, onEdit, onDelete,
}: {
  question: ExamQuestion
  index: number
  onEdit: (q: ExamQuestion) => void
  onDelete: (q: ExamQuestion) => void
}) {
  const ANSWER_LABELS = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD }

  return (
    <div className={`rounded-lg border p-4 space-y-2 ${question.isDeleted ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm">
          <span className="text-muted-foreground mr-1">Câu {index + 1}:</span>
          {question.content}
        </p>
        <div className="ml-2">
          <Badge variant="outline" className="text-xs">{question.difficulty ?? 'normal'}</Badge>
        </div>
        {!question.isDeleted && (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(question)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
        {question.isDeleted && <Badge variant="outline" className="text-xs bg-red-50 text-red-500">Đã xóa</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {(['A', 'B', 'C', 'D'] as const).map((letter) => (
          <div key={letter} className={`rounded px-2 py-1 ${letter === question.correctAnswer ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400' : 'bg-muted'}`}>
            {letter}. {ANSWER_LABELS[letter]}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Exam Detail Panel ────────────────────────────────────────────────────────

export function ExamDetailPanel({
  exam, onExamUpdated, onExamDeleted,
}: {
  exam: Exam
  onExamUpdated: (exam: Exam) => void
  onExamDeleted: (examId: string) => void
}) {
  const sdk = SDK.getInstance()
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<ExamDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [editExamOpen, setEditExamOpen] = useState(false)
  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; question?: ExamQuestion }>({ open: false })
  const [bulkOpen, setBulkOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; onConfirm: () => Promise<void>
  }>({ open: false, title: '', description: '', onConfirm: async () => { } })

  const loadDetail = async () => {
    setLoadingDetail(true)
    try {
      const res = await sdk.getExamDetail(exam.id)
      setDetail(res.data)
    } catch { /* interceptor */ }
    finally { setLoadingDetail(false) }
  }

  const easyCount = detail?.questions.filter((q) => !q.isDeleted && q.difficulty === 'easy').length ?? 0
  const normalCount = detail?.questions.filter((q) => !q.isDeleted && q.difficulty === 'normal').length ?? 0
  const hardCount = detail?.questions.filter((q) => !q.isDeleted && q.difficulty === 'hard').length ?? 0
  const reqEasy = (detail?.numEasy ?? exam.numEasy) ?? 0
  const reqNormal = (detail?.numNormal ?? exam.numNormal) ?? 0
  const reqHard = (detail?.numHard ?? exam.numHard) ?? 0

  const handleToggle = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !detail) loadDetail()
  }

  // ── Exam CRUD
  const handleUpdateExam = async (data: CreateExamDto, id?: string) => {
    if (!id) return
    const res = await sdk.updateExam(id, data)
    const updated = res.data
    onExamUpdated(updated)
    setDetail((prev) => prev ? { ...prev, ...updated } : prev)
    toast.success('Đã cập nhật đề thi')
  }

  const handleDeleteExam = () => {
    setConfirmDialog({
      open: true,
      title: 'Xóa đề thi',
      description: `Bạn có chắc chắn muốn xóa đề thi "${exam.name}"?`,
      onConfirm: async () => {
        await sdk.deleteExam(exam.id)
        onExamDeleted(exam.id)
        toast.success('Đã xóa đề thi')
      },
    })
  }

  // ── Question CRUD
  const handleSaveQuestion = async (data: CreateQuestionDto, id?: string) => {
    if (id) {
      await sdk.updateQuestion(id, data)
      toast.success('Đã cập nhật câu hỏi')
    } else {
      await sdk.addQuestion(exam.id, data)
      toast.success('Đã thêm câu hỏi')
    }
    await loadDetail()
  }

  const handleBulkSave = async (questions: CreateQuestionDto[]) => {
    await sdk.addQuestions(exam.id, questions)
    toast.success(`Đã thêm ${questions.length} câu hỏi`)
    await loadDetail()
  }

  const handleDeleteQuestion = (q: ExamQuestion) => {
    setConfirmDialog({
      open: true,
      title: 'Xóa câu hỏi',
      description: `Bạn có chắc chắn muốn xóa câu hỏi này?`,
      onConfirm: async () => {
        await sdk.deleteQuestion(q.id)
        toast.success('Đã xóa câu hỏi')
        await loadDetail()
      },
    })
  }

  const activeQuestions = detail?.questions.filter((q) => !q.isDeleted) ?? []

  return (
    <>
      <Collapsible open={open} onOpenChange={handleToggle}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-blue-500" />
                    <p className="font-medium truncate">{exam.name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{exam.questionCount} câu</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} phút</span>
                    <span className="flex items-center gap-1"><Percent className="h-3 w-3" />{exam.passPercent}% đạt</span>
                    <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{exam.retryAfterDays} ngày chờ</span>
                    {exam._count && <span>{exam._count.questions} câu trong ngân hàng</span>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span> Dễ {easyCount}/{reqEasy} </span>
                      <span> Bình thường {normalCount}/{reqNormal} </span>
                      <span> Khó {hardCount}/{reqHard} </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={exam.status} />
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Sửa" onClick={(e) => { e.stopPropagation(); setEditExamOpen(true) }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Xóa" onClick={(e) => { e.stopPropagation(); handleDeleteExam() }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="border-t p-4 space-y-4">
              {loadingDetail ? (
                <p className="text-sm text-muted-foreground text-center py-4">Đang tải câu hỏi...</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Câu hỏi ({activeQuestions.length})</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Thêm nhiều
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setQuestionDialog({ open: true })}>
                        <Plus className="mr-1 h-4 w-4" /> Thêm câu hỏi
                      </Button>
                    </div>
                  </div>
                  {activeQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {activeQuestions.map((q, idx) => (
                        <QuestionItem
                          key={q.id}
                          question={q}
                          index={idx}
                          onEdit={(q) => setQuestionDialog({ open: true, question: q })}
                          onDelete={handleDeleteQuestion}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">Chưa có câu hỏi</p>
                  )}
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dialogs */}
      {editExamOpen && (
        <ExamDialog
          key={exam.id}
          open={editExamOpen}
          onClose={() => setEditExamOpen(false)}
          initial={exam}
          onSave={handleUpdateExam}
        />
      )}
      {questionDialog.open && (
        <QuestionDialog
          key={questionDialog.question?.id ?? 'new'}
          open={questionDialog.open}
          onClose={() => setQuestionDialog({ open: false })}
          initial={questionDialog.question}
          onSave={handleSaveQuestion}
        />
      )}
      {bulkOpen && (
        <BulkQuestionDialog
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onSave={handleBulkSave}
        />
      )}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </>
  )
}

// ─── Main: Exam Section for Course Management ────────────────────────────────

export function ExamSection({
  courseId, initialExams,
}: {
  courseId: string
  initialExams: Exam[]
}) {
  const sdk = SDK.getInstance()
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [createOpen, setCreateOpen] = useState(false)

  const handleCreateExam = async (data: CreateExamDto) => {
    const res = await sdk.createExam(courseId, data)
    setExams((prev) => [...prev, res.data])
    toast.success('Đã tạo đề thi')
  }

  const handleExamUpdated = (updated: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)))
  }

  const handleExamDeleted = (examId: string) => {
    setExams((prev) => prev.map((e) => e.id === examId ? { ...e, status: 'outdated' } : e))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            Đề thi
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Thêm đề thi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <ExamDetailPanel
              key={exam.id}
              exam={exam}
              onExamUpdated={handleExamUpdated}
              onExamDeleted={handleExamDeleted}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Chưa có đề thi nào</p>
        )}
      </CardContent>

      {createOpen && (
        <ExamDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSave={handleCreateExam}
        />
      )}
    </Card>
  )
}
