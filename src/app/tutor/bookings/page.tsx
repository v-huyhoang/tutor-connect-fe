'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { BookingRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle, XCircle, Phone, Mail, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function TutorBookingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [bookings, setBookings] = useState<BookingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/api/bookings');
            setBookings(response.data.data || []);
        } catch (error) {
            console.error("Lỗi tải danh sách yêu cầu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading && !user) {
            window.location.href = '/login';
        } else if (!isAuthLoading && user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchBookings();
        }
    }, [user, isAuthLoading]);

    const handleAccept = async (id: number) => {
        setIsActionLoading(true);
        try {
            await api.put(`/api/bookings/${id}/status`, {
                status: 'accepted'
            });
            await fetchBookings();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedBooking) return;
        setIsActionLoading(true);
        try {
            await api.put(`/api/bookings/${selectedBooking.id}/status`, {
                status: 'rejected',
                tutor_response_note: rejectNote
            });
            setRejectNote('');
            setIsRejectDialogOpen(false);
            setSelectedBooking(null);
            await fetchBookings();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const openRejectDialog = (booking: BookingRequest) => {
        setSelectedBooking(booking);
        setRejectNote('');
        setIsRejectDialogOpen(true);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { 
                    label: 'Đang chờ xử lý', 
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: <Clock className="w-3.5 h-3.5 mr-1" />
                };
            case 'accepted':
                return { 
                    label: 'Đã nhận lớp', 
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />
                };
            case 'rejected':
                return { 
                    label: 'Đã từ chối', 
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: <XCircle className="w-3.5 h-3.5 mr-1" />
                };
            default:
                return { 
                    label: status, 
                    color: 'bg-slate-50 text-slate-700 border-slate-200',
                    icon: null
                };
        }
    };

    if (isAuthLoading || isLoading) {
        return <div className="p-8 text-slate-500">Đang tải dữ liệu...</div>;
    }

    const handleLogout = async () => {
        try {
            await api.post('/api/logout');
        } catch (err) {
            console.error(err);
        } finally {
            window.location.href = '/login';
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-medium text-slate-900">Quản lý yêu cầu nhận lớp</h1>
                    <p className="text-slate-500 mt-1">Xem và duyệt các yêu cầu đặt lịch học từ học sinh/phụ huynh.</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                    Đăng xuất
                </button>
            </div>

            {bookings.length === 0 ? (
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white text-center py-16">
                    <CardContent>
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có yêu cầu nào</h3>
                        <p className="text-slate-500 mb-6">Hiện tại chưa có học sinh nào gửi yêu cầu đặt lịch cho bạn.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => {
                        const statusConfig = getStatusConfig(booking.status);
                        return (
                            <Card key={booking.id} className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 pt-5 px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-lg font-medium text-slate-900">
                                                Từ: {booking.student?.name || 'Học sinh ẩn danh'}
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 mt-1">
                                                Lớp: {booking.student?.studentProfile?.grade_level || 'Chưa cập nhật'} | Ngày gửi: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                                            </CardDescription>
                                        </div>
                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm border text-sm font-medium w-fit ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-900 mb-1">Lời nhắn của học sinh</h4>
                                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[3rem]">
                                                    {booking.message || <span className="italic text-slate-400">Không có lời nhắn</span>}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-900 mb-1">Lịch đề xuất</h4>
                                                    <p className="text-sm text-slate-600">{booking.schedule_note || 'Không có'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-900 mb-1">Mức giá đề nghị</h4>
                                                    <p className="text-sm text-slate-600">
                                                        {booking.price_offer 
                                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.price_offer) 
                                                            : 'Theo giá của bạn'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                                            {booking.status === 'pending' ? (
                                                <div className="h-full flex flex-col justify-center">
                                                    <h4 className="text-sm font-medium text-slate-900 mb-3">Phản hồi yêu cầu</h4>
                                                    <div className="flex gap-3">
                                                        <Button 
                                                            onClick={() => handleAccept(booking.id)}
                                                            disabled={isActionLoading}
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                        >
                                                            Nhận lớp
                                                        </Button>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => openRejectDialog(booking)}
                                                            disabled={isActionLoading}
                                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : booking.status === 'accepted' ? (
                                                <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                    <p className="text-sm text-emerald-800 mb-2 font-medium">
                                                        Thông tin liên hệ của học sinh:
                                                    </p>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <Phone className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-sm font-medium">{booking.student?.phone || 'Chưa cập nhật SĐT'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <Mail className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-sm">{booking.student?.email}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2 border-t border-emerald-200 pt-2">
                                                        Bạn hãy chủ động liên hệ với học sinh để trao đổi chi tiết nhé.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-red-600">Bạn đã từ chối yêu cầu này.</p>
                                                    {booking.tutor_response_note && (
                                                        <div className="text-sm text-slate-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                                            <span className="font-medium text-red-800 block mb-1">Lý do từ chối:</span>
                                                            {booking.tutor_response_note}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-medium text-slate-900">Từ chối yêu cầu</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-slate-500">
                            Học sinh sẽ nhận được thông báo từ chối. Hãy để lại một lời nhắn nhỏ để học sinh biết lý do nhé.
                        </p>
                        <Textarea 
                            placeholder="VD: Xin lỗi, hiện tại lịch của mình đã kín..."
                            className="resize-none h-24 border-slate-200 focus-visible:ring-teal-500"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="border-slate-200 text-slate-600"
                        >
                            Hủy
                        </Button>
                        <Button 
                            onClick={handleReject}
                            disabled={isActionLoading || !rejectNote.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                            Xác nhận Từ chối
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
