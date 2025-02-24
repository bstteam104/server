import express from 'express';
import { identifier } from '../middlewares/identification.js';
import { profile } from '../controllers/UserController.js';

const router = express.Router();

router.get("/profile",identifier, profile);

export default router;