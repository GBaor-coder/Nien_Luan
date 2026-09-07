# TỔNG QUAN HỆ THỐNG QUẢN LÝ THƯ VIỆN TRƯỜNG HỌC

Đây là ứng dụng **Quản Lý Thư Viện Trường Học** gồm 2 phần:
- **Backend** (`backend-my-app/`): API server Node.js + Express + Prisma + MySQL
- **Frontend** (`my-app/`): App React + TypeScript + Vite + Tailwind CSS v4

---

# BACKEND (`backend-my-app/`)

## Cấu trúc thư mục

```
backend-my-app/
├── .env                 # Cấu hình cổng, DB, JWT secret
├── package.json         # Dependencies & scripts
├── seed.js              # Script tạo dữ liệu mẫu
├── prisma/
│   ├── schema.prisma    # Định nghĩa toàn bộ database (12 models)
│   └── migration.sql    # SQL migration
└── src/
    ├── server.js        # Khởi động server Express
    ├── app.js           # Cấu hình Express app (cors, helmet, routes)
    ├── config/          # Cấu hình database
    ├── controllers/     # Xử lý HTTP request (14 files)
    ├── middleware/       # Middleware (auth, error, validation)
    ├── routes/          # Định nghĩa API routes (16 files)
    ├── services/        # Logic nghiệp vụ (14 files)
    ├── utils/           # Helper functions
    └── validations/     # Validate input với Joi (12 files)
```

---

### 1. `src/server.js` (9 dòng)
**Chức năng:** Điểm khởi động ứng dụng. Đọc file `.env`, tạo app Express và lắng nghe trên cổng cấu hình.

### 2. `src/app.js` (31 dòng)
**Chức năng:** Cấu hình Express app:
- **helmet()** — Bảo mật HTTP headers
- **cors** — Cho phép frontend truy cập API
- **morgan** — Ghi log request
- **express.json** — Parse JSON body (tối đa 10MB)
- Mount tất cả routes tại `/api`
- Serve file tĩnh từ `/uploads`
- Gắn middleware xử lý lỗi toàn cục

### 3. `src/config/database.js` (14 dòng)
**Chức năng:** Tạo singleton PrismaClient. Tránh tạo nhiều instance khi dev hot-reload.

### 4. `prisma/schema.prisma` (474 dòng)
**Chức năng:** Định nghĩa **toàn bộ cơ sở dữ liệu** gồm 12 models:

| Model | Chức năng |
|-------|-----------|
| `Role` | Phân quyền: admin, teacher, student |
| `User` | Tài khoản người dùng (code, name, email, password, role) |
| `Student` | Thông tin học sinh (mã HS, lớp, khối, năm nhập học) |
| `Teacher` | Thông tin giáo viên (mã GV, khoa, chức vụ, bằng cấp) |
| `Librarian` | Thông tin thủ thư |
| `Category` | Thể loại sách (hỗ trợ phân cấp parent-child) |
| `Author` | Tác giả |
| `Publisher` | Nhà xuất bản |
| `Book` | Sách (title, ISBN, số trang, giá, số lượng, vị trí) |
| `BookCopy` | Bản sao sách vật lý (barcode, tình trạng, vị trí kệ) |
| `BorrowRecord` | Phiếu mượn/trả sách |
| `Reservation` | Đặt chỗ/đăng ký mượn sách (hàng đợi) |
| `Fine` | Phí phạt (quá hạn, hư hỏng, mất) |
| `Review` | Đánh giá sách (1-5 sao) |
| `BookTag` | Tag tìm kiếm cho sách |
| `MembershipCard` | Thẻ thư viện (số thẻ, hạn, số sách mượn tối đa) |
| `BorrowingStats` | Thống kê mượn/trả theo ngày |
| `BookStats` | Thống kê lượt xem/mượn theo sách |
| `Session` | Phiên đăng nhập |
| `Notification` | Thông báo cho người dùng |
| `AuditLog` | Nhật ký hành động (audit trail) |
| `SystemConfig` | Cấu hình hệ thống (số sách mượn tối đa, phí phạt/ngày...) |

---

### 5. Middleware (3 files)

