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

const data = {
  message: 'Lấy thống kê giảng viên thành công',
  data: {
    overview: {
      totalCourses: 3,
      totalStudents: 6,
      totalReviews: 0,
      avgRating: 0,
      totalRevenue: 895000,
    },
    courses: [
      {
        id: 'aa4c69b2-b882-4959-808f-7304e042e5d9',
        name: 'NestJS: Cẩm nang toàn diện dành cho nhà phát triển',
        price: 49000,
        status: 'published',
        star: '3.3',
        studentCount: 0,
        createdAt: '2026-03-21T03:54:57.565Z',
        _count: { userCourses: 2, reviews: 0, lessons: 4 },
      },
      {
        id: 'd6e9d5cb-fe0b-4521-921e-c8b4fd66543c',
        name: 'HRBP – Đối tác Kinh Doanh Xuất Sắc',
        price: 199000,
        status: 'published',
        star: '2.8',
        studentCount: 0,
        createdAt: '2026-03-21T03:54:57.703Z',
        _count: { userCourses: 2, reviews: 0, lessons: 4 },
      },
      {
        id: '06d9be19-a203-4c15-a2bc-95e1d32e5a00',
        name: 'Khóa học NextJS 14-ReactJS-Typescript thực chiến',
        price: 299000,
        status: 'published',
        star: '3.2',
        studentCount: 0,
        createdAt: '2026-03-21T03:54:57.425Z',
        _count: { userCourses: 2, reviews: 0, lessons: 4 },
      },
    ],
  },
};

function formatCurrency(v: number) {
  return v.toLocaleString('vi-VN') + ' ₫';
}

export default async function Dashboard() {
  const { overview, courses } = data.data;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Tổng quan giảng viên</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
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

      <section>
        <h2 className="text-lg font-medium">Danh sách khóa học</h2>

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
                    <Badge variant="outline">{c.status}</Badge>
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
