const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const auth = require('../middleware/authMiddleware');
const { 
    createBlog,
    getBlogs,
    getBlogBySlug,
    getBlogById,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');

// Public routes
router.get('/', getBlogs);
// @route   GET api/blogs/:slug
// @desc    Get a single blog post by slug
// @access  Public
router.get('/:slug', getBlogBySlug);
// @route   GET api/blogs/id/:id
// @desc    Get a single blog post by ID
// @access  Public (for admin edit)
router.get('/id/:id', getBlogById);

// Admin routes (protected)
router.post('/', auth, upload.single('image'), createBlog);
router.put('/:id', auth, upload.single('image'), updateBlog);
router.delete('/:id', auth, deleteBlog);

module.exports = router;
