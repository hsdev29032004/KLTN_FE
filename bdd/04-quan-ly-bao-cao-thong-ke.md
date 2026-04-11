# 4. QUẢN LÝ BÁO CÁO THỐNG KÊ

---

## 4.1. Doanh thu

**Tác nhân:** Quản trị viên, Giảng viên

**Mô tả:**
- Quản trị viên xem báo cáo doanh thu tổng thể của hệ thống; Giảng viên xem doanh thu cá nhân từ các khóa học đã bán

**Đầu vào:**
- Bộ lọc: khoảng thời gian (từ ngày - đến ngày), theo giảng viên, theo khóa học

**Điều kiện cần:**
- Người dùng đã đăng nhập vào hệ thống
- Quản trị viên có quyền xem toàn bộ báo cáo; Giảng viên chỉ xem doanh thu của mình

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Báo cáo doanh thu"
 Thì: Hệ thống kiểm tra vai trò người dùng
  Nếu: Người dùng là Quản trị viên
   Thì: Hệ thống hiển thị trang báo cáo doanh thu tổng thể (tổng doanh thu, doanh thu nền tảng, doanh thu giảng viên, số giao dịch)
    Nếu: Quản trị viên chọn bộ lọc thời gian và nhấn "Xem báo cáo"
     Thì: Hệ thống truy vấn và hiển thị biểu đồ doanh thu theo thời gian, bảng doanh thu theo giảng viên, bảng doanh thu theo khóa học
     Không thì: Hệ thống hiển thị dữ liệu mặc định (tháng hiện tại)
    Nếu: Quản trị viên chọn xem chi tiết theo giảng viên
     Thì: Hệ thống hiển thị danh sách giảng viên với tổng doanh thu, thu nhập giảng viên, số lượng giao dịch
     Không thì: Không thực hiện gì
    Nếu: Quản trị viên chọn xem chi tiết theo khóa học
     Thì: Hệ thống hiển thị danh sách khóa học với tổng doanh thu, doanh thu nền tảng, số lượng bán
     Không thì: Không thực hiện gì
  Nếu: Người dùng là Giảng viên
   Thì: Hệ thống hiển thị trang thống kê cá nhân (tổng doanh thu cá nhân, số khóa học, số học viên)
    Nếu: Giảng viên chọn bộ lọc thời gian
     Thì: Hệ thống hiển thị doanh thu cá nhân theo khoảng thời gian đã chọn
     Không thì: Hệ thống hiển thị dữ liệu mặc định
  Không thì: Hệ thống thông báo không có quyền truy cập
Không thì: Không thực hiện gì

**Đầu ra:**
- Biểu đồ và bảng báo cáo doanh thu / Thông báo không có quyền

---

## 4.2. Khóa học

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên xem báo cáo thống kê về tình trạng khóa học trên hệ thống

**Đầu vào:**
- Bộ lọc: khoảng thời gian, trạng thái khóa học

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Thống kê khóa học"
 Thì: Hệ thống hiển thị trang báo cáo khóa học
  Nếu: Hệ thống truy vấn dữ liệu thành công
   Thì: Hệ thống hiển thị tổng quan (tổng số khóa học, phân bố theo trạng thái: nháp/chờ duyệt/đã xuất bản/bị từ chối)
    Nếu: Quản trị viên chọn bộ lọc thời gian hoặc trạng thái
     Thì: Hệ thống lọc và hiển thị dữ liệu theo tiêu chí
     Không thì: Hệ thống hiển thị tất cả dữ liệu
    Nếu: Quản trị viên chọn xem danh sách khóa học chờ duyệt
     Thì: Hệ thống hiển thị danh sách khóa học đang chờ phê duyệt với số lượng
     Không thì: Không thực hiện gì
   Không thì: Hệ thống thông báo lỗi tải dữ liệu
Không thì: Không thực hiện gì

**Đầu ra:**
- Biểu đồ và bảng thống kê khóa học / Thông báo lỗi

---

## 4.3. Tài khoản

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên xem báo cáo thống kê về người dùng trên hệ thống

**Đầu vào:**
- Bộ lọc: khoảng thời gian, vai trò người dùng

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Thống kê tài khoản"
 Thì: Hệ thống hiển thị trang báo cáo tài khoản người dùng
  Nếu: Hệ thống truy vấn dữ liệu thành công
   Thì: Hệ thống hiển thị tổng quan (tổng người dùng, số bị khóa, số bị xóa, phân bố theo vai trò)
    Nếu: Quản trị viên chọn bộ lọc thời gian
     Thì: Hệ thống hiển thị biểu đồ người dùng mới đăng ký theo thời gian, tổng tích lũy
     Không thì: Hệ thống hiển thị dữ liệu mặc định
    Nếu: Quản trị viên chọn xem danh sách người mua hàng nhiều nhất
     Thì: Hệ thống hiển thị bảng xếp hạng người mua hàng đầu (top buyers)
     Không thì: Không thực hiện gì
   Không thì: Hệ thống thông báo lỗi tải dữ liệu
Không thì: Không thực hiện gì

**Đầu ra:**
- Biểu đồ và bảng thống kê người dùng / Thông báo lỗi
