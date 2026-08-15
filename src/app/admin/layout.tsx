import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar />
      <div className="flex-1 bg-muted/30 overflow-x-hidden">
        <div className="p-4 md:p-6 lg:p-10">{children}</div>
      </div>
    </div>
  );
}