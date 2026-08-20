import { query } from '../config/db.js';
import logger from '../utils/logger.js';
import localStore from '../data/localStore.js';

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
    logger.warn('PostgreSQL offline for getAllCasesFromDb, reading from localStore');
    return localStore.getCases(status);
  }
};

// Get single case by ID
export const getCaseByIdFromDb = async (id) => {
  try {
    const numericId = parseInt(id, 10);
    let res;
    if (!isNaN(numericId)) {
      res = await query(`SELECT * FROM cases WHERE id = $1 OR id::text = $2`, [numericId, String(id)]);
    } else {
      res = await query(`SELECT * FROM cases WHERE id::text = $1`, [String(id)]);
    }
    if (res && res.rows && res.rows.length > 0) return res.rows[0];
    return localStore.getCaseById(id);
  } catch (error) {
    logger.warn(`PostgreSQL query error for getCaseByIdFromDb, falling back to localStore ID ${id}`);
    return localStore.getCaseById(id);
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
    logger.warn('PostgreSQL offline for createCaseInDb, saving to localStore');
    return localStore.addCase(caseData);
  }
};

// Update case precedent
export const updateCaseInDb = async (id, caseData) => {
  try {
    const {
      caseNumber, title, petitioner, respondent, court, judgmentDate,
      year, act, section, headNote, judgmentText, status, citations
    } = caseData;

    const numericId = parseInt(id, 10);
    const sql = `
      UPDATE cases
      SET 
        case_number = $1, title = $2, petitioner = $3, respondent = $4,
        court = $5, judgment_date = $6, year = $7, act = $8, section = $9,
        head_note = $10, judgment_text = $11, status = $12, citations = $13::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 OR id::text = $15
      RETURNING *
    `;

    const values = [
      caseNumber, title, petitioner, respondent, court, judgmentDate,
      parseInt(year || (judgmentDate ? judgmentDate.substring(0, 4) : '2026'), 10), act, section,
      headNote, judgmentText, status, JSON.stringify(citations || []),
      isNaN(numericId) ? 0 : numericId, String(id)
    ];

    const res = await query(sql, values);
    const updatedLocal = localStore.updateCase(id, caseData);
    if (res && res.rows && res.rows[0]) {
      return res.rows[0];
    }
    return updatedLocal;
  } catch (error) {
    logger.warn(`PostgreSQL offline for updateCaseInDb, updating localStore ID ${id}`);
    return localStore.updateCase(id, caseData);
  }
};

// Delete case permanently from database
export const deleteCaseFromDb = async (id) => {
  try {
    const numericId = parseInt(id, 10);
    let res;
    if (!isNaN(numericId)) {
      res = await query(`DELETE FROM cases WHERE id = $1 OR id::text = $2 RETURNING *`, [numericId, String(id)]);
    } else {
      res = await query(`DELETE FROM cases WHERE id::text = $1 RETURNING *`, [String(id)]);
    }
    if (res && res.rows && res.rows.length > 0) return res.rows[0];
    return localStore.deleteCase(id);
  } catch (error) {
    logger.warn(`PostgreSQL query error for deleteCaseFromDb, deleting from localStore ID ${id}`);
    return localStore.deleteCase(id);
  }
};

// Update case status
export const updateCaseStatusInDb = async (id, status) => {
  try {
    const res = await query(`UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [status, id]);
    return res.rows[0];
  } catch (error) {
    logger.warn(`PostgreSQL offline for updateCaseStatusInDb, updating localStore ID ${id}`);
    return localStore.updateCase(id, { status });
  }
};
