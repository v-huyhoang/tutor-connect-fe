'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type DocumentStatus = {
    status: 'missing' | 'submitted' | 'approved' | 'rejected';
    url: string | null;
    admin_note: string | null;
};

type VerificationStatus = {
    verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
    rejection_reason: string | null;
    checklist: {
        avatar: DocumentStatus;
        cccd_front: DocumentStatus;
        cccd_back: DocumentStatus;
        degree: DocumentStatus;
        intro_video: DocumentStatus;
    };
};

export default function TutorVerificationPage() {
    const router = useRouter();
    const [status, setStatus] = useState<VerificationStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await api.get('/api/tutor-profile/verification-status');
                setStatus(response.data);
            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const error = err as any;
                if (error.response?.status === 401 || error.response?.status === 403) {
                    router.push('/login');
                } else {
                    setMessage({ type: 'error', text: 'Không thể tải trạng thái xác thực.' });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [router]);

    const handleUpload = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        setUploading(type);
        setMessage(null);

        try {
            await api.post('/api/tutor-profile/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage({ type: 'success', text: 'Tải tài liệu lên thành công!' });
            await fetchStatus();
        } catch (err: unknown) {
            setMessage({ type: 'error', text: (err as Error).message || 'Lỗi khi tải file.' });
        } finally {
            setUploading(null);
            if (e.target) e.target.value = ''; // reset input
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Đang tải...</div>;
    }

    const docConfig = [
        { key: 'avatar', label: 'Ảnh đại diện (Rõ mặt)' },
        { key: 'cccd_front', label: 'Mặt trước CCCD' },
        { key: 'cccd_back', label: 'Mặt sau CCCD' },
        { key: 'degree', label: 'Bằng cấp / Thẻ sinh viên' },
        { key: 'intro_video', label: 'Video giới thiệu (Tùy chọn)' },
    ];

    const getStatusBadge = (docStatus: DocumentStatus['status']) => {
        switch (docStatus) {
            case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Đã duyệt</span>;
            case 'submitted': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Đang chờ duyệt</span>;
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Bị từ chối</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Chưa có</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Xác thực hồ sơ Gia sư</h1>
                    <p className="text-slate-500 mt-2">Vui lòng tải lên các tài liệu cần thiết để chúng tôi xác thực hồ sơ của bạn. Hồ sơ chỉ được hiển thị khi đã được duyệt.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {message.text}
                    </div>
                )}

                <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Trạng thái tổng thể: {
                            status?.verification_status === 'verified' ? <span className="text-green-600">Đã xác thực</span> : 
                            status?.verification_status === 'rejected' ? <span className="text-red-600">Bị từ chối</span> : 
                            <span className="text-yellow-600">Chờ duyệt</span>
                        }</CardTitle>
                        {status?.rejection_reason && (
                            <CardDescription className="text-red-600">Lý do từ chối: {status.rejection_reason}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {docConfig.map(config => {
                            const doc = status?.checklist[config.key as keyof typeof status.checklist];
                            const isEditable = !doc || doc.status === 'missing' || doc.status === 'rejected';

                            return (
                                <div key={config.key} className="border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Label className="text-base font-medium">{config.label}</Label>
                                            {getStatusBadge(doc?.status || 'missing')}
                                        </div>
                                        {doc?.admin_note && (
                                            <p className="text-sm text-red-500 mt-1">Lưu ý từ Admin: {doc.admin_note}</p>
                                        )}
                                        {doc?.url && (
                                            <a href={'http://localhost:8000' + doc.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                                                Xem tài liệu đã tải lên
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isEditable ? (
                                            <div className="relative">
                                                <Input 
                                                    type="file" 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => handleUpload(config.key, e)}
                                                    disabled={uploading === config.key}
                                                />
                                                <Button type="button" disabled={uploading === config.key} variant="outline" className="w-full md:w-auto rounded-xl border-slate-200">
                                                    {uploading === config.key ? 'Đang tải lên...' : 'Tải lên tài liệu'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">Không thể thay đổi</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
