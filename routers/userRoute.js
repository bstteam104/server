import express from 'express';
import { identifier } from '../middlewares/identification.js';
import {excelDataStore, profile, signout } from '../controllers/UserController.js';

const router = express.Router();

router.get("/profile",identifier, profile);
router.post("/signout",identifier, signout);
router.post("/excel-data",identifier, excelDataStore);

export default router;