import { query } from '../config/db.js';
import logger from '../utils/logger.js';

// Get all cases (with optional status filter & pagination)
export const getAllCasesFromDb = async ({ status, limit = 50, offset = 0 }) => {
  try {
    let sql = `SELECT * FROM cases`;
    const values = [];

    if (status) {
      values.push(status);
      sql += ` WHERE status = $1`;
    }

    sql += ` ORDER BY judgment_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const res = await query(sql, values);
    return res.rows;
  } catch (error) {
    logger.error('Error fetching cases from DB:', error);
    throw error;
  }
};

// Create new case precedent
export const createCaseInDb = async (caseData) => {
  try {
    const {
      caseNumber, title, petitioner, respondent, court, judgmentDate,
      year, act, section, headNote, judgmentText, status, citations
    } = caseData;

    const sql = `
      INSERT INTO cases (
        case_number, title, petitioner, respondent, court, judgment_date,
        year, act, section, head_note, judgment_text, status, citations
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
      RETURNING *
    `;

    const values = [
      caseNumber, title, petitioner, respondent, court || 'Supreme Court of India',
      judgmentDate, parseInt(year || judgmentDate.substring(0, 4), 10),
      act, section, headNote, judgmentText, status || 'Published',
      JSON.stringify(citations || [])
    ];

    const res = await query(sql, values);
    return res.rows[0];
  } catch (error) {
    logger.error('Error inserting case into DB:', error);
    throw error;
  }
};

// Update case precedent
export const updateCaseInDb = async (id, caseData) => {
  try {
    const {
      caseNumber, title, petitioner, respondent, court, judgmentDate,
      year, act, section, headNote, judgmentText, status, citations
    } = caseData;

    const sql = `
      UPDATE cases
      SET 
        case_number = $1, title = $2, petitioner = $3, respondent = $4,
        court = $5, judgment_date = $6, year = $7, act = $8, section = $9,
        head_note = $10, judgment_text = $11, status = $12, citations = $13::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;

    const values = [
      caseNumber, title, petitioner, respondent, court, judgmentDate,
      parseInt(year || judgmentDate.substring(0, 4), 10), act, section,
      headNote, judgmentText, status, JSON.stringify(citations || []), id
    ];

    const res = await query(sql, values);
    return res.rows[0];
  } catch (error) {
    logger.error(`Error updating case ID ${id} in DB:`, error);
    throw error;
  }
};

// Delete case
export const deleteCaseFromDb = async (id) => {
  try {
    const res = await query(`DELETE FROM cases WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0];
  } catch (error) {
    logger.error(`Error deleting case ID ${id} from DB:`, error);
    throw error;
  }
};

// Toggle Case Status (Draft <-> Published)
export const updateCaseStatusInDb = async (id, status) => {
  try {
    const res = await query(
      `UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  } catch (error) {
    logger.error(`Error updating status for case ID ${id}:`, error);
    throw error;
  }
};
