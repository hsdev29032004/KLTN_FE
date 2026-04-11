# 6. QUẢN LÝ HỆ THỐNG

---

## 6.1. Thiết lập thông số chung hệ thống

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên thiết lập các thông số cấu hình chung cho hệ thống (thông tin liên hệ, tỷ lệ hoa hồng, điều khoản sử dụng)

**Đầu vào:**
- Thông tin liên hệ (phone/email), tỷ lệ hoa hồng (%), điều khoản sử dụng

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Thiết lập thông số chung hệ thống"
 Thì: Hệ thống hiển thị form cấu hình với giá trị hiện tại (thông tin liên hệ, tỷ lệ hoa hồng, điều khoản sử dụng)
  Nếu: Quản trị viên chỉnh sửa thông số và nhấn "Lưu cấu hình"
   Thì: Hệ thống kiểm tra tính hợp lệ của thông số mới
    Nếu: Thông số hợp lệ (tỷ lệ hoa hồng từ 0-100%, thông tin liên hệ không trống)
     Thì: Hệ thống cập nhật cấu hình vào cơ sở dữ liệu, thông báo cập nhật thành công, các thay đổi có hiệu lực ngay lập tức
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Cấu hình hệ thống được cập nhật thành công / Thông báo lỗi

---

## 6.2. Thêm ngân hàng thanh toán

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên thêm tài khoản ngân hàng vào hệ thống để phục vụ việc thanh toán và rút tiền

**Đầu vào:**
- Tên ngân hàng, số tài khoản, tên người thụ hưởng

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Thêm ngân hàng thanh toán"
 Thì: Hệ thống hiển thị form nhập thông tin ngân hàng (tên ngân hàng, số tài khoản, tên người thụ hưởng)
  Nếu: Quản trị viên nhập thông tin và nhấn "Thêm ngân hàng"
   Thì: Hệ thống kiểm tra tính hợp lệ và trùng lặp
    Nếu: Thông tin hợp lệ (đầy đủ thông tin, số tài khoản chưa tồn tại)
     Thì: Hệ thống lưu thông tin ngân hàng vào cơ sở dữ liệu, thông báo thêm thành công
     Không thì: Hệ thống thông báo lỗi (thông tin thiếu hoặc số tài khoản đã tồn tại)
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Ngân hàng thanh toán được thêm thành công / Thông báo lỗi

---

## 6.3. Sửa ngân hàng thanh toán

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên chỉnh sửa thông tin tài khoản ngân hàng đã thêm vào hệ thống

**Đầu vào:**
- Mã ngân hàng, thông tin cần cập nhật (tên ngân hàng, số tài khoản, tên người thụ hưởng)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Ngân hàng tồn tại trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Sửa ngân hàng thanh toán" trên một ngân hàng cụ thể
 Thì: Hệ thống hiển thị form chỉnh sửa với thông tin hiện tại của ngân hàng
  Nếu: Quản trị viên chỉnh sửa thông tin và nhấn "Lưu thay đổi"
   Thì: Hệ thống kiểm tra tính hợp lệ
    Nếu: Thông tin hợp lệ (đầy đủ thông tin, số tài khoản mới không trùng với ngân hàng khác)
     Thì: Hệ thống cập nhật thông tin ngân hàng vào cơ sở dữ liệu, thông báo cập nhật thành công
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Thông tin ngân hàng được cập nhật thành công / Thông báo lỗi

---

## 6.4. Xóa ngân hàng thanh toán

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên xóa tài khoản ngân hàng khỏi hệ thống

**Đầu vào:**
- Mã ngân hàng cần xóa

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Ngân hàng tồn tại trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Xóa ngân hàng thanh toán" trên một ngân hàng cụ thể
 Thì: Hệ thống hiển thị hộp thoại xác nhận "Bạn có chắc chắn muốn xóa ngân hàng này?"
  Nếu: Quản trị viên xác nhận xóa
   Thì: Hệ thống kiểm tra xem ngân hàng có đang được sử dụng trong giao dịch chưa hoàn thành không
    Nếu: Ngân hàng không liên quan đến giao dịch chưa hoàn thành
     Thì: Hệ thống xóa ngân hàng khỏi cơ sở dữ liệu, thông báo xóa thành công
     Không thì: Hệ thống thông báo "Không thể xóa ngân hàng đang có giao dịch chưa hoàn thành"
  Không thì: Hệ thống đóng hộp thoại, không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Ngân hàng được xóa thành công / Thông báo lỗi không thể xóa
