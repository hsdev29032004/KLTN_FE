# 1. QUẢN LÝ KHÓA HỌC

---

## 1.1. Tạo khóa học

**Tác nhân:** Giảng viên

**Mô tả:**
- Giảng viên tạo khóa học mới trên hệ thống để cung cấp nội dung học tập cho học viên

**Đầu vào:**
- Tên khóa học, mô tả, nội dung chi tiết, giá, ảnh đại diện, chủ đề/danh mục

**Điều kiện cần:**
- Giảng viên đã đăng nhập vào hệ thống
- Giảng viên có quyền tạo khóa học

**Nội dung quy trình xử lý:**

Nếu: Giảng viên truy cập chức năng "Tạo khóa học"
 Thì: Hệ thống hiển thị form nhập thông tin khóa học (tên, mô tả, nội dung, giá, ảnh đại diện, chủ đề)
  Nếu: Giảng viên nhập đầy đủ thông tin và nhấn "Tạo khóa học"
   Thì: Hệ thống kiểm tra tính hợp lệ của thông tin
    Nếu: Thông tin hợp lệ (tên không trống, giá >= 0, ảnh đúng định dạng)
     Thì: Hệ thống lưu khóa học với trạng thái "Nháp" (draft), thông báo tạo thành công và điều hướng đến trang quản lý khóa học
     Không thì: Hệ thống hiển thị thông báo lỗi cụ thể và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Khóa học mới được tạo với trạng thái "Nháp" / Thông báo lỗi tạo khóa học thất bại

---

## 1.2. Sửa khóa học

**Tác nhân:** Giảng viên

**Mô tả:**
- Giảng viên chỉnh sửa thông tin khóa học đã tạo

**Đầu vào:**
- Thông tin khóa học cần cập nhật (tên, mô tả, nội dung, giá, ảnh đại diện, chủ đề)

**Điều kiện cần:**
- Giảng viên đã đăng nhập vào hệ thống
- Khóa học thuộc sở hữu của giảng viên
- Khóa học chưa bị xóa

**Nội dung quy trình xử lý:**

Nếu: Giảng viên truy cập chức năng "Sửa khóa học" trên một khóa học cụ thể
 Thì: Hệ thống hiển thị form chỉnh sửa với thông tin hiện tại của khóa học
  Nếu: Giảng viên chỉnh sửa thông tin và nhấn "Lưu thay đổi"
   Thì: Hệ thống kiểm tra tính hợp lệ của thông tin mới
    Nếu: Thông tin hợp lệ
     Thì: Hệ thống cập nhật thông tin khóa học vào cơ sở dữ liệu, thông báo cập nhật thành công
      Nếu: Khóa học đang ở trạng thái "Đã xuất bản" (published)
       Thì: Hệ thống chuyển trạng thái khóa học sang "Cập nhật" (update) và yêu cầu duyệt lại
       Không thì: Giữ nguyên trạng thái hiện tại
     Không thì: Hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Thông tin khóa học được cập nhật thành công / Thông báo lỗi cập nhật thất bại

---

## 1.3. Ẩn khóa học

**Tác nhân:** Giảng viên, Quản trị viên

**Mô tả:**
- Giảng viên hoặc quản trị viên ẩn (xóa mềm) khóa học khỏi hệ thống, khóa học sẽ không còn hiển thị cho học viên

**Đầu vào:**
- Mã khóa học cần ẩn

**Điều kiện cần:**
- Người dùng đã đăng nhập vào hệ thống
- Khóa học tồn tại và chưa bị ẩn
- Giảng viên là chủ sở hữu khóa học hoặc người dùng là quản trị viên

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Ẩn khóa học" trên một khóa học cụ thể
 Thì: Hệ thống hiển thị hộp thoại xác nhận "Bạn có chắc chắn muốn ẩn khóa học này?"
  Nếu: Người dùng xác nhận ẩn khóa học
   Thì: Hệ thống đánh dấu khóa học là đã xóa (xóa mềm), cập nhật thời gian xóa
    Nếu: Xóa mềm thành công
     Thì: Hệ thống thông báo ẩn khóa học thành công, khóa học không còn hiển thị trên danh sách công khai
     Không thì: Hệ thống thông báo lỗi
  Không thì: Hệ thống đóng hộp thoại, không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Khóa học được ẩn khỏi hệ thống / Thông báo lỗi

---

## 1.4. Kiểm duyệt khóa học

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên xem xét và phê duyệt hoặc từ chối khóa học do giảng viên gửi yêu cầu xuất bản

