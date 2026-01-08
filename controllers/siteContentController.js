const { db } = require('../config/firebase');

// Get content by document ID (e.g., 'pages', 'settings')
const getContent = async (req, res) => {
    try {
        const docRef = db.collection('site_content').doc(req.params.docId);
        let doc = await docRef.get();

        if (!doc.exists) {
            // If the document doesn't exist, create it with default data
            if (req.params.docId === 'homepage') {
                const defaultHomepageData = {
                    hero: {
                        title: 'Find Your Perfect Advertising Space',
                        subtitle: 'The #1 platform for billboard and outdoor advertising in Seemanchal.',
                        backgroundImage: null,
                        slider: {
                            enabled: false,
                            intervalMs: 5000,
                            images: []
                        }
                    },
                    sections: {
                        featuredLocations: { enabled: true, title: 'Featured Locations' },
                        whyUs: { enabled: true },
                        latestBlog: { enabled: true },
                        cta: { enabled: true }
                    },
                    whyUs: {
                        title: 'Why Seemanchal Advertising?',
                        features: [
                            { icon: 'Target', title: 'Strategic Locations', description: 'Prime spots that guarantee maximum visibility and audience engagement.' },
                            { icon: 'Award', title: 'Premium Quality', description: 'High-quality materials and printing for impactful, long-lasting displays.' },
                            { icon: 'Users', title: 'Expert Support', description: 'Dedicated support from our team of advertising professionals.' }
                        ]
                    },
                    cta: {
                        title: 'Ready to Boost Your Brand\'s Visibility?',
                        subtitle: 'Contact us today to find the perfect advertising space for your business.',
                        buttonText: 'Enquire Now',
                        buttonUrl: '/contact'
                    }
                };
                await docRef.set(defaultHomepageData);
                doc = await docRef.get(); // Re-fetch the document
            } else if (req.params.docId === 'footer') {
                const defaultFooterData = {
                    about: {
                        logoUrl: '/logo-placeholder.png',
                        text: 'The #1 platform for billboard and outdoor advertising in Seemanchal, connecting businesses with their target audiences through high-impact, strategically placed hoardings.'
                    },
                    quickLinks: [
                        { label: 'Home', url: '/' },
                        { label: 'About Us', url: '/about' },
                        { label: 'Contact Us', url: '/contact' },
                        { label: 'Blog', url: '/blog' }
                    ],
                    contact: {
                        address: '123 Advertising Lane, Seemanchal, Bihar',
                        email: 'info@seemanchalads.com',
                        phone: '+91 12345 67890'
                    },
                    socialLinks: [
                        { platform: 'Facebook', url: 'https://facebook.com' },
                        { platform: 'Twitter', url: 'https://twitter.com' },
                        { platform: 'Instagram', url: 'https://instagram.com' }
                    ]
                };
                await docRef.set(defaultFooterData);
                doc = await docRef.get();
            } else if (req.params.docId === 'settings') {
                const defaultSettingsData = {
                    whatsappNumber: '',
                    seoTitle: 'Seemanchal Advertising',
                    seoDescription: 'The #1 platform for billboard and outdoor advertising in Seemanchal.'
                };
                await docRef.set(defaultSettingsData);
                doc = await docRef.get();
            } else if (req.params.docId === 'pages') {
                const defaultPagesData = {
                    aboutContent: '',
                    contactContent: '',
                    termsContent: '',
                    privacyContent: ''
                };
                await docRef.set(defaultPagesData);
                doc = await docRef.get();
            } else {
                return res.status(404).json({ msg: 'Content not found' });
            }
        }
        
        res.json(doc.data());
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update content by document ID
const updateContent = async (req, res) => {
    try {
        if (req.params.docId === 'homepage' && req.body?.hero?.slider?.images && Array.isArray(req.body.hero.slider.images)) {
            req.body.hero.slider.images = req.body.hero.slider.images.slice(0, 3);
        }
        await db.collection('site_content').doc(req.params.docId).set(req.body, { merge: true });
        res.json({ msg: 'Content updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { getContent, updateContent };
