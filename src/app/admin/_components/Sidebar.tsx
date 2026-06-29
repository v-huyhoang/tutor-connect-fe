"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUserCheck,
  IconBooks,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: IconLayoutDashboard },
    { name: "Tutor Verification", href: "/admin/verifications", icon: IconUserCheck },
    { name: "Subject Management", href: "/admin/subjects", icon: IconBooks },
    { name: "Settings", href: "/admin/settings", icon: IconSettings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <span className="text-lg font-semibold text-slate-900">
          TutorConnect Admin
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={20} stroke={1.5} className={isActive ? "text-blue-700" : "text-slate-400"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium"
        >
          <IconLogout size={20} stroke={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}
