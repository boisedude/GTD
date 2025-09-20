import { Header, MobileNav } from "@/components/layout/header";
import { GTDSidebar } from "@/components/layout/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <GTDSidebar />
        </div>

        {/* Main content area */}
        <SidebarInset className="flex-1">
          <Header />
          <main id="main-content" className="pb-20 md:pb-0">
            {children}
          </main>
        </SidebarInset>

        {/* Mobile Navigation - only visible on mobile */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
