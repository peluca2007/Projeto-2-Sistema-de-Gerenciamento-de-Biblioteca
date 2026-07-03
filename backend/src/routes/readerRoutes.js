const router = require('express').Router();
const readerController = require('../controllers/readerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), readerController.listReaders);
router.get('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), readerController.getReaderById);
router.post('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), readerController.createReader);
router.put('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), readerController.updateReader);
router.delete('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), readerController.deleteReader);

module.exports = router;