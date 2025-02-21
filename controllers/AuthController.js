import transport from '../middlewares/sendMail.js';
import User from '../models/usersModel.js';
import bcrypt from 'bcryptjs';
import { hmacProcess } from '../utils/hashing.js';

// export const signup = async (req, res) => {

//         const { email,password } = req.body;
//         try {

//             const existingUser = await User.findOne({ email });
//             if (existingUser) {
//                 return res.status(400).json({ success: false, message: "User already exists!" });
//             }

//             // Use doHash for password hashing
//             const saltRounds = 10; // Ensure this is a number
//             const hashedPassword = await bcrypt.hash(password, saltRounds);
//             const codeValue = Math.floor(Math.random() * 1000000).toString();

//             const newUser = new User({
//                 email,
//                 password: hashedPassword,
//                 verificationCode : codeValue,
//                 verificationCodeValidation : Date.now(),
//             });

//             const createUser = await newUser.save();

//             let info = await transport.sendMail({
//                 from : process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
//                 to : email,
//                 subject : "verification code",
//                 html : '<h1>'+ codeValue +'<h1>',
//             });

//             return res.status(201).json({ success: true, message: "User created successfully", user: createUser, emails : info });


//             // if(info.accepted[0] === existingUser.email) {
//             //     const hashedCodeValue = hmacProcess(codeValue,process.env.HMAC_VARIFICATION_CODE_SECRET);

//             //     existingUser.verificationCode = hashedCodeValue;
//             //     existingUser.verificationCodeValidation = Date.now();
//             //     await existingUser.save();
//             //     return res.status(200).json({success : true, message : "code sent!"})
//             // }
//             // return res.status(200).json({success : false, message : "code sent failed!"})

//         } catch (error) {
//             console.log(error)
//         }

// };


export const signup = async (req, res) => {

    const { email,password } = req.body;
    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists!" });
        }

        // Use doHash for password hashing
        const saltRounds = 10; // Ensure this is a number
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        const hashedCodeValue = hmacProcess(codeValue,process.env.HMAC_VARIFICATION_CODE_SECRET);
           
        console.log(hashedCodeValue.Promise)

        const newUser = new User({
            email,
            password: hashedPassword,
            verificationCode : codeValue,
            verificationCodeValidation : Date.now(),
        });

        const createUser = await newUser.save();

        let info = await transport.sendMail({
            from : process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to : email,
            subject : "verification code",
            html : '<h1>'+ codeValue +'<h1>',
        });

        return res.status(201).json({ success: true, message: "code sent!", user: createUser, emails : info });


        // if(info.accepted[0] === existingUser.email) {
        //     const hashedCodeValue = hmacProcess(codeValue,process.env.HMAC_VARIFICATION_CODE_SECRET);

        //     existingUser.verificationCode = hashedCodeValue;
        //     existingUser.verificationCodeValidation = Date.now();
        //     await existingUser.save();
        //     return res.status(200).json({success : true, message : "code sent!"})
        // }
        // return res.status(200).json({success : false, message : "code sent failed!"})

    } catch (error) {
        console.log(error)
    }

};