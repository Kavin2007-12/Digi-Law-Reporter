import { 
  getAllCasesFromDb, getCaseByIdFromDb, createCaseInDb, updateCaseInDb, 
  deleteCaseFromDb, updateCaseStatusInDb 
} from '../repositories/caseRepository.js';
import logger from '../utils/logger.js';

// GET /api/cases
export const getCases = async (req, res) => {
  try {
    const casesList = await getAllCasesFromDb(req.query);
    res.json({ success: true, count: casesList.length, data: casesList });
  } catch (error) {
    logger.error('Failed to fetch cases:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cases' });
  }
};

// GET /api/cases/:id
export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseItem = await getCaseByIdFromDb(id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case record not found' });
    }
    res.json({ success: true, data: caseItem });
  } catch (error) {
    logger.error(`Failed to fetch case ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error fetching case' });
  }
};

// POST /api/cases
export const createCase = async (req, res) => {
  try {
    const newCase = await createCaseInDb(req.body);
    res.status(201).json({ success: true, message: 'Case created successfully', data: newCase });
  } catch (error) {
    logger.error('Failed to create case:', error);
    res.status(500).json({ success: false, message: 'Server error creating case' });
  }
};

// PUT /api/cases/:id
export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCase = await updateCaseInDb(id, req.body);
    if (!updatedCase) {
      return res.status(404).json({ success: false, message: 'Case record not found' });
    }
    res.json({ success: true, message: 'Case updated successfully', data: updatedCase });
  } catch (error) {
    logger.error(`Failed to update case ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error updating case' });
  }
};

// DELETE /api/cases/:id -> Permanently deletes case record
export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCase = await deleteCaseFromDb(id);
    if (!deletedCase) {
      return res.status(404).json({ success: false, message: 'Case record not found' });
    }
    res.json({ success: true, message: 'Case deleted permanently successfully', data: deletedCase });
  } catch (error) {
    logger.error(`Failed to delete case ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error deleting case' });
  }
};

// PUT /api/cases/:id/status
export const toggleCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateCaseStatusInDb(id, status);
    res.json({ success: true, message: `Case status updated to ${status}`, data: updated });
  } catch (error) {
    logger.error(`Failed to toggle status for case ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};
