import { getHomeStatsFromDb, searchCasesFromDb, getJudgmentByIdFromDb } from '../repositories/publicRepository.js';
import logger from '../utils/logger.js';

// GET /api/public/home
export const getHomeData = async (req, res) => {
  try {
    const data = await getHomeStatsFromDb();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Failed to get Home data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching home data' });
  }
};

// GET /api/public/search
export const searchJudgments = async (req, res) => {
  try {
    const results = await searchCasesFromDb(req.query);
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    logger.error('Failed to execute search query:', error);
    res.status(500).json({ success: false, message: 'Server error performing legal search' });
  }
};

// GET /api/public/judgment/:id
export const getJudgmentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const judgment = await getJudgmentByIdFromDb(id);

    if (!judgment) {
      return res.status(404).json({ success: false, message: 'Judgment precedent record not found' });
    }

    res.json({
      success: true,
      data: judgment
    });
  } catch (error) {
    logger.error(`Failed to fetch judgment detail for ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error fetching judgment record' });
  }
};
