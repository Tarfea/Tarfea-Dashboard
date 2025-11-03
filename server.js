

// server.js

const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const domesticRoutes = require('./routes/domesticRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

mongoose
    .connect(
        'mongodb+srv://Tarfea:IMHq1xc2LBqkhXRK@tarfeadb.7p6flo2.mongodb.net/?appName=TarfeaDB')
    .then(() = > console.log("MongoDB connected"))
    .catch(err = > console.error(err));  // Enable CORS for local development
// (adjust origin as needed)
//
// ✅ CORS — only once
app.use(cors({
    origin: 'https://tarfeadashboard.vercel.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.static(path.join(__dirname, 'frontend')));
app.get(
    '/', (req, res) = > {
        res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
    });

app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/domestic', domesticRoutes);
app.use('/api', notificationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () = > { console.log(Server running on port ${ PORT }); });
