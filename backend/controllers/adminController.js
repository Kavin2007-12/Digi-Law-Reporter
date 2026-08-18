import userRepository from '../repositories/userRepository.js';
import judgmentRepository from '../repositories/judgmentRepository.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await userRepository.findByEmail(email);
    
    if (!user || user.role === 'USER') {
      return res.status(401).json({ status: 'error', message: 'Invalid admin credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ status: 'error', message: 'Account is deactivated. Contact SUPER_ADMIN.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid admin credentials' });
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Admin login error', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    const newAdmin = await userRepository.createAdmin({
      name,
      email,
      password_hash,
      role,
      created_by: req.user.id
    });

    res.json({
      status: 'success',
      message: 'Admin created successfully',
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
        // Validate uniqueness before saving
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

    // Determine path based on env, fallback to uploads/
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
    const { dlrString } = req.query;
    if (!dlrString) {
      return res.status(400).json({ status: 'error', message: 'dlrString is required' });
    }

    const exists = await judgmentRepository.checkCitationExists(dlrString);
    res.json({
      status: 'success',
      exists
    });
  } catch (error) {
    logger.error('Admin check citation error', error);
    res.status(500).json({ status: 'error', message: 'Database error while checking citation' });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ status: 'error', message: 'New password is required' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const updated = await userRepository.updatePassword(id, password_hash);

    res.json({
      status: 'success',
      message: 'Admin password updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error(`Admin update password error for ID ${req.params.id}`, error);
    res.status(500).json({ status: 'error', message: 'Database error updating password' });
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
      message: 'Extra Admin removed successfully'
    });
  } catch (error) {
    logger.error(`Admin delete error for ID ${req.params.id}`, error);
    res.status(500).json({ status: 'error', message: 'Database error removing admin' });
  }
};
