import { query } from '../config/db.js';
import logger from '../utils/logger.js';

// Get all cases (with optional status filter & pagination) from PostgreSQL
export const getAllCasesFromDb = async ({ status, limit = 50, offset = 0 }) => {
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
};

// Get single case by ID from PostgreSQL
export const getCaseByIdFromDb = async (id) => {
  const numericId = parseInt(id, 10);
  let res;
  if (!isNaN(numericId)) {
    res = await query(`SELECT * FROM cases WHERE id = $1 OR id::text = $2`, [numericId, String(id)]);
  } else {
    res = await query(`SELECT * FROM cases WHERE id::text = $1`, [String(id)]);
  }
  return (res && res.rows && res.rows.length > 0) ? res.rows[0] : null;
};

// Create new case precedent in PostgreSQL
export const createCaseInDb = async (caseData) => {
  const {
    caseNumber, title, petitioner, respondent, court, judgmentDate,
    year, act, section, headNote, judgmentText, status, citations
  } = caseData;

  const validDate = judgmentDate && String(judgmentDate).trim().length >= 8 
    ? String(judgmentDate).trim() 
    : new Date().toISOString().split('T')[0];
  const validYear = parseInt(year || (validDate ? validDate.substring(0, 4) : '2026'), 10) || new Date().getFullYear();

  const sql = `
    INSERT INTO cases (
      case_number, title, petitioner, respondent, court, judgment_date,
      year, act, section, head_note, judgment_text, status, citations
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
    RETURNING *
  `;

  const values = [
    caseNumber,
    title,
    petitioner || null,
    respondent || null,
    court || 'Supreme Court of India',
    validDate,
    validYear,
    act || null,
    section || null,
    headNote || null,
    judgmentText || null,
    status || 'Published',
    JSON.stringify(citations || [])
  ];

  const res = await query(sql, values);
  return res.rows[0];
};

// Update case precedent in PostgreSQL
export const updateCaseInDb = async (id, caseData) => {
  const {
    caseNumber, title, petitioner, respondent, court, judgmentDate,
    year, act, section, headNote, judgmentText, status, citations
  } = caseData;

  const numericId = parseInt(id, 10);
  const validDate = judgmentDate && String(judgmentDate).trim().length >= 8 
    ? String(judgmentDate).trim() 
    : new Date().toISOString().split('T')[0];
  const validYear = parseInt(year || (validDate ? validDate.substring(0, 4) : '2026'), 10) || new Date().getFullYear();

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
    caseNumber,
    title,
    petitioner || null,
    respondent || null,
    court || 'Supreme Court of India',
    validDate,
    validYear,
    act || null,
    section || null,
    headNote || null,
    judgmentText || null,
    status || 'Published',
    JSON.stringify(citations || []),
    isNaN(numericId) ? 0 : numericId,
    String(id)
  ];

  const res = await query(sql, values);
  return (res && res.rows && res.rows.length > 0) ? res.rows[0] : null;
};

// Delete case permanently from PostgreSQL
export const deleteCaseFromDb = async (id) => {
  const numericId = parseInt(id, 10);
  let res;
  if (!isNaN(numericId)) {
    res = await query(`DELETE FROM cases WHERE id = $1 OR id::text = $2 RETURNING *`, [numericId, String(id)]);
  } else {
    res = await query(`DELETE FROM cases WHERE id::text = $1 RETURNING *`, [String(id)]);
  }
  return (res && res.rows && res.rows.length > 0) ? res.rows[0] : null;
};

// Update case status in PostgreSQL
export const updateCaseStatusInDb = async (id, status) => {
  const numericId = parseInt(id, 10);
  const res = !isNaN(numericId)
    ? await query(`UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR id::text = $3 RETURNING *`, [status, numericId, String(id)])
    : await query(`UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id::text = $2 RETURNING *`, [status, String(id)]);

  return (res && res.rows && res.rows.length > 0) ? res.rows[0] : null;
};
