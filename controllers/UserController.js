import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/TokenBlacklist.js"; // Ensure correct path
import ExcelData from "../models/excelData.js"; // Ensure correct path

export const profile = async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.TOKEN_SECRET);


        return res.status(200).json({ success: true, user : decoded });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};


// export const signout = async(req, res) => {
//     res.clearCookie('Authorization').status(200).json({success : true, message : "logged out successfully"});
// }

export const signout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Get token from header
        if (!token) return res.status(401).json({success : false, message: "Unauthorized" });

        // Verify and decode token (ignoring expiration to get expiry time)
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET, { ignoreExpiration: true });
        if (!decoded) return res.status(401).json({success : false, message: "Invalid token" });

        const expiresAt = new Date(decoded.exp * 1000);

        // Store token in blacklist
        await TokenBlacklist.create({ token, expiresAt });

        res.json({success : true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error.message);
        res.status(500).json({success : false, message: "Error logging out", error: error.message });
    }
};

export const excelDataStore = async (req, res) => {
    try {
        // Check if required fields are present
        if (!req.body.userId || !req.body.data) {
            return res.status(400).json({ success: false, message: "userId and data are required!" });
        }

        const result = new ExcelData({
            userId: req.body.userId,
            data: req.body.data,
        });

        const dt = await result.save();
        res.status(201).json({ success: true, message: "Data saved successfully!", data: dt });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving data", error: error.message });
    }
};
