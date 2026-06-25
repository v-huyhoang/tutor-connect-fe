"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Document = {
  id: number;
  type: string;
  file_path: string;
  status: "submitted" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
};

type TutorProfile = {
  id: number;
  user: { name: string; email: string; phone: string | null };
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  documents: Document[];
};

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTutors = async () => {
    try {
      const response = await api.get("/api/admin/tutors?status=pending");
      setTutors(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleDocumentAction = async (
    tutorId: number,
    type: string,
    action: "approve" | "reject",
  ) => {
    setActionLoading(`${tutorId}-${type}-${action}`);
    try {
      if (action === "approve") {
        await api.post(`/api/admin/tutors/${tutorId}/approve-document`, {
          type,
        });
      } else {
        const note = prompt("Nhập lý do từ chối tài liệu này:");
        if (!note) return;
        await api.post(`/api/admin/tutors/${tutorId}/reject-document`, {
          type,
          note,
        });
      }
      await fetchTutors();
    } catch (err: unknown) {
      alert("Có lỗi xảy ra.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTutorAction = async (
    tutorId: number,
    action: "verify" | "reject",
  ) => {
    setActionLoading(`${tutorId}-${action}`);
    try {
      if (action === "verify") {
        await api.post(`/api/admin/tutors/${tutorId}/verify`);
        alert("Đã duyệt hồ sơ gia sư.");
      } else {
        const reason = prompt("Nhập lý do từ chối toàn bộ hồ sơ:");
        if (!reason) return;
        await api.post(`/api/admin/tutors/${tutorId}/reject`, { reason });
        alert("Đã từ chối hồ sơ.");
      }
      await fetchTutors();
    } catch (err: unknown) {
      alert("Có lỗi xảy ra.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        Đang tải...
      </div>
    );

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      avatar: "Ảnh đại diện",
      cccd_front: "Mặt trước CCCD",
      cccd_back: "Mặt sau CCCD",
      degree: "Bằng cấp",
      intro_video: "Video giới thiệu",
    };
    return types[type] || type;
  };

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
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Kiểm duyệt Gia sư
            </h1>
            <p className="text-slate-500 mt-2">
              Danh sách các hồ sơ gia sư đang chờ kiểm duyệt.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg text-sm font-medium transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        {tutors.length === 0 ? (
          <Card className="rounded-2xl border-slate-200 shadow-sm p-12 text-center text-slate-500">
            Không có hồ sơ nào đang chờ duyệt.
          </Card>
        ) : (
          <div className="space-y-6">
            {tutors.map((tutor) => (
              <Card
                key={tutor.id}
                className="rounded-2xl border-slate-200 shadow-sm"
              >
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">
                        {tutor.user.name}
                      </CardTitle>
                      <CardDescription>
                        {tutor.user.email}{" "}
                        {tutor.user.phone && `• ${tutor.user.phone}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleTutorAction(tutor.id, "reject")}
                        disabled={!!actionLoading}
                      >
                        Từ chối hồ sơ
                      </Button>
                      <Button
                        className="rounded-xl bg-green-600 hover:bg-green-700"
                        onClick={() => handleTutorAction(tutor.id, "verify")}
                        disabled={!!actionLoading}
                      >
                        Duyệt toàn bộ hồ sơ
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Tài liệu đã nộp
                  </h3>
                  {tutor.documents.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                      Chưa tải lên tài liệu nào.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tutor.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="border rounded-xl p-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {translateType(doc.type)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  doc.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : doc.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {doc.status}
                              </span>
                            </div>
                            <a
                              href={
                                "http://localhost:8000/storage/" + doc.file_path
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline block mb-4"
                            >
                              Xem tài liệu
                            </a>
                            {doc.admin_note && (
                              <p className="text-xs text-red-500 mb-4">
                                Note: {doc.admin_note}
                              </p>
                            )}
                          </div>

                          {doc.status === "submitted" && (
                            <div className="flex gap-2 mt-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() =>
                                  handleDocumentAction(
                                    tutor.id,
                                    doc.type,
                                    "reject",
                                  )
                                }
                                disabled={!!actionLoading}
                              >
                                Từ chối
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700"
                                onClick={() =>
                                  handleDocumentAction(
                                    tutor.id,
                                    doc.type,
                                    "approve",
                                  )
                                }
                                disabled={!!actionLoading}
                              >
                                Duyệt
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
