// models/Domestic.js
const mongoose = require('mongoose');

const domesticSchema = new mongoose.Schema({
    sponsor: { type: String, required: true },
    contact: { type: String, required: true },
    housemaid: { type: String, required: true },
    damanExp: { type: Date, required: true },
    status: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Domestic', domesticSchema);



