export const profile = async (req, res) => {
    try {
        // The user info is already stored in `req.user` from the middleware
        res.json({
            success: true,
            message: "User profile fetched successfully",
            user: req.user, // This contains user ID and other claims from the token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}