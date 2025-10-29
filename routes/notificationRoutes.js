const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const NotificationDismiss = require('../models/NotificationDismiss');

router.get('/notifications', async (req, res) => {
    try {
        const today = new Date();

        // Get all dismissed notifications (if per user, filter by userId here)
        const dismissed = await NotificationDismiss.find({});

        // We'll create a Set of strings "companyId_field" to easily exclude dismissed notifications
        const dismissedSet = new Set(dismissed.map(d => `${d.companyId.toString()}_${d.field}`));

        const companies = await Company.find({});

        const notifications = [];

        companies.forEach(company => {
            const fields = [
                { key: 'licenceExp', label: 'License' },
                { key: 'munshaExp', label: 'Munsha' },
                { key: 'mathafiExp', label: 'Mathafi' },
                { key: 'damanExp', label: 'Daman' },
                { key: 'echannelExp', label: 'E-Channel' },
            ];

            fields.forEach(({ key, label }) => {
                const keyIdentifier = `${company._id.toString()}_${key}`;
                if (dismissedSet.has(keyIdentifier)) {
                    // Skip dismissed notification
                    return;
                }

                const expDate = company[key];
                const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    notifications.push({
                        companyId: company._id,
                        field: key,
                        type: 'Expired',
                        companyName: company.companyName,
                        label,
                        date: expDate,
                    });
                } else if (diffDays <= 30) {
                    notifications.push({
                        companyId: company._id,
                        field: key,
                        type: 'Nearly Expired',
                        companyName: company.companyName,
                        label,
                        date: expDate,
                    });
                }
            });
        });

        // Sort by priority: Expired first, then Nearly Expired by date ascending
        notifications.sort((a, b) => {
            if (a.type === 'Expired' && b.type !== 'Expired') return -1;
            if (a.type !== 'Expired' && b.type === 'Expired') return 1;
            return new Date(a.date) - new Date(b.date);
        });

        res.json(notifications);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
});

router.post('/notifications/dismiss', async (req, res) => {
    try {
        const { companyId, field } = req.body;
        if (!companyId || !field) {
            return res.status(400).json({ error: 'companyId and field are required' });
        }

        // Check if already dismissed
        const exists = await NotificationDismiss.findOne({ companyId, field });
        if (exists) {
            return res.json({ message: 'Already dismissed' });
        }

        // Save dismissal
        await NotificationDismiss.create({ companyId, field });
        res.json({ message: 'Notification dismissed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to dismiss notification' });
    }
});

module.exports = router;
