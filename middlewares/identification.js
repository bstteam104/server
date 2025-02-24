import jwt from 'jsonwebtoken';

export const identifier = (req, res, next) => {
    let token;

    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    } else {
        token = req.cookies['Authorization'];
    }

    if (!token) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
        // If token has "Bearer ", split it, otherwise use it as is
        const userToken = token.startsWith("Bearer ") ? token.split(' ')[1] : token;

        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

        if (jwtVerified) {
            req.user = jwtVerified;
            return next();
        } else {
            throw new Error("Invalid token");
        }

    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
