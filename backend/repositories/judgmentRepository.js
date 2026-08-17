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
   * Search judgments using Full Text Search and GIN index
   * Supports pagination
   */
  async searchJudgments(searchTerm, limit = 20, offset = 0) {
    try {
      // Split search term by spaces and join with logical AND (&) for tsquery
      // Example: "supreme court" -> "supreme & court"
      // Using 'simple' config to prevent stemming of Indian names/sections
      
      const formattedTerm = searchTerm.trim().split(/\s+/).join(' & ');

      const sql = `
        SELECT 
          id, title, court_name, judgment_date, citation, 
          petitioner_name, respondent_name, act_name, section_number, 
          topics, head_note, content, pdf_file_path
        FROM judgments 
        WHERE search_vector @@ to_tsquery('simple', $1)
        ORDER BY ts_rank(search_vector, to_tsquery('simple', $1)) DESC, judgment_date DESC
        LIMIT $2 OFFSET $3
      `;

      const { rows } = await query(sql, [formattedTerm, limit, offset]);
      return rows;
    } catch (error) {
      logger.error(`JudgmentRepository.searchJudgments failed for term: ${searchTerm}`, error);
      throw error;
    }
  }
}

export default new JudgmentRepository();
