const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
    createEnquiry,
    getEnquiries,
    deleteEnquiry
} = require('../controllers/enquiryController');

// Public route
router.post('/', createEnquiry);

// Admin routes (protected)
router.get('/', auth, getEnquiries);
router.delete('/:id', auth, deleteEnquiry);

module.exports = router;
