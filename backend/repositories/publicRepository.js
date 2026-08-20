import { query } from '../config/db.js';
import logger from '../utils/logger.js';
import localStore from '../data/localStore.js';

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
    logger.warn('PostgreSQL offline for getHomeStatsFromDb, reading from localStore');
    const cases = localStore.getCases('Published');
    const users = localStore.getUsers();
    return {
      totalPublishedCases: cases.length,
      totalActiveUsers: users.length,
      recentCases: cases.slice(0, 6)
    };
  }
};

export const searchCasesFromDb = async (params) => {
  const rawTerm = (params.keyword || params.q || params.citation || params.party || '').trim();
  const tab = (params.tab || 'keyword').toLowerCase().trim();

  try {
    let sql = `
      SELECT id, case_number, title, petitioner, respondent, court, judgment_date, year, act, section, head_note, judgment_text, citations
      FROM cases 
      WHERE status = 'Published'
    `;
    const values = [];

    if (rawTerm) {
      const cleanTerm = rawTerm.includes(':') ? rawTerm.split(':').pop().trim() : rawTerm;
      const lowerRaw = rawTerm.toLowerCase();

      // 1. FIND BY CITATION (tab === 'citation' or starts with citation:)
      if (tab === 'citation' || lowerRaw.startsWith('citation:')) {
        const wordTokens = cleanTerm.split(/[\s,()#:]+/).filter(w => w.length > 0);
        const yearToken = wordTokens.find(w => /^(19|20)\d{2}$/.test(w));
        const numberToken = wordTokens.find(w => /^\d+$/.test(w) && w !== yearToken && w !== '08' && w !== '8');

        if (yearToken && numberToken) {
          values.push(`%${yearToken}%`);
          const yIdx = values.length;
          values.push(`%"number":"${numberToken}"%`);
          const nIdx1 = values.length;
          values.push(`%#${numberToken}%`);
          const nIdx2 = values.length;
          sql += ` AND (citations::text ILIKE $${nIdx1} OR citations::text ILIKE $${nIdx2}) AND (citations::text ILIKE $${yIdx} OR judgment_date::text ILIKE $${yIdx})`;
        } else if (numberToken) {
          values.push(`%"number":"${numberToken}"%`);
          const nIdx1 = values.length;
          values.push(`%#${numberToken}%`);
          const nIdx2 = values.length;
          sql += ` AND (citations::text ILIKE $${nIdx1} OR citations::text ILIKE $${nIdx2})`;
        } else if (yearToken) {
          values.push(`%${yearToken}%`);
          const yIdx = values.length;
          sql += ` AND (citations::text ILIKE $${yIdx} OR judgment_date::text ILIKE $${yIdx})`;
        } else {
          values.push(`%${cleanTerm}%`);
          const cIdx = values.length;
          sql += ` AND (citations::text ILIKE $${cIdx})`;
        }
      }

      // 2. FIND BY SECTION / TITLE OR ACT (tab === 'section' or tab === 'act' or tab === 'title')
      else if (tab === 'section' || tab === 'act' || tab === 'title' || tab === 'section_only') {
        const numMatch = cleanTerm.match(/\d+[a-zA-Z]*/);
        values.push(`%${cleanTerm}%`);
        const sIdx = values.length;

        if (numMatch) {
          values.push(`%${numMatch[0]}%`);
          const nIdx = values.length;
          sql += ` AND (
            section ILIKE $${sIdx} OR 
            section ILIKE $${nIdx} OR 
            title ILIKE $${sIdx} OR 
            act ILIKE $${sIdx} OR 
            (act ILIKE $${nIdx} AND (act ILIKE '%section%' OR act ILIKE '%sec%' OR act ILIKE '%u/s%'))
          )`;
        } else {
          sql += ` AND (section ILIKE $${sIdx} OR title ILIKE $${sIdx} OR act ILIKE $${sIdx})`;
        }
      }

      // 3. FIND BY PARTY NAME (tab === 'party')
      else if (tab === 'party') {
        values.push(`%${cleanTerm}%`);
        const pIdx = values.length;
        sql += ` AND (petitioner ILIKE $${pIdx} OR respondent ILIKE $${pIdx} OR title ILIKE $${pIdx})`;
      }

      // 4. FIND BY TOPIC (tab === 'topic')
      else if (tab === 'topic') {
        values.push(`%${cleanTerm}%`);
        const tpIdx = values.length;
        sql += ` AND (act ILIKE $${tpIdx} OR head_note ILIKE $${tpIdx})`;
      }

      // 5. WORDS & PHRASES (tab === 'phrase')
      else if (tab === 'phrase') {
        values.push(`%${cleanTerm}%`);
        const phIdx = values.length;
        sql += ` AND (head_note ILIKE $${phIdx} OR judgment_text ILIKE $${phIdx})`;
      }

      // 6. KEYWORD SEARCH (tab === 'keyword' or default)
      else {
        values.push(`%${cleanTerm}%`);
        const kIdx = values.length;
        sql += ` AND (title ILIKE $${kIdx} OR head_note ILIKE $${kIdx} OR judgment_text ILIKE $${kIdx})`;
      }
    }

    sql += ` ORDER BY judgment_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(params.limit || 50, 10), parseInt(params.offset || 0, 10));

    const res = await query(sql, values);
    return res.rows;
  } catch (error) {
    logger.warn('PostgreSQL query error or offline for searchCasesFromDb, searching localStore for: ' + rawTerm);
    return localStore.searchCases(rawTerm, tab);
  }
};

export const getJudgmentByIdFromDb = async (id) => {
  try {
    const res = await query(`SELECT * FROM cases WHERE id = $1 AND status = 'Published'`, [id]);
    return res.rows[0] || null;
  } catch (error) {
    logger.warn(`PostgreSQL offline for getJudgmentByIdFromDb, getting localStore ID ${id}`);
    return localStore.getCaseById(id);
  }
};
