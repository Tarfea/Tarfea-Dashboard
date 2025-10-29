const mongoose = require('mongoose');

const notificationDismissSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    field: { type: String, required: true }, // e.g. 'licenceExp'
    dismissedAt: { type: Date, default: Date.now },
    // optionally, if you have users:
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('NotificationDismiss', notificationDismissSchema);
