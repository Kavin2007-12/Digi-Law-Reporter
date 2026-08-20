import userRepository from '../repositories/userRepository.js';
import judgmentRepository from '../repositories/judgmentRepository.js';
import localStore from '../data/localStore.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const adminLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = (email || username || '').trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ status: 'error', message: 'Invalid email or password.' });
    }

    // 1. Find Admin Account in DB / localStore
    const admin = await userRepository.findAdminByEmail(loginIdentifier);
    if (!admin) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    // Account status check (Disabled accounts cannot log in)
    if (admin.status === 'Disabled' || admin.is_active === false) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    // 2. Strict BCrypt Password Verification
    let isMatch = false;
    if (admin.password_hash) {
      isMatch = await bcrypt.compare(password, admin.password_hash);
    } else if (admin.password) {
      // Legacy plain-text verification & auto-upgrade to bcrypt hash
      isMatch = (password === admin.password);
      if (isMatch) {
        const newHash = await bcrypt.hash(password, 10);
        await userRepository.updateAdminPasswordHash(admin.id, newHash, password);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(admin.id);

    // 3. Role strictly determined by Database record
    const userRole = admin.role === 'MAIN_ADMIN' ? 'MAIN_ADMIN' : 'EXTRA_ADMIN';

    // Sign JWT Token
    const token = jwt.sign(
      { id: admin.id, email: admin.email || loginIdentifier, role: userRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Admin login successful for ${loginIdentifier} (${userRole})`);

    return res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        name: admin.name || 'Admin User',
        email: admin.email || loginIdentifier,
        username: admin.username || loginIdentifier,
        role: userRole
      }
    });

  } catch (error) {
    logger.error('Admin login error', error);
    return res.status(500).json({ status: 'error', message: 'Invalid email or password.' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, Username, and Password are required' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    const newAdmin = await userRepository.createAdmin({
      name,
      username: username.toLowerCase().trim(),
      password,
      password_hash,
      role: role || 'EXTRA_ADMIN',
      created_by: req.user?.id || 1
    });

    res.json({
      status: 'success',
      message: 'Sub-admin created successfully',
      data: newAdmin
    });

  } catch (error) {
    logger.error('Create admin error', error);
    res.status(500).json({ status: 'error', message: 'Failed to create admin' });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await userRepository.getAdmins();
    res.json({
      status: 'success',
      data: admins
    });
  } catch (error) {
    logger.error('Admin get users error', error);
    res.status(500).json({ status: 'error', message: 'Database error fetching admins' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    logger.error('Admin get users error', error);
    res.status(500).json({ status: 'error', message: 'Database error fetching users' });
  }
};

export const uploadJudgment = async (req, res) => {
  try {
    const {
      title, court_name, judgment_date, citationsData,
      petitioner_name, respondent_name, act_name,
      section_number, topics, head_note, content
    } = req.body;

    if (!title) {
      return res.status(400).json({ status: 'error', message: 'Title is required' });
    }

    let citation = '';
    if (citationsData) {
      try {
        const citationsArr = JSON.parse(citationsData);
        for (const c of citationsArr) {
          const dlrString = `${c.year} (${c.month}) DLR (${c.court}) ${c.count}`;
          const exists = await judgmentRepository.checkCitationExists(dlrString);
          if (exists) {
            return res.status(400).json({ status: 'error', message: `Citation ${dlrString} already exists in the database.` });
          }
        }
        citation = citationsArr.map(c => `${c.year} (${c.month}) DLR (${c.court}) ${c.count} : ${c.equivalent}`).join(', ');
      } catch (err) {
        logger.error('Error parsing citationsData', err);
        return res.status(400).json({ status: 'error', message: 'Invalid citation format' });
      }
    }

    const uploadBase = process.env.UPLOAD_PATH || 'uploads/';
    const pdfFilePath = req.file ? `/${uploadBase}${req.file.filename}` : null;

    const judgmentData = {
      title, court_name, judgment_date, citation,
      petitioner_name, respondent_name, act_name,
      section_number, topics, head_note, content, pdf_file_path: pdfFilePath
    };

    const insertedId = await judgmentRepository.createJudgment(judgmentData);
    
    res.json({
      status: 'success',
      message: 'Judgment uploaded successfully',
      id: insertedId
    });
  } catch (error) {
    logger.error('Admin upload judgment error', error);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

export const checkCitation = async (req, res) => {
  try {
    const { dlrString, number, year, month } = req.query;
    let exists = false;

    if (number) {
      exists = localStore.checkCitationExists(number, year, month);
    } else if (dlrString) {
      try {
        exists = await judgmentRepository.checkCitationExists(dlrString);
      } catch (e) {
        exists = false;
      }
      if (!exists) {
        exists = localStore.checkCitationExists(dlrString, year, month);
      }
    }

    res.json({
      status: 'success',
      exists
    });
  } catch (error) {
    logger.error('Admin check citation error', error);
    res.json({ status: 'success', exists: false });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, currentPassword } = req.body;

    if (!username && !password) {
      return res.status(400).json({ status: 'error', message: 'Username or password is required' });
    }

    let passwordHash = null;
    if (password && String(password).trim()) {
      const cleanPass = String(password).trim();
      if (cleanPass.length < 8) {
        return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters long.' });
      }
      passwordHash = await bcrypt.hash(cleanPass, 10);
    }

    const updated = await userRepository.updateAdminCredentials(id, { 
      username: username ? String(username).trim().toLowerCase() : undefined, 
      password: password ? String(password).trim() : undefined,
      password_hash: passwordHash 
    });

    logger.info(`Admin credentials updated for ID ${id}`);

    return res.json({
      status: 'success',
      message: 'Admin details updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error(`Admin update password error for ID ${req.params.id}`, error);
    return res.status(500).json({ status: 'error', message: 'Database error updating credentials' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userRepository.deleteAdmin(id);

    if (!deleted) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete Main Admin or account not found' });
    }

    res.json({
      status: 'success',
      message: 'Sub-admin removed successfully'
    });
  } catch (error) {
    logger.error(`Admin delete error for ID ${req.params.id}`, error);
    res.status(500).json({ status: 'error', message: 'Database error removing admin' });
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = localStore.getSettings();
    res.json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching settings' });
  }
};

export const saveSettings = async (req, res) => {
  try {
    const saved = localStore.saveSettings(req.body);
    res.json({
      status: 'success',
      message: 'Settings updated successfully',
      data: saved
    });
  } catch (error) {
    logger.error('Error saving settings:', error);
    res.status(500).json({ status: 'error', message: 'Error saving settings' });
  }
};

/**
 * Main Admin Forgot Password Controller
 * Generates secure single-use reset token & dispatches email strictly for MAIN ADMIN
 */
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Please provide a valid email address.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await userRepository.findAdminByEmail(cleanEmail);

    // ACCOUNT ENUMERATION PROTECTION:
    // If account not found or is ADDED ADMIN, return generic success response without token or email
    if (!admin || admin.role !== 'MAIN_ADMIN') {
      logger.info(`Password reset request ignored for non-main-admin: ${cleanEmail}`);
      return res.json({
        status: 'success',
        message: 'If an account is eligible for password reset, a password reset link has been sent.'
      });
    }

    // Generate cryptographically secure random token
    const crypto = await import('crypto');
    const { sendAdminPasswordResetEmail } = await import('../services/mailService.js');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration

    // Persist token hash securely
    await userRepository.savePasswordResetToken({
      adminId: admin.id,
      tokenHash,
      expiresAt
    });

    const baseUrl = process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${rawToken}`;

    await sendAdminPasswordResetEmail(admin.email || cleanEmail, resetUrl);

    logger.info(`Password reset link generated for Main Admin ID ${admin.id}`);

    return res.json({
      status: 'success',
      message: 'If an account is eligible for password reset, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Admin forgot password error', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'If an account is eligible for password reset, a password reset link has been sent.' 
    });
  }
};

/**
 * Main Admin Reset Password Controller
 * Validates single-use token, checks expiration, hashes new password and updates credentials
 */
export const adminResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This password reset link is invalid or has expired.' 
      });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Password must be at least 8 characters long.' 
      });
    }

    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const tokenRecord = await userRepository.getPasswordResetToken(tokenHash);

    if (!tokenRecord || tokenRecord.used) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This password reset link is invalid or has expired.' 
      });
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This password reset link is invalid or has expired.' 
      });
    }

    const admin = await userRepository.findAdminById(tokenRecord.adminId);
    if (!admin || admin.role !== 'MAIN_ADMIN') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This password reset link is invalid or has expired.' 
      });
    }

    // Hash new password using bcrypt
    const newPasswordHash = await bcrypt.hash(password, 10);

    // Update Main Admin Password
    await userRepository.updateAdminPasswordHash(admin.id, newPasswordHash, password);

    // Invalidate single-use reset token
    await userRepository.markPasswordResetTokenUsed(tokenHash);

    logger.info(`Main Admin password successfully updated for ID ${admin.id}`);

    return res.json({
      status: 'success',
      message: 'Password reset successfully. You can now sign in with your new password.'
    });

  } catch (error) {
    logger.error('Admin reset password error', error);
    return res.status(400).json({ 
      status: 'error', 
      message: 'This password reset link is invalid or has expired.' 
    });
  }
};
