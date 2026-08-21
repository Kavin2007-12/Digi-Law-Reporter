import express from 'express';
import { login, signup, getSavedCases, saveCases } from '../controllers/authController.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.post('/signup', loginRateLimiter, signup);
router.get('/saved-cases/:identifier', getSavedCases);
router.post('/saved-cases', saveCases);

export default router;
