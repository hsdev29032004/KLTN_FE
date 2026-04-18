"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
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

interface LecturerPayrollModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    fromDate: string
    toDate: string
}

export default function LecturerPayrollModal({ open, onOpenChange, fromDate, toDate }: LecturerPayrollModalProps) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const user = useSelector((state: any) => state.auth.user)

    useEffect(() => {
        if (!open || !user) return
        (async () => {
            try {
                setLoading(true)
                const res = await payrollRequest.getPayroll({ fromDate, toDate })
                const allData = res.data || []
                // Filter to get only current lecturer's data
                const currentLecturerData = allData.find((t: any) => t.teacherId === user?.id || t.email === user?.email)
                console.log('Lecturer payroll data:', currentLecturerData)
                setData(currentLecturerData || null)
            } catch (err) {
                console.error('Error fetching payroll:', err)
                setData(null)
            } finally {
                setLoading(false)
            }
        })()
    }, [open, fromDate, toDate, user])

    const handleExport = () => {
        if (!data) return

        // Export only current lecturer's data
        const rows = [{
            teacherId: data.teacherId,
            fullName: data.fullName,
            email: data.email,
            bankName: data.bankName ?? 'Không có thông tin',
            bankNumber: data.bankNumber ?? '',
            totalSales: data.totalSales,
            totalTeacherEarnings: data.totalTeacherEarnings,
        }]

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
                            <Button onClick={handleExport} size="sm" disabled={!data}>Xuất XLSX</Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-2">
                    {loading && <div>Đang tải...</div>}

                    {!loading && !data && <div>Không có dữ liệu cho khoảng thời gian này ({fromDate} - {toDate}).</div>}

                    {!loading && data && (
                        <div className="border rounded p-3 my-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{data.fullName} ({data.email})</div>
                                    <div className="text-sm text-muted-foreground">{data.bankName ?? 'Không có thông tin'} — {data.bankNumber ?? ''}</div>
                                </div>
                                <div className="text-right">
                                    <div>Tổng doanh thu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalSales || 0)}</div>
                                    <div>Thực nhận: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalTeacherEarnings || 0)}</div>
                                </div>
                            </div>

                            {Array.isArray(data.detailInvoices) && data.detailInvoices.length > 0 && (
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
                                        {data.detailInvoices.map((d: any) => (
                                            <TableRow key={d.id}>
                                                <TableCell>{d.course?.name ?? ''}</TableCell>
                                                <TableCell>
                                                    {d.buyer?.fullName ?? '—'}
                                                </TableCell>
                                                <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.price || 0)}</TableCell>
                                                <TableCell>{d.commissionRate}%</TableCell>
                                                <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.teacherEarnings || 0)}</TableCell>
                                                <TableCell>{new Date(d.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    )}
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
