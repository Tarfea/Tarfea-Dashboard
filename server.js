// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const dbConnect = require('./db');

const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const domesticRoutes = require('./routes/domesticRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ✅ CORS — only once
app.use(cors({
  origin: 'https://tarfeadashboard.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ✅ Parse JSON before routes
app.use(express.json());

// ✅ Connect to MongoDB (once)
dbConnect()
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/domestic', domesticRoutes);
app.use('/api', notificationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
