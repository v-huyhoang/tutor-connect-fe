"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export default function Navbar() {
  const { user, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/login";
    }
  };



  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "student") return "/student/bookings";
    if (user.role === "tutor") return "/tutor/bookings";
    if (user.role === "admin") return "/admin/verifications";
    return "/";
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/tutors"
          className="text-xl font-bold text-teal-600 tracking-tight"
        >
          TutorConnect
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg"></div>
          ) : user ? (
            <>
              <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
                Chào, {user.name}
              </span>
              <Link
                href={getDashboardLink()}
                className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-sm font-medium transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
