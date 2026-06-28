'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import api, { csrf } from '@/lib/api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Vui lòng nhập email hợp lệ'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    password_confirmation: z.string().min(8, 'Vui lòng xác nhận mật khẩu'),
    role: z.enum(['student', 'tutor'], {
        required_error: 'Vui lòng chọn vai trò',
    }),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["password_confirmation"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
            role: 'student',
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await csrf();
            await api.post('/api/register', data);
            // After successful registration, log them in automatically
            await api.post('/api/login', {
                email: data.email,
                password: data.password
            });
            const userResponse = await api.get('/api/me');
            
            const role = userResponse.data.role;
            if (role === 'student') {
                router.push('/student/dashboard');
            } else {
                router.push('/tutor/dashboard');
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
                <CardDescription>
                    Điền thông tin bên dưới để bắt đầu tìm kiếm hoặc giảng dạy.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div 
                            className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${selectedRole === 'student' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                            onClick={() => setValue('role', 'student')}
                        >
                            <div className="font-medium">Phụ huynh / Học sinh</div>
                            <div className="text-xs mt-1 opacity-70">Tìm kiếm gia sư</div>
                        </div>
                        <div 
                            className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${selectedRole === 'tutor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                            onClick={() => setValue('role', 'tutor')}
                        >
                            <div className="font-medium">Trở thành Gia sư</div>
                            <div className="text-xs mt-1 opacity-70">Giảng dạy và kết nối</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            {...register('name')}
                            className="rounded-xl"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="mail@example.com"
                            {...register('email')}
                            className="rounded-xl"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại (Tuỳ chọn)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="0901234567"
                            {...register('phone')}
                            className="rounded-xl"
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            className="rounded-xl"
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Xác nhận mật khẩu</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            {...register('password_confirmation')}
                            className="rounded-xl"
                        />
                        {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>}
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 hover:scale-[0.98] transition-transform mt-4" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
