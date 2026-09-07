-- ============================================================
-- MIGRATION SCRIPT - DATABASE HỆ THỐNG THƯ VIỆN TRƯỜNG HỌC
-- Phiên bản: 2.0
-- ============================================================

-- BANG 1: ROLE
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- BANG 2: USER
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "gender" TEXT,
    "dateOfBirth" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastActive" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_code_key" ON "User"("code");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- BANG 3: STUDENT
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "enrollYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- BANG 4: TEACHER
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT,
    "degree" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Teacher_teacherId_key" ON "Teacher"("teacherId");

-- BANG 5: LIBRARIAN
CREATE TABLE "Librarian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    CONSTRAINT "Librarian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Librarian_employeeId_key" ON "Librarian"("employeeId");

-- BANG 6: CATEGORY
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#2563EB',
    "icon" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- BANG 7: AUTHOR
CREATE TABLE "Author" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nationality" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- BANG 8: PUBLISHER
CREATE TABLE "Publisher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "description" TEXT,
    "foundedYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Publisher_name_key" ON "Publisher"("name");

-- BANG 9: BOOK
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "isbn" TEXT,
    "year" INTEGER,
    "pages" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'Vietnamese',
    "price" REAL,
    "location" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "coverColor" TEXT NOT NULL DEFAULT '#2563EB',
    "edition" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "available" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'available',
    "avgRating" REAL NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "authorId" TEXT,
    "publisherId" TEXT,
    CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
CREATE INDEX "Book_publisherId_idx" ON "Book"("publisherId");

-- BANG 10: BOOK_COPY
CREATE TABLE "BookCopy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barcode" TEXT NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "shelfLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "acquiredDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BookCopy_barcode_key" ON "BookCopy"("barcode");

-- BANG 11: BORROW_RECORD
CREATE TABLE "BorrowRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "returnDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "maxRenewals" INTEGER NOT NULL DEFAULT 2,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "readerId" TEXT NOT NULL,
    "readerType" TEXT NOT NULL,
    "studentId" TEXT,
    "teacherId" TEXT,
    "bookCopyId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "borrowedBy" TEXT,
    "librarianId" TEXT,
    "returnedBy" TEXT,
    "returnLibId" TEXT,
    CONSTRAINT "BorrowRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BorrowRecord_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BorrowRecord_bookCopyId_fkey" FOREIGN KEY ("bookCopyId") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BorrowRecord_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BorrowRecord_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "Librarian"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "BorrowRecord_status_idx" ON "BorrowRecord"("status");
CREATE INDEX "BorrowRecord_dates_idx" ON "BorrowRecord"("borrowDate", "dueDate");

-- BANG 12: RESERVATION
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedAvailability" DATETIME,
    "expiryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queuePosition" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'in_queue',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "readerId" TEXT NOT NULL,
    "readerType" TEXT NOT NULL,
    "studentId" TEXT,
    "teacherId" TEXT,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Reservation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- BANG 13: FINE
CREATE TABLE "Fine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "paidDate" DATETIME,
    "paidMethod" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "studentId" TEXT,
    "teacherId" TEXT,
    "borrowRecordId" TEXT,
    "processedBy" TEXT,
    "waivedBy" TEXT,
    CONSTRAINT "Fine_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Fine_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Fine_borrowRecordId_fkey" FOREIGN KEY ("borrowRecordId") REFERENCES "BorrowRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Fine_status_idx" ON "Fine"("status");

-- BANG 14: REVIEW
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Review_userId_bookId_key" ON "Review"("userId", "bookId");

-- BANG 15: BOOK_TAG
CREATE TABLE "BookTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tag" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "BookTag_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BookTag_bookId_tag_key" ON "BookTag"("bookId", "tag");

-- BANG 16: MEMBERSHIP_CARD
CREATE TABLE "MembershipCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardNumber" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "maxBorrow" INTEGER NOT NULL DEFAULT 5,
    "borrowDays" INTEGER NOT NULL DEFAULT 14,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "studentId" TEXT,
    "teacherId" TEXT,
    CONSTRAINT "MembershipCard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MembershipCard_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MembershipCard_cardNumber_key" ON "MembershipCard"("cardNumber");

-- BANG 17: BORROWING_STATS
CREATE TABLE "BorrowingStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "totalBorrows" INTEGER NOT NULL DEFAULT 0,
    "totalReturns" INTEGER NOT NULL DEFAULT 0,
    "totalOverdue" INTEGER NOT NULL DEFAULT 0,
    "totalReserves" INTEGER NOT NULL DEFAULT 0,
    "activeBorrows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentBorrows" INTEGER NOT NULL DEFAULT 0,
    "teacherBorrows" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "BorrowingStats_date_key" ON "BorrowingStats"("date");

-- BANG 18: BOOK_STATS
CREATE TABLE "BookStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "borrowCount" INTEGER NOT NULL DEFAULT 0,
    "reserveCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookStats_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BookStats_bookId_date_key" ON "BookStats"("bookId", "date");

-- BANG 19: SESSION
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- BANG 20: NOTIFICATION
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Notification_user_read_idx" ON "Notification"("userId", "read");

-- BANG 21: AUDIT_LOG
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AuditLog_user_created_idx" ON "AuditLog"("userId", "createdAt");

-- BANG 22: SYSTEM_CONFIG
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- ============================================================
-- SEED DATA - DỮ LIỆU MẪU
-- ============================================================

-- Roles
INSERT INTO "Role" ("id", "name", "description", "permissions", "level", "createdAt", "updatedAt") VALUES
('role_admin', 'admin', 'Quản trị viên hệ thống', '["all"]', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_librarian', 'librarian', 'Thủ thư', '["manage_books", "manage_borrow", "manage_fines"]', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_teacher', 'teacher', 'Giáo viên', '["borrow_books", "view_books"]', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_student', 'student', 'Học sinh', '["borrow_books", "view_books", "reserve_books"]', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- System Config
INSERT INTO "SystemConfig" ("id", "key", "value", "description", "createdAt", "updatedAt") VALUES
('cfg_1', 'max_borrow_student', '5', 'Số sách mượn tối đa của học sinh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfg_2', 'max_borrow_teacher', '10', 'Số sách mượn tối đa của giáo viên', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfg_3', 'max_borrow_days_student', '14', 'Số ngày mượn tối đa của học sinh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfg_4', 'max_borrow_days_teacher', '30', 'Số ngày mượn tối đa của giáo viên', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfg_5', 'fine_per_day', '5000', 'Phí phạt mỗi ngày (VNĐ)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfg_6', 'max_renewals', '2', 'Số lần gia hạn tối đa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfg_7', 'card_expiry_months', '12', 'Số tháng hết hạn thẻ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Categories
INSERT INTO "Category" ("id", "name", "description", "color", "createdAt", "updatedAt") VALUES
('cat_1', 'Giáo khoa', 'Sách giáo khoa các môn học', '#2563EB', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_2', 'Tham khảo', 'Sách tham khảo bổ trợ', '#059669', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_3', 'Tiểu thuyết', 'Tiểu thuyết trong nước và quốc tế', '#DC2626', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_4', 'Khoa học', 'Sách khoa học thường thức', '#7C3AED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_5', 'Văn học', 'Tác phẩm văn học Việt Nam', '#EA580C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_6', 'Ngoại ngữ', 'Sách học ngoại ngữ', '#0891B2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
