import jwt from 'jsonwebtoken';
import TokenBlacklist from '../models/TokenBlacklist.js';


export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({success : false, message: "Unauthorized" });

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) return res.status(401).json({ success : false, message: "Token expired. Please log in again." });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next();
    }
};