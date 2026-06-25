'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { BookingRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Phone, Mail, BookOpen } from 'lucide-react';

export default function StudentBookingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [bookings, setBookings] = useState<BookingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { 
                    label: 'Đang chờ', 
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: <Clock className="w-3.5 h-3.5 mr-1" />
                };
            case 'accepted':
                return { 
                    label: 'Đã chấp nhận', 
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

    const handleLogout = async () => {
        try {
            await api.post('/api/logout');
        } catch (err) {
            console.error(err);
        } finally {
            window.location.href = '/login';
        }
    };

    if (isAuthLoading || isLoading) {
        return <div className="p-8 text-slate-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-medium text-slate-900">Yêu cầu đặt lịch của bạn</h1>
                    <p className="text-slate-500 mt-1">Theo dõi trạng thái các yêu cầu tìm gia sư bạn đã gửi.</p>
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
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có yêu cầu nào</h3>
                        <p className="text-slate-500 mb-6">Bạn chưa gửi yêu cầu đặt lịch nào cho gia sư.</p>
                        <Link href="/tutors" className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white shadow-sm h-10 px-6 rounded-xl text-sm font-medium transition-colors">
                            Tìm gia sư ngay
                        </Link>
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
                                                Gia sư: {booking.tutor?.name || 'Không rõ'}
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 mt-1">
                                                Ngày gửi: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
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
                                                <h4 className="text-sm font-medium text-slate-900 mb-1">Lời nhắn của bạn</h4>
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
                                                            : 'Thỏa thuận'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                                            <h4 className="text-sm font-medium text-slate-900 mb-3">Thông tin liên lạc</h4>
                                            {booking.status === 'accepted' ? (
                                                <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                    <p className="text-sm text-emerald-800 mb-2">
                                                        Gia sư đã chấp nhận yêu cầu. Bạn có thể liên hệ trực tiếp:
                                                    </p>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <Phone className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-sm font-medium">{booking.tutor?.phone || 'Chưa cập nhật SĐT'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <Mail className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-sm">{booking.tutor?.email}</span>
                                                    </div>
                                                </div>
                                            ) : booking.status === 'rejected' ? (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-red-600">Gia sư đã từ chối yêu cầu này.</p>
                                                    {booking.tutor_response_note && (
                                                        <div className="text-sm text-slate-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                                            <span className="font-medium text-red-800 block mb-1">Lý do:</span>
                                                            {booking.tutor_response_note}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    Thông tin liên lạc sẽ hiển thị khi gia sư chấp nhận yêu cầu của bạn.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
