import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
    const isDashboard = request.nextUrl.pathname.startsWith('/student') || request.nextUrl.pathname.startsWith('/tutor') || request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/profile';

    // In a real implementation with Sanctum, we would verify the session cookie exists.
    // For now, we'll do a simple check. If they have laravel_session cookie, they are logged in.
    const hasSession = request.cookies.has('laravel_session') || request.cookies.has('XSRF-TOKEN');

    if (isAuthPage && hasSession) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isDashboard && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/register', '/student/:path*', '/tutor/:path*', '/admin/:path*', '/profile'],
};