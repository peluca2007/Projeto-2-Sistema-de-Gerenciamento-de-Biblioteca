const router = require('express').Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO', 'LEITOR'), loanController.listLoans);
router.get('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO', 'LEITOR'), loanController.getLoanById);
router.post('/', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), loanController.createLoan);
router.put('/:id', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), loanController.updateLoan);
router.put('/:id/return', authorizeRoles('ADMIN', 'BIBLIOTECARIO'), loanController.returnLoan);
router.delete('/:id', authorizeRoles('ADMIN'), loanController.deleteLoan);

module.exports = router;