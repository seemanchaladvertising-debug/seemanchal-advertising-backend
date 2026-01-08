const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getContent, updateContent } = require('../controllers/siteContentController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// @route   GET api/site-content/:docId
// @desc    Get site content by document ID
// @access  Public
router.get('/:docId', getContent);

router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  return res.json({
    url: req.file.path,
    filename: req.file.filename,
  });
});

// @route   PUT api/site-content/:docId
// @desc    Update site content
// @access  Private
router.put('/:docId', auth, updateContent);

module.exports = router;
