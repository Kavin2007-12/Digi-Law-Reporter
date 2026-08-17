import express from 'express';
import { adminLogin, uploadJudgment, getUsers, createAdmin, getAdmins, checkCitation } from '../controllers/adminController.js';
import upload from '../middleware/uploadMiddleware.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for login
router.post('/login', adminLogin);

// Protected Routes
// Middleware applied sequentially: Token verification, then Role verification

// Judgments (Allowed for all internal roles except DATA_ENTRY for editing, but for now we follow requirement: 
// SUPER_ADMIN, ADMIN, EDITOR can Upload/Edit. DATA_ENTRY can Add Records. We'll allow all these to POST)
router.get('/judgments/check-citation', verifyToken, requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'DATA_ENTRY']), checkCitation);

router.post('/judgments', 
  verifyToken, 
  requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'DATA_ENTRY']), 
  upload.single('pdfFile'), 
  uploadJudgment
);

// Admin Management (Strictly SUPER_ADMIN only)
router.get('/admins', verifyToken, requireRole(['SUPER_ADMIN']), getAdmins);
router.post('/admins', verifyToken, requireRole(['SUPER_ADMIN']), createAdmin);

// User Management (Allowed for SUPER_ADMIN and ADMIN)
router.get('/users', verifyToken, requireRole(['SUPER_ADMIN', 'ADMIN']), getUsers);

export default router;
