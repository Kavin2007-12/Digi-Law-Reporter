import { query } from '../config/db.js';
import logger from '../utils/logger.js';

export const getHomeStatsFromDb = async () => {
  try {
    const totalCasesRes = await query(`SELECT COUNT(*) FROM cases WHERE status = 'Published'`);
    const totalUsersRes = await query(`SELECT COUNT(*) FROM users WHERE status = 'Active'`);
    const recentCasesRes = await query(`
      SELECT id, case_number, title, petitioner, respondent, court, judgment_date, year, act, section, head_note, citations
      FROM cases 
      WHERE status = 'Published' 
      ORDER BY judgment_date DESC 
      LIMIT 6
    `);

    return {
      totalPublishedCases: parseInt(totalCasesRes.rows[0].count, 10) || 0,
      totalActiveUsers: parseInt(totalUsersRes.rows[0].count, 10) || 0,
      recentCases: recentCasesRes.rows
    };
  } catch (error) {
    logger.error('Error fetching home stats from DB:', error);
    throw error;
  }
};

export const searchCasesFromDb = async (params) => {
  try {
    const { keyword, citation, party, act, section, court, year, limit = 20, offset = 0 } = params;

    let sql = `
      SELECT id, case_number, title, petitioner, respondent, court, judgment_date, year, act, section, head_note, citations
      FROM cases 
      WHERE status = 'Published'
    `;
    const values = [];

    // 1. Full Text Search Keyword Query using GIN Index
    if (keyword && keyword.trim()) {
      values.push(keyword.trim().split(/\s+/).join(' & '));
      sql += ` AND search_vector @@ to_tsquery('english', $${values.length})`;
    }

    // 2. Citation Filter
    if (citation && citation.trim()) {
      values.push(`%${citation.trim()}%`);
      sql += ` AND (citations::text ILIKE $${values.length} OR case_number ILIKE $${values.length})`;
    }

    // 3. Party Filter (Petitioner or Respondent)
    if (party && party.trim()) {
      values.push(`%${party.trim()}%`);
      sql += ` AND (petitioner ILIKE $${values.length} OR respondent ILIKE $${values.length} OR title ILIKE $${values.length})`;
    }

    // 4. Act Filter
    if (act && act.trim()) {
      values.push(`%${act.trim()}%`);
      sql += ` AND act ILIKE $${values.length}`;
    }

    // 5. Section Filter
    if (section && section.trim()) {
      values.push(`%${section.trim()}%`);
      sql += ` AND section ILIKE $${values.length}`;
    }

    // 6. Court Filter
    if (court && court.trim()) {
      values.push(`%${court.trim()}%`);
      sql += ` AND court ILIKE $${values.length}`;
    }

    // 7. Year Filter
    if (year) {
      values.push(parseInt(year, 10));
      sql += ` AND year = $${values.length}`;
    }

    sql += ` ORDER BY judgment_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const res = await query(sql, values);
    return res.rows;
  } catch (error) {
    logger.error('Error executing legal search query:', error);
    throw error;
  }
};

export const getJudgmentByIdFromDb = async (id) => {
  try {
    const res = await query(`SELECT * FROM cases WHERE id = $1 AND status = 'Published'`, [id]);
    return res.rows[0] || null;
  } catch (error) {
    logger.error(`Error fetching judgment with ID ${id}:`, error);
    throw error;
  }
};
