'use client';

import * as React from 'react';
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  TicketCheck,
  CreditCard,
} from 'lucide-react';

import { NavMain } from '@/components/layouts/nav-main';
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

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        plan: 'Admin',
      },
    ],
    navMain: [
      {
        title: 'Tổng quan',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: 'Quản lý người dùng',
        url: '/admin/managements/users',
        icon: Users,
      },
      {
        title: 'Quản lý khóa học',
        url: '/admin/managements/courses',
        icon: BookOpen,
      },
      {
        title: 'Doanh thu',
        url: '/admin/managements/transactions',
        icon: CreditCard,
      },
      {
        title: 'Quản lý hệ thống',
        url: '/admin/settings',
        icon: Settings,
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
