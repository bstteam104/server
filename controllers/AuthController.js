import transport from '../middlewares/sendMail.js';
import { RegisterSchema, SignupSchema } from '../middlewares/validator.js';
import User from '../models/usersModel.js';
import crypto from 'node:crypto';  // ✅ Correct way for ESM
import { doHash } from '../utils/hashing.js';




export const sendVerificationCode = async (req, res) => {

    const { email } = req.body;
    try {

        const { error, value } = SignupSchema.validate({ email });

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser && existingUser.verified){
            return res.status(400).json({ success: false, message: "User already exist" });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
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

        let info = await transport.sendMail({
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

        return res.status(200).json({ success: false, message: "unexpected occured !" });

    } catch (error) {
        console.log(error)
    }
};

export const signup = async (req, res) => {

    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const password = req.body.password;

    const { error, value } = RegisterSchema.validate({firstName, lastName, email, phone, password });

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });

    const haspassword = await doHash(password, 10); 

    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.email = email;
    existingUser.phone = phone;
    existingUser.password = haspassword;
    await existingUser.save();
    return res.status(200).json({ success: true, message: "You are register successfully !" });
};