| File | Chức năng |
|------|-----------|
| `auth.js` (32 dòng) | **Xác thực JWT**: `authenticate` kiểm tra Bearer token, `authorize(['admin','teacher'])` kiểm tra vai trò |
| `errorHandler.js` (19 dòng) | **Xử lý lỗi toàn cục**: Bắt lỗi Prisma (unique constraint → 409, not found → 404) và lỗi chung → 500 |
| `validate.js` (16 dòng) | **Validate input**: Dùng Joi schema để kiểm tra request body/query/params, trả 422 nếu sai |

---

### 6. Routes (16 files)

| File | API Endpoints |
|------|--------------|
| `index.js` | Mount tất cả sub-routes + upload endpoints (`/upload/book-cover`, `/upload/author-avatar`) |
| `auth.routes.js` | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` |
| `books.routes.js` | CRUD `/books` + `POST /books/sync-copies` |
| `categories.routes.js` | CRUD `/categories` + `GET /categories/simple` |
| `authors.routes.js` | CRUD `/authors` |
| `publishers.routes.js` | CRUD `/publishers` + `GET /publishers/simple` |
| `readers.routes.js` | CRUD `/readers` (học sinh + giáo viên) |
| `borrowing.routes.js` | `/borrowing` CRUD + `POST return` + `POST renew` + `GET stats` + `GET overdue` + `POST process-overdue` |
| `reservations.routes.js` | CRUD `/reservations` + `PATCH status` |
| `fines.routes.js` | CRUD `/fines` + `POST payment` + `POST waive` + `GET stats` |
| `users.routes.js` | CRUD `/users` + `PATCH change-password` |
| `roles.routes.js` | CRUD `/roles` |
| `notifications.routes.js` | `/notifications` + `PATCH read` + `PATCH read-all` + `GET unread-count` |
| `dashboard.routes.js` | `/dashboard/overview` + `/dashboard/trends` + `/dashboard/categories` + `/dashboard/activity` + `/dashboard/status-distribution` |
| `reports.routes.js` | `/reports/borrowing` + `/reports/books` + `/reports/readers` + `/reports/overview` |
| `upload.routes.js` | Upload file ảnh |

---

### 7. Controllers (14 files)
Controller nhận HTTP request → gọi Service → trả JSON response. Mỗi file tương ứng 1 module.

### 8. Services (14 files) — **LOGIC NGHIỆP VỤ CHÍNH**

| Service | Dòng | Chức năng chính |
|---------|------|-----------------|
| `auth.service.js` | 148 | Đăng ký (tạo User + Student/Teacher profile), Đăng nhập (4 cách: mã HS, mã GV, mã NV, email), Lấy profile |
| `books.service.js` | 176 | CRUD sách + tìm kiếm/lọc/sắp xếp + tự động tạo ISBN + tạo BookCopy + đồng bộ bản sao |
| `categories.service.js` | 52 | CRUD thể loại + đếm số sách mỗi thể loại |
| `authors.service.js` | 46 | CRUD tác giả + đếm số sách |
| `publishers.service.js` | 52 | CRUD NXB + đếm số sách |
| `readers.service.js` | 253 | CRUD học sinh/giáo viên (tạo user + profile trong transaction, tự động tạo mã HV/GV) |
| `borrowing.service.js` | **430** | **Lớn nhất**: Mượn sách (kiểm tra giới hạn, SystemConfig), trả sách (tính phạt quá hạn, đẩy hàng đợi đặt chỗ), xử lý quá hạn hàng loạt, gia hạn, thống kê |
| `reservations.service.js` | 359 | Đặt chỗ sách: tạo reservation, quản lý hàng đợi (queue position), chuyển trạng thái, hết hạn, thông báo |
| `fines.service.js` | 144 | Quản lý phạt: tạo, thanh toán (partial/full), miễn trừ, thống kê |
| `users.service.js` | 203 | CRUD tài khoản hệ thống + cascade delete qua tất cả liên kết |
| `roles.service.js` | 59 | CRUD vai trò + quyền hạn (JSON permissions) |
| `notifications.service.js` | 36 | CRUD thông báo + đánh dấu đã đọc |
| `dashboard.service.js` | 207 | Dashboard: 19 query song song tính KPI, xu hướng mượn 12 tháng, phân bố thể loại, hoạt động gần đây |
| `reports.service.js` | 157 | Báo cáo: mượn/trả (theo khoảng ngày), sách (phân bố thể loại), người đọc (top 10), tổng quan |

### 9. Validations (12 files)
Mỗi file định nghĩa Joi schema cho input của module tương ứng. Validate: register, login, book, category, author, publisher, reader, borrow, reservation, fine, user, role, notification.

### 10. Utils (2 files)

| File | Chức năng |
|------|-----------|
| `helpers.js` (20 dòng) | `generateId()` — tạo mã ID, `calculateBookStatus()` — tính trạng thái sách, `calculateRemainingDays()` — tính số ngày còn lại |
| `apiResponse.js` (30 dòng) | `sendSuccess/sendError` — response chuẩn hóa, `paginate/buildPagination` — phân trang |

### 11. `seed.js` (532 dòng)
**Chức năng:** Tạo dữ liệu mẫu:
- 3 roles (admin, teacher, student)
- 7 cấu hình hệ thống (max borrow, fine per day...)
- 6 thể loại sách
- 5 user (1 admin, 1 nhân viên, 3 học sinh) + 3 student profiles + 3 membership cards
- 8 tác giả, 5 NXB
- 7 sách mẫu + các bản sao (book copies)
- 5 phiếu mượn mẫu + 3 đặt chỗ mẫu + 1 phạt mẫu
- 7 tag cho sách

---

# FRONTEND (`my-app/`)

## Cấu trúc thư mục

```
my-app/src/
├── main.tsx              # Entry point
├── App.tsx               # Router chính (routes cho admin + student)
├── index.css             # Tailwind v4 theme (màu sắc, font, animations)
├── context/              # React Context (Auth, Theme/Dark mode)
├── data/                 # Mock data, config trạng thái
├── layouts/              # Layout wrapper (Admin, Student)
├── pages/                # Trang (Admin + Student pages)
├── components/           # Component (auth, admin, user, ui)
├── services/             # API service layer (Axios)
└── utils/                # Helper functions
```

---

### 1. `main.tsx` (10 dòng)
Entry point — render `<App>` trong StrictMode.

### 2. `App.tsx` (~140 dòng)
Định nghĩa **toàn bộ routes**:
- `/login` → Trang đăng nhập
- `/dashboard/*` → Khu vực admin (sidebar + outlet)
- `/user/*` → Khu vực học sinh/giáo viên (sidebar + outlet)

### 3. `index.css` (~250 dòng)
Cấu hình **Tailwind CSS v4 theme**: custom colors, shadows, fonts, keyframe animations, utility classes.

---

### 4. Context (4 files)

| File | Chức năng |
|------|-----------|
| `AuthContext.tsx` | Quản lý trạng thái đăng nhập (login, register, logout, profile), token lưu trong sessionStorage |
| `useAuth.ts` | Hook `useAuth()` sử dụng AuthContext |
| `ThemeContext.tsx` | Bật/tắt dark mode, lưu trong localStorage |
| `useTheme.ts` | Hook `useTheme()` |

---

### 5. Data (4 files)

| File | Chức năng |
|------|-----------|
| `mockData.ts` | Dữ liệu mẫu: book copies, history, nav items, quick actions, filter options |
| `studentData.ts` | Thông báo thư viện cho trang student |
| `studentNav.ts` | Item navigation cho sidebar học sinh |
| `statusConfig.ts` | Cấu hình badge trạng thái (mượn, đặt chỗ, phạt, sách) |

---

### 6. Layouts (2 files)

| File | Chức năng |
|------|-----------|
| `DashboardLayout.tsx` | Layout admin: sidebar có thể thu gọn + TopNav + Outlet |
| `StudentLayout.tsx` | Layout học sinh: sidebar + StudentTopNav + Outlet |

---

### 7. Services (17 files) — **API LAYER**

| Service | Chức năng |
|---------|-----------|
| `api.ts` | Axios instance + JWT interceptor (gắn Bearer token) + loading state |
| `loadingStore.ts` | Đếm request đang chờ + subscriber pattern (hiện loading bar) |
| `auth.service.ts` | API đăng nhập, đăng ký, lấy profile |
| `books.service.ts` | API CRUD sách |
| `borrowing.service.ts` | API mượn/trả, gia hạn, thống kê, xử lý quá hạn |
| `reservations.service.ts` | API đặt chỗ |
| `fines.service.ts` | API phạt, thanh toán, miễn trừ |
| `dashboard.service.ts` | API dashboard KPIs, xu hướng, phân bố |
| `reports.service.ts` | API báo cáo |
| `readers.service.ts` | API quản lý học sinh/giáo viên |
| `users.service.ts` | API tài khoản |
| `roles.service.ts` | API vai trò |
| `authors.service.ts` | API tác giả |
| `categories.service.ts` | API thể loại |
| `publishers.service.ts` | API NXB |
| `student.service.ts` | API cho học sinh (mượn, đặt chỗ, phạt, thông báo, catalog, thẻ TV) |
| `upload.service.ts` | API upload ảnh |

---

### 8. Utils (2 files)

| File | Chức năng |
|------|-----------|
| `error.ts` | `getErrorMessage()` — trích xuất thông báo lỗi từ API response |
| `borrowing.ts` | `getReaderName()`, `getReaderTypeLabel()`, `getOverdueDays()` — helper cho trang mượn |

---

### 9. Components — Auth (4 files)

| File | Chức năng |
|------|-----------|
| `AuthLayout.tsx` | Layout split-screen cho login (hero + form) |
| `HeroSection.tsx` | Section hero trang trí với animation cards + stats |
| `InputField.tsx` | Component input tái sử dụng (icon, label, error) |
| `LoginForm.tsx` | Form đăng nhập với validation, remember-me, redirect theo role |

---

### 10. Components — Admin (17 files)

| File | Chức năng |
|------|-----------|
| `Sidebar.tsx` | Sidebar admin (navigation, sections có thể collapse, role badge) |
| `TopNav.tsx` | Top bar (search, dark mode toggle, notifications, user menu) |
| `KPICard.tsx` | Card KPI trên dashboard |
| `QuickActions.tsx` | Nút thao tác nhanh trên dashboard |
| `RecentActivityTable.tsx` | Bảng hoạt động gần đây |
| `BorrowingTrendsChart.tsx` | Biểu đồ đường xu hướng mượn (Recharts) |
| `CategoryDistributionChart.tsx` | Biểu đồ tròn phân bố thể loại |
| `StatusDistributionChart.tsx` | Biểu đồ donut phân bố trạng thái |
| `StatusBadge.tsx` | Badge trạng thái |
| `Toast.tsx` | Thông báo toast |
| `Modal.tsx` | Modal popup |
| `ConfirmDialog.tsx` | Dialog xác nhận |
| `PageHeader.tsx` | Header trang (title + subtitle) |
| `SearchInput.tsx` | Ô tìm kiếm |
| `ActionableInsights.tsx` | Card gợi ý hành động trên dashboard |
| `BorrowFlowPipeline.tsx` | Visualize luồng mượn sách |
| `BorrowRecordDetailModal.tsx` | Modal chi tiết phiếu mượn |

---

### 11. Components — UI Primitives (14 files)

| File | Chức năng |
|------|-----------|
| `Button.tsx` | Nút với variants: primary, secondary, danger, ghost, outline + nhiều sizes |
| `Card.tsx` | Container card |
| `BookCover.tsx` | Ảnh bìa sách (có fallback placeholder) |
| `ConfirmModal.tsx` | Modal xác nhận (danger/warning) |
| `EmptyState.tsx` | Component khi không có dữ liệu |
| `ErrorState.tsx` | Component lỗi (có nút retry) |
| `LoadingState.tsx` | Component loading spinner |
| `TopProgressBar.tsx` | Thanh tiến trình trên cùng (reacts loading state) |
| `StatusBadge.tsx` | Badge trạng thái đơn giản |
| `Spinner.tsx` | Loading spinner |
| `SessionExpiredModal.tsx` | Modal cảnh báo hết phiên |
| `Select.tsx` | Select dropdown tùy chỉnh |
| `Pagination.tsx` | Phân trang |

---

### 12. Components — Student (8 files)

| File | Chức năng |
|------|-----------|
| `StudentTopNav.tsx` | Top nav cho học sinh |
| `StudentSidebar.tsx` | Sidebar cho học sinh |
| `ReservationStatus.tsx` | Hiển thị timeline trạng thái đặt chỗ |
| `RecommendedBooks.tsx` | Carousel sách đề xuất |
| `QuickStats.tsx` | Card thống kê nhanh |
| `LibraryNotice.tsx` | Hiển thị thông báo thư viện |
| `DueDateAlert.tsx` | Cảnh báo ngày hết hạn |
| `CurrentBorrowings.tsx` | Danh sách đang mượn |

---

### 13. Pages — Admin (17 files)

| File | Chức năng |
|------|-----------|
| `LoginPage.tsx` | Trang đăng nhập |
| `DashboardPage.tsx` (~350 dòng) | Dashboard admin: KPIs, biểu đồ, hoạt động gần đây, insights |
| `CatalogPage.tsx` (~650 dòng) | Quản lý catalog sách: lọc, phân trang, CRUD modals |
| `BookDetailPage.tsx` (~1000 dòng) | Chi tiết sách + quản lý bản sao |
| `CategoriesPage.tsx` | CRUD thể loại |
| `AuthorsPage.tsx` | CRUD tác giả |
| `PublishersPage.tsx` | CRUD NXB |
| `TagsPage.tsx` | Quản lý tags (placeholder) |
| `ReadersPage.tsx` | CRUD học sinh/giáo viên |
| `BorrowingPage.tsx` (~800 dòng) | Quản lý mượn/trả chính |
| `ReservationsPage.tsx` | Quản lý đặt chỗ |
| `ReportsPage.tsx` | Báo cáo (4 tabs: tổng quan, mượn, sách, người đọc) |
| `UsersPage.tsx` | Quản lý tài khoản |
| `RolesPage.tsx` | Quản lý vai trò & quyền |
| `SettingsPage.tsx` | Cài đặt hệ thống |
| `FinesPage.tsx` | Quản lý phạt |

### 14. Pages — Borrowing Sub-pages (7 files)

| File | Chức năng |
|------|-----------|
| `BorrowingCreatePage.tsx` | Tạo phiếu mượn mới |
| `BorrowingActivePage.tsx` | Danh sách đang mượn |
| `BorrowingReturnedPage.tsx` | Danh sách đã trả |
| `BorrowingOverduePage.tsx` | Quản lý quá hạn |
| `BorrowingRenewPage.tsx` | Yêu cầu gia hạn |
| `BorrowingHistoryPage.tsx` | Lịch sử mượn |
| `BorrowingStatsPage.tsx` | Thống kê mượn |

### 15. Pages — Student (10 files)

| File | Chức năng |
|------|-----------|
| `StudentDashboardPage.tsx` | Trang chủ: thống kê, cảnh báo, đề xuất |
| `StudentCatalogPage.tsx` | Duyệt/tìm kiếm sách |
| `StudentBookDetailPage.tsx` | Chi tiết sách + hành động mượn/đặt chỗ |
| `StudentBorrowingsPage.tsx` | Sách đang mượn (gia hạn/trả) |
| `StudentReservationsPage.tsx` | Đặt chỗ của tôi |
| `StudentFinesPage.tsx` | Phạt của tôi + thanh toán |
| `StudentHistoryPage.tsx` | Lịch sử mượn |
| `StudentNotificationsPage.tsx` | Hộp thư thông báo |
| `StudentProfilePage.tsx` | Hồ sơ cá nhân |
| `StudentSettingsPage.tsx` | Cài đặt (mật khẩu, sở thích) |

---

# TỔNG KẾT

| Phân khúc | Số file | Dòng code |
|-----------|---------|-----------|
| Backend (Prisma schema) | 1 | 474 |
| Backend (src/) | 47 | ~3,119 |
| Seed data | 1 | 532 |
| Frontend (src/) | ~82 | ~10,000+ |
| **Tổng** | **~131** | **~14,000+** |

**Luồng hoạt động chính:**
1. **Admin** đăng nhập → Dashboard thấy KPIs, biểu đồ, hoạt động
2. **Admin** quản lý: sách → thể loại → tác giả → NXB → học sinh/giáo viên → mượn/trả → phạt
3. **Học sinh/Giáo viên** đăng nhập → Duyệt catalog → Mượn sách hoặc đặt chỗ → Theo dõi đang mượn → Trả sách → Xem phạt
4. Hệ thống tự động: xử lý quá hạn, tính phạt, đẩy hàng đợi đặt chỗ, gửi thông báo
