export interface DashboardOverview {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalTransactions: number;
  totalReviews: number;
  totalReports: number;
}

export interface DashboardTrend {
  thisMonth: number;
  lastMonth: number;
  growth: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  trends: {
    users: DashboardTrend;
    revenue: DashboardTrend;
    courses: DashboardTrend;
  };
  pending: {
    approvals: number;
    reports: number;
    withdrawals: number;
  };
  distributions: {
    usersByRole: { role: string; count: number }[];
    coursesByStatus: { status: string; count: number }[];
  };
}

export interface RevenueChartPoint {
  period: string;
  totalRevenue: number;
  platformRevenue: number;
  teacherRevenue: number;
  transactionCount: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
}

export interface RevenueData {
  summary: RevenueSummary;
  chart: RevenueChartPoint[];
  items: any[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface TeacherRevenue {
  teacher: { id: string; fullName: string; email: string; avatar: string };
  totalRevenue: number;
  teacherEarnings: number;
  count: number;
}

export interface CourseRevenue {
  course: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    price: number;
    star: number;
    studentCount: number;
    user: { id: string; fullName: string };
  };
  totalRevenue: number;
  platformRevenue: number;
  count: number;
}

export interface UserChartPoint {
  period: string;
  newUsers: number;
  cumulativeTotal: number;
}

export interface UserStatsData {
  summary: { totalUsers: number; bannedUsers: number; deletedUsers: number };
  roleDistribution: { role: string; count: number }[];
  chart: UserChartPoint[];
  topBuyers: any[];
}
