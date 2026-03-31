'use client';

import * as React from 'react';
import {
  BookOpen,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/layouts/nav-main';
import { NavProjects } from '@/components/layouts/nav-projects';
import { NavUser } from '@/components/layouts/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth/auth-store';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authStore = useAuthStore();

  const data = {
    user: {
      name: authStore.user?.fullName,
      email: authStore.user?.email,
      avatar: authStore.user?.avatar,
    },
    teams: [
      {
        name: 'ONLEARN',
        logo: GalleryVerticalEnd,
        plan: 'Lecturer',
      },
    ],
    navMain: [
      {
        title: 'Tổng quan',
        url: '/lecturer/dashboard',
        icon: PieChart,
        isActive: true,
      },
      {
        title: 'Quản lý khóa học',
        url: '/lecturer/course-management',
        icon: BookOpen,
        items: [
          {
            title: 'React Advanced',
            url: '/lecturer/course-management/react-advanced',
          },
          {
            title: 'TypeScript Pro',
            url: '/lecturer/course-management/typescript-pro',
          },
          {
            title: 'Design Patterns',
            url: '/lecturer/course-management/design-patterns',
          },
        ],
      },
      {
        title: 'Đoạn chat',
        url: '/lecturer/conversation',
        icon: SquareTerminal,
        items: [
          { title: 'Hỏi về bài 1', url: '/lecturer/conversation/chat-1' },
          { title: 'Phản hồi nội dung', url: '/lecturer/conversation/chat-2' },
          { title: 'Yêu cầu hỗ trợ', url: '/lecturer/conversation/chat-3' },
        ],
      },
      {
        title: 'Giao dịch',
        url: '/lecturer/transaction',
        icon: Map,
      },
      {
        title: 'Trang cá nhân',
        url: '/lecturer/profile',
        icon: Settings2,
      },
    ],
    projects: [
      {
        name: 'Tài liệu',
        url: '#',
        icon: Frame,
      },
      {
        name: 'Điều khoản sử dụng',
        url: '#',
        icon: PieChart,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
