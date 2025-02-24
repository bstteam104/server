import transport from '../middlewares/sendMail.js';
import { SignupSchema } from '../middlewares/validator.js';
import User from '../models/usersModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';  // ✅ Correct way for ESM




export const sendVerificationCode = async (req, res) => {

    const { email } = req.body;
    try {
         
        const {error , value} = SignupSchema.validate({email});

        if(error){
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists!" });
        }

<<<<<<< HEAD
        // Use doHash for password hashing
        // const saltRounds = 10; // Ensure this is a number
        // const hashedPassword = await bcrypt.hash(password, saltRounds);
=======
>>>>>>> d8efd73 (verification code)
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        const hashedCodeValue = crypto.createHmac("sha256", process.env.HMAC_VARIFICATION_CODE_SECRET).update(codeValue).digest("hex");
        
        const newUser = new User({
            email,
<<<<<<< HEAD
            verificationCode : codeValue,
=======
            verificationCode : hashedCodeValue,
>>>>>>> d8efd73 (verification code)
            verificationCodeValidation : Date.now(),
        });

        const createUser = await newUser.save();

        let info = await transport.sendMail({
            from : process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to : email,
            subject : "verification code",
            html : '<h1>'+ codeValue +'<h1>',
        });

        return res.status(201).json({ success: true, message: "code sent!", user: createUser});

    } catch (error) {
        console.log(error)
    }

};

export const verificationCode = async (req, res) => {
    
    const {email, code} = req.body;

    try{
         
        const  codeValue = code.toString();
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

        if(Date.now() - existingUser.verificationCodeValidation > 5 * 60 *1000){
            return res.status(400).json({ success: false, message: "Code has been expired !" });
        }

        const hashedCodeValue = crypto.createHmac("sha256", process.env.HMAC_VARIFICATION_CODE_SECRET).update(codeValue).digest("hex");

       if(hashedCodeValue  === existingUser.verificationCode){
           
               existingUser.verified = true;
               existingUser.verificationCode = undefined;
               existingUser.verificationCodeValidation = undefined;

               await existingUser.save();

               return res.status(200).json({ success: true, message: "Your account has been verified !" });
       }

       return res.status(200).json({ success: false, message: "unexpected occured !" });
    
    } catch(error){
        console.log(error)
    }
};

export const signin = async (req, res) => {

    return res.status(200).json({success : true, message : "code sent sent!"})


};
