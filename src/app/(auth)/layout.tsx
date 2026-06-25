export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">TutorConnect</h1>
                    <p className="text-slate-500 mt-2">Connect with the best tutors in your area.</p>
                </div>
                {children}
            </div>
        </div>
    );
}
