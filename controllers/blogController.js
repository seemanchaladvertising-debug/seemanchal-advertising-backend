const { db } = require('../config/firebase');
const { cloudinary } = require('../config/cloudinary');

const createBlog = async (req, res) => {
    try {
        const { title, content, slug, seoMetaTitle, seoMetaDescription } = req.body;
        const image = { url: req.file.path, filename: req.file.filename };

        const newBlog = {
            title,
            content,
            image,
            slug,
            seoMeta: {
                title: seoMetaTitle,
                description: seoMetaDescription
            },
            createdAt: new Date()
        };

        const docRef = await db.collection('blogs').add(newBlog);
        res.status(201).json({ msg: 'Blog created successfully', id: docRef.id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getBlogs = async (req, res) => {
    try {
        const snapshot = await db.collection('blogs').orderBy('createdAt', 'desc').get();
        const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getBlogBySlug = async (req, res) => {
    try {
        const snapshot = await db.collection('blogs').where('slug', '==', req.params.slug).limit(1).get();
        if (snapshot.empty) {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        const blog = snapshot.docs[0].data();
        res.json({ id: snapshot.docs[0].id, ...blog });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const updateBlog = async (req, res) => {
    try {
        const { title, content, slug, seoMetaTitle, seoMetaDescription, existingImage } = req.body;
        let image = existingImage ? JSON.parse(existingImage) : null;

        if (req.file) {
            image = { url: req.file.path, filename: req.file.filename };
        }

        const updatedBlog = {
            title,
            content,
            slug,
            image,
            seoMeta: {
                title: seoMetaTitle,
                description: seoMetaDescription
            }
        };

        await db.collection('blogs').doc(req.params.id).update(updatedBlog);
        res.json({ msg: 'Blog updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const deleteBlog = async (req, res) => {
    try {
        const docRef = db.collection('blogs').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Delete image from Cloudinary
        const image = doc.data().image;
        if (image && image.filename) {
            await cloudinary.uploader.destroy(image.filename);
        }

        await docRef.delete();
        res.json({ msg: 'Blog deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getBlogById = async (req, res) => {
    try {
        const doc = await db.collection('blogs').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { createBlog, getBlogs, getBlogBySlug, getBlogById, updateBlog, deleteBlog };
