const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

router.use(require('./publicRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/user', authenticateToken, require('./userRoutes'));

module.exports = router;





