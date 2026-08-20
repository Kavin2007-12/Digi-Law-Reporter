import userRepository from '../repositories/userRepository.js';
import logger from '../utils/logger.js';

export const login = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ status: 'error', message: 'Name and Mobile number are required.' });
    }

    let user = await userRepository.findByMobile(mobile);

    if (!user) {
      // Auto-create user seamlessly in PostgreSQL
      user = await userRepository.createUser({ name: name.trim(), mobile: mobile.trim(), email: `${mobile}@digilawreporter.in` });
    } else {
      // Always update name & last_login timestamp in PostgreSQL on every re-login!
      user = await userRepository.updateUserLogin(mobile.trim(), name.trim());
    }

    return res.json({
      status: 'success',
      message: 'Login successful',
      user
    });

  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ status: 'error', message: 'Name and Mobile number are required.' });
    }

    const existingUser = await userRepository.findByMobile(mobile);

    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Mobile number already registered. Please Login.' });
    }

    const newUser = await userRepository.createUser({ name, mobile, email });
    
    res.json({
      status: 'success',
      message: 'Registration successful',
      user: newUser
    });

  } catch (error) {
    logger.error('Signup error', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getSavedCases = async (req, res) => {
  try {
    const { identifier } = req.params;
    const cases = await userRepository.getSavedCases(identifier);
    res.json({ status: 'success', data: cases });
  } catch (error) {
    logger.error('getSavedCases error', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch saved cases' });
  }
};

export const saveCases = async (req, res) => {
  try {
    const { identifier, cases } = req.body;
    if (!identifier) {
      return res.status(400).json({ status: 'error', message: 'User identifier required' });
    }
    const updated = await userRepository.saveCasesForUser(identifier, cases || []);
    res.json({ status: 'success', data: updated });
  } catch (error) {
    logger.error('saveCases error', error);
    res.status(500).json({ status: 'error', message: 'Failed to save cases' });
  }
};
