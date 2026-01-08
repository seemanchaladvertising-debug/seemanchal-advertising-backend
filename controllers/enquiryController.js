const { db } = require('../config/firebase');

const createEnquiry = async (req, res) => {
    try {
        const { name, phone, email, subject, message, buildingId } = req.body;

        const newEnquiry = {
            name,
            phone,
            email: email || '',
            subject: subject || '',
            message,
            buildingId: buildingId || null,
            createdAt: new Date(),
            isRead: false
        };

        await db.collection('enquiries').add(newEnquiry);
        res.status(201).json({ msg: 'Enquiry submitted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getEnquiries = async (req, res) => {
    try {
        const snapshot = await db.collection('enquiries').orderBy('createdAt', 'desc').get();
        const enquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(enquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const deleteEnquiry = async (req, res) => {
    try {
        await db.collection('enquiries').doc(req.params.id).delete();
        res.json({ msg: 'Enquiry deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { createEnquiry, getEnquiries, deleteEnquiry };
