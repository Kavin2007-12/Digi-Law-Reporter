import express from 'express';
import { getHomeData, searchJudgments, getJudgmentDetail } from '../controllers/publicController.js';

const router = express.Router();

// Public Legal Portal Endpoints
router.get('/home', getHomeData);
router.get('/search', searchJudgments);
router.get('/judgment/:id', getJudgmentDetail);

export default router;
