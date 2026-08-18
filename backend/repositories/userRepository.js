import { query } from '../config/db.js';
import logger from '../utils/logger.js';

class UserRepository {
  async findByMobile(mobile) {
    try {
      const { rows } = await query('SELECT * FROM users WHERE mobile = $1', [mobile]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`UserRepository.findByMobile failed for mobile: ${mobile}`, error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`UserRepository.findByEmail failed for email: ${email}`, error);
      throw error;
    }
  }

  async createUser({ name, mobile, email }) {
    try {
      const sql = `
        INSERT INTO users (name, mobile, email, role) 
        VALUES ($1, $2, $3, 'USER') 
        ON CONFLICT (mobile) DO NOTHING 
        RETURNING id, name, mobile, email, role
      `;
      const { rows } = await query(sql, [name, mobile, email || null]);
      return rows[0] || null; 
    } catch (error) {
      logger.error('UserRepository.createUser failed', error);
      throw error;
    }
  }

  async createAdmin({ name, email, password_hash, role, created_by }) {
    try {
      // For admins, mobile is not required, generate random or empty placeholder if not used for admin login
      // However, schema says mobile is NOT NULL UNIQUE. We can store a unique fake mobile for admins.
      const fakeMobile = 'ADMIN_' + Date.now().toString().slice(-10);
      const sql = `
        INSERT INTO users (name, mobile, email, password_hash, role, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, name, email, role, created_at
      `;
      const { rows } = await query(sql, [name, fakeMobile, email, password_hash, role, created_by]);
      return rows[0] || null; 
    } catch (error) {
      logger.error('UserRepository.createAdmin failed', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const sql = "SELECT id, name, mobile, email, role, created_at FROM users WHERE role = 'USER' ORDER BY created_at DESC";
      const { rows } = await query(sql);
      return rows;
    } catch (error) {
      logger.error('UserRepository.getAllUsers failed', error);
      throw error;
    }
  }

  async getAdmins() {
    try {
      const sql = `
        SELECT id, name, email, role, is_active, created_at, last_login 
        FROM users 
        WHERE role != 'USER' 
        ORDER BY created_at DESC
      `;
      const { rows } = await query(sql);
      return rows;
    } catch (error) {
      logger.error('UserRepository.getAdmins failed', error);
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    } catch (error) {
      logger.error(`UserRepository.updateLastLogin failed for id: ${id}`, error);
    }
  }

  async updatePassword(id, password_hash) {
    try {
      const sql = 'UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, username, role';
      const { rows } = await query(sql, [password_hash, id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`UserRepository.updatePassword failed for id: ${id}`, error);
      throw error;
    }
  }

  async deleteAdmin(id) {
    try {
      const sql = "DELETE FROM admins WHERE id = $1 AND role != 'MAIN_ADMIN' RETURNING id, username";
      const { rows } = await query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`UserRepository.deleteAdmin failed for id: ${id}`, error);
      throw error;
    }
  }
}

export default new UserRepository();
