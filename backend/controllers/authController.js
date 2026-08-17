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
      // Auto-create user seamlessly if they don't exist yet
      user = await userRepository.createUser({ name: name.trim(), mobile: mobile.trim(), email: `${mobile}@digilawreporter.in` });
    } else {
      // Update name if needed
      const dbName = user.name.toLowerCase().trim();
      const inputName = name.toLowerCase().trim();
      if (dbName !== inputName) {
        user.name = name.trim();
      }
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
