'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
    email: z.string().email('Vui lòng nhập email hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { user, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (!isAuthLoading && user) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/api/login', data);
            const userResponse = await api.get('/api/me');
            
            const role = userResponse.data.role;
            if (role === 'student') {
                router.push('/student/bookings');
            } else if (role === 'tutor') {
                router.push('/tutor/bookings');
            } else {
                router.push('/admin/verifications');
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Đăng nhập</CardTitle>
                <CardDescription>
                    Nhập email và mật khẩu để truy cập tài khoản của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="mail@example.com"
                            {...register('email')}
                            className="rounded-xl"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            className="rounded-xl"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 hover:scale-[0.98] transition-transform" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="font-medium text-blue-600 hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
