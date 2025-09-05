import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Protected from "@/components/Protected";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <SidebarProvider>
        <div className="flex h-screen overflow-y-auto">
          <AppSidebar />
          <main className="p-4 pb-20 sm:p-6 lg:p-8">
            <SidebarTrigger />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </Protected>
  );
}
