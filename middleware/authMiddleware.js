//middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // same as in userRoutes

module.exports = function (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id: user._id, iat, exp }
        next();
    } catch (err) {
        return res.status(400).json({ error: "Invalid token." });
    }
};
