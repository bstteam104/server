import express from 'express';
import { identifier } from '../middlewares/identification.js';
import { profile, signout } from '../controllers/UserController.js';

const router = express.Router();

router.get("/profile",identifier, profile);
router.post("/signout",identifier, signout);

export default router;