const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, updateProfile, createAdmin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
