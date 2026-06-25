'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Profile form state (simplified for both student and tutor)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        grade_level: '', // student
        bio: '', // tutor
        experience_description: '', // tutor
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/me');
                const userData = response.data;
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    phone: userData.phone || '',
                    grade_level: userData.student_profile?.grade_level || '',
                    bio: userData.tutor_profile?.bio || '',
                    experience_description: userData.tutor_profile?.experience_description || '',
                });
            } catch (err: unknown) {
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            if (user?.role === 'student') {
                await api.put('/api/student-profile', {
                    grade_level: formData.grade_level,
                });
            } else if (user?.role === 'tutor') {
                await api.put('/api/tutor-profile', {
                    bio: formData.bio,
                    experience_description: formData.experience_description,
                });
            }
            setMessage('Lưu hồ sơ thành công.');
        } catch (err: unknown) {
            setMessage('Có lỗi xảy ra khi lưu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await api.post('/api/logout');
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse bg-slate-200 h-32 w-full max-w-md rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
                    <Button variant="outline" onClick={handleLogout} className="rounded-xl border-slate-200">
                        Đăng xuất
                    </Button>
                </div>

                <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Thông tin chung</CardTitle>
                        <CardDescription>Vai trò: <span className="font-medium text-blue-600 capitalize">{user?.role}</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            {message && (
                                <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label>Họ và tên</Label>
                                <Input disabled value={formData.name} className="rounded-xl bg-slate-100" />
                            </div>

                            <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                <Input disabled value={formData.phone} className="rounded-xl bg-slate-100" />
                            </div>

                            {user?.role === 'student' && (
                                <div className="space-y-2">
                                    <Label>Cấp lớp (VD: Lớp 10)</Label>
                                    <Input 
                                        value={formData.grade_level} 
                                        onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                                        className="rounded-xl"
                                        placeholder="Nhập cấp lớp..."
                                    />
                                </div>
                            )}

                            {user?.role === 'tutor' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Giới thiệu bản thân (Bio)</Label>
                                        <Input 
                                            value={formData.bio} 
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            className="rounded-xl"
                                            placeholder="Giới thiệu ngắn về bạn..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kinh nghiệm giảng dạy</Label>
                                        <Input 
                                            value={formData.experience_description} 
                                            onChange={(e) => setFormData({...formData, experience_description: e.target.value})}
                                            className="rounded-xl"
                                            placeholder="Bạn đã từng dạy những lớp nào?"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <Button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
