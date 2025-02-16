import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req) {
  const token = req.cookies.get('token');
  if (token) {
    const user = jwtDecode(token);
    if (user.role !== 'Admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } else {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: '/admin/:path*', // Apply middleware to admin routes
};