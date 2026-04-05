import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useSdk } from '@/hooks/use-my-cookies';
import { RevenueChart } from '@/components/lecturer/revenue-chart';
import { CreateCourseButton } from '@/components/lecturer/create-course-button';

function formatCurrency(v: number) {
  return v.toLocaleString('vi-VN') + ' ₫';
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  published: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700 border-green-300' },
  pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  draft: { label: 'Nháp', className: 'bg-orange-100 text-orange-700 border-orange-300' },
  update: { label: 'Chờ duyệt cập nhật', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-700 border-red-300' },
  need_update: { label: 'Cần cập nhật', className: 'bg-purple-100 text-purple-700 border-purple-300' },
};

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const defaults = getDefaultDateRange();
  const startDate = params.startDate || defaults.startDate;
  const endDate = params.endDate || defaults.endDate;

  const sdk = await useSdk();
  const res = await sdk.fetchStats({ startDate, endDate });
  const { overview, courses, invoiceDetails } = res.data;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Tổng quan giảng viên</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className='py-3'>
          <CardHeader>
            <CardTitle>Khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalCourses}</div>
          </CardContent>
        </Card>

        <Card className='py-3'>
          <CardHeader>
            <CardTitle>Học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className='py-3'>
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(overview.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <RevenueChart
        invoiceDetails={invoiceDetails ?? []}
        startDate={startDate}
        endDate={endDate}
      />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Danh sách khóa học</h2>
          <CreateCourseButton />
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Bài học</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {courses.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                  </TableCell>
                  <TableCell>{c._count.lessons}</TableCell>
                  <TableCell>{c._count.userCourses}</TableCell>
                  <TableCell>{formatCurrency(c.price)}</TableCell>
                  <TableCell>{c.star} ★</TableCell>
                  <TableCell>
                    {(() => {
                      const cfg = STATUS_LABEL[c.status] ?? { label: c.status, className: '' };
                      return (
                        <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                          {cfg.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
