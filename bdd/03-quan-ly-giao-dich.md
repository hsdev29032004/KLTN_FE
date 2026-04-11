# 3. QUẢN LÝ GIAO DỊCH

---

## 3.1. Trả lương cho giảng viên

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên xử lý trả lương (rút tiền) cho giảng viên dựa trên doanh thu từ khóa học đã bán, sau khi trừ phần chiết khấu (hoa hồng) của hệ thống

**Đầu vào:**
- Mã giao dịch, trạng thái phê duyệt (duyệt/từ chối)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Có yêu cầu rút tiền từ giảng viên đang ở trạng thái "Chờ xử lý" (pending)

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Trả lương cho giảng viên" (Quản lý giao dịch rút tiền)
 Thì: Hệ thống hiển thị danh sách các yêu cầu rút tiền từ giảng viên (tên giảng viên, số tiền, ngân hàng, số tài khoản, trạng thái)
  Nếu: Quản trị viên chọn một yêu cầu rút tiền để xem chi tiết
   Thì: Hệ thống hiển thị chi tiết giao dịch (thông tin giảng viên, số tiền, thông tin ngân hàng, lịch sử doanh thu)
    Nếu: Quản trị viên nhấn "Phê duyệt"
     Thì: Hệ thống cập nhật trạng thái giao dịch thành "Đã hoàn thành" (completed), trừ số dư khả dụng của giảng viên, thông báo cho giảng viên
     Không thì:
      Nếu: Quản trị viên nhấn "Từ chối"
       Thì: Hệ thống cập nhật trạng thái giao dịch thành "Bị từ chối" (rejected), hoàn trả số dư cho giảng viên, thông báo cho giảng viên
       Không thì: Không thực hiện gì
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Giao dịch rút tiền được phê duyệt/từ chối, giảng viên nhận thông báo / Thông báo lỗi
