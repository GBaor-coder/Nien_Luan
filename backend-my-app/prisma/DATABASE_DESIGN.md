# THIẾT KẾ DATABASE - HỆ THỐNG THƯ VIỆN TRƯỜNG HỌC

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HỆ THỐNG THƯ VIỆN TRƯỜNG HỌC                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   NGƯỜI DÙNG  │    │     SÁCH     │    │  MƯỢN/TRẢ   │                   │
│  │              │    │              │    │              │                   │
│  │  • User      │◄──►│  • Book      │◄──►│  • Borrow    │                   │
│  │  • Role      │    │  • BookCopy  │    │  • Reserve   │                   │
│  │  • Student   │    │  • Category  │    │  • Fine      │                   │
│  │  • Teacher   │    │  • Author    │    │              │                   │
│  │  • Librarian │    │  • Publisher │    │              │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  THẺ THƯ VIỆN│    │  ĐÁNH GIÁ    │    │  THỐNG KÊ    │                   │
│  │              │    │              │    │              │                   │
│  │  • Card      │    │  • Review    │    │  • Stats     │                   │
│  │  • Membership│    │  • Tag       │    │  • Report    │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  HỆ THỐNG    │    │  PHIÊN      │    │  THÔNG BÁO   │                   │
│  │              │    │              │    │              │                   │
│  │  • Config    │    │  • Session   │    │  • Noti      │                   │
│  │  • Audit     │    │              │    │              │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Danh sách các bảng (12 bảng)

| # | Bảng | Mô tả | Số trường |
|---|------|-------|-----------|
| 1 | `Role` | Vai trò người dùng | 6 |
| 2 | `User` | Thông tin người dùng | 11 |
| 3 | `Student` | Thông tin học sinh | 8 |
| 4 | `Teacher` | Thông tin giáo viên | 8 |
| 5 | `Librarian` | Thông tin thủ thư | 8 |
| 6 | `Category` | Thể loại sách | 8 |
| 7 | `Author` | Tác giả | 8 |
| 8 | `Publisher` | Nhà xuất bản | 9 |
| 9 | `Book` | Thông tin sách | 20 |
| 10 | `BookCopy` | Phiên bản sách vật lý | 10 |
| 11 | `BorrowRecord` | Phiên mượn sách | 16 |
| 12 | `Reservation` | Đặt chỗ sách | 11 |
| 13 | `Fine` | Phạt | 11 |
| 14 | `Review` | Đánh giá sách | 9 |
| 15 | `BookTag` | Thẻ tag sách | 5 |
| 16 | `MembershipCard` | Thẻ thư viện | 11 |
| 17 | `BorrowingStats` | Thống kê mượn trả | 9 |
| 18 | `BookStats` | Thống kê sách | 7 |
| 19 | `Session` | Phiên đăng nhập | 6 |
| 20 | `Notification` | Thông báo | 8 |
| 21 | `AuditLog` | Lịch sử hành động | 9 |
| 22 | `SystemConfig` | Cấu hình hệ thống | 5 |

## Mối quan hệ chính

```
Role 1────N User
User 1────1 Student
User 1────1 Teacher
User 1────1 Librarian

Category 1────N Book
Author 1────N Book
Publisher 1────N Book
Book 1────N BookCopy

Book 1────N BorrowRecord
Book 1────N Reservation
Book 1────N Review
Book 1────N BookTag

BookCopy 1────N BorrowRecord

Student 1────N BorrowRecord
Student 1────N Reservation
Student 1────N Fine
Student 1────1 MembershipCard

Teacher 1────N BorrowRecord
Teacher 1────N Reservation
Teacher 1────N Fine
Teacher 1────1 MembershipCard

Librarian 1────N BorrowRecord

BorrowRecord 1────N Fine
```

## So sánh với schema cũ

| Tính năng | Schema cũ | Schema mới |
|-----------|-----------|------------|
| Phân quyền | Role chỉ là string | Role là bảng riêng với permissions |
| Học sinh/Giáo viên | Chỉ có User chung | Tách riêng Student/Teacher |
| Thủ thư | Không có | Có bảng Librarian riêng |
| Lớp/Khoa | Không có | className, department |
| Mã người dùng | Không có | code (GV001, HV001) |
| Thẻ thư viện | Không có | MembershipCard |
| Đánh giá sách | Không có | Review |
| Tag sách | Không có | BookTag |
| Thống kê | Không có | BorrowingStats, BookStats |
| Audit Log | Không có | AuditLog |
| Cấu hình hệ thống | Hardcode | SystemConfig |
| Giới hạn gia hạn | Không có | renewalCount, maxRenewals |
| Ngày hết hạn đặt | Không có | expiryDate |
| Vị trí kệ chi tiết | location chung | shelfLocation trên BookCopy |

## Quy tắc mượn sách (theo SystemConfig)

| Loại người | Số sách tối đa | Số ngày mượn | Số lần gia hạn |
|------------|----------------|--------------|----------------|
| Học sinh | 5 | 14 ngày | 2 lần |
| Giáo viên | 10 | 30 ngày | 3 lần |

## Phí phạt

| Loại vi phạm | Phí phạt |
|--------------|----------|
| Trả muộn | 5,000 VNĐ/ngày |
| Sách hỏng | 50,000 - 200,000 VNĐ |
| Sách mất | Giá bìa sách |

## Indexes khuyến nghị

```sql
-- Performance indexes
CREATE INDEX idx_book_category ON Book(categoryId);
CREATE INDEX idx_book_author ON Book(authorId);
CREATE INDEX idx_book_isbn ON Book(isbn);
CREATE INDEX idx_borrow_status ON BorrowRecord(status);
CREATE INDEX idx_borrow_dates ON BorrowRecord(borrowDate, dueDate);
CREATE INDEX idx_fine_status ON Fine(status);
CREATE INDEX idx_notification_user ON Notification(userId, read);
CREATE INDEX idx_audit_user ON AuditLog(userId, createdAt);
CREATE INDEX idx_membership_expiry ON MembershipCard(expiryDate);
```

## Migration path

1. Backup database hiện tại
2. Áp dụng schema mới qua `prisma migrate`
3. Import dữ liệu cũ vào schema mới
4. Kiểm tra tính toàn vẹn dữ liệu
5. Deploy mới
