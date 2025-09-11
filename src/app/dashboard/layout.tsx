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
          <main className="w-full md:min-w-[65rem] p-4 pb-20 sm:p-6 lg:p-8">
            <SidebarTrigger />
            {children}
            <div className="h-20"></div>
          </main>
        </div>
      </SidebarProvider>
    </Protected>
  );
}
