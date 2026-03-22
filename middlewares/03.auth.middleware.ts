import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { publicRoutes } from '@/constants/public-routes.constant';
import SDK from '@/stores/sdk';
import { isPublicRoute } from '@/helpers/route.helper';

interface TokenPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

// Redirect sang trang login và xóa cookies
function redirectToLogin(request: NextRequest, pathname: string, search: string): NextResponse {
  const loginResponse = NextResponse.redirect(new URL('/login', request.url));
  loginResponse.cookies.delete('access_token');
  loginResponse.cookies.delete('refresh_token');
  loginResponse.headers.set('x-pathname', pathname);
  loginResponse.headers.set('x-search', search);
  return loginResponse;
}

export async function authMiddleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const search = new URL(request.url).search;
  const accessToken = request.cookies.get('access_token')?.value || '';
  const refreshToken = request.cookies.get('refresh_token')?.value || '';

  // Tạo instance MỚI với tokens của request này
  const sdk = new SDK(accessToken, refreshToken);

  let needsRefresh = false;

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
      const res = NextResponse.next();
      res.headers.set('x-pathname', pathname);
      res.headers.set('x-search', search);
      return res;
    }

    // Token sắp hết hạn, cần refresh
    needsRefresh = true;
  } catch (error) {
    // Token không hợp lệ hoặc đã hết hạn, cần refresh
    needsRefresh = true;
  }

  // Thử refresh token nếu cần
  if (needsRefresh && refreshToken) {
    try {
      const response = await sdk.refreshToken();

      // Lấy set-cookie từ response headers của NestJS
      const setCookieHeader = response.headers['set-cookie'];

      const nextResponse = NextResponse.next();

      // Parse và set cookies vào NextResponse
      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

        cookies.forEach((cookie: string) => {
          // Parse cookie string: "access_token=value; HttpOnly; Path=/; Max-Age=300"
          const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim());
          const [name, value] = nameValue.split('=');

          // Extract attributes
          const cookieOptions: any = {
            httpOnly: attributes.some(attr => attr.toLowerCase() === 'httponly'),
            secure: attributes.some(attr => attr.toLowerCase() === 'secure'),
            sameSite: 'lax' as const,
          };

          // Extract maxAge
          const maxAgeAttr = attributes.find(attr => attr.toLowerCase().startsWith('max-age='));
          if (maxAgeAttr) {
            // NestJS set maxAge in milliseconds, Next.js needs seconds
            cookieOptions.maxAge = parseInt(maxAgeAttr.split('=')[1]);
          }

          nextResponse.cookies.set(name, value, cookieOptions);
        });
      }

      nextResponse.headers.set('x-pathname', pathname);
      nextResponse.headers.set('x-search', search);
      return nextResponse;
    } catch (error) {
      if (!isPublicRoute(pathname)) return redirectToLogin(request, pathname, search);
    }
  }

  // Không có refresh token hoặc là public route
  if (!isPublicRoute(pathname)) {
    return redirectToLogin(request, pathname, search);
  }

  const res = NextResponse.next();
  res.headers.set('x-pathname', pathname);
  res.headers.set('x-search', search);
  return res;
}