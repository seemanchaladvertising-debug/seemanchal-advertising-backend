const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin SDK
require('./config/firebase');

// Routes
app.get('/', (req, res) => {
  res.send('Seemanchal Advertising API is running!');
});

app.use('/api/admin', require('./routes/admin'));
app.use('/api/buildings', require('./routes/buildings'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/site-content', require('./routes/siteContent'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
