const router = require('express').Router();
const { upload, uploadImage } = require('./upload.routes');
const { authenticate } = require('../middleware/auth');

router.use('/auth', require('./auth.routes'));
router.use('/books', require('./books.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/authors', require('./authors.routes'));
router.use('/publishers', require('./publishers.routes'));
router.use('/readers', require('./readers.routes'));
router.use('/borrowing', require('./borrowing.routes'));
router.use('/reservations', require('./reservations.routes'));
router.use('/fines', require('./fines.routes'));
router.use('/users', require('./users.routes'));
router.use('/roles', require('./roles.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/reports', require('./reports.routes'));

// Upload
router.post('/upload/book-cover', authenticate, upload.single('image'), uploadImage);
router.post('/upload/author-avatar', authenticate, upload.single('image'), uploadImage);

module.exports = router;
