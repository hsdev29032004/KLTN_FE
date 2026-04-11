# 2. QUẢN LÝ NỘI DUNG KHÓA HỌC

---

## 2.1. Đăng tải học liệu

**Tác nhân:** Giảng viên

**Mô tả:**
- Giảng viên tải lên các tài liệu học tập (video, PDF, hình ảnh, liên kết) cho từng bài học trong khóa học

**Đầu vào:**
- Mã bài học, tên học liệu, loại học liệu (video/img/file/pdf/link), tệp tin hoặc đường dẫn, trạng thái xem trước (isPreview)

**Điều kiện cần:**
- Giảng viên đã đăng nhập vào hệ thống
- Khóa học và bài học thuộc sở hữu của giảng viên
- Bài học đã được tạo trước đó

**Nội dung quy trình xử lý:**

Nếu: Giảng viên truy cập chức năng "Đăng tải học liệu" trong một bài học
 Thì: Hệ thống hiển thị form tải lên học liệu (tên, loại, tệp/đường dẫn, cho phép xem trước)
  Nếu: Giảng viên nhập thông tin, chọn tệp và nhấn "Tải lên"
   Thì: Hệ thống kiểm tra tính hợp lệ (định dạng tệp, kích thước, loại học liệu)
    Nếu: Thông tin hợp lệ và tệp đúng định dạng
     Thì: Hệ thống tải tệp lên lưu trữ, lưu thông tin học liệu với trạng thái "Nháp" (draft), thông báo tải lên thành công
     Không thì: Hệ thống thông báo lỗi (tệp quá lớn, định dạng không hỗ trợ) và yêu cầu chọn lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Học liệu được tải lên thành công và gắn vào bài học / Thông báo lỗi tải lên thất bại

---

## 2.2. Chỉnh sửa học liệu

**Tác nhân:** Giảng viên

**Mô tả:**
- Giảng viên chỉnh sửa thông tin hoặc thay thế tệp học liệu đã đăng tải

**Đầu vào:**
- Mã học liệu, thông tin cần cập nhật (tên, loại, tệp mới, trạng thái xem trước)

**Điều kiện cần:**
- Giảng viên đã đăng nhập vào hệ thống
- Học liệu thuộc bài học của giảng viên
- Học liệu chưa bị xóa

**Nội dung quy trình xử lý:**

Nếu: Giảng viên truy cập chức năng "Chỉnh sửa học liệu" trên một học liệu cụ thể
 Thì: Hệ thống hiển thị form chỉnh sửa với thông tin hiện tại của học liệu
  Nếu: Giảng viên chỉnh sửa thông tin và/hoặc thay thế tệp rồi nhấn "Lưu thay đổi"
   Thì: Hệ thống kiểm tra tính hợp lệ của thông tin mới
    Nếu: Thông tin hợp lệ
     Thì: Hệ thống cập nhật thông tin học liệu vào cơ sở dữ liệu, thông báo cập nhật thành công
      Nếu: Có thay thế tệp mới
       Thì: Hệ thống tải tệp mới lên lưu trữ và cập nhật đường dẫn
       Không thì: Giữ nguyên tệp cũ
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Học liệu được cập nhật thành công / Thông báo lỗi cập nhật thất bại

---

## 2.3. Đăng tải đề thi

**Tác nhân:** Giảng viên

**Mô tả:**
- Giảng viên tạo đề thi cho khóa học với các câu hỏi trắc nghiệm, cấu hình thời gian, điểm đạt, số lần thi lại

**Đầu vào:**
- Mã khóa học, tên đề thi, phần trăm điểm đạt (passPercent), số ngày chờ thi lại (retryAfterDays), thời gian làm bài (duration), số câu hỏi (questionCount), danh sách câu hỏi (nội dung, 4 đáp án A-B-C-D, đáp án đúng)

**Điều kiện cần:**
- Giảng viên đã đăng nhập vào hệ thống
- Khóa học thuộc sở hữu của giảng viên

**Nội dung quy trình xử lý:**

