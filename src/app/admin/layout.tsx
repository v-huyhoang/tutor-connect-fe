"use client";

import Link from "next/link";
import {
  IconLayoutDashboard,
  IconUserCheck,
  IconBooks,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/login";
    }
  };

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: IconLayoutDashboard },
    { name: "Duyệt gia sư", href: "/admin/verifications", icon: IconUserCheck },
    { name: "Quản lý môn học", href: "/admin/subjects", icon: IconBooks },
    { name: "Cài đặt", href: "/admin/settings", icon: IconSettings },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-lg font-semibold text-slate-900">
            TutorConnect Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Icon size={20} stroke={1.5} className="text-slate-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium"
          >
            <IconLogout size={20} stroke={1.5} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:hidden justify-between">
          <span className="font-semibold text-slate-900">TutorConnect Admin</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Đăng xuất
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
