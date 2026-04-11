# 5. QUẢN LÝ NGƯỜI DÙNG

---

## 5.1. Đăng ký

**Tác nhân:** Học viên, Giảng viên

**Mô tả:**
- Học viên và giảng viên tạo tài khoản mới để sử dụng hệ thống

**Đầu vào:**
- Thông tin đăng ký (email, mật khẩu, họ tên, vai trò: Học viên/Giảng viên)

**Điều kiện cần:**
- Chưa tồn tại tài khoản với email này trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Đăng ký"
 Thì: Hệ thống hiển thị form nhập thông tin đăng ký (email, mật khẩu, xác nhận mật khẩu, họ tên, chọn vai trò)
  Nếu: Người dùng nhập thông tin và nhấn "Đăng ký"
   Thì: Hệ thống kiểm tra tính hợp lệ và trùng lặp
    Nếu: Thông tin hợp lệ (email đúng định dạng, mật khẩu đủ mạnh, mật khẩu khớp) và email chưa tồn tại
     Thì: Hệ thống lưu tài khoản mới vào cơ sở dữ liệu, thông báo đăng ký thành công và điều hướng đến trang đăng nhập
     Không thì: Hệ thống thông báo lỗi cụ thể (email đã tồn tại, mật khẩu yếu, thông tin thiếu) và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Tài khoản mới được tạo thành công / Thông báo lỗi đăng ký thất bại

---

## 5.2. Đăng nhập

**Tác nhân:** Học viên, Giảng viên, Quản trị viên

**Mô tả:**
- Người dùng đăng nhập vào hệ thống để sử dụng các chức năng theo vai trò

**Đầu vào:**
- Email, mật khẩu

**Điều kiện cần:**
- Tài khoản đã tồn tại trong hệ thống
- Tài khoản chưa bị khóa hoặc xóa

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Đăng nhập"
 Thì: Hệ thống hiển thị form đăng nhập (email, mật khẩu)
  Nếu: Người dùng nhập email, mật khẩu và nhấn "Đăng nhập"
   Thì: Hệ thống kiểm tra thông tin đăng nhập
    Nếu: Email và mật khẩu chính xác
     Thì: Hệ thống kiểm tra trạng thái tài khoản
      Nếu: Tài khoản không bị khóa và chưa bị xóa
       Thì: Hệ thống tạo access token và refresh token, lưu vào cookie, điều hướng đến trang chính theo vai trò (Học viên -> trang chủ, Giảng viên -> dashboard, Quản trị viên -> admin dashboard)
       Không thì: Hệ thống thông báo "Tài khoản đã bị khóa" hoặc "Tài khoản không tồn tại"
     Không thì: Hệ thống thông báo "Email hoặc mật khẩu không chính xác" và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Đăng nhập thành công, điều hướng theo vai trò / Thông báo lỗi đăng nhập

---

## 5.3. Đăng xuất

**Tác nhân:** Học viên, Giảng viên, Quản trị viên

**Mô tả:**
- Người dùng đăng xuất khỏi hệ thống

**Đầu vào:**
- Không có

**Điều kiện cần:**
- Người dùng đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Người dùng nhấn nút "Đăng xuất"
 Thì: Hệ thống hiển thị hộp thoại xác nhận "Bạn có chắc chắn muốn đăng xuất?"
  Nếu: Người dùng xác nhận đăng xuất
   Thì: Hệ thống gọi API đăng xuất, xóa access token và refresh token khỏi cookie, xóa thông tin phiên đăng nhập, điều hướng về trang đăng nhập
   Không thì: Hệ thống đóng hộp thoại, không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Phiên đăng nhập kết thúc, điều hướng về trang đăng nhập

---

## 5.4. Quên mật khẩu

**Tác nhân:** Học viên, Giảng viên, Quản trị viên

**Mô tả:**
- Người dùng yêu cầu đặt lại mật khẩu khi quên mật khẩu hiện tại

**Đầu vào:**
- Email đã đăng ký

**Điều kiện cần:**
- Tài khoản với email này tồn tại trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Quên mật khẩu" (từ trang đăng nhập)
 Thì: Hệ thống hiển thị form nhập email
  Nếu: Người dùng nhập email và nhấn "Gửi yêu cầu"
   Thì: Hệ thống kiểm tra email trong cơ sở dữ liệu
    Nếu: Email tồn tại
     Thì: Hệ thống gửi email chứa đường dẫn đặt lại mật khẩu, thông báo "Vui lòng kiểm tra email để đặt lại mật khẩu"
      Nếu: Người dùng nhấn vào đường dẫn trong email
       Thì: Hệ thống hiển thị form nhập mật khẩu mới (mật khẩu mới, xác nhận mật khẩu)
        Nếu: Người dùng nhập mật khẩu mới và nhấn "Đặt lại mật khẩu"
         Thì: Hệ thống kiểm tra tính hợp lệ
          Nếu: Mật khẩu hợp lệ (đủ mạnh, khớp nhau)
           Thì: Hệ thống cập nhật mật khẩu mới, thông báo thành công, điều hướng về trang đăng nhập
           Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
        Không thì: Không thực hiện gì
      Không thì: Đường dẫn hết hạn sau thời gian quy định
     Không thì: Hệ thống thông báo "Email không tồn tại trong hệ thống"
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Mật khẩu được đặt lại thành công / Thông báo lỗi

---

## 5.5. Đổi mật khẩu

**Tác nhân:** Học viên, Giảng viên, Quản trị viên

**Mô tả:**
- Người dùng thay đổi mật khẩu hiện tại của tài khoản

**Đầu vào:**
- Mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới

