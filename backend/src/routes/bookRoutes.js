const router = require('express').Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO', 'LEITOR'), bookController.listBooks);
router.get('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO', 'LEITOR'), bookController.getBookById);
router.post('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), bookController.createBook);
router.put('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), bookController.updateBook);
router.delete('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), bookController.deleteBook);

module.exports = router;