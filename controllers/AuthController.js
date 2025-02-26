import jwt from 'jsonwebtoken';
import transport from '../middlewares/sendMail.js';
import { RegisterSchema, SigninSchema, SignupSchema } from '../middlewares/validator.js';
import User from '../models/usersModel.js';
import crypto, { verify } from 'node:crypto';  // ✅ Correct way for ESM
import { doHash, doHashValidation } from '../utils/hashing.js';

export const sendVerificationCode = async (req, res) => {

    const { email } = req.body;
    try {

        const { error, value } = SignupSchema.validate({ email });

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.verified) {
            return res.status(409).json({ success: false, message: "User already exist" });
        }

        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCodeValue = crypto.createHmac("sha256", process.env.HMAC_VARIFICATION_CODE_SECRET).update(codeValue).digest("hex");

        let user;

        if (existingUser) {
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            user = await existingUser.save();
        } else {
            const newUser = new User({
                email,
                verificationCode: hashedCodeValue,
                verificationCodeValidation: Date.now(),
            });
            user = await newUser.save();
        }
        await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: email,
            subject: "verification code",
            html: '<h1>' + codeValue + '<h1>',
        });

        return res.status(201).json({ success: true, message: "code sent!", user });

    } catch (error) {
        console.log(error)
    }

};

export const verificationCode = async (req, res) => {

    const { email, code } = req.body;

    try {

        const codeValue = code.toString();
        const existingUser = await User.findOne({ email }).select("+verificationCode +verificationCodeValidation");

        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User does not exists!" });
        }

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "You are already verified!" });
        }

        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "Something is wrong with the code" });
        }

        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "Code has been expired !" });
        }

        const hashedCodeValue = crypto.createHmac("sha256", process.env.HMAC_VARIFICATION_CODE_SECRET).update(codeValue).digest("hex");

        if (hashedCodeValue === existingUser.verificationCode) {

            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;

            await existingUser.save();

            return res.status(200).json({ success: true, message: "Your account has been verified !" });
        }

        return res.status(400).json({ success: false, message: "unexpected occured !" });

    } catch (error) {
        console.log(error)
    }
};

export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Validate request data
        const { error } = RegisterSchema.validate({ firstName, lastName, email, phone, password });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Check if user exists
        let existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Hash password
        const hashedPassword = await doHash(password, 10);

        // Update user details
        Object.assign(existingUser, { firstName, lastName, phone, password: hashedPassword });
        await existingUser.save();

        return res.status(200).json({ success: true, message: "You are registered successfully!" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate request body
        const { error, value } = SigninSchema.validate({ email, password });

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email, isAdmin: false }).select("+password");

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }

        if (!existingUser.verified) {
            return res.status(401).json({ success: false, message: "You are not active!" });
        }

        // Validate password
        const isValidPassword = await doHashValidation(password, existingUser.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
                isAdmin: existingUser.isAdmin,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        // Set cookie and return response
        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000), 
            httpOnly: process.env.NODE_ENV === 'production', 
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({
            success: true,
            token,
            user: existingUser,  // Changed `existingUser` to `user` for clarity
            message: "Logged in successfully"
        });

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const adminSignin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate request body
        const { error, value } = SigninSchema.validate({ email, password });

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email, isAdmin: true }).select("+password");
        
        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }

        // Validate password
        const isValidPassword = await doHashValidation(password, existingUser.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
                isAdmin: existingUser.isAdmin,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        // Set cookie and return response
        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000), 
            httpOnly: process.env.NODE_ENV === 'production', 
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({
            success: true,
            token,
            user: existingUser,  // Changed `existingUser` to `user` for clarity
            message: "Logged in successfully"
        });

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};






