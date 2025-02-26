import jwt from "jsonwebtoken";

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


export const signout = async(req, res) => {
    res.clearCookie('Authorization').status(200).json({success : true, message : "logged out successfully"});
}