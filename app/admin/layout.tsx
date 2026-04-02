import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSiteHeader } from "@/components/layouts/admin-site-header";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <AdminSiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}