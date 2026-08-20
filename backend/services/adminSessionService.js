import crypto from 'crypto';
import logger from '../utils/logger.js';
import localStore from '../data/localStore.js';
import dotenv from 'dotenv';
dotenv.config();

// Session Duration in seconds (Default: 3600 seconds = 1 hour)
const getSessionDurationMs = () => {
  const durationSec = parseInt(process.env.ADMIN_SESSION_DURATION || '3600', 10);
  return (isNaN(durationSec) ? 3600 : durationSec) * 1000;
};

// Warning window in seconds (Default: 20 seconds)
const getWarningWindowMs = () => {
  const warningSec = parseInt(process.env.ADMIN_WARNING_WINDOW || '20', 10);
  return (isNaN(warningSec) ? 20 : warningSec) * 1000;
};

// In-memory active session map
const activeSessions = new Map();

class AdminSessionService {
  /**
   * Create a new server-side admin session
   * @param {Object} admin - Admin user object { id, email, role, username }
   */
  createSession(admin) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const durationMs = getSessionDurationMs();
    const warningMs = getWarningWindowMs();
    const now = Date.now();
    const expiresAt = now + durationMs;

    const sessionData = {
      sessionId,
      adminId: String(admin.id),
      email: admin.email || admin.username,
      role: admin.role || 'MAIN_ADMIN',
      createdAt: now,
      expiresAt: expiresAt,
      lastActivity: now
    };

    activeSessions.set(sessionId, sessionData);

    // Save to localStore / PostgreSQL for persistence
    try {
      localStore.saveAdminSession(sessionData);
    } catch (e) {
      logger.warn('Failed to persist admin session to localStore', e);
    }

    logger.info(`[ADMIN SESSION] Created session ${sessionId.substring(0, 8)}... for Admin ID ${admin.id}. Expires in ${durationMs / 1000}s`);

    return {
      sessionId,
      expiresAt,
      durationSeconds: durationMs / 1000,
      warningWindowSeconds: warningMs / 1000
    };
  }

  /**
   * Get and validate an active admin session
   * @param {string} sessionId 
   */
  getSession(sessionId) {
    if (!sessionId) return null;

    let session = activeSessions.get(sessionId);

    if (!session) {
      // Try restoring from localStore
      try {
        session = localStore.getAdminSession(sessionId);
        if (session) {
          activeSessions.set(sessionId, session);
        }
      } catch (e) {}
    }

    if (!session) {
      return null;
    }

    // Check server-side expiration strictly
    if (Date.now() > session.expiresAt) {
      logger.info(`[ADMIN SESSION] Session ${sessionId.substring(0, 8)}... expired on server. Invalidating.`);
      this.destroySession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Explicitly renew an active session for another full duration (Only when admin clicks Continue Session)
   * @param {string} sessionId 
   */
  renewSession(sessionId) {
    const session = this.getSession(sessionId);

    if (!session) {
      return { success: false, message: 'Session expired or invalid. Renewal denied.' };
    }

    const durationMs = getSessionDurationMs();
    const now = Date.now();
    const newExpiresAt = now + durationMs;

    session.expiresAt = newExpiresAt;
    session.lastActivity = now;

    activeSessions.set(sessionId, session);
    try {
      localStore.saveAdminSession(session);
    } catch (e) {}

    logger.info(`[ADMIN SESSION] Explicitly RENEWED session ${sessionId.substring(0, 8)}... for another ${durationMs / 1000}s.`);

    return {
      success: true,
      sessionId,
      expiresAt: newExpiresAt,
      durationSeconds: durationMs / 1000,
      warningWindowSeconds: getWarningWindowMs() / 1000
    };
  }

  /**
   * Destroy an admin session (Logout or Expiration)
   * @param {string} sessionId 
   */
  destroySession(sessionId) {
    if (!sessionId) return;
    activeSessions.delete(sessionId);
    try {
      localStore.deleteAdminSession(sessionId);
    } catch (e) {}
    logger.info(`[ADMIN SESSION] Destroyed session ${sessionId.substring(0, 8)}...`);
  }
}

export default new AdminSessionService();
