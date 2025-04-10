import express from 'express';
import { identifier } from '../middlewares/identification.js';
import {excelDataStore, profile, signout } from '../controllers/UserController.js';
import { getCustomInsight,getInsights } from '../controllers/customInsightController.js';

const router = express.Router();

router.get("/profile",identifier, profile);
router.post("/signout",identifier, signout);
router.post("/excel-data",identifier, excelDataStore);
router.post('/get-insights', identifier, getInsights);
router.post('/get-custom-insights', identifier, getCustomInsight);

export default router;