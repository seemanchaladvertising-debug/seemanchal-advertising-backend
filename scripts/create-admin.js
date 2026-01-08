require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { db } = require('../config/firebase');

const createAdmin = async (email) => {
  if (!email) {
    console.error('Please provide an email.');
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const snapshot = await db.collection('admins').where('email', '==', email).get();
    if (!snapshot.empty) {
      console.log('Admin with this email already exists.');
      process.exit(0);
    }

    // Create new admin
    await db.collection('admins').add({
      email,
      role: 'superadmin',
      createdAt: new Date(),
    });

    console.log(`Admin user ${email} created successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

const email = process.argv[2];

createAdmin(email);
