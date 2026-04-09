'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  CreditCard,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Clock,
  Wallet,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';
import SDK from '@/stores/sdk';
import { formatMoney } from '@/helpers/format.helper';
import type {
  DashboardData,
  RevenueData,
  TeacherRevenue,
  CourseRevenue,
  UserStatsData,
} from '@/types/stat.type';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatShortMoney(amount: number) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B ₫`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ₫`;
  return formatMoney(amount);
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_COLORS: Record<string, string> = {
  Admin: '#ef4444',
  Teacher: '#3b82f6',
  User: '#22c55e',
};

const STATUS_COLORS: Record<string, string> = {
  published: '#22c55e',
  draft: '#f97316',
  pending: '#eab308',
  rejected: '#ef4444',
  need_update: '#a855f7',
  update: '#3b82f6',
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316', '#a855f7', '#eab308'];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  suffix = '',
  formatter,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: { growth: number; thisMonth: number; label?: string };
  suffix?: string;
  formatter?: (v: number) => string;
}) {
  const display = formatter ? formatter(value) : `${value.toLocaleString('vi-VN')}${suffix}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1 truncate">{display}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                {trend.growth > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : trend.growth < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={
                    trend.growth > 0
                      ? 'text-green-600'
                      : trend.growth < 0
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                  }
                >
                  {trend.growth > 0 ? '+' : ''}
                  {trend.growth}% so với tháng trước
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 ml-3 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pending Alert Bar ────────────────────────────────────────────────────────

function PendingBar({ pending }: { pending: DashboardData['pending'] }) {
  const items = [
    { label: 'Chờ duyệt khóa học', value: pending.approvals, color: 'bg-yellow-500' },
    { label: 'Báo cáo vi phạm', value: pending.reports, color: 'bg-red-500' },
    { label: 'Yêu cầu rút tiền', value: pending.withdrawals, color: 'bg-blue-500' },
  ].filter((i) => i.value > 0);

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2"
        >
          <span className={`h-2 w-2 rounded-full ${item.color}`} />
          <span className="text-sm font-medium">{item.value}</span>
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Revenue Area Chart ───────────────────────────────────────────────────────

function RevenueChart({ data }: { data: RevenueData }) {
  const chartConfig = {
    totalRevenue: { label: 'Tổng doanh thu', color: '#3b82f6' },
    platformRevenue: { label: 'Nền tảng', color: '#22c55e' },
    teacherRevenue: { label: 'Giảng viên', color: '#f97316' },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Biểu đồ doanh thu</CardTitle>
        <div className="flex flex-wrap gap-4 text-sm mt-1">
          <div>
            <span className="text-muted-foreground">Tổng doanh thu: </span>
            <span className="font-semibold">{formatShortMoney(data.summary.totalRevenue)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Giao dịch: </span>
            <span className="font-semibold">{data.summary.totalTransactions.toLocaleString('vi-VN')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Trung bình: </span>
            <span className="font-semibold">{formatShortMoney(data.summary.avgTransactionValue)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <AreaChart data={data.chart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(v) => formatShortMoney(v)}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatShortMoney(Number(value))}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="totalRevenue"
              stroke="#3b82f6"
              fill="url(#totalGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="platformRevenue"
              stroke="#22c55e"
              fill="url(#platformGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="teacherRevenue"
              stroke="#f97316"
              fill="url(#teacherGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── User Growth Chart ────────────────────────────────────────────────────────

function UserGrowthChart({ data }: { data: UserStatsData }) {
  const chartConfig = {
    newUsers: { label: 'Người dùng mới', color: '#3b82f6' },
    cumulativeTotal: { label: 'Tích lũy', color: '#22c55e' },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tăng trưởng người dùng</CardTitle>
        <div className="flex flex-wrap gap-4 text-sm mt-1">
          <div>
            <span className="text-muted-foreground">Tổng: </span>
            <span className="font-semibold">{data.summary.totalUsers.toLocaleString('vi-VN')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Bị cấm: </span>
            <span className="font-semibold text-red-600">{data.summary.bannedUsers}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <ComposedChart data={data.chart} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar yAxisId="left" dataKey="newUsers" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="cumulativeTotal" stroke="#22c55e" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Distribution Pie Charts ──────────────────────────────────────────────────

function RoleDistributionChart({ data }: { data: { role: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Phân bố vai trò</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <PieChart width={140} height={140}>
            <Pie data={data} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
              {data.map((entry, i) => (
                <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="space-y-2 flex-1">
            {data.map((entry, i) => (
              <div key={entry.role} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ROLE_COLORS[entry.role] ?? PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.count}</span>
                  <span className="text-muted-foreground text-xs">
                    ({total > 0 ? Math.round((entry.count / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const STATUS_LABEL: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Nháp',
    pending: 'Chờ duyệt',
    rejected: 'Bị từ chối',
    need_update: 'Cần cập nhật',
    update: 'Cập nhật',
  };

  const chartConfig = Object.fromEntries(
    data.map((d) => [d.status, { label: STATUS_LABEL[d.status] ?? d.status, color: STATUS_COLORS[d.status] ?? '#6b7280' }]),
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Phân bố trạng thái khóa học</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-45 w-full">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="status"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={90}
              tickFormatter={(v) => STATUS_LABEL[v] ?? v}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v, name) => [v, STATUS_LABEL[String(name)] ?? String(name)]}
                />
              }
            />
            <Bar dataKey="count" radius={[0, 3, 3, 0]}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Top Teachers Table ───────────────────────────────────────────────────────

function TopTeachersCard({ data }: { data: TeacherRevenue[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top giảng viên doanh thu</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {data.map((item, idx) => (
            <div key={item.teacher.id} className="flex items-center gap-3 px-6 py-3">
              <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                {idx + 1}
              </span>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={item.teacher.avatar} alt={item.teacher.fullName} />
                <AvatarFallback className="text-xs">{getInitials(item.teacher.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.teacher.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{item.teacher.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatShortMoney(item.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">{item.count} giao dịch</p>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">Chưa có dữ liệu</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Top Courses Table ────────────────────────────────────────────────────────

function TopCoursesCard({ data }: { data: CourseRevenue[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top khóa học doanh thu</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {data.map((item, idx) => (
            <div key={item.course.id} className="flex items-center gap-3 px-6 py-3">
              <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                {idx + 1}
              </span>
              {item.course.thumbnail ? (
                <img
                  src={item.course.thumbnail}
                  alt={item.course.name}
                  className="h-10 w-16 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-16 rounded bg-muted shrink-0 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.course.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.course.user.fullName} · {item.count} học viên
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatShortMoney(item.totalRevenue)}</p>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {item.course.star}
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">Chưa có dữ liệu</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [topTeachers, setTopTeachers] = useState<TeacherRevenue[]>([]);
  const [topCourses, setTopCourses] = useState<CourseRevenue[]>([]);
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);

  useEffect(() => {
    const sdk = SDK.getInstance();
    setLoading(true);

    Promise.all([
      sdk.getDashboard().catch(() => null),
      sdk.getRevenueStats({ groupBy: 'month' }).catch(() => null),
      sdk.getRevenueByTeacher({ limit: '5' }).catch(() => null),
      sdk.getRevenueByCourse({ limit: '5' }).catch(() => null),
      sdk.getUserStats({ groupBy: 'month' }).catch(() => null),
    ])
      .then(([dashRes, revRes, teacherRes, courseRes, userRes]) => {
        if (dashRes) setDashboard((dashRes as any).data ?? null);
        if (revRes) setRevenue((revRes as any).data ?? null);
        if (teacherRes) {
          const d = (teacherRes as any).data;
          setTopTeachers(Array.isArray(d) ? d : []);
        }
        if (courseRes) {
          const d = (courseRes as any).data;
          setTopCourses(Array.isArray(d) ? d : []);
        }
        if (userRes) setUserStats((userRes as any).data ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Pending alerts */}
      {dashboard?.pending && <PendingBar pending={dashboard.pending} />}

      {/* Overview stat cards */}
      {dashboard?.overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Người dùng"
            value={dashboard.overview.totalUsers}
            icon={Users}
            trend={dashboard.trends.users}
          />
          <StatCard
            title="Khóa học"
            value={dashboard.overview.totalCourses}
            icon={BookOpen}
            trend={dashboard.trends.courses}
          />
          <StatCard
            title="Doanh thu"
            value={dashboard.overview.totalRevenue}
            icon={Wallet}
            formatter={formatShortMoney}
            trend={dashboard.trends.revenue}
          />
          <StatCard
            title="Giao dịch"
            value={dashboard.overview.totalTransactions}
            icon={CreditCard}
          />
          <StatCard
            title="Đánh giá"
            value={dashboard.overview.totalReviews}
            icon={Star}
          />
          <StatCard
            title="Báo cáo"
            value={dashboard.overview.totalReports}
            icon={AlertCircle}
          />
        </div>
      )}

      {/* Revenue chart */}
      {revenue && revenue.chart.length > 0 && <RevenueChart data={revenue} />}

      {/* User growth + distributions in 3-col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {userStats && userStats.chart.length > 0 && (
          <div className="lg:col-span-2">
            <UserGrowthChart data={userStats} />
          </div>
        )}
        {dashboard?.distributions.usersByRole && (
          <RoleDistributionChart data={dashboard.distributions.usersByRole} />
        )}
      </div>

      {/* Course status distribution */}
      {dashboard?.distributions.coursesByStatus && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CourseStatusChart data={dashboard.distributions.coursesByStatus} />
          {/* Placeholder for additional chart slot */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.pending && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Khóa học chờ duyệt</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      {dashboard.pending.approvals}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Báo cáo vi phạm</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      {dashboard.pending.reports}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Yêu cầu rút tiền</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      {dashboard.pending.withdrawals}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top teachers & courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopTeachersCard data={topTeachers} />
        <TopCoursesCard data={topCourses} />
      </div>
    </div>
  );
}
