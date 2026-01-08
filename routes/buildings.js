const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const auth = require('../middleware/authMiddleware');
const { 
    createBuilding,
    getBuildings,
    getBuildingById,
    updateBuilding,
    deleteBuilding,
    searchBuildings
} = require('../controllers/buildingController');

// Public routes
router.get('/search', searchBuildings);
router.get('/', getBuildings);
router.get('/:id', getBuildingById);

// Admin routes (protected)
router.post('/', auth, upload.array('images', 3), createBuilding);
router.put('/:id', auth, upload.array('images', 3), updateBuilding);
router.delete('/:id', auth, deleteBuilding);

module.exports = router;
