'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface BookingRequestModalProps {
    tutorId: number;
    tutorName: string;
}

export function BookingRequestModal({ tutorId, tutorName }: BookingRequestModalProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form fields
    const [message, setMessage] = useState('');
    const [scheduleNote, setScheduleNote] = useState('');
    const [priceOffer, setPriceOffer] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!user) {
            window.location.href = '/login';
            return;
        }
        
        if (user.role !== 'student') {
            setError('Chỉ học sinh/phụ huynh mới có thể đặt lịch.');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/api/bookings', {
                tutor_id: tutorId,
                message,
                schedule_note: scheduleNote,
                price_offer: priceOffer ? Number(priceOffer) : null,
            });
            
            setSuccess('Đã gửi yêu cầu thành công! Gia sư sẽ sớm phản hồi.');
            // Reset form
            setMessage('');
            setScheduleNote('');
            setPriceOffer('');
            
            // Auto close after 2s
            setTimeout(() => {
                setOpen(false);
                setSuccess('');
            }, 2000);
        } catch (err: unknown) {
            import('axios').then((axios) => {
                if (axios.default.isAxiosError(err)) {
                    setError((err as Error).message || 'Có lỗi xảy ra, vui lòng thử lại.');
                } else {
                    setError('Có lỗi xảy ra, vui lòng thử lại.');
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger 
                render={<Button className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm h-12 rounded-xl text-base font-medium" />}
            >
                Gửi yêu cầu liên hệ
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-medium text-slate-900">Gửi yêu cầu cho {tutorName}</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Gia sư sẽ nhận được thông báo. Nếu đồng ý, hệ thống sẽ mở kết nối liên lạc giữa hai bên.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                {success}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="message" className="text-slate-700 font-medium">Lời nhắn giới thiệu</Label>
                            <Textarea
                                id="message"
                                placeholder="Xin chào, tôi muốn tìm gia sư Toán lớp 10 cho con..."
                                className="resize-none h-24 border-slate-200 focus-visible:ring-teal-500"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="schedule" className="text-slate-700 font-medium">Thời gian có thể học</Label>
                            <Input
                                id="schedule"
                                placeholder="VD: Tối thứ 2, 4, 6 từ 19h-21h"
                                className="border-slate-200 focus-visible:ring-teal-500"
                                value={scheduleNote}
                                onChange={(e) => setScheduleNote(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="price" className="text-slate-700 font-medium">Mức giá đề nghị (VNĐ / buổi) - Tùy chọn</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="VD: 200000"
                                className="border-slate-200 focus-visible:ring-teal-500"
                                value={priceOffer}
                                onChange={(e) => setPriceOffer(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={isLoading || success !== ''}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu ngay'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
