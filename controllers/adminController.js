const jwt = require('jsonwebtoken');
const { db, admin } = require('../config/firebase');

const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    const snapshot = await db.collection('admins').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(403).json({ msg: 'Access denied. You are not an authorized admin.' });
    }

    const payload = { admin: { id: snapshot.docs[0].id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.json({ token });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ msg: 'Invalid token or authentication failed.' });
  }
};

module.exports = { googleLogin };
