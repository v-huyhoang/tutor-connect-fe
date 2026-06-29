"use client";

import api from "@/lib/api";
import { Sidebar } from "./_components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:hidden justify-between">
          <span className="font-semibold text-slate-900">
            TutorConnect Admin
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
