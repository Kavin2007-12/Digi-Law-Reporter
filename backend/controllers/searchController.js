import judgmentRepository from '../repositories/judgmentRepository.js';
import logger from '../utils/logger.js';

export const search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ status: 'error', message: 'Search query is required' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // GIN index based fast search
    const results = await judgmentRepository.searchJudgments(q, parseInt(limit), offset);

    res.json({
      status: 'success',
      count: results.length,
      data: results
    });

  } catch (error) {
    logger.error('Search API error', error);
    res.status(500).json({ status: 'error', message: 'Database search error' });
  }
};
