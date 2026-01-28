import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Tentukan Rute
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = ['/login', '/register'].includes(pathname);

  // 2. Logic Jika BELUM Login (Tidak ada Token)
  if (!token) {
    // Jika coba masuk ke Admin atau Dashboard tanpa token -> Tendang ke Login
    if (isAdminRoute || isUserRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Izinkan akses ke Landing Page, Login, Register
    return NextResponse.next();
  }

  // 3. Logic Jika SUDAH Login (Ada Token)
  // Kita perlu decode Token untuk tahu Role-nya (tanpa library berat)
  let userRole = 'student';
  try {
    // JWT format: header.payload.signature. Kita ambil payload (tengah)
    const payload = token.split('.')[1];
    // Decode Base64
    const decodedValue = JSON.parse(atob(payload));
    userRole = decodedValue.role || 'student';
  } catch (e) {
    // Jika token rusak, paksa logout
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // A. Jika User yang sudah login mencoba buka Login/Register -> Arahkan ke Dashboard masing-masing
  if (isAuthRoute) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // B. Proteksi Rute Admin
  // Jika Siswa coba masuk /admin -> Tendang ke /dashboard siswa
  if (isAdminRoute && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // C. Proteksi Rute Siswa (Opsional, agar rapi)
  // Jika Admin coba masuk /dashboard biasa -> Arahkan ke /admin/dashboard
  if (isUserRoute && userRole === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang dijaga oleh Middleware ini
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};