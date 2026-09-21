import express from 'express';
import multer from 'multer';
import { getCases, getCaseById, createCase, updateCase, deleteCase, toggleCaseStatus, extractPdfCase } from '../controllers/caseController.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = express.Router();

// Cases Management Routes
router.get('/', getCases);
router.post('/', createCase);
router.post('/extract-pdf', upload.single('pdfFile'), extractPdfCase);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);
router.put('/:id/status', toggleCaseStatus);

export default router;
