import express from 'express';
import { sendVerificationCode, signin, verificationCode } from '../controllers/AuthController.js';


const router = express.Router();

router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-verification-code", verificationCode);
router.get("/signin", signin);

export default router;