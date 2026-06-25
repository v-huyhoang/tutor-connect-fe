'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { TutorProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TutorsListingPage() {
    const [tutors, setTutors] = useState<TutorProfile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Ideally, we'd fetch districts and subjects for the filter, but we keep it simple for now
    
    useEffect(() => {
        const fetchTutors = async () => {
            setIsLoading(true);
            try {
                // Build query params
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                
                const response = await api.get(`/api/tutors?${params.toString()}`);
                // API returns paginated data inside response.data.data
                setTutors(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách gia sư:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search slightly
        const delayDebounceFn = setTimeout(() => {
            fetchTutors();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Lấy ký tự đầu làm avatar fallback
    const getInitials = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    // Format tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-16 pb-12">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">
                        Tìm gia sư đồng hành
                    </h1>
                    <p className="text-base text-slate-600 max-w-[60ch] mb-8 leading-relaxed">
                        Khám phá đội ngũ gia sư đã được TutorConnect xác thực kỹ lưỡng. Chúng tôi ưu tiên sự tận tâm, chuyên môn và an toàn để bạn an tâm gửi gắm tương lai con em.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Tìm theo tên gia sư..."
                            className="pl-12 pr-4 py-6 rounded-2xl border-slate-200 bg-slate-50/50 text-base shadow-sm focus-visible:ring-teal-500 focus-visible:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="animate-pulse border-none shadow-sm rounded-2xl h-64 bg-slate-100/50" />
                        ))}
                    </div>
                ) : tutors.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Không tìm thấy gia sư</h3>
                        <p className="text-slate-500 mt-2">Thử điều chỉnh từ khóa tìm kiếm của bạn xem sao.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tutors.map((tutor) => (
                            <Link href={`/tutors/${tutor.id}`} key={tutor.id} className="group outline-none">
                                <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white overflow-hidden flex flex-col group-focus-visible:ring-2 group-focus-visible:ring-teal-500 group-focus-visible:ring-offset-2">
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        
                                        {/* Header: Avatar + Info */}
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-medium text-lg shrink-0 border border-teal-100">
                                                    {getInitials(tutor.user?.name || '')}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-900 text-base line-clamp-1 group-hover:text-teal-700 transition-colors">
                                                        {tutor.user?.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span className="line-clamp-1">{tutor.district?.name || 'Chưa cập nhật khu vực'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Signature Asymmetric Badge for Verification */}
                                            {tutor.verification_status === 'verified' && (
                                                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium px-2.5 py-1 flex items-center gap-1 rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm shadow-sm shrink-0">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    Đã xác thực
                                                </div>
                                            )}
                                        </div>

                                        {/* Body: Bio */}
                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6 flex-1">
                                            {tutor.bio || tutor.experience_description || 'Gia sư chưa cập nhật lời giới thiệu.'}
                                        </p>

                                        {/* Metrics Divider */}
                                        <div className="h-px w-full bg-slate-100 mb-4" />

                                        {/* Footer Metrics */}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-amber-500 font-medium">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span>{tutor.avg_rating > 0 ? tutor.avg_rating : 'Mới'}</span>
                                                </div>
                                                {tutor.total_reviews > 0 && (
                                                    <span className="text-slate-400 text-xs">({tutor.total_reviews} đánh giá)</span>
                                                )}
                                            </div>
                                            <div className="font-medium text-slate-900">
                                                {formatCurrency(tutor.hourly_rate_min)}
                                                <span className="text-slate-400 font-normal text-xs ml-1">/ giờ</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
