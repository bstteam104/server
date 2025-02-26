import express from 'express';
import { identifier } from '../middlewares/identification.js';
import { status, userList } from '../controllers/AdminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';

const router = express.Router();

router.get("/user-list",identifier, adminAuth, userList);
router.get("/status/:id",identifier, adminAuth, status);

export default router;