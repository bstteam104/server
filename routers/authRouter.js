import express from 'express';
import { sendVerificationCode, signup, verificationCode } from '../controllers/AuthController.js';


const router = express.Router();

router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-verification-code", verificationCode);
router.post("/signup", signup);

export default router;