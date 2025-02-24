import express from 'express';
import { sendVerificationCode, signin, signout, signup, verificationCode } from '../controllers/AuthController.js';
import { identifier } from '../middlewares/identification.js';


const router = express.Router();

router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-verification-code", verificationCode);
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout",identifier, signout);

export default router;