# 7. QUẢN LÝ GIỎ HÀNG

---

## 7.1. Thêm khóa học vào giỏ hàng

**Tác nhân:** Khách truy cập, Học viên

**Mô tả:**
- Người dùng thêm khóa học vào giỏ hàng để mua sau hoặc mua nhiều khóa học cùng lúc. Khách truy cập chưa đăng nhập vẫn có thể thêm vào giỏ hàng (lưu tạm trên trình duyệt)

**Đầu vào:**
- Mã khóa học cần thêm (có thể thêm một hoặc nhiều khóa học)

**Điều kiện cần:**
- Khóa học đã được xuất bản
- Khóa học chưa có trong giỏ hàng

**Nội dung quy trình xử lý:**

Nếu: Người dùng nhấn nút "Thêm vào giỏ hàng" trên trang chi tiết khóa học hoặc trang tìm kiếm
 Thì: Hệ thống kiểm tra khóa học đã có trong giỏ hàng chưa
  Nếu: Khóa học chưa có trong giỏ hàng
   Thì: Hệ thống kiểm tra trạng thái đăng nhập
    Nếu: Người dùng đã đăng nhập
     Thì: Hệ thống kiểm tra xem người dùng đã mua khóa học chưa
      Nếu: Người dùng chưa mua khóa học
       Thì: Hệ thống thêm khóa học vào giỏ hàng (lưu trên server), cập nhật số lượng giỏ hàng trên giao diện, thông báo "Đã thêm vào giỏ hàng"
       Không thì: Hệ thống thông báo "Bạn đã mua khóa học này"
    Không thì: Hệ thống thêm khóa học vào giỏ hàng tạm (lưu trên localStorage trình duyệt), cập nhật số lượng giỏ hàng trên giao diện, thông báo "Đã thêm vào giỏ hàng"
  Không thì: Hệ thống thông báo "Khóa học đã có trong giỏ hàng" (bỏ qua, không thêm trùng)
Không thì: Không thực hiện gì

**Đầu ra:**
- Khóa học được thêm vào giỏ hàng, số lượng giỏ hàng tăng / Thông báo khóa học đã tồn tại hoặc đã mua

---

## 7.2. Xóa khóa học khỏi giỏ hàng

**Tác nhân:** Khách truy cập, Học viên

**Mô tả:**
- Người dùng xóa khóa học không muốn mua khỏi giỏ hàng. Khách truy cập chưa đăng nhập cũng có thể xóa khóa học khỏi giỏ hàng tạm trên trình duyệt

**Đầu vào:**
- Mã khóa học cần xóa (có thể xóa một hoặc nhiều khóa học)

**Điều kiện cần:**
- Khóa học đang có trong giỏ hàng

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập trang giỏ hàng
 Thì: Hệ thống hiển thị danh sách khóa học trong giỏ hàng (tên, ảnh, giá, giảng viên, đánh giá) và tổng giá
  Nếu: Người dùng nhấn nút "Xóa" trên một khóa học cụ thể
   Thì: Hệ thống hiển thị xác nhận xóa
    Nếu: Người dùng xác nhận xóa
     Thì: Hệ thống kiểm tra trạng thái đăng nhập
      Nếu: Người dùng đã đăng nhập
       Thì: Hệ thống xóa khóa học khỏi giỏ hàng trên server, cập nhật lại tổng giá và số lượng giỏ hàng, thông báo "Đã xóa khỏi giỏ hàng"
       Không thì: Hệ thống xóa khóa học khỏi giỏ hàng tạm trên localStorage, cập nhật lại tổng giá và số lượng giỏ hàng trên giao diện, thông báo "Đã xóa khỏi giỏ hàng"
     Không thì: Không thực hiện gì
  Không thì: Người dùng tiếp tục xem giỏ hàng
Không thì: Không thực hiện gì

**Đầu ra:**
- Khóa học được xóa khỏi giỏ hàng, tổng giá cập nhật / Thông báo lỗi

---

## 7.3. Thanh toán giỏ hàng

**Tác nhân:** Khách truy cập, Học viên

**Mô tả:**
- Người dùng thanh toán tất cả khóa học trong giỏ hàng thông qua cổng thanh toán VnPay. Nếu chưa đăng nhập, hệ thống yêu cầu đăng nhập trước khi tiến hành thanh toán

**Đầu vào:**
- Danh sách khóa học trong giỏ hàng

**Điều kiện cần:**
- Giỏ hàng có ít nhất một khóa học
- Các khóa học trong giỏ hàng vẫn còn hiệu lực (đã xuất bản, chưa bị ẩn)

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập trang giỏ hàng và nhấn "Thanh toán"
 Thì: Hệ thống kiểm tra trạng thái đăng nhập
  Nếu: Người dùng chưa đăng nhập
   Thì: Hệ thống hiển thị form đăng nhập
    Nếu: Người dùng đăng nhập thành công
     Thì: Hệ thống đồng bộ giỏ hàng tạm (localStorage) lên server, tiếp tục quy trình thanh toán
     Không thì: Hệ thống hiển thị lỗi đăng nhập, người dùng không thể tiến hành thanh toán
  Không thì: Tiếp tục quy trình thanh toán
   Thì: Hệ thống kiểm tra giỏ hàng
    Nếu: Giỏ hàng có khóa học hợp lệ
     Thì: Hệ thống tạo hóa đơn (invoice) với danh sách khóa học và tổng số tiền, tính phần chiết khấu (hoa hồng) cho từng khóa học
      Nếu: Tạo hóa đơn thành công
       Thì: Hệ thống tạo đường dẫn thanh toán VnPay và điều hướng học viên đến trang thanh toán VnPay
        Nếu: Học viên hoàn tất thanh toán trên VnPay thành công
         Thì: Hệ thống nhận callback từ VnPay, cập nhật trạng thái hóa đơn thành "Đã mua" (purchased), cấp quyền truy cập tất cả khóa học cho học viên, xóa các khóa học đã mua khỏi giỏ hàng, cộng doanh thu cho giảng viên (trừ hoa hồng), thông báo mua thành công và điều hướng đến trang "Khóa học của tôi"
         Không thì:
          Nếu: Học viên hủy thanh toán hoặc thanh toán thất bại
           Thì: Hệ thống cập nhật trạng thái hóa đơn thành "Thất bại" (failed), giữ nguyên giỏ hàng, thông báo "Thanh toán thất bại, vui lòng thử lại"
           Không thì: Không thực hiện gì
      Không thì: Hệ thống thông báo lỗi tạo hóa đơn
    Không thì: Hệ thống thông báo "Giỏ hàng trống" hoặc "Có khóa học không còn khả dụng"
Không thì: Không thực hiện gì

**Đầu ra:**
- Thanh toán thành công, khóa học được cấp quyền truy cập / Form đăng nhập hiển thị nếu chưa đăng nhập / Thông báo thanh toán thất bại
