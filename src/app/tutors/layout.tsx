import Navbar from '@/components/layout/Navbar';

export default function TutorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
