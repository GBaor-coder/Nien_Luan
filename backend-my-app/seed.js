/**
 * SEED DATA - HỆ THỐNG THƯ VIỆN TRƯỜNG HỌC
 * Phiên bản: 2.0 - Schema mới
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  // ============================================================
  // 1. ROLES
  // ============================================================
  console.log('Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'admin',
        description: 'Quan tri vien he thong',
        permissions: JSON.stringify(['all']),
        level: 100
      }
    }),
    prisma.role.create({
      data: {
        name: 'teacher',
        description: 'Giao vien',
        permissions: JSON.stringify(['view_books', 'borrow_books']),
        level: 50
      }
    }),
    prisma.role.create({
      data: {
        name: 'student',
        description: 'Hoc sinh',
        permissions: JSON.stringify(['view_books', 'borrow_books']),
        level: 10
      }
    }),
  ]);
  console.log(`Created ${roles.length} roles`);

  const adminRole = roles.find(r => r.name === 'admin');
  const studentRole = roles.find(r => r.name === 'student');

  // ============================================================
  // 2. SYSTEM CONFIG
  // ============================================================
  console.log('Creating system config...');
  await Promise.all([
    prisma.systemConfig.create({ data: { key: 'max_borrow_student', value: '5', description: 'So sach muon toi da cua hoc sinh' } }),
    prisma.systemConfig.create({ data: { key: 'max_borrow_teacher', value: '10', description: 'So sach muon toi da cua giao vien' } }),
    prisma.systemConfig.create({ data: { key: 'max_borrow_days_student', value: '14', description: 'So ngay muon toi da cua hoc sinh' } }),
    prisma.systemConfig.create({ data: { key: 'max_borrow_days_teacher', value: '30', description: 'So ngay muon toi da cua giao vien' } }),
    prisma.systemConfig.create({ data: { key: 'fine_per_day', value: '5000', description: 'Phi phat moi ngay (VND)' } }),
    prisma.systemConfig.create({ data: { key: 'max_renewals', value: '2', description: 'So lan gia han toi da' } }),
    prisma.systemConfig.create({ data: { key: 'card_expiry_months', value: '12', description: 'So thang het han the' } }),
  ]);

  // ============================================================
  // 3. CATEGORIES
  // ============================================================
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Giao khoa', description: 'Sach giao khoa cac mon hoc', color: '#2563EB' } }),
    prisma.category.create({ data: { name: 'Tham khao', description: 'Sach tham khao bo tro', color: '#059669' } }),
    prisma.category.create({ data: { name: 'Tieu thuyet', description: 'Tieu thuyet trong nuoc va quoc te', color: '#DC2626' } }),
    prisma.category.create({ data: { name: 'Khoa hoc', description: 'Sach khoa hoc thuong thuc', color: '#7C3AED' } }),
    prisma.category.create({ data: { name: 'Van hoc', description: 'Tac pham van hoc Viet Nam', color: '#EA580C' } }),
    prisma.category.create({ data: { name: 'Ngoai ngu', description: 'Sach hoc ngoai ngu', color: '#0891B2' } }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // ============================================================
  // 4. USERS (Admin + Librarians)
  // ============================================================
  console.log('Creating users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const libPassword = await bcrypt.hash('lib123', 10);

  const adminUser = await prisma.user.create({
    data: {
      code: 'ADMIN001',
      name: 'Admin',
      email: 'admin@library.edu.vn',
      password: adminPassword,
      role: { connect: { id: adminRole.id } },
      status: 'active'
    }
  });

  const lib1User = await prisma.user.create({
    data: {
      code: 'USER001',
      name: 'Nguyen Thi Thu Thu',
      email: 'thuthu@library.edu.vn',
      password: libPassword,
      phone: '0901234567',
      gender: 'female',
      role: { connect: { id: adminRole.id } },
      status: 'active'
    }
  });

  console.log('Created admin and user accounts');

  // ============================================================
  // 4b. STUDENT USERS
  // ============================================================
  console.log('Creating student users...');
  const studentPassword = await bcrypt.hash('student123', 10);

  const student1User = await prisma.user.create({
    data: {
      code: 'HS2026001',
      name: 'Tran Van Nam',
      email: 'nam@library.edu.vn',
      password: studentPassword,
      phone: '0912345678',
      gender: 'male',
      dateOfBirth: new Date('2008-05-15'),
      role: { connect: { id: studentRole.id } },
      status: 'active'
    }
  });

  const student2User = await prisma.user.create({
    data: {
      code: 'HS2026002',
      name: 'Le Thi Mai',
      email: 'mai@library.edu.vn',
      password: studentPassword,
      phone: '0923456789',
      gender: 'female',
      dateOfBirth: new Date('2008-09-20'),
      role: { connect: { id: studentRole.id } },
      status: 'active'
    }
  });

  const student3User = await prisma.user.create({
    data: {
      code: 'HS2026003',
      name: 'Pham Hoang Duc',
      email: 'duc@library.edu.vn',
      password: studentPassword,
      phone: '0934567890',
      gender: 'male',
      dateOfBirth: new Date('2007-03-10'),
      role: { connect: { id: studentRole.id } },
      status: 'active'
    }
  });

  // Create Student profiles
  const student1 = await prisma.student.create({
    data: {
      studentId: 'HV2026001',
      className: '11A1',
      grade: 11,
      enrollYear: 2024,
      status: 'active',
      userId: student1User.id
    }
  });

  const student2 = await prisma.student.create({
    data: {
      studentId: 'HV2026002',
      className: '10B2',
      grade: 10,
      enrollYear: 2025,
      status: 'active',
      userId: student2User.id
    }
  });

  const student3 = await prisma.student.create({
    data: {
      studentId: 'HV2026003',
      className: '12A3',
      grade: 12,
      enrollYear: 2023,
      status: 'active',
      userId: student3User.id
    }
  });

  // Create Membership Cards
  await prisma.membershipCard.create({
    data: {
      cardNumber: 'TH-2026-000001',
      maxBorrow: 5,
      borrowDays: 14,
      expiryDate: new Date('2027-06-30'),
      status: 'active',
      studentId: student1.id
    }
  });

  await prisma.membershipCard.create({
    data: {
      cardNumber: 'TH-2026-000002',
      maxBorrow: 5,
      borrowDays: 14,
      expiryDate: new Date('2027-06-30'),
      status: 'active',
      studentId: student2.id
    }
  });

  await prisma.membershipCard.create({
    data: {
      cardNumber: 'TH-2026-000003',
      maxBorrow: 5,
      borrowDays: 14,
      expiryDate: new Date('2027-06-30'),
      status: 'active',
      studentId: student3.id
    }
  });

  console.log('Created 3 student accounts with profiles and membership cards');

  // ============================================================
  // 5. AUTHORS
  // ============================================================
  console.log('Creating authors...');
  const authors = await Promise.all([
    prisma.author.create({ data: { name: 'Nguyen Nhat Anh', nationality: 'Vietnamese', bio: 'Nha van noi tieng Viet Nam', birthYear: 1955 } }),
    prisma.author.create({ data: { name: 'Nam Cao', nationality: 'Vietnamese', bio: 'Nha van xu Nghe', birthYear: 1917, deathYear: 1951 } }),
    prisma.author.create({ data: { name: 'Xuan Dieu', nationality: 'Vietnamese', bio: 'Nha van Tuong Tan', birthYear: 1916, deathYear: 1985 } }),
    prisma.author.create({ data: { name: 'Thomas H. Cormen', nationality: 'American', bio: 'Computer scientist, co-author of CLRS', birthYear: 1956 } }),
    prisma.author.create({ data: { name: 'Robert C. Martin', nationality: 'American', bio: 'Software engineer, author of Clean Code', birthYear: 1952 } }),
    prisma.author.create({ data: { name: 'Yuval Noah Harari', nationality: 'Israeli', bio: 'Historian and author of Sapiens', birthYear: 1976 } }),
    prisma.author.create({ data: { name: 'James Clear', nationality: 'American', bio: 'Author and speaker on habits', birthYear: 1985 } }),
    prisma.author.create({ data: { name: 'Stephen Hawking', nationality: 'British', bio: 'Theoretical physicist and cosmologist', birthYear: 1942, deathYear: 2018 } }),
  ]);
  console.log(`Created ${authors.length} authors`);

  // ============================================================
  // 6. PUBLISHERS
  // ============================================================
  console.log('Creating publishers...');
  const publishers = await Promise.all([
    prisma.publisher.create({ data: { name: 'NXB Tre', address: 'Ha Noi', foundedYear: 1981 } }),
    prisma.publisher.create({ data: { name: 'NXB Van Hoa', address: 'TP. Ho Chi Minh', foundedYear: 1982 } }),
    prisma.publisher.create({ data: { name: 'NXB Giao Duc', address: 'Ha Noi', foundedYear: 1957 } }),
    prisma.publisher.create({ data: { name: 'MIT Press', address: 'Cambridge, MA', foundedYear: 1962 } }),
    prisma.publisher.create({ data: { name: 'HarperCollins', address: 'New York, NY', foundedYear: 1817 } }),
  ]);
  console.log(`Created ${publishers.length} publishers`);

  // ============================================================
  // 7. BOOKS
  // ============================================================
  console.log('Creating books...');
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'Toan hoc cap 3 - Tap 1',
        isbn: '978-604-01-2345-1',
        year: 2024, pages: 200, language: 'Vietnamese', price: 45000,
        location: 'A1-01', coverColor: '#2563EB', quantity: 20, available: 15,
        description: 'Sach giao khoa Toan hoc lop 10',
        category: { connect: { id: categories[0].id } },
        author: { connect: { id: authors[3].id } },
        publisher: { connect: { id: publishers[2].id } }
      }
    }),
    prisma.book.create({
      data: {
        title: 'Ngu van 10 - Tap 1',
        isbn: '978-604-01-2345-2',
        year: 2024, pages: 180, language: 'Vietnamese', price: 42000,
        location: 'A1-02', coverColor: '#059669', quantity: 25, available: 20,
        description: 'Sach giao khoa Ngu van lop 10',
        category: { connect: { id: categories[0].id } },
        author: { connect: { id: authors[2].id } },
        publisher: { connect: { id: publishers[2].id } }
      }
    }),
    prisma.book.create({
      data: {
        title: 'Chiec xe lua may muoi',
        isbn: '978-604-01-2345-3',
        year: 2020, pages: 200, language: 'Vietnamese', price: 85000,
        location: 'B1-01', coverColor: '#7C3AED', quantity: 5, available: 3,
        description: 'Tieu thuyet noi tieng cua Nguyen Nhat Anh',
        category: { connect: { id: categories[2].id } },
        author: { connect: { id: authors[0].id } },
        publisher: { connect: { id: publishers[0].id } }
      }
    }),
    prisma.book.create({
      data: {
        title: 'Sapiens - Lich su cua loai nguoi',
        isbn: '978-604-01-2345-4',
        year: 2015, pages: 464, language: 'Vietnamese', price: 198000,
        location: 'B2-01', coverColor: '#EA580C', quantity: 8, available: 5,
        description: 'Lich su cua loai nguoi',
        category: { connect: { id: categories[3].id } },
        author: { connect: { id: authors[5].id } },
        publisher: { connect: { id: publishers[4].id } }
      }
    }),
    prisma.book.create({
      data: {
        title: 'Atomic Habits - Thoi quen tuyet voi',
        isbn: '978-604-01-2345-5',
        year: 2018, pages: 320, language: 'Vietnamese', price: 168000,
        location: 'B2-02', coverColor: '#0891B2', quantity: 12, available: 10,
        description: 'Xay dung thoi quen tot',
        category: { connect: { id: categories[4].id } },
        author: { connect: { id: authors[6].id } },
        publisher: { connect: { id: publishers[4].id } }
      }
    }),
    prisma.book.create({
      data: {
        title: 'A Brief History of Time',
        isbn: '978-0553380163',
        year: 1998, pages: 212, language: 'English', price: 250000,
        location: 'C1-01', coverColor: '#06B6D4', quantity: 6, available: 4,
        description: 'From the Big Bang to Black Holes',
        category: { connect: { id: categories[3].id } },
        author: { connect: { id: authors[7].id } },
        publisher: { connect: { id: publishers[3].id } }
      }
    }),
    prisma.book.create({
      data: {
        title: 'Introduction to Algorithms',
        isbn: '978-0262033848',
        year: 2009, pages: 1312, language: 'English', price: 899000,
        location: 'C1-02', coverColor: '#8B5CF6', quantity: 4, available: 2,
        description: 'Comprehensive guide to algorithms',
        category: { connect: { id: categories[3].id } },
        author: { connect: { id: authors[3].id } },
        publisher: { connect: { id: publishers[3].id } }
      }
    }),
  ]);
  console.log(`Created ${books.length} books`);

  // ============================================================
  // 8. BOOK COPIES
  // ============================================================
  console.log('Creating book copies...');
  for (const book of books) {
    for (let i = 1; i <= book.available; i++) {
      await prisma.bookCopy.create({
        data: {
          barcode: `LIB-${book.isbn.replace(/-/g, '').slice(-6)}-${String(i).padStart(2, '0')}`,
          condition: 'new',
          shelfLocation: book.location,
          status: 'available',
          book: { connect: { id: book.id } }
        }
      });
    }
  }
  console.log('Book copies created');

  // ============================================================
  // 4c. SAMPLE BORROW RECORDS
  // ============================================================
  console.log('Creating sample borrow records...');
  const bookCopies = await prisma.bookCopy.findMany({ take: 6 });

  const borrowRecords = await Promise.all([
    // Student 1: 1 active, 1 overdue, 1 returned
    prisma.borrowRecord.create({
      data: {
        borrowDate: new Date('2026-07-04'),
        dueDate: new Date('2026-07-18'),
        status: 'active',
        readerId: student1User.id,
        readerType: 'student',
        studentId: student1.id,
        bookCopyId: bookCopies[0].id,
        bookId: bookCopies[0].bookId
      }
    }),
    prisma.borrowRecord.create({
      data: {
        borrowDate: new Date('2026-06-20'),
        dueDate: new Date('2026-07-04'),
        status: 'overdue',
        readerId: student1User.id,
        readerType: 'student',
        studentId: student1.id,
        bookCopyId: bookCopies[1].id,
        bookId: bookCopies[1].bookId
      }
    }),
    prisma.borrowRecord.create({
      data: {
        borrowDate: new Date('2026-06-01'),
        dueDate: new Date('2026-06-15'),
        returnDate: new Date('2026-06-14'),
        status: 'returned',
        readerId: student1User.id,
        readerType: 'student',
        studentId: student1.id,
        bookCopyId: bookCopies[2].id,
        bookId: bookCopies[2].bookId
      }
    }),
    // Student 2: 1 active, 1 returned
    prisma.borrowRecord.create({
      data: {
        borrowDate: new Date('2026-07-10'),
        dueDate: new Date('2026-07-24'),
        status: 'active',
        readerId: student2User.id,
        readerType: 'student',
        studentId: student2.id,
        bookCopyId: bookCopies[3].id,
        bookId: bookCopies[3].bookId
      }
    }),
    prisma.borrowRecord.create({
      data: {
        borrowDate: new Date('2026-05-15'),
        dueDate: new Date('2026-05-29'),
        returnDate: new Date('2026-05-28'),
        status: 'returned',
        readerId: student2User.id,
        readerType: 'student',
        studentId: student2.id,
        bookCopyId: bookCopies[4].id,
        bookId: bookCopies[4].bookId
      }
    }),
  ]);

  console.log('Created sample borrow records');

  // ============================================================
  // 4d. SAMPLE RESERVATIONS
  // ============================================================
  console.log('Creating sample reservations...');
  await Promise.all([
    prisma.reservation.create({
      data: {
        requestDate: new Date('2026-07-14'),
        estimatedAvailability: new Date('2026-07-20'),
        queuePosition: 1,
        status: 'in_queue',
        readerId: student1User.id,
        readerType: 'student',
        studentId: student1.id,
        bookId: books[0].id
      }
    }),
    prisma.reservation.create({
      data: {
        requestDate: new Date('2026-07-12'),
        estimatedAvailability: new Date('2026-07-18'),
        queuePosition: 0,
        status: 'ready',
        readerId: student1User.id,
        readerType: 'student',
        studentId: student1.id,
        bookId: books[1].id
      }
    }),
    prisma.reservation.create({
      data: {
        requestDate: new Date('2026-07-16'),
        estimatedAvailability: new Date('2026-07-22'),
        queuePosition: 1,
        status: 'in_queue',
        readerId: student2User.id,
        readerType: 'student',
        studentId: student2.id,
        bookId: books[3].id
      }
    }),
  ]);

  console.log('Created sample reservations');

  // ============================================================
  // 4e. SAMPLE FINES
  // ============================================================
  console.log('Creating sample fines...');
  await prisma.fine.create({
    data: {
      amount: 15000,
      reason: 'overdue',
      status: 'pending',
      paidAmount: 0,
      notes: 'Qua han 3 ngay',
      studentId: student1.id,
      borrowRecordId: borrowRecords[1].id
    }
  });

  console.log('Created sample fines');

  // ============================================================
  // 9. BOOK TAGS
  // ============================================================
  console.log('Creating book tags...');
  await Promise.all([
    prisma.bookTag.create({ data: { tag: 'giao khoa', book: { connect: { id: books[0].id } } } }),
    prisma.bookTag.create({ data: { tag: 'giao khoa', book: { connect: { id: books[1].id } } } }),
    prisma.bookTag.create({ data: { tag: 'tieu thuyet', book: { connect: { id: books[2].id } } } }),
    prisma.bookTag.create({ data: { tag: 'khoa hoc', book: { connect: { id: books[3].id } } } }),
    prisma.bookTag.create({ data: { tag: 'phat trien ban than', book: { connect: { id: books[4].id } } } }),
    prisma.bookTag.create({ data: { tag: 'khoa hoc', book: { connect: { id: books[5].id } } } }),
    prisma.bookTag.create({ data: { tag: 'lap trinh', book: { connect: { id: books[6].id } } } }),
  ]);

  console.log('Seed completed!');
  console.log('\nDefault accounts:');
  console.log('  Admin:     admin@library.edu.vn / admin123');
  console.log('  Admin:     thuthu@library.edu.vn / lib123');
  console.log('  Student1:  nam@library.edu.vn / student123');
  console.log('  Student2:  mai@library.edu.vn / student123');
  console.log('  Student3:  duc@library.edu.vn / student123');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
