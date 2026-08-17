import express from 'express';
import { getCases, createCase, updateCase, deleteCase, toggleCaseStatus } from '../controllers/caseController.js';

const router = express.Router();

// Cases Management Routes
router.get('/', getCases);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);
router.put('/:id/status', toggleCaseStatus);

export default router;
