'use client'

import { ExamPage } from '@/components/exam/exam-page'
import { use } from 'react'

export default function ExamTakingPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ course?: string }>
}) {
  const { examId } = use(params)
  const { course } = use(searchParams)

  return <ExamPage examId={examId} courseSlug={course} />
}
