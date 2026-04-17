"use client"

import { useEffect, useState } from "react"
import * as XLSX from "xlsx"
import { payrollRequest } from "@/stores/payment/payroll-request"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

interface PayrollModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromDate: string
  toDate: string
}

export default function PayrollModal({ open, onOpenChange, fromDate, toDate }: PayrollModalProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (!open) return
    (async () => {
      try {
        setLoading(true)
        const res = await payrollRequest.getPayroll({ fromDate, toDate })
        setData(res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [open, fromDate, toDate])

  const handleExport = () => {
    // Produce one row per teacher; include a compact details summary
    const rows = data.map((teacher: any) => {
      return {
        teacherId: teacher.teacherId,
        fullName: teacher.fullName,
        email: teacher.email,
        bankName: teacher.bankName ?? 'No bank info',
        bankNumber: teacher.bankNumber ?? '',
        totalSales: teacher.totalSales,
        totalTeacherEarnings: teacher.totalTeacherEarnings,
      }
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, `Payroll_${fromDate}`)
    XLSX.writeFile(wb, `payroll_${fromDate}_to_${toDate}.xlsx`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Bảng lương {fromDate}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} size="sm">Xuất XLSX</Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-2">
          {loading && <div>Loading...</div>}

          {!loading && data.length === 0 && <div>Không có dữ liệu cho khoảng thời gian này.</div>}

          {!loading && data.map((t: any) => (
            <div key={t.teacherId} className="border rounded p-3 my-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{t.fullName} ({t.email})</div>
                  <div className="text-sm text-muted-foreground">{t.bankName ?? 'No bank info'} — {t.bankNumber ?? ''}</div>
                </div>
                <div className="text-right">
                  <div>Tổng doanh thu: {t.totalSales?.toLocaleString?.('vi-VN') ?? t.totalSales}</div>
                  <div>Thực nhận: {t.totalTeacherEarnings?.toLocaleString?.('vi-VN') ?? t.totalTeacherEarnings}</div>
                </div>
              </div>

              {Array.isArray(t.detailInvoices) && (
                <Table className="mt-3 text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khóa học</TableHead>
                      <TableHead>Người mua</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Tỷ lệ (%)</TableHead>
                      <TableHead>Thực nhận</TableHead>
                      <TableHead>Ngày</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {t.detailInvoices.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.course?.name ?? ''}</TableCell>
                        <TableCell>
                          {d.buyer?.fullName ?? '—'}
                        </TableCell>
                        <TableCell>{d.price?.toLocaleString?.('vi-VN') ?? d.price}</TableCell>
                        <TableCell>{d.commissionRate}</TableCell>
                        <TableCell>{d.teacherEarnings?.toLocaleString?.('vi-VN') ?? d.teacherEarnings}</TableCell>
                        <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <div className="w-full flex justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Đóng</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
