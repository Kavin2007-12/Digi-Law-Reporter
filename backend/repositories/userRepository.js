import { query } from '../config/db.js';
import logger from '../utils/logger.js';
import localStore from '../data/localStore.js';

class UserRepository {
  async findByMobile(mobile) {
    try {
      const { rows } = await query('SELECT * FROM users WHERE mobile = $1', [mobile]);
      return rows[0] || null;
    } catch (error) {
      logger.warn(`PostgreSQL offline for findByMobile, using localStore: ${mobile}`);
      const users = localStore.getUsers();
      return users.find(u => u.mobile === mobile) || null;
    }
  }

  async findByEmail(email) {
    try {
      const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0] || null;
    } catch (error) {
      logger.warn(`PostgreSQL offline for findByEmail, using localStore: ${email}`);
      const users = localStore.getUsers();
      return users.find(u => u.email === email) || null;
    }
  }

  async createUser({ name, mobile, email }) {
    try {
      const sql = `
        INSERT INTO users (name, mobile, email, status, joined_date, last_login) 
        VALUES ($1, $2, $3, 'Active', CURRENT_DATE, CURRENT_TIMESTAMP) 
        ON CONFLICT (mobile) DO UPDATE SET name = EXCLUDED.name, last_login = CURRENT_TIMESTAMP 
        RETURNING id, name, mobile, email, status, joined_date, last_login
      `;
      const { rows } = await query(sql, [name, mobile, email || null]);
      return rows[0] || null; 
    } catch (error) {
      logger.warn('PostgreSQL offline for createUser, persisting to localStore');
      return localStore.addUser({ name, mobile, email });
    }
  }

  async updateUserLogin(mobile, name) {
    try {
      const sql = `
        UPDATE users 
        SET name = $1, last_login = CURRENT_TIMESTAMP 
        WHERE mobile = $2 
        RETURNING id, name, mobile, email, status, joined_date, last_login
      `;
      const { rows } = await query(sql, [name, mobile]);
      return rows[0] || null;
    } catch (error) {
      logger.warn('PostgreSQL offline for updateUserLogin, persisting to localStore');
      return localStore.addUser({ name, mobile });
    }
  }

  async createAdmin({ name, username, email, password, password_hash, role, created_by }) {
    try {
      const fakeMobile = 'ADMIN_' + Date.now().toString().slice(-10);
      const sql = `
        INSERT INTO users (name, mobile, email, password_hash, role, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, name, email, role, created_at
      `;
      const { rows } = await query(sql, [name, fakeMobile, email || `${username}@digilawreporter.in`, password_hash, role || 'EXTRA_ADMIN', created_by]);
      return rows[0] || null; 
    } catch (error) {
      logger.warn('PostgreSQL offline for createAdmin, saving to localStore');
      return localStore.addAdmin({ name, username: username || name.toLowerCase().replace(/\s+/g, ''), password, role: role || 'EXTRA_ADMIN' });
    }
  }

  async getAllUsers() {
    try {
      const sql = "SELECT id, name, mobile, email, status, joined_date, last_login, created_at FROM users ORDER BY created_at DESC";
      const { rows } = await query(sql);
      return rows;
    } catch (error) {
      logger.warn('PostgreSQL offline for getAllUsers, reading from localStore');
      return localStore.getUsers();
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
      logger.warn('PostgreSQL offline for getAdmins, reading from localStore');
      return localStore.getAdmins();
    }
  }

  async updateLastLogin(id) {
    try {
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    } catch (error) {
      logger.warn(`UserRepository.updateLastLogin failed for id: ${id}`);
    }
  }

  async findAdminByEmail(emailIdentifier) {
    if (!emailIdentifier) return null;
    const clean = String(emailIdentifier).trim().toLowerCase();
    try {
      // 1. Check users table
      const sqlUsers = "SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(mobile) = $1 OR LOWER(name) = $1";
      const { rows: userRows } = await query(sqlUsers, [clean]);
      const matchedUser = userRows.find(u => u.role === 'MAIN_ADMIN' || u.role === 'EXTRA_ADMIN');
      if (matchedUser) return matchedUser;

      // 2. Check admins table
      const sqlAdmins = "SELECT * FROM admins WHERE LOWER(email) = $1 OR LOWER(username) = $1";
      const { rows: adminRows } = await query(sqlAdmins, [clean]);
      if (adminRows[0]) return adminRows[0];
    } catch (error) {
      logger.warn(`PostgreSQL offline for findAdminByEmail, checking localStore: ${clean}`);
    }

    // Fallback: Check localStore admins
    const admins = localStore.getAdmins();
    return admins.find(a => 
      (a.email && a.email.toLowerCase() === clean) || 
      (a.username && a.username.toLowerCase() === clean) ||
      (a.name && a.name.toLowerCase() === clean)
    ) || null;
  }

  async findAdminById(adminId) {
    if (!adminId) return null;
    try {
      const sqlUsers = "SELECT * FROM users WHERE id = $1 AND role != 'USER'";
      const { rows: userRows } = await query(sqlUsers, [adminId]);
      if (userRows[0]) return userRows[0];

      const sqlAdmins = "SELECT * FROM admins WHERE id = $1";
      const { rows: adminRows } = await query(sqlAdmins, [adminId]);
      if (adminRows[0]) return adminRows[0];
    } catch (error) {
      logger.warn(`PostgreSQL offline for findAdminById, checking localStore: ${adminId}`);
    }

    const admins = localStore.getAdmins();
    return admins.find(a => String(a.id) === String(adminId)) || null;
  }

  async savePasswordResetToken({ adminId, tokenHash, expiresAt }) {
    try {
      const sql = `
        INSERT INTO password_reset_tokens (admin_id, token_hash, expires_at, used)
        VALUES ($1, $2, $3, false)
      `;
      await query(sql, [String(adminId), tokenHash, expiresAt]);
    } catch (error) {
      logger.warn(`PostgreSQL offline for savePasswordResetToken, saving to localStore for adminId: ${adminId}`);
    }
    // Always persist to localStore as well for dual redundancy
    localStore.saveResetToken({ adminId, tokenHash, expiresAt });
  }

  async getPasswordResetToken(tokenHash) {
    try {
      const sql = "SELECT * FROM password_reset_tokens WHERE token_hash = $1";
      const { rows } = await query(sql, [tokenHash]);
      if (rows[0]) {
        return {
          adminId: rows[0].admin_id,
          tokenHash: rows[0].token_hash,
          expiresAt: rows[0].expires_at,
          used: rows[0].used
        };
      }
    } catch (error) {
      logger.warn(`PostgreSQL offline for getPasswordResetToken, checking localStore`);
    }

    return localStore.getResetToken(tokenHash);
  }

  async markPasswordResetTokenUsed(tokenHash) {
    try {
      const sql = "UPDATE password_reset_tokens SET used = true WHERE token_hash = $1";
      await query(sql, [tokenHash]);
    } catch (error) {
      logger.warn(`PostgreSQL offline for markPasswordResetTokenUsed, updating localStore`);
    }

    localStore.markResetTokenUsed(tokenHash);
  }

  async updateAdminPasswordHash(adminId, passwordHash, rawPassword) {
    try {
      // Update in users table if exists
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, adminId]);
      // Update in admins table if exists
      await query('UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, adminId]);
    } catch (error) {
      logger.warn(`PostgreSQL offline for updateAdminPasswordHash, updating localStore for ID: ${adminId}`);
    }

    // Always update localStore
    localStore.updateAdminCredentials(adminId, { password: rawPassword, password_hash: passwordHash });
  }

  async updateAdminCredentials(id, { username, password, password_hash }) {
    try {
      const sql = 'UPDATE users SET username = COALESCE($1, username), password_hash = COALESCE($2, password_hash), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, username, role';
      const { rows } = await query(sql, [username || null, password_hash || null, id]);
      if (rows[0]) {
        localStore.updateAdminCredentials(id, { username, password, password_hash });
        return rows[0];
      }
    } catch (error) {
      logger.warn(`PostgreSQL offline for updateAdminCredentials, updating localStore ID: ${id}`);
    }
    return localStore.updateAdminCredentials(id, { username, password, password_hash });
  }

  async getSavedCases(identifier) {
    try {
      return localStore.getUserSavedCases(identifier);
    } catch (error) {
      return [];
    }
  }

  async saveCasesForUser(identifier, cases) {
    try {
      return localStore.saveUserCases(identifier, cases);
    } catch (error) {
      return cases;
    }
  }
}

export default new UserRepository();