**Điều kiện cần:**
- Người dùng đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Đổi mật khẩu" (từ trang cài đặt tài khoản)
 Thì: Hệ thống hiển thị form đổi mật khẩu (mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới)
  Nếu: Người dùng nhập thông tin và nhấn "Đổi mật khẩu"
   Thì: Hệ thống kiểm tra mật khẩu hiện tại và tính hợp lệ của mật khẩu mới
    Nếu: Mật khẩu hiện tại chính xác
     Thì: Hệ thống kiểm tra mật khẩu mới
      Nếu: Mật khẩu mới hợp lệ (đủ mạnh, khớp xác nhận, khác mật khẩu cũ)
       Thì: Hệ thống cập nhật mật khẩu mới vào cơ sở dữ liệu, thông báo đổi mật khẩu thành công
       Không thì: Hệ thống thông báo lỗi (mật khẩu yếu, không khớp, trùng mật khẩu cũ)
     Không thì: Hệ thống thông báo "Mật khẩu hiện tại không chính xác"
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Mật khẩu được thay đổi thành công / Thông báo lỗi

---

## 5.6. Chỉnh sửa thông tin tài khoản

**Tác nhân:** Học viên, Giảng viên, Quản trị viên

**Mô tả:**
- Người dùng chỉnh sửa thông tin cá nhân trên tài khoản

**Đầu vào:**
- Thông tin cần cập nhật (họ tên, ảnh đại diện, giới thiệu bản thân)

**Điều kiện cần:**
- Người dùng đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Chỉnh sửa thông tin tài khoản"
 Thì: Hệ thống hiển thị form thông tin cá nhân với dữ liệu hiện tại (họ tên, ảnh đại diện, giới thiệu)
  Nếu: Người dùng chỉnh sửa thông tin và nhấn "Lưu thay đổi"
   Thì: Hệ thống kiểm tra tính hợp lệ của thông tin mới
    Nếu: Thông tin hợp lệ (tên không trống, ảnh đúng định dạng)
     Thì: Hệ thống cập nhật thông tin vào cơ sở dữ liệu
      Nếu: Có thay đổi ảnh đại diện
       Thì: Hệ thống tải ảnh mới lên lưu trữ, cập nhật đường dẫn ảnh
       Không thì: Giữ nguyên ảnh cũ
      Thì: Hệ thống thông báo cập nhật thành công, cập nhật lại thông tin hiển thị trên giao diện
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Thông tin tài khoản được cập nhật thành công / Thông báo lỗi

---

## 5.7. Khóa tài khoản

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên khóa (ban) tài khoản người dùng vi phạm quy định, người dùng bị khóa sẽ không thể đăng nhập hoặc sử dụng hệ thống

**Đầu vào:**
- Mã người dùng, lý do khóa, thời gian khóa (tạm thời hoặc vĩnh viễn)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Tài khoản cần khóa tồn tại và chưa bị khóa

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Khóa tài khoản" trên một người dùng cụ thể
 Thì: Hệ thống hiển thị form khóa tài khoản (lý do, loại khóa: tạm thời/vĩnh viễn, thời gian mở khóa nếu tạm thời)
  Nếu: Quản trị viên nhập lý do và nhấn "Khóa tài khoản"
   Thì: Hệ thống kiểm tra thông tin
    Nếu: Thông tin hợp lệ (có lý do khóa)
     Thì: Hệ thống tạo bản ghi khóa (ban record), cập nhật trạng thái tài khoản, ghi nhận thời gian khóa/mở khóa
      Nếu: Đây là khóa tạm thời
       Thì: Hệ thống đặt thời gian tự động mở khóa (timeUnBan)
       Không thì: Tài khoản bị khóa vĩnh viễn
      Thì: Hệ thống thông báo khóa tài khoản thành công, người dùng bị khóa sẽ bị đăng xuất và không thể đăng nhập lại
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lý do
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Tài khoản bị khóa thành công / Thông báo lỗi

---

## 5.8. Phân quyền

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên phân quyền truy cập cho các vai trò trong hệ thống, xác định các chức năng và API mà mỗi vai trò được phép sử dụng

**Đầu vào:**
- Mã vai trò, danh sách quyền (permission) kèm phương thức HTTP (GET/POST/PUT/DELETE)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Phân quyền"
 Thì: Hệ thống hiển thị danh sách các vai trò (Role) trong hệ thống và quyền hiện tại của mỗi vai trò
  Nếu: Quản trị viên chọn một vai trò để chỉnh sửa quyền
   Thì: Hệ thống hiển thị danh sách tất cả các quyền (permission) với trạng thái bật/tắt cho vai trò đó
    Nếu: Quản trị viên thay đổi quyền (bật/tắt các quyền, chọn phương thức HTTP) và nhấn "Lưu thay đổi"
     Thì: Hệ thống cập nhật bảng quyền vai trò (rolePermissions) vào cơ sở dữ liệu
      Nếu: Cập nhật thành công
       Thì: Hệ thống thông báo phân quyền thành công, các thay đổi có hiệu lực ngay lập tức cho tất cả người dùng thuộc vai trò đó
       Không thì: Hệ thống thông báo lỗi cập nhật
    Không thì: Không thực hiện gì
  Nếu: Quản trị viên thay đổi vai trò của một người dùng cụ thể
   Thì: Hệ thống hiển thị form chọn vai trò mới cho người dùng
    Nếu: Quản trị viên chọn vai trò mới và nhấn "Cập nhật"
     Thì: Hệ thống cập nhật vai trò người dùng, thông báo thành công
     Không thì: Không thực hiện gì
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Quyền vai trò được cập nhật thành công / Thông báo lỗi phân quyền
