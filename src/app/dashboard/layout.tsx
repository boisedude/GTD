import { Header, MobileNav } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main id="main-content" className="pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