Nếu: Giảng viên truy cập chức năng "Đăng tải đề thi" trong khóa học
 Thì: Hệ thống hiển thị form tạo đề thi (tên, cấu hình, danh sách câu hỏi)
  Nếu: Giảng viên nhập thông tin cấu hình đề thi và nhấn "Tạo đề thi"
   Thì: Hệ thống kiểm tra tính hợp lệ (phần trăm đạt 0-100, thời gian > 0, có ít nhất 1 câu hỏi)
    Nếu: Thông tin hợp lệ
     Thì: Hệ thống lưu đề thi với trạng thái "Nháp" (draft), thông báo tạo thành công
      Nếu: Giảng viên thêm câu hỏi vào đề thi
       Thì: Hệ thống hiển thị form nhập câu hỏi (nội dung, 4 đáp án, đáp án đúng)
        Nếu: Giảng viên nhập đầy đủ nội dung câu hỏi và nhấn "Thêm câu hỏi"
         Thì: Hệ thống kiểm tra tính hợp lệ (đầy đủ 4 đáp án, có đáp án đúng)
          Nếu: Câu hỏi hợp lệ
           Thì: Lưu câu hỏi vào đề thi, cập nhật số lượng câu hỏi
           Không thì: Thông báo lỗi và yêu cầu nhập lại
        Không thì: Không thực hiện gì
       Không thì: Đề thi được tạo không có câu hỏi (cần thêm sau)
     Không thì: Hệ thống thông báo lỗi cấu hình và yêu cầu nhập lại
  Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Đề thi mới được tạo với danh sách câu hỏi / Thông báo lỗi tạo đề thi thất bại

---

## 2.4. Chỉnh sửa đề thi

**Tác nhân:** Giảng viên

**Mô tả:**
- Giảng viên chỉnh sửa cấu hình đề thi hoặc nội dung câu hỏi trong đề thi

**Đầu vào:**
- Mã đề thi, thông tin cần cập nhật (tên, cấu hình, câu hỏi)

**Điều kiện cần:**
- Giảng viên đã đăng nhập vào hệ thống
- Đề thi thuộc khóa học của giảng viên
- Đề thi chưa bị xóa

**Nội dung quy trình xử lý:**

Nếu: Giảng viên truy cập chức năng "Chỉnh sửa đề thi" trên một đề thi cụ thể
 Thì: Hệ thống hiển thị form chỉnh sửa đề thi với thông tin hiện tại (cấu hình, danh sách câu hỏi)
  Nếu: Giảng viên chỉnh sửa cấu hình đề thi và nhấn "Lưu thay đổi"
   Thì: Hệ thống kiểm tra tính hợp lệ của cấu hình mới
    Nếu: Thông tin hợp lệ
     Thì: Hệ thống cập nhật cấu hình đề thi, thông báo thành công
     Không thì: Hệ thống thông báo lỗi và yêu cầu nhập lại
  Nếu: Giảng viên chỉnh sửa một câu hỏi trong đề thi
   Thì: Hệ thống hiển thị form chỉnh sửa câu hỏi (nội dung, đáp án, đáp án đúng)
    Nếu: Giảng viên cập nhật câu hỏi và nhấn "Lưu câu hỏi"
     Thì: Hệ thống kiểm tra tính hợp lệ và cập nhật câu hỏi
     Không thì: Không thực hiện gì
  Nếu: Giảng viên xóa một câu hỏi khỏi đề thi
   Thì: Hệ thống xác nhận và xóa câu hỏi, cập nhật số lượng câu hỏi
   Không thì: Không thực hiện gì
Không thì: Không thực hiện gì

**Đầu ra:**
- Đề thi được cập nhật thành công / Thông báo lỗi cập nhật thất bại

---

## 2.5. Xem nội dung khóa học

**Tác nhân:** Học viên

**Mô tả:**
- Học viên xem nội dung bài học và học liệu trong khóa học đã mua

**Đầu vào:**
- Mã khóa học

**Điều kiện cần:**
- Học viên đã đăng nhập vào hệ thống
- Học viên đã mua khóa học

**Nội dung quy trình xử lý:**

