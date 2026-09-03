import { query, isDbOnline } from '../config/db.js';
import logger from '../utils/logger.js';
import localStore from '../data/localStore.js';

export const getHomeStatsFromDb = async () => {
  if (!isDbOnline) {
    const cases = localStore.getCases('Published');
    const users = localStore.getUsers();
    return {
      totalPublishedCases: cases.length,
      totalActiveUsers: users.length,
      recentCases: cases.slice(0, 6)
    };
  }
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

  if (!isDbOnline) {
    return localStore.searchCases(rawTerm, tab);
  }

  try {
    let sql = `
      SELECT id, case_number, title, petitioner, respondent, court, judgment_date, year, act, section, head_note, judgment_text, citations
      FROM cases 
      WHERE status = 'Published'
    `;
    const values = [];

    if (rawTerm) {
      const cleanTerm = rawTerm.includes(':') ? rawTerm.split(':').slice(1).join(':').trim() : rawTerm;
      const lowerRaw = rawTerm.toLowerCase();

      const wordTokens = cleanTerm.split(/[\s,()#:]+/).filter(w => w.length > 0);
      const yearToken = wordTokens.find(w => /^(19|20)\d{2}$/.test(w));
      const numericTokens = wordTokens.filter(w => /^\d+$/.test(w) && w !== yearToken);

      let monthToken = null;
      let numberToken = null;

      if (numericTokens.length >= 2) {
        monthToken = numericTokens[0].replace(/^0+/, '');
        numberToken = numericTokens[1];
      } else if (numericTokens.length === 1) {
        const monthInBracketsMatch = cleanTerm.match(/\(\s*(0?[1-9]|1[0-2])\s*\)/);
        if (monthInBracketsMatch) {
          monthToken = monthInBracketsMatch[1].replace(/^0+/, '');
          numberToken = numericTokens[0] !== monthInBracketsMatch[1] ? numericTokens[0] : null;
        } else {
          numberToken = numericTokens[0];
        }
      }

      const isCitationQuery = tab === 'citation' || 
                              lowerRaw.startsWith('citation:') ||
                              Boolean(yearToken && numberToken) ||
                              Boolean(cleanTerm.toLowerCase().includes('dlr'));

      // 1. FIND BY CITATION
      if (isCitationQuery) {
        if (yearToken && numberToken) {
          values.push(`%${yearToken}%`);
          const yIdx = values.length;
          values.push(`%"number":"${numberToken}"%`);
          const nIdx1 = values.length;
          values.push(`%#${numberToken}%`);
          const nIdx2 = values.length;
          sql += ` AND (citations::text ILIKE $${nIdx1} OR citations::text ILIKE $${nIdx2} OR citations::text ILIKE $${yIdx}) AND (citations::text ILIKE $${yIdx} OR judgment_date::text ILIKE $${yIdx})`;
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
        let courtPart = null;
        let partyPart = rawTerm;

        if (rawTerm.includes(':')) {
          const parts = rawTerm.split(':');
          courtPart = parts[0].trim();
          partyPart = parts.slice(1).join(':').trim();
        }

        if (courtPart && courtPart !== '') {
          values.push(`%${courtPart}%`);
          const cIdx = values.length;
          sql += ` AND (court ILIKE $${cIdx} OR court_name ILIKE $${cIdx})`;
        }

        if (partyPart && partyPart !== '') {
          values.push(`%${partyPart}%`);
          const pIdx = values.length;
          sql += ` AND (petitioner ILIKE $${pIdx} OR respondent ILIKE $${pIdx} OR title ILIKE $${pIdx})`;
        }
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
