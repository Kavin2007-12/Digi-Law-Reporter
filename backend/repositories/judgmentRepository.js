import { query, getClient } from '../config/db.js';
import logger from '../utils/logger.js';

class JudgmentRepository {
  /**
   * Insert a new judgment and explicitly calculate the search_vector
   */
  async createJudgment(data) {
    try {
      // Coalesce text fields to ensure no nulls break the concatenation
      const searchText = [
        data.title, 
        data.court_name, 
        data.citation,
        data.petitioner_name, 
        data.respondent_name, 
        data.act_name,
        data.section_number, 
        data.topics, 
        data.head_note, 
        data.content
      ].filter(Boolean).join(' ');

      const sql = `
        INSERT INTO judgments (
          title, court_name, judgment_date, citation, 
          petitioner_name, respondent_name, act_name, 
          section_number, topics, head_note, content, pdf_file_path,
          search_vector
        ) VALUES (
          $1, $2, $3, $4, 
          $5, $6, $7, 
          $8, $9, $10, $11, $12,
          to_tsvector('simple', $13)
        )
        RETURNING id
      `;

      const values = [
        data.title, 
        data.court_name || null, 
        data.judgment_date || null, 
        data.citation || null,
        data.petitioner_name || null, 
        data.respondent_name || null, 
        data.act_name || null,
        data.section_number || null, 
        data.topics || null, 
        data.head_note || null, 
        data.content || null, 
        data.pdf_file_path || null,
        searchText
      ];

      const { rows } = await query(sql, values);
      return rows[0].id;
    } catch (error) {
      logger.error('JudgmentRepository.createJudgment failed', error);
      throw error;
    }
  }

  /**
   * Check if a specific citation string already exists in the database
   */
  async checkCitationExists(dlrString) {
    try {
      const sql = `
        SELECT id FROM judgments 
        WHERE citation LIKE $1
        LIMIT 1
      `;
      const { rows } = await query(sql, [`%${dlrString}%`]);
      return rows.length > 0;
    } catch (error) {
      logger.error('JudgmentRepository.checkCitationExists failed', error);
      throw error;
    }
  }

  /**
   * Search judgments using Full Text Search and GIN index with ILIKE fallback
   * Supports pagination
   */
  async searchJudgments(searchTerm = '', limit = 20, offset = 0) {
    try {
      const rawTerm = String(searchTerm || '').trim();
      const cleanTerm = rawTerm.replace(/[()#:&|\-!\\/]/g, ' ').trim();
      const terms = cleanTerm.split(/\s+/).filter(Boolean);
      
      if (terms.length === 0) {
        // Return recent database judgments if search query is empty
        const sql = `
          SELECT 
            id, title, court_name, judgment_date, citation, 
            petitioner_name, respondent_name, act_name, section_number, 
            topics, head_note, content, pdf_file_path
          FROM judgments 
          ORDER BY judgment_date DESC 
          LIMIT $1 OFFSET $2
        `;
        const { rows } = await query(sql, [limit, offset]);
        return rows;
      }

      const formattedTerm = terms.join(' & ');

      const sql = `
        SELECT 
          id, title, court_name, judgment_date, citation, 
          petitioner_name, respondent_name, act_name, section_number, 
          topics, head_note, content, pdf_file_path
        FROM judgments 
        WHERE search_vector @@ to_tsquery('simple', $1)
           OR title ILIKE $2
           OR citation ILIKE $2
           OR petitioner_name ILIKE $2
           OR respondent_name ILIKE $2
        ORDER BY judgment_date DESC
        LIMIT $3 OFFSET $4
      `;

      try {
        const { rows } = await query(sql, [formattedTerm, `%${cleanTerm}%`, limit, offset]);
        if (rows && rows.length > 0) return rows;
      } catch (tsErr) {
        logger.warn('tsquery search failed, attempting ILIKE fallback:', tsErr.message);
      }

      // Fallback ILIKE search across all fields if tsquery returns 0 matches or fails
      const fallbackSql = `
        SELECT 
          id, title, court_name, judgment_date, citation, 
          petitioner_name, respondent_name, act_name, section_number, 
          topics, head_note, content, pdf_file_path
        FROM judgments 
        WHERE title ILIKE $1 
           OR citation ILIKE $1 
           OR petitioner_name ILIKE $1 
           OR respondent_name ILIKE $1
           OR head_note ILIKE $1
           OR content ILIKE $1
        ORDER BY judgment_date DESC
        LIMIT $2 OFFSET $3
      `;
      const { rows } = await query(fallbackSql, [`%${cleanTerm}%`, limit, offset]);
      return rows;

    } catch (error) {
      logger.error('JudgmentRepository.searchJudgments failed', error);
      return [];
    }
  }
}

export default new JudgmentRepository();
