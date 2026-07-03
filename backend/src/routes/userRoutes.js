const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), userController.listUsers);
router.get('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), userController.getUserById);
router.post('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), userController.createUser);
router.put('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), userController.updateUser);
router.delete('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), userController.deleteUser);

module.exports = router;