Nếu: Học viên truy cập chức năng "Xem nội dung khóa học" (vào trang học tập)
 Thì: Hệ thống kiểm tra quyền truy cập của học viên
  Nếu: Học viên đã mua khóa học
   Thì: Hệ thống hiển thị danh sách bài học của khóa học (tên bài, số học liệu)
    Nếu: Học viên chọn một bài học cụ thể
     Thì: Hệ thống hiển thị danh sách học liệu trong bài học (video, PDF, tài liệu)
      Nếu: Học viên chọn xem một học liệu
       Thì: Hệ thống kiểm tra loại học liệu
        Nếu: Học liệu là video
         Thì: Hệ thống tạo đường dẫn truy cập có chữ ký và phát video trực tiếp
         Không thì:
          Nếu: Học liệu là PDF hoặc tệp
           Thì: Hệ thống tạo đường dẫn tải về có chữ ký và cho phép tải/xem
           Không thì:
            Nếu: Học liệu là liên kết
             Thì: Hệ thống mở đường dẫn trong tab mới
             Không thì: Hệ thống hiển thị nội dung tương ứng
      Không thì: Học viên chỉ xem danh sách học liệu
    Không thì: Học viên chỉ xem danh sách bài học
  Không thì: Hệ thống thông báo "Bạn chưa mua khóa học này" và điều hướng đến trang chi tiết khóa học
Không thì: Không thực hiện gì

**Đầu ra:**
- Nội dung bài học và học liệu được hiển thị / Thông báo chưa có quyền truy cập

---

## 2.6. Tham gia thi

**Tác nhân:** Học viên

**Mô tả:**
- Học viên tham gia làm bài thi trắc nghiệm trong khóa học đã mua

**Đầu vào:**
- Mã đề thi, câu trả lời cho từng câu hỏi

**Điều kiện cần:**
- Học viên đã đăng nhập vào hệ thống
- Học viên đã mua khóa học chứa đề thi
- Học viên chưa đạt bài thi hoặc đã hết thời gian chờ thi lại

**Nội dung quy trình xử lý:**

Nếu: Học viên truy cập chức năng "Tham gia thi" trên một đề thi cụ thể
 Thì: Hệ thống kiểm tra điều kiện tham gia thi
  Nếu: Học viên đủ điều kiện tham gia (chưa đạt, hoặc đã hết thời gian chờ thi lại)
   Thì: Hệ thống hiển thị thông tin đề thi (tên, thời gian, số câu, phần trăm đạt) và nút "Bắt đầu thi"
    Nếu: Học viên nhấn "Bắt đầu thi"
     Thì: Hệ thống tạo phiên thi mới, bắt đầu đếm ngược thời gian, hiển thị danh sách câu hỏi (nội dung, 4 đáp án)
      Nếu: Học viên chọn đáp án cho các câu hỏi và nhấn "Nộp bài"
       Thì: Hệ thống tính điểm (số câu đúng / tổng câu hỏi * 100)
        Nếu: Điểm >= phần trăm đạt (passPercent)
         Thì: Hệ thống thông báo "Đạt", lưu kết quả, hiển thị chi tiết (điểm, câu đúng/sai, đáp án đúng)
         Không thì: Hệ thống thông báo "Không đạt", lưu kết quả, hiển thị chi tiết và thời gian có thể thi lại
      Nếu: Hết thời gian làm bài
       Thì: Hệ thống tự động nộp bài với các câu đã chọn, tính điểm và hiển thị kết quả
       Không thì: Không thực hiện gì
    Không thì: Không thực hiện gì
  Không thì:
   Nếu: Học viên đã đạt bài thi
    Thì: Hệ thống thông báo "Bạn đã đạt bài thi này"
    Không thì: Hệ thống thông báo "Bạn cần chờ đến [ngày] để thi lại" (hiển thị thời gian có thể thi lại)
Không thì: Không thực hiện gì

**Đầu ra:**
- Kết quả bài thi (đạt/không đạt, điểm số, chi tiết câu trả lời) / Thông báo không đủ điều kiện tham gia
