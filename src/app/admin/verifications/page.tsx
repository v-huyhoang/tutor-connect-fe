"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  IconCheck,
  IconClock,
  IconX,
  IconUser,
  IconId,
  IconCertificate,
  IconVideo,
  IconExternalLink,
} from "@tabler/icons-react";

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
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTutors = async () => {
    try {
      const response = await api.get("/api/admin/tutors?status=pending");
      setTutors(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        window.location.href = "/login";
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
        const note = prompt("Nhập lý do từ chối tài liệu này (bắt buộc):");
        if (!note) return;
        await api.post(`/api/admin/tutors/${tutorId}/reject-document`, {
          type,
          note,
        });
      }
      await fetchTutors();
    } catch (err: unknown) {
      alert("Có lỗi xảy ra khi cập nhật tài liệu.");
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
        alert("Đã duyệt hồ sơ gia sư thành công.");
      } else {
        const reason = prompt("Nhập lý do từ chối toàn bộ hồ sơ (bắt buộc):");
        if (!reason) return;
        await api.post(`/api/admin/tutors/${tutorId}/reject`, { reason });
        alert("Đã từ chối hồ sơ.");
      }
      await fetchTutors();
    } catch (err: unknown) {
      alert("Có lỗi xảy ra khi cập nhật hồ sơ.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-medium text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "avatar":
        return { label: "Ảnh đại diện", icon: IconUser };
      case "cccd_front":
        return { label: "Mặt trước CCCD", icon: IconId };
      case "cccd_back":
        return { label: "Mặt sau CCCD", icon: IconId };
      case "degree":
        return { label: "Bằng cấp", icon: IconCertificate };
      case "intro_video":
        return { label: "Video giới thiệu", icon: IconVideo };
      default:
        return { label: type, icon: IconCheck };
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Phê duyệt hồ sơ</h1>
        <p className="text-slate-500">
          Danh sách gia sư đang chờ hệ thống kiểm tra và xác thực thông tin.
        </p>
      </div>

      {tutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <IconCheck size={32} stroke={1.5} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Tất cả đã hoàn tất</h3>
          <p className="text-slate-500">Không còn hồ sơ nào đang chờ duyệt lúc này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-medium text-lg">
                    {tutor.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {tutor.user.name}
                    </h3>
                    <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:gap-3">
                      <span>{tutor.user.email}</span>
                      {tutor.user.phone && (
                        <span className="hidden sm:inline text-slate-300">•</span>
                      )}
                      {tutor.user.phone && <span>{tutor.user.phone}</span>}
                    </div>
                  </div>
                </div>
                {/* Signature Badge: asymmetric corners */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-tr-xl rounded-bl-xl ml-4">
                  <IconClock size={14} stroke={2} />
                  <span>Chờ duyệt</span>
                </div>
              </div>

              {/* Card Body - Documents */}
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                  Tài liệu tải lên
                </h4>

                {tutor.documents.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-4">
                    Gia sư chưa tải lên tài liệu nào.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {tutor.documents.map((doc) => {
                      const { label, icon: TypeIcon } = getTypeInfo(doc.type);
                      const isApproved = doc.status === "approved";
                      const isRejected = doc.status === "rejected";

                      return (
                        <div
                          key={doc.id}
                          className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors ${
                            isApproved
                              ? "border-emerald-200 bg-emerald-50/30"
                              : isRejected
                              ? "border-rose-200 bg-rose-50/30"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 text-slate-700">
                              <TypeIcon size={18} stroke={1.5} className="text-slate-400" />
                              <span className="font-medium text-sm">{label}</span>
                            </div>
                            {isApproved && (
                              <IconCheck size={18} stroke={2} className="text-emerald-600" />
                            )}
                            {isRejected && (
                              <IconX size={18} stroke={2} className="text-rose-600" />
                            )}
                          </div>

                          <a
                            href={"http://localhost:8000/storage/" + doc.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 self-start"
                          >
                            Mở tài liệu
                            <IconExternalLink size={12} stroke={2} />
                          </a>

                          {doc.admin_note && (
                            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-md mt-1 border border-rose-100">
                              <span className="font-semibold">Lý do:</span> {doc.admin_note}
                            </p>
                          )}

                          {doc.status === "submitted" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleDocumentAction(tutor.id, doc.type, "reject")}
                                disabled={!!actionLoading}
                                className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 active:scale-[0.98]"
                              >
                                Từ chối
                              </button>
                              <button
                                onClick={() => handleDocumentAction(tutor.id, doc.type, "approve")}
                                disabled={!!actionLoading}
                                className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
                              >
                                Duyệt
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tutor Actions */}
                <div className="mt-auto pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => handleTutorAction(tutor.id, "reject")}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    onClick={() => handleTutorAction(tutor.id, "verify")}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  >
                    Hoàn tất phê duyệt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