**Đầu vào:**
- Mã khóa học cần duyệt, lý do từ chối (nếu từ chối)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Khóa học có trạng thái "Chờ duyệt" (pending)

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Kiểm duyệt khóa học"
 Thì: Hệ thống hiển thị danh sách các khóa học đang chờ duyệt
  Nếu: Quản trị viên chọn một khóa học để xem chi tiết
   Thì: Hệ thống hiển thị đầy đủ thông tin khóa học (nội dung, bài học, đề thi, giảng viên)
    Nếu: Quản trị viên nhấn "Phê duyệt"
     Thì: Hệ thống chuyển trạng thái khóa học sang "Đã xuất bản" (published), ghi nhận người duyệt và thời gian duyệt, thông báo cho giảng viên
     Không thì:
      Nếu: Quản trị viên nhấn "Từ chối" và nhập lý do từ chối
       Thì: Hệ thống chuyển trạng thái khóa học sang "Bị từ chối" (rejected), lưu lý do từ chối, thông báo cho giảng viên
       Không thì: Không thực hiện gì
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Khóa học được xuất bản thành công / Khóa học bị từ chối kèm lý do

---

## 1.5. Tìm kiếm khóa học

**Tác nhân:** Học viên, Giảng viên, Quản trị viên

**Mô tả:**
- Người dùng tìm kiếm khóa học theo nhiều tiêu chí khác nhau

**Đầu vào:**
- Từ khóa tìm kiếm, bộ lọc (chủ đề, khoảng giá, đánh giá, giảng viên)

**Điều kiện cần:**
- Không yêu cầu đăng nhập (tìm kiếm công khai)

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Tìm kiếm khóa học"
 Thì: Hệ thống hiển thị trang tìm kiếm với ô nhập từ khóa và các bộ lọc
  Nếu: Người dùng nhập từ khóa và/hoặc chọn bộ lọc rồi nhấn "Tìm kiếm"
   Thì: Hệ thống truy vấn danh sách khóa học đã xuất bản phù hợp với tiêu chí
    Nếu: Có kết quả phù hợp
     Thì: Hệ thống hiển thị danh sách khóa học (tên, ảnh, giá, đánh giá, giảng viên, số học viên) với phân trang
     Không thì: Hệ thống hiển thị thông báo "Không tìm thấy khóa học phù hợp"
  Không thì: Hệ thống hiển thị tất cả khóa học đã xuất bản
Không thì: Không thực hiện gì

**Đầu ra:**
- Danh sách khóa học phù hợp với tiêu chí tìm kiếm / Thông báo không có kết quả

---

## 1.6. Mua khóa học

**Tác nhân:** Học viên

**Mô tả:**
- Học viên mua khóa học để có quyền truy cập nội dung học tập

**Đầu vào:**
- Danh sách mã khóa học cần mua

**Điều kiện cần:**
- Học viên đã đăng nhập vào hệ thống
- Khóa học đã được xuất bản
- Học viên chưa mua khóa học này trước đó

**Nội dung quy trình xử lý:**

Nếu: Học viên truy cập chức năng "Mua khóa học" (từ giỏ hàng hoặc trang chi tiết khóa học)
 Thì: Hệ thống tạo hóa đơn với danh sách khóa học và tổng số tiền
  Nếu: Hệ thống tạo hóa đơn thành công
   Thì: Hệ thống tạo đường dẫn thanh toán VnPay và điều hướng học viên đến trang thanh toán
    Nếu: Học viên hoàn tất thanh toán trên VnPay
     Thì: Hệ thống cập nhật trạng thái hóa đơn thành "Đã mua" (purchased), cấp quyền truy cập khóa học cho học viên, thông báo mua thành công
     Không thì: Hệ thống cập nhật trạng thái hóa đơn thành "Thất bại" (failed), thông báo thanh toán thất bại
   Không thì: Hệ thống thông báo lỗi tạo hóa đơn
Không thì: Không thực hiện gì

**Đầu ra:**
- Học viên được cấp quyền truy cập khóa học / Thông báo lỗi mua khóa học thất bại

---

## 1.7. Đánh giá khóa học

**Tác nhân:** Học viên

**Mô tả:**
- Học viên đánh giá và nhận xét về khóa học đã mua

**Đầu vào:**
- Mã khóa học, số sao đánh giá (1-5), nội dung nhận xét

**Điều kiện cần:**
- Học viên đã đăng nhập vào hệ thống
- Học viên đã mua khóa học này

**Nội dung quy trình xử lý:**

Nếu: Học viên truy cập chức năng "Đánh giá khóa học" trên trang chi tiết khóa học
 Thì: Hệ thống hiển thị form đánh giá (chọn số sao, nhập nhận xét)
  Nếu: Học viên chọn số sao, nhập nhận xét và nhấn "Gửi đánh giá"
   Thì: Hệ thống kiểm tra tính hợp lệ của đánh giá
    Nếu: Thông tin hợp lệ (số sao từ 1-5, nội dung không trống)
     Thì: Hệ thống lưu đánh giá vào cơ sở dữ liệu, cập nhật điểm đánh giá trung bình của khóa học, hiển thị đánh giá mới trên trang khóa học
     Không thì: Hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Đánh giá được lưu thành công, điểm trung bình khóa học được cập nhật / Thông báo lỗi

