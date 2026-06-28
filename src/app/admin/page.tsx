"use client";

import {
  IconUsersGroup,
  IconUserCheck,
  IconBook,
  IconChartBar,
} from "@tabler/icons-react";

export default function AdminOverviewPage() {
  const kpis = [
    {
      title: "Tổng số Gia sư",
      value: "1,245",
      trend: "+12% tháng này",
      icon: IconUsersGroup,
      trendUp: true,
    },
    {
      title: "Hồ sơ chờ duyệt",
      value: "24",
      trend: "-3% tuần này",
      icon: IconUserCheck,
      trendUp: false,
    },
    {
      title: "Lớp học đang mở",
      value: "432",
      trend: "+5% tháng này",
      icon: IconBook,
      trendUp: true,
    },
    {
      title: "Doanh thu (ước tính)",
      value: "14.5M",
      trend: "+18% tháng này",
      icon: IconChartBar,
      trendUp: true,
    },
  ];

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tổng quan Hệ thống</h1>
        <p className="text-slate-500">
          Chào mừng trở lại. Dưới đây là tình hình hoạt động của TutorConnect.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={24} stroke={1.5} />
                </div>
              </div>
              <p className="text-slate-500 font-medium text-sm mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold text-slate-900 tabular-nums">
                {kpi.value}
              </h3>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    kpi.trendUp ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
        <p className="mb-4">Khu vực biểu đồ chi tiết sẽ được hiển thị tại đây.</p>
        <div className="h-64 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center bg-slate-50">
          Biểu đồ Doanh thu & Người dùng
        </div>
      </div>
    </div>
  );
}
