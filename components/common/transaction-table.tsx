'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInvoiceStore } from '@/stores/invoice/invoice-store';
import { useCourseStore } from '@/stores/course/course-store';
import { formatMoney } from '@/helpers/format.helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  CalendarIcon,
  Receipt,
} from 'lucide-react';
import type { InvoiceDetailParams } from '@/types/invoice.type';

interface TransactionTableProps {
  role: 'admin' | 'teacher';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function TransactionTable({ role }: TransactionTableProps) {
  const { list, meta, loading, fetchInvoiceDetails } = useInvoiceStore();
  const { list: courseList, fetchCourses } = useCourseStore();

  const [params, setParams] = useState<InvoiceDetailParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
    status: 'paid',
  });
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchCourses();
  }, []);

  const loadData = useCallback(() => {
    fetchInvoiceDetails(params);
  }, [params]);

  useEffect(() => {
    loadData();
  }, [params]);

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleSort = (sortBy: 'createdAt' | 'price') => {
    setParams((prev) => ({
      ...prev,
      sortBy,
      order: prev.sortBy === sortBy && prev.order === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handleCourseFilter = (courseId: string) => {
    setParams((prev) => ({
      ...prev,
      courseId: courseId === 'all' ? undefined : courseId,
      page: 1,
    }));
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    setFromDate(date);
    setParams((prev) => ({
      ...prev,
      fromDate: date ? toISODate(date) : undefined,
      page: 1,
    }));
  };

  const handleToDateSelect = (date: Date | undefined) => {
    setToDate(date);
    setParams((prev) => ({
      ...prev,
      toDate: date ? toISODate(date) : undefined,
      page: 1,
    }));
  };

  const handleLimitChange = (limit: string) => {
    setParams((prev) => ({
      ...prev,
      limit: parseInt(limit),
      page: 1,
    }));
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setParams({ page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' });
  };

  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? 1;

  const SortButton = ({ field, children }: { field: 'createdAt' | 'price'; children: React.ReactNode }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={`size-3.5 ${params.sortBy === field ? 'text-foreground' : 'text-muted-foreground/50'}`} />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-48">
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Khóa học</label>
              <Select value={params.courseId || 'all'} onValueChange={handleCourseFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả khóa học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khóa học</SelectItem>
                  {courseList?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <span className="truncate max-w-60 block">{course.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Từ ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-36 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 size-4" />
                    {fromDate ? formatDateShort(fromDate) : <span className="text-muted-foreground">Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={handleFromDateSelect}
                    disabled={(date) => (toDate ? date > toDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Đến ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-36 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 size-4" />
                    {toDate ? formatDateShort(toDate) : <span className="text-muted-foreground">Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={handleToDateSelect}
                    disabled={(date) => (fromDate ? date < fromDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={handleReset}>
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="size-5" />
              Chi tiết giao dịch
              {meta && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({meta.total} bản ghi)
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select value={String(params.limit)} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-17.5" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12.5">#</TableHead>
                  <TableHead>Khóa học</TableHead>
                  {role === 'admin' && <TableHead>Giảng viên</TableHead>}
                  <TableHead>Người mua</TableHead>
                  <TableHead>
                    <SortButton field="price">Giá khóa học</SortButton>
                  </TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Giá thực nhận</TableHead>
                  <TableHead>
                    <SortButton field="createdAt">Ngày tạo</SortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      {role === 'admin' && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : list && list.length > 0 ? (
                  list.map((item, idx) => {
                    const rowNum = ((currentPage - 1) * (params.limit || 10)) + idx + 1;
                    const netAmount = item.price * (1 + item.commissionRate / 100);

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{rowNum}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.courses.thumbnail}
                              alt={item.courses.name}
                              className="size-10 rounded object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-50">{item.courses.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{item.courses.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        {role === 'admin' && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7">
                                <AvatarImage src={item.courses.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {item.courses.user.fullName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate max-w-30">{item.courses.user.fullName}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage src={item.invoices.users.avatar} />
                              <AvatarFallback className="text-xs">
                                {item.invoices.users.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm truncate max-w-30">{item.invoices.users.fullName}</div>
                              <div className="text-xs text-muted-foreground truncate">{item.invoices.users.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatMoney(item.price)}</TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium text-emerald-600">{item.commissionRate}%</span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatMoney(netAmount)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={role === 'admin' ? 8 : 7} className="h-24 text-center text-muted-foreground">
                      Không có dữ liệu giao dịch
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages} &middot; Tổng {meta.total} bản ghi
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(1)}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(totalPages)}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
