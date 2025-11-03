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


app.use(cors({
  origin: 'https://tarfeadashboard.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// app.use(cors());
app.use(express.json()); // ✅ must be before routes

mongoose.connect('mongodb+srv://Tarfea:IMHq1xc2LBqkhXRK@tarfeadb.7p6flo2.mongodb.net/?appName=TarfeaDB')
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));


// app.use(cors({
//     origin: 'https://tarfeadashboard.vercel.app/' // or '*' for all origins, but better be specific 
// }));

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});


app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/domestic', domesticRoutes);
app.use('/api', notificationRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
