import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layouts/site-header";
import { AppSidebar } from "@/components/layouts/app-sidebar";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}