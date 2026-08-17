import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import caseRoutes from './routes/caseRoutes.js';

// Import Utils
import logger from './utils/logger.js';
import pool from './config/db.js'; // Ensures DB connection is initialized

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
const uploadBase = process.env.UPLOAD_PATH || 'uploads/';
app.use(`/${uploadBase}`, express.static(path.join(__dirname, uploadBase)));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API is running optimally' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/cases', caseRoutes);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});
