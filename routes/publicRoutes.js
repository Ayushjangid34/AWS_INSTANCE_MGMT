// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const publicController = require('../controllers/publicController');
const isAuthenticated = require('../middlewares/isAuthenticated');


router.get('/', isAuthenticated, publicController.getHomePage);
router.get('/signin', isAuthenticated, publicController.getSignInPage);
router.get('/signup', isAuthenticated, publicController.getSignUpPage);

module.exports = router;