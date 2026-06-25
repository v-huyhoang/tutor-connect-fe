'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, ShieldCheck, Clock, GraduationCap, Video } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { TutorProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { BookingRequestModal } from '@/components/tutors/BookingRequestModal';

export default function TutorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [tutor, setTutor] = useState<TutorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const response = await api.get(`/api/tutors/${params.id}`);
                setTutor(response.data.data);
            } catch (error) {
                console.error("Lỗi tải thông tin gia sư", error);
                // Return to list if not found
                router.push('/tutors');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchTutor();
        }
    }, [params.id, router]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getInitials = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full" />
                    <div className="w-32 h-4 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    if (!tutor) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Top Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
                    <Link href="/tutors" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-8 md:mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Header Profile Card */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-medium text-2xl shrink-0 border border-teal-100">
                                        {getInitials(tutor.user?.name || '')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-2xl font-medium text-slate-900">{tutor.user?.name}</h1>
                                            {tutor.verification_status === 'verified' && (
                                                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium px-2.5 py-1 flex items-center gap-1 rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm shadow-sm">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    Đã xác thực
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {tutor.district?.name || 'Chưa cập nhật khu vực'}
                                            </span>
                                            {tutor.avg_rating > 0 && (
                                                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    {tutor.avg_rating} ({tutor.total_reviews} đánh giá)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 leading-relaxed text-base">
                                            {tutor.bio || 'Chưa cập nhật lời giới thiệu ngắn.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detailed Sections */}
                        <div className="space-y-8 mt-8">
                            {/* Học vấn & Kinh nghiệm */}
                            <section>
                                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-teal-600" />
                                    Học vấn & Kinh nghiệm
                                </h3>
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                                    <div>
                                        <span className="text-sm text-slate-500 block mb-1">Trường/Ngành học</span>
                                        <p className="text-slate-800">{tutor.education_description || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="h-px bg-slate-100 w-full" />
                                    <div>
                                        <span className="text-sm text-slate-500 block mb-1">Kinh nghiệm giảng dạy</span>
                                        <p className="text-slate-800">{tutor.experience_description || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Video giới thiệu (Nếu có) */}
                            {tutor.video_url && (
                                <section>
                                    <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                                        <Video className="w-5 h-5 text-teal-600" />
                                        Video giới thiệu
                                    </h3>
                                    <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center text-slate-400">
                                        {/* Mocking video iframe placeholder */}
                                        <span>Video Player Placeholder</span>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="md:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="text-center mb-6">
                                        <div className="text-sm text-slate-500 mb-1">Học phí đề nghị</div>
                                        <div className="text-2xl font-medium text-slate-900">
                                            {formatCurrency(tutor.hourly_rate_min)}
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">
                                            đến {formatCurrency(tutor.hourly_rate_max)} / giờ
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start gap-3 text-sm text-slate-600">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <p>Danh tính và bằng cấp đã được kiểm duyệt bởi TutorConnect.</p>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm text-slate-600">
                                            <Clock className="w-5 h-5 text-teal-600 shrink-0" />
                                            <p>Gia sư thường phản hồi trong vòng 24 giờ.</p>
                                        </div>
                                    </div>

                                    {/* Component Đặt lịch */}
                                    <BookingRequestModal 
                                        tutorId={tutor.user_id} 
                                        tutorName={tutor.user?.name || 'Gia sư'} 
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
