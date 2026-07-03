const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/books', require('./bookRoutes'));
router.use('/readers', require('./readerRoutes'));
router.use('/loans', require('./loanRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;