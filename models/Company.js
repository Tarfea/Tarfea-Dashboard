// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  licenceExp: { type: Date, required: true },
  munshaExp: { type: Date, required: true },
  mathafiExp: { type: Date, required: true },
  damanExp: { type: Date, required: true },
  echannelExp: { type: Date, required: true },
  status: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Company', companySchema);






