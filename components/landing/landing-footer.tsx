import Link from 'next/link';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 py-12 px-2 md:px-4 lg:px-8">
          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Teaching */}
          <div>
            <h4 className="mb-4 font-semibold">Giảng dạy</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/teach" className="hover:text-foreground transition-colors">
                  Trở thành giảng viên
                </Link>
              </li>
              <li>
                <Link href="/instructor-guide" className="hover:text-foreground transition-colors">
                  Hướng dẫn giảng viên
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-foreground transition-colors">
                  Tài nguyên
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">ONLEARN</h3>
            <p className="text-sm text-muted-foreground">
              Nền tảng học tập trực tuyến hàng đầu Việt Nam. Học mọi lúc, mọi nơi với các khóa học chất lượng cao.
            </p>
          </div>
        </div>

        <div className="border-t py-2 text-center text-sm text-muted-foreground">
          <p>© {currentYear} ONLEARN</p>
        </div>
      </div>
    </footer>
  );
}
