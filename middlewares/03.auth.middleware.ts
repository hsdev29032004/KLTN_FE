import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { publicRoutes } from '@/constants/public-routes.constant';

interface TokenPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

// Kiểm tra xem path có trong publicRoutes không
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    // Exact match
    if (route === pathname) return true;
    
    // Pattern match (ví dụ: /courses/:id)
    const routePattern = route
      .replace(/:[^\s/]+/g, '[^/]+') // Thay :id bằng [^/]+
      .replace(/\*/g, '.*');
    
    return new RegExp(`^${routePattern}$`).test(pathname);
  });
}

// Redirect sang trang login và xóa cookies
function redirectToLogin(request: NextRequest): NextResponse {
  const loginResponse = NextResponse.redirect(new URL('/login', request.url));
  loginResponse.cookies.delete('accessToken');
  loginResponse.cookies.delete('refreshToken');
  return loginResponse;
}

export async function authMiddleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const accessToken = request.cookies.get('accessToken')?.value || '';
  const refreshToken = request.cookies.get('refreshToken')?.value || '';

  try {
    // Decode token để lấy thời gian hết hạn
    const decoded = jwtDecode<TokenPayload>(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - currentTime;    
    
    // Tính tổng thời gian sống của token
    const totalDuration = decoded.exp - decoded.iat;
    // Threshold: quá 2/3 hạn (còn lại 1/3) thì refresh
    const refreshThreshold = totalDuration / 3;

    // Nếu token còn hợp lệ và chưa quá 2/3 hạn, tiếp tục
    if (expiresIn > refreshThreshold) {
      return NextResponse.next();
    }

    // Token sắp hết hạn hoặc đã hết, thực hiện refresh
    if (refreshToken) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Tạo response và gắn token mới vào cookie
        const nextResponse = NextResponse.next();
        nextResponse.cookies.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 600, // 600 seconds
        });
        nextResponse.cookies.set('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 8640000, // 100 days
        });

        return nextResponse;
      } else {
        // Refresh token thất bại hoặc hết hạn, đá sang trang login
        if(!isPublicRoute(pathname)) redirectToLogin(request);
      }
    }
    if(!isPublicRoute(pathname)) redirectToLogin(request);
  } catch (error) {
    // Token không hợp lệ hoặc lỗi decode, đá sang trang login
    console.log(pathname);
    console.log(!isPublicRoute(pathname));
    
    if(!isPublicRoute(pathname)){
      return redirectToLogin(request);
    };
  }
}