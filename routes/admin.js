const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/adminController');

// @route   POST api/admin/google-login
// @desc    Authenticate admin with Google and get token
// @access  Public
router.post('/google-login', googleLogin);

module.exports = router;