---

## 1.8. Hội thoại

**Tác nhân:** Học viên, Giảng viên

**Mô tả:**
- Học viên và giảng viên trao đổi, thảo luận trong khóa học thông qua hệ thống tin nhắn thời gian thực

**Đầu vào:**
- Nội dung tin nhắn

**Điều kiện cần:**
- Người dùng đã đăng nhập vào hệ thống
- Học viên đã mua khóa học hoặc giảng viên là chủ sở hữu khóa học

**Nội dung quy trình xử lý:**

Nếu: Người dùng truy cập chức năng "Hội thoại" của một khóa học
 Thì: Hệ thống hiển thị danh sách cuộc hội thoại mà người dùng tham gia
  Nếu: Người dùng chọn một cuộc hội thoại
   Thì: Hệ thống hiển thị lịch sử tin nhắn với phân trang, danh sách thành viên, thông tin khóa học
    Nếu: Người dùng nhập tin nhắn và nhấn "Gửi"
     Thì: Hệ thống kiểm tra nội dung tin nhắn
      Nếu: Tin nhắn hợp lệ (không trống)
       Thì: Hệ thống lưu tin nhắn, phát tin nhắn đến tất cả thành viên qua WebSocket thời gian thực
       Không thì: Không gửi tin nhắn
    Không thì: Người dùng chỉ xem lịch sử tin nhắn
  Không thì: Người dùng xem danh sách cuộc hội thoại
Không thì: Không thực hiện gì

**Đầu ra:**
- Tin nhắn được gửi thành công đến tất cả thành viên / Lịch sử hội thoại được hiển thị

---

## 1.9. Thêm danh mục khóa học

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên thêm danh mục (chủ đề) mới để phân loại khóa học

**Đầu vào:**
- Tên danh mục, slug (đường dẫn thân thiện)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Tên danh mục chưa tồn tại trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Thêm danh mục khóa học"
 Thì: Hệ thống hiển thị form nhập thông tin danh mục (tên, slug)
  Nếu: Quản trị viên nhập thông tin và nhấn "Thêm danh mục"
   Thì: Hệ thống kiểm tra tính hợp lệ và trùng lặp
    Nếu: Thông tin hợp lệ và danh mục chưa tồn tại
     Thì: Hệ thống lưu danh mục mới vào cơ sở dữ liệu, thông báo thêm thành công
     Không thì: Hệ thống thông báo lỗi (tên trùng hoặc thông tin không hợp lệ)
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Danh mục khóa học mới được tạo thành công / Thông báo lỗi

---

## 1.10. Sửa danh mục khóa học

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên chỉnh sửa thông tin danh mục (chủ đề) khóa học

**Đầu vào:**
- Mã danh mục, thông tin cần cập nhật (tên, slug)

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Danh mục tồn tại trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Sửa danh mục khóa học" trên một danh mục cụ thể
 Thì: Hệ thống hiển thị form chỉnh sửa với thông tin hiện tại của danh mục
  Nếu: Quản trị viên chỉnh sửa thông tin và nhấn "Lưu thay đổi"
   Thì: Hệ thống kiểm tra tính hợp lệ và trùng lặp tên
    Nếu: Thông tin hợp lệ và không trùng với danh mục khác
     Thì: Hệ thống cập nhật thông tin danh mục vào cơ sở dữ liệu, thông báo cập nhật thành công
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Thông tin danh mục được cập nhật thành công / Thông báo lỗi

---

## 1.11. Xóa danh mục khóa học

**Tác nhân:** Quản trị viên

**Mô tả:**
- Quản trị viên xóa danh mục (chủ đề) khóa học khỏi hệ thống

**Đầu vào:**
- Mã danh mục cần xóa

**Điều kiện cần:**
- Quản trị viên đã đăng nhập vào hệ thống
- Danh mục tồn tại trong hệ thống

**Nội dung quy trình xử lý:**

Nếu: Quản trị viên truy cập chức năng "Xóa danh mục khóa học" trên một danh mục cụ thể
 Thì: Hệ thống hiển thị hộp thoại xác nhận "Bạn có chắc chắn muốn xóa danh mục này?"
  Nếu: Quản trị viên xác nhận xóa
   Thì: Hệ thống kiểm tra xem có khóa học nào đang sử dụng danh mục này không
    Nếu: Không có khóa học nào đang sử dụng danh mục
     Thì: Hệ thống xóa danh mục khỏi cơ sở dữ liệu, thông báo xóa thành công
     Không thì: Hệ thống thông báo "Không thể xóa danh mục đang được sử dụng bởi khóa học" và yêu cầu gỡ danh mục khỏi các khóa học trước
  Không thì: Hệ thống đóng hộp thoại, không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Danh mục được xóa thành công / Thông báo lỗi không thể xóa
