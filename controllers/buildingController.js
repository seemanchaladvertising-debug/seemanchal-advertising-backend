const { db } = require('../config/firebase');
const { cloudinary } = require('../config/cloudinary');
const { calculateDistance } = require('../utils/haversine');

const createBuilding = async (req, res) => {
    try {
        const { title, description, locationName, pincode, hoardingSize, marketPrice, dealPrice, discountPercent, facingDirection, hoardingCode, lightType, dailyTraffic, agencyName, lat, lng, isAvailable, seoMetaTitle, seoMetaDescription } = req.body;
        if (!req.files || req.files.length < 1) {
            return res.status(400).json({ msg: 'Please upload at least 1 image' });
        }
        const images = req.files.slice(0, 3).map(file => ({ url: file.path, filename: file.filename }));

        const marketPriceNum = marketPrice === undefined || marketPrice === '' ? null : Number(marketPrice);
        const dealPriceNum = dealPrice === undefined || dealPrice === '' ? null : Number(dealPrice);
        const discountPercentNum = discountPercent === undefined || discountPercent === ''
            ? (marketPriceNum && dealPriceNum && marketPriceNum > 0 ? Math.round(((marketPriceNum - dealPriceNum) / marketPriceNum) * 100) : null)
            : Number(discountPercent);

        const newBuilding = {
            title,
            description,
            locationName,
            pincode,
            hoardingSize: hoardingSize || '',
            marketPrice: Number.isFinite(marketPriceNum) ? marketPriceNum : null,
            dealPrice: Number.isFinite(dealPriceNum) ? dealPriceNum : null,
            discountPercent: Number.isFinite(discountPercentNum) ? discountPercentNum : null,
            facingDirection: facingDirection || '',
            hoardingCode: hoardingCode || '',
            lightType: lightType || '',
            dailyTraffic: dailyTraffic || '',
            agencyName: agencyName || '',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            images,
            isAvailable: isAvailable === 'true',
            seoMeta: {
                title: seoMetaTitle,
                description: seoMetaDescription
            },
            createdAt: new Date()
        };

        const docRef = await db.collection('buildings').add(newBuilding);
        res.status(201).json({ msg: 'Building created successfully', id: docRef.id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getBuildings = async (req, res) => {
    try {
        let query = db.collection('buildings').orderBy('createdAt', 'desc');

        if (req.query.limit) {
            query = query.limit(parseInt(req.query.limit, 10));
        }

        const snapshot = await query.get();
        const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(buildings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getBuildingById = async (req, res) => {
    try {
        const doc = await db.collection('buildings').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ msg: 'Building not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const updateBuilding = async (req, res) => {
    try {
        const { title, description, locationName, pincode, hoardingSize, marketPrice, dealPrice, discountPercent, facingDirection, hoardingCode, lightType, dailyTraffic, agencyName, lat, lng, isAvailable, seoMetaTitle, seoMetaDescription, existingImages } = req.body;
        let images = existingImages ? JSON.parse(existingImages) : [];

        if (req.files) {
            const newImages = req.files.map(file => ({ url: file.path, filename: file.filename }));
            images = [...images, ...newImages];
        }

        if (images.length > 3) {
            return res.status(400).json({ msg: 'Maximum 3 images are allowed' });
        }

        const marketPriceNum = marketPrice === undefined || marketPrice === '' ? null : Number(marketPrice);
        const dealPriceNum = dealPrice === undefined || dealPrice === '' ? null : Number(dealPrice);
        const discountPercentNum = discountPercent === undefined || discountPercent === ''
            ? (marketPriceNum && dealPriceNum && marketPriceNum > 0 ? Math.round(((marketPriceNum - dealPriceNum) / marketPriceNum) * 100) : null)
            : Number(discountPercent);

        const updatedBuilding = {
            title,
            description,
            locationName,
            pincode,
            hoardingSize: hoardingSize || '',
            marketPrice: Number.isFinite(marketPriceNum) ? marketPriceNum : null,
            dealPrice: Number.isFinite(dealPriceNum) ? dealPriceNum : null,
            discountPercent: Number.isFinite(discountPercentNum) ? discountPercentNum : null,
            facingDirection: facingDirection || '',
            hoardingCode: hoardingCode || '',
            lightType: lightType || '',
            dailyTraffic: dailyTraffic || '',
            agencyName: agencyName || '',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            images,
            isAvailable: isAvailable === 'true',
            seoMeta: {
                title: seoMetaTitle,
                description: seoMetaDescription
            }
        };

        await db.collection('buildings').doc(req.params.id).update(updatedBuilding);
        res.json({ msg: 'Building updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const deleteBuilding = async (req, res) => {
    try {
        const docRef = db.collection('buildings').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ msg: 'Building not found' });
        }

        // Delete images from Cloudinary
        const images = doc.data().images;
        if (images && images.length > 0) {
            const filenames = images.map(img => img.filename);
            await cloudinary.api.delete_resources(filenames);
        }

        await docRef.delete();
        res.json({ msg: 'Building deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const searchBuildings = async (req, res) => {
    const { pincode, location } = req.query;

    try {
        let query = db.collection('buildings');
        let exactMatches = [];

        if (pincode) {
            const snapshot = await query.where('pincode', '==', pincode).get();
            exactMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else if (location) {
            const snapshot = await query.where('locationName', '==', location).get();
            exactMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        if (exactMatches.length > 0) {
            return res.json(exactMatches);
        }

        // If no exact matches, find nearest
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ msg: 'Latitude and longitude are required for proximity search' });
        }

        const allBuildingsSnapshot = await db.collection('buildings').where('isAvailable', '==', true).get();
        const allBuildings = allBuildingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const sortedBuildings = allBuildings.map(building => {
            const distance = calculateDistance(lat, lng, building.lat, building.lng);
            return { ...building, distance };
        }).sort((a, b) => a.distance - b.distance);

        res.json(sortedBuildings.slice(0, 10)); // Return nearest 10

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { 
    createBuilding, 
    getBuildings, 
    getBuildingById, 
    updateBuilding, 
    deleteBuilding,
    searchBuildings
}; 
