import express from 'express';
import { login, signup, getSavedCases, saveCases } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/saved-cases/:identifier', getSavedCases);
router.post('/saved-cases', saveCases);

export default router;
