import express from 'express';
import { 
  adminLogin, uploadJudgment, getUsers, createAdmin, 
  getAdmins, checkCitation, updateAdminPassword, deleteAdmin,
  getSettings, saveSettings, adminForgotPassword, adminResetPassword
} from '../controllers/adminController.js';
import upload from '../middleware/uploadMiddleware.js';
import { forgotPasswordRateLimiter, loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Auth & Password Reset Routes
router.post('/login', loginRateLimiter, adminLogin);
router.post('/forgot-password', forgotPasswordRateLimiter, adminForgotPassword);
router.post('/reset-password', adminResetPassword);

// Protected Admin Management Routes
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id/password', updateAdminPassword);
router.delete('/admins/:id', deleteAdmin);

// Settings Routes
router.get('/settings', getSettings);
router.post('/settings', saveSettings);

// User & Judgment Management Routes
router.get('/users', getUsers);
router.get('/judgments/check-citation', checkCitation);
router.post('/judgments', upload.single('pdfFile'), uploadJudgment);

export default router;
