const router = require('express').Router();
const { getDashboard } = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN'), getDashboard);

module.exports = router;